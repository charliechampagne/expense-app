import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TableRow, GeneratedComponentProps } from './RuntimeTypes';
import {
    makeStyles,
    shorthands,
    tokens,
    Text,
    Card,
    Button,
    Badge,
    CounterBadge,
    Spinner,
    MessageBar,
    MessageBarBody,
    Divider,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Field,
    Input,
    Textarea,
    Combobox,
    Option,
} from '@fluentui/react-components';
import {
    AddRegular,
    ArrowClockwiseRegular,
    ChevronDownRegular,
    ChevronRightRegular,
    ReceiptRegular,
    OpenRegular,
    DismissRegular,
    MoneyRegular,
    CheckmarkCircleRegular,
    SendRegular,
    CircleRegular,
    LockClosedRegular,
    ClockRegular,
} from '@fluentui/react-icons';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import * as d3 from 'd3';

// ============================================================================
// My Expenses Dashboard — submitter overview of the current user's expense
// headers grouped by status, with per-status totals, spend charts, recent
// activity and a quick "New expense" dialog.
//
// Data mode: dataverse. Connectors: disabled. Telemetry: disabled.
// Entities: cp_expenseheader, cp_expenseline, contact, systemuser.
// ============================================================================

// ---------- Row types (subset of verified RuntimeTypes columns) ----------

type ExpenseHeaderRow = TableRow<{
    readonly cp_expenseheaderid: string;
    cp_name?: string;
    cp_date?: string;
    cp_description?: string;
    cp_totalamount?: number;
    statuscode?: number;
    modifiedon?: string;
    _cp_contactid_value?: string;
}>;

type ExpenseLineRow = TableRow<{
    readonly cp_expenselineid: string;
    _cp_expenseheaderid_value?: string;
}>;

type ContactRow = TableRow<{
    readonly contactid: string;
    fullname?: string;
}>;

interface ContactOption {
    id: string;
    name: string;
}

interface DashboardData {
    headers: ExpenseHeaderRow[];
    lineCounts: Record<string, number>;
    contacts: ContactOption[];
}

interface DashboardState extends DashboardData {
    loading: boolean;
    error: string | null;
}

// Loose view of the DataAPI for the calls this page makes. We do not rename or
// re-shape any method — only widen the option/return types so system columns
// (modifiedon, _ownerid_value) and OData annotations are ergonomic to read.
interface LooseDataApi {
    queryTable: (
        entity: string,
        options: Record<string, unknown>,
    ) => Promise<{ rows: Array<Record<string, unknown>> }>;
    createRow: (entity: string, data: Record<string, unknown>) => Promise<string>;
}

// ---------- Status metadata ----------

const STATUS_OPEN = 1;
const STATUS_SUBMITTED = 121570000;
const STATUS_APPROVED = 121570001;
const STATUS_PAID = 121570002;
const STATUS_CLOSED = 2;

const STATUS_ORDER: number[] = [
    STATUS_OPEN,
    STATUS_SUBMITTED,
    STATUS_APPROVED,
    STATUS_PAID,
    STATUS_CLOSED,
];

type BadgeColor = 'informative' | 'warning' | 'success' | 'brand' | 'subtle';

interface StatusMeta {
    label: string;
    badge: BadgeColor;
    chartColor: string;
}

const STATUS_META: Record<number, StatusMeta> = {
    [STATUS_OPEN]: { label: 'Open', badge: 'informative', chartColor: tokens.colorPaletteBlueForeground2 },
    [STATUS_SUBMITTED]: { label: 'Submitted', badge: 'warning', chartColor: tokens.colorStatusWarningForeground1 },
    [STATUS_APPROVED]: { label: 'Approved', badge: 'success', chartColor: tokens.colorStatusSuccessForeground1 },
    [STATUS_PAID]: { label: 'Paid', badge: 'brand', chartColor: tokens.colorPaletteTealForeground2 },
    [STATUS_CLOSED]: { label: 'Closed', badge: 'subtle', chartColor: tokens.colorNeutralForeground3 },
};

function statusMetaFor(code: number | undefined): StatusMeta {
    return STATUS_META[code ?? STATUS_OPEN] ?? STATUS_META[STATUS_OPEN];
}

function StatusIcon(props: { code: number }) {
    switch (props.code) {
        case STATUS_SUBMITTED:
            return <SendRegular />;
        case STATUS_APPROVED:
            return <CheckmarkCircleRegular />;
        case STATUS_PAID:
            return <MoneyRegular />;
        case STATUS_CLOSED:
            return <LockClosedRegular />;
        default:
            return <CircleRegular />;
    }
}

// ---------- Formatting helpers ----------

const USD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

function formatMoney(value: number | undefined | null): string {
    const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    return USD.format(n);
}

function formatMoneyShort(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1000) {
        const k = value / 1000;
        return `$${k.toFixed(Math.abs(k % 1) < 0.05 ? 0 : 1)}k`;
    }
    return `$${Math.round(value)}`;
}

function formatDate(value: string | undefined | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function toDateOnly(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formattedValue(row: Record<string, unknown>, fkColumn: string): string | undefined {
    const v = row[`${fkColumn}@OData.Community.Display.V1.FormattedValue`];
    return typeof v === 'string' && v.length > 0 ? v : undefined;
}

// Normalise a Dataverse id / lookup value to a lowercase GUID. Accepts a bare
// GUID, "{GUID}", or a "/entity(GUID)" nav string.
function guidOf(value: unknown): string {
    if (typeof value !== 'string') return '';
    const m = value.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    return (m ? m[0] : value).toLowerCase();
}

function getCurrentUserId(): string | null {
    try {
        const xrm = (window as unknown as { Xrm?: any }).Xrm;
        const id = xrm?.Utility?.getGlobalContext?.()?.userSettings?.userId;
        return typeof id === 'string' ? id.replace(/[{}]/g, '') : null;
    } catch {
        return null;
    }
}

// ---------- Window-scoped de-dupe + cache (survives the host double-mount) ----------

const CACHE_KEY = '__ppMyExpensesDashboard_dataCache';
const INFLIGHT_KEY = '__ppMyExpensesDashboard_dataInflight';
const winAny = window as unknown as Record<string, unknown>;

async function fetchDashboardData(api: LooseDataApi): Promise<DashboardData> {
    const userId = getCurrentUserId();

    const baseHeaderOptions: Record<string, unknown> = {
        select: [
            'cp_name',
            'cp_date',
            'cp_description',
            'cp_totalamount',
            'statuscode',
            'modifiedon',
            '_cp_contactid_value',
        ],
        orderBy: 'modifiedon desc',
        pageSize: 250,
    };

    let headers: ExpenseHeaderRow[] = [];
    if (userId) {
        try {
            const filtered = await api.queryTable('cp_expenseheader', {
                ...baseHeaderOptions,
                filter: `_ownerid_value eq ${userId}`,
            });
            headers = (filtered?.rows ?? []) as ExpenseHeaderRow[];
        } catch {
            // Fall back to an unfiltered read (e.g. org-owned table or no Xrm context).
            const all = await api.queryTable('cp_expenseheader', baseHeaderOptions);
            headers = (all?.rows ?? []) as ExpenseHeaderRow[];
        }
    } else {
        const all = await api.queryTable('cp_expenseheader', baseHeaderOptions);
        headers = (all?.rows ?? []) as ExpenseHeaderRow[];
    }

    // Per-header line counts. One grouped query per chunk of header ids, then a
    // client-side reduction. The lookup value read back from cp_expenseline can
    // be either a bare GUID or a "/cp_expenseheader(<guid>)" nav string
    // depending on the runtime, so both the map keys and the lookups are
    // normalised to a lowercase GUID via guidOf().
    const lineCounts: Record<string, number> = {};
    const ids = headers
        .map((h) => guidOf(h.cp_expenseheaderid))
        .filter((id) => id.length > 0);

    for (let i = 0; i < ids.length; i += 20) {
        const chunk = ids.slice(i, i + 20);
        const filter = chunk.map((id) => `_cp_expenseheaderid_value eq ${id}`).join(' or ');
        try {
            const lineResult = await api.queryTable('cp_expenseline', {
                select: ['cp_expenselineid', '_cp_expenseheaderid_value'],
                filter,
                pageSize: 5000,
            });
            for (const line of (lineResult?.rows ?? []) as ExpenseLineRow[]) {
                const key = guidOf(line._cp_expenseheaderid_value);
                if (key) {
                    lineCounts[key] = (lineCounts[key] ?? 0) + 1;
                }
            }
        } catch {
            // leave these headers at count 0
        }
    }

    let contacts: ContactOption[] = [];
    try {
        const contactResult = await api.queryTable('contact', {
            select: ['fullname'],
            orderBy: 'fullname asc',
            pageSize: 200,
        });
        contacts = ((contactResult?.rows ?? []) as ContactRow[])
            .map((c) => ({ id: c.contactid, name: c.fullname ?? '(no name)' }))
            .filter((c) => typeof c.id === 'string' && c.id.length > 0);
    } catch {
        contacts = [];
    }

    return { headers, lineCounts, contacts };
}

// ---------- Styles ----------

const useStyles = makeStyles({
    root: {
        position: 'relative',
        contain: 'layout',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalL),
        ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
        backgroundColor: tokens.colorNeutralBackground2,
        color: tokens.colorNeutralForeground1,
    },
    headerBar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shorthands.gap(tokens.spacingHorizontalM),
    },
    titleGroup: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalS),
    },
    headerActions: {
        display: 'flex',
        ...shorthands.gap(tokens.spacingHorizontalS),
    },
    kpiRow: {
        display: 'flex',
        flexWrap: 'wrap',
        ...shorthands.gap(tokens.spacingHorizontalL),
    },
    kpiCard: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '220px',
        ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalXS),
    },
    kpiLabelRow: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalXS),
        color: tokens.colorNeutralForeground2,
    },
    kpiValue: {
        fontSize: tokens.fontSizeHero800,
        fontWeight: tokens.fontWeightSemibold,
        fontVariantNumeric: 'tabular-nums',
    },
    kpiHint: {
        color: tokens.colorNeutralForeground3,
    },
    chartsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        ...shorthands.gap(tokens.spacingHorizontalL),
    },
    chartCard: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '360px',
        minWidth: 0,
        ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalS),
    },
    chartTitle: {
        fontWeight: tokens.fontWeightSemibold,
    },
    chartSvg: {
        width: '100%',
        height: '260px',
    },
    sectionTitle: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        marginTop: tokens.spacingVerticalS,
    },
    segmentsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        ...shorthands.gap(tokens.spacingHorizontalL),
        alignItems: 'flex-start',
    },
    segmentCard: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '320px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    segmentToggle: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalS),
        width: '100%',
        ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
        ...shorthands.border('0'),
        backgroundColor: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
        borderTopLeftRadius: tokens.borderRadiusMedium,
        borderTopRightRadius: tokens.borderRadiusMedium,
        ':hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
        },
        ':focus-visible': {
            ...shorthands.outline('2px', 'solid', tokens.colorStrokeFocus2),
        },
    },
    segmentToggleSpacer: {
        flexGrow: 1,
    },
    segmentCount: {
        fontWeight: tokens.fontWeightSemibold,
        fontVariantNumeric: 'tabular-nums',
    },
    segmentSum: {
        color: tokens.colorNeutralForeground2,
        fontVariantNumeric: 'tabular-nums',
    },
    segmentBody: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalXS),
        ...shorthands.padding(0, tokens.spacingHorizontalM, tokens.spacingVerticalM),
    },
    listCard: {
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalXS),
    },
    headerRow: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shorthands.gap(tokens.spacingHorizontalM),
        ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        cursor: 'pointer',
        backgroundColor: tokens.colorNeutralBackground1,
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
        ':focus-visible': {
            ...shorthands.outline('2px', 'solid', tokens.colorStrokeFocus2),
        },
    },
    headerRowMain: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    headerRowMeta: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalS),
        flexShrink: 0,
    },
    muted: {
        color: tokens.colorNeutralForeground3,
    },
    amount: {
        fontWeight: tokens.fontWeightSemibold,
        fontVariantNumeric: 'tabular-nums',
    },
    spinnerWrap: {
        display: 'flex',
        justifyContent: 'center',
        ...shorthands.padding(tokens.spacingVerticalXXL),
    },
    dialogFields: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap(tokens.spacingVerticalM),
        minWidth: '320px',
    },
    srOnly: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        ...shorthands.padding('0'),
        ...shorthands.margin('-1px'),
        ...shorthands.overflow('hidden'),
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        ...shorthands.borderWidth('0'),
    },
    legend: {
        display: 'flex',
        flexWrap: 'wrap',
        ...shorthands.gap(tokens.spacingHorizontalM),
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap(tokens.spacingHorizontalXS),
        color: tokens.colorNeutralForeground2,
        fontSize: tokens.fontSizeBase200,
    },
    legendSwatch: {
        width: '10px',
        height: '10px',
        ...shorthands.borderRadius(tokens.borderRadiusSmall),
        display: 'inline-block',
        flexShrink: 0,
    },
});

// ---------- Status badge ----------

function StatusBadge(props: { code: number }) {
    const meta = statusMetaFor(props.code);
    return (
        <Badge appearance="tint" color={meta.badge} icon={<StatusIcon code={props.code} />}>
            {meta.label}
        </Badge>
    );
}

// ---------- KPI card ----------

interface KpiCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    hint?: string;
}

function KpiCard(props: KpiCardProps) {
    const styles = useStyles();
    return (
        <Card
            className={styles.kpiCard}
            aria-label={`${props.label}: ${props.value}${props.hint ? `. ${props.hint}` : ''}`}
        >
            <span className={styles.kpiLabelRow}>
                {props.icon}
                <Text size={200}>{props.label}</Text>
            </span>
            <Text className={styles.kpiValue}>{props.value}</Text>
            {props.hint ? (
                <Text size={200} className={styles.kpiHint}>
                    {props.hint}
                </Text>
            ) : null}
        </Card>
    );
}

// ---------- Spend by status donut ----------

interface StatusDatum {
    label: string;
    value: number;
    color: string;
}

const STATUS_DONUT_ANIM_KEY = '__ppMyExpensesDashboardStatusDonutAnimated';

function SpendByStatusDonut(props: { data: StatusDatum[] }) {
    const styles = useStyles();
    const svgRef = useRef<SVGSVGElement>(null);
    const { data } = props;

    useEffect(() => {
        const node = svgRef.current;
        if (!node) return;
        const svg = d3.select(node);
        const w = window as unknown as Record<string, boolean>;
        const shouldAnimate = !w[STATUS_DONUT_ANIM_KEY];
        w[STATUS_DONUT_ANIM_KEY] = true;

        svg.selectAll('*').remove();

        const rect = node.getBoundingClientRect();
        const width = rect.width || 360;
        const height = rect.height || 260;
        const radius = Math.min(width, height) / 2 - 8;
        const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

        const total = d3.sum(data, (d) => d.value);
        if (!data.length || total <= 0) {
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', tokens.colorNeutralForeground3)
                .attr('font-size', '13px')
                .text('No spend to show');
            return;
        }

        const pie = d3.pie<StatusDatum>().value((d) => d.value).sort(null);
        const arc = d3.arc<d3.PieArcDatum<StatusDatum>>().innerRadius(radius * 0.6).outerRadius(radius);
        const arcs = g
            .selectAll('path.arc')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('fill', (d) => d.data.color)
            .attr('stroke', tokens.colorNeutralBackground1)
            .attr('stroke-width', 2);

        if (shouldAnimate) {
            arcs.transition()
                .duration(700)
                .attrTween('d', function (d) {
                    const i = d3.interpolate({ ...d, endAngle: d.startAngle }, d);
                    return (t) => arc(i(t)) ?? '';
                });
        } else {
            arcs.attr('d', (d) => arc(d) ?? '');
        }

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.1em')
            .attr('fill', tokens.colorNeutralForeground1)
            .attr('font-size', '16px')
            .attr('font-weight', 600)
            .text(formatMoneyShort(total));
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.3em')
            .attr('fill', tokens.colorNeutralForeground3)
            .attr('font-size', '11px')
            .text('Total spend');
    }, [data]);

    const summary = data.length
        ? data.map((d) => `${d.label}: ${formatMoney(d.value)}`).join(', ')
        : 'No spend recorded.';

    return (
        <>
            <svg
                ref={svgRef}
                className={styles.chartSvg}
                role="img"
                aria-label={`Spend by status donut chart. ${summary}`}
            />
            <span className={styles.srOnly}>{summary}</span>
        </>
    );
}

// ---------- Spend by month bar chart ----------

interface MonthDatum {
    label: string;
    value: number;
}

const MONTH_BARS_ANIM_KEY = '__ppMyExpensesDashboardMonthBarsAnimated';

function SpendByMonthChart(props: { data: MonthDatum[] }) {
    const styles = useStyles();
    const svgRef = useRef<SVGSVGElement>(null);
    const { data } = props;

    useEffect(() => {
        const node = svgRef.current;
        if (!node) return;
        const svg = d3.select(node);
        const w = window as unknown as Record<string, boolean>;
        const shouldAnimate = !w[MONTH_BARS_ANIM_KEY];
        w[MONTH_BARS_ANIM_KEY] = true;

        svg.selectAll('*').remove();

        const rect = node.getBoundingClientRect();
        const width = rect.width || 360;
        const height = rect.height || 260;
        const margin = { top: 12, right: 12, bottom: 28, left: 52 };
        const innerW = Math.max(width - margin.left - margin.right, 10);
        const innerH = Math.max(height - margin.top - margin.bottom, 10);
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        if (!data.length) {
            g.append('text')
                .attr('x', innerW / 2)
                .attr('y', innerH / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', tokens.colorNeutralForeground3)
                .attr('font-size', '13px')
                .text('No dated expenses to show');
            return;
        }

        const x = d3
            .scaleBand<string>()
            .domain(data.map((d) => d.label))
            .range([0, innerW])
            .padding(0.3);
        const maxV = d3.max(data, (d) => d.value) ?? 0;
        const y = d3.scaleLinear().domain([0, maxV * 1.1 || 1]).range([innerH, 0]);

        g.append('g')
            .attr('transform', `translate(0,${innerH})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .attr('color', tokens.colorNeutralForeground3)
            .selectAll('text')
            .attr('font-size', '10px');

        g.append('g')
            .call(d3.axisLeft(y).ticks(4).tickFormat((d) => formatMoneyShort(d as number)))
            .attr('color', tokens.colorNeutralForeground3)
            .selectAll('text')
            .attr('font-size', '10px');

        const bars = g
            .selectAll('rect.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => x(d.label) ?? 0)
            .attr('width', x.bandwidth())
            .attr('fill', tokens.colorBrandBackground)
            .attr('rx', 3);

        if (shouldAnimate) {
            bars.attr('y', innerH)
                .attr('height', 0)
                .transition()
                .duration(700)
                .attr('y', (d) => y(d.value))
                .attr('height', (d) => innerH - y(d.value));
        } else {
            bars.attr('y', (d) => y(d.value)).attr('height', (d) => innerH - y(d.value));
        }
    }, [data]);

    const summary = data.length
        ? data.map((d) => `${d.label}: ${formatMoney(d.value)}`).join(', ')
        : 'No dated expenses recorded.';

    return (
        <>
            <svg
                ref={svgRef}
                className={styles.chartSvg}
                role="img"
                aria-label={`Spend by month bar chart. ${summary}`}
            />
            <span className={styles.srOnly}>{summary}</span>
        </>
    );
}

// ---------- Expense header row ----------

interface HeaderRowProps {
    header: ExpenseHeaderRow;
    lineCount: number;
    onOpen: () => void;
}

function ExpenseHeaderRowItem(props: HeaderRowProps) {
    const styles = useStyles();
    const { header, lineCount, onOpen } = props;
    const name = header.cp_name ?? 'Draft expense';
    const contactName = formattedValue(header as Record<string, unknown>, '_cp_contactid_value');
    const meta = statusMetaFor(header.statuscode);
    const subtitle = [formatDate(header.cp_date), contactName].filter(Boolean).join(' · ');

    return (
        <div
            className={styles.headerRow}
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen();
                }
            }}
            aria-label={`Open ${name}, ${formatMoney(header.cp_totalamount)}, ${lineCount} line${
                lineCount === 1 ? '' : 's'
            }, status ${meta.label}`}
        >
            <div className={styles.headerRowMain}>
                <Text weight="semibold">{name}</Text>
                <Text size={200} className={styles.muted}>
                    {subtitle || '—'}
                </Text>
            </div>
            <div className={styles.headerRowMeta}>
                <CounterBadge
                    count={lineCount}
                    appearance="filled"
                    color="informative"
                    showZero
                    aria-label={`${lineCount} expense lines`}
                />
                <Text className={styles.amount}>{formatMoney(header.cp_totalamount)}</Text>
                <StatusBadge code={header.statuscode ?? STATUS_OPEN} />
                <OpenRegular aria-hidden />
            </div>
        </div>
    );
}

// ---------- New expense dialog ----------

interface NewExpenseDialogProps {
    open: boolean;
    mountNode: HTMLElement | null;
    contacts: ContactOption[];
    dataApi: LooseDataApi;
    onClose: () => void;
    onCreated: () => void;
}

function NewExpenseDialog(props: NewExpenseDialogProps) {
    const styles = useStyles();
    const { open, mountNode, contacts, dataApi, onClose, onCreated } = props;

    const [date, setDate] = useState<Date | null>(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [contactId, setContactId] = useState('');
    const [contactQuery, setContactQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDate(null);
            setDescription('');
            setAmount('');
            setContactId('');
            setContactQuery('');
            setSubmitting(false);
            setFormError(null);
        }
    }, [open]);

    const contactMatches = useMemo(() => {
        const q = contactQuery.trim().toLowerCase();
        const base = q ? contacts.filter((c) => c.name.toLowerCase().includes(q)) : contacts;
        return base.slice(0, 50);
    }, [contacts, contactQuery]);

    const handleSubmit = async () => {
        if (submitting) return;

        if (!date) {
            setFormError('Select a date for this expense.');
            return;
        }
        const parsedAmount = Number(amount);
        if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setFormError('Enter a valid total amount (0 or greater).');
            return;
        }

        const payload: Record<string, unknown> = {
            cp_date: toDateOnly(date),
            cp_description: description.trim(),
            cp_totalamount: parsedAmount,
        };
        if (contactId) {
            payload._cp_contactid_value = `/contact(${contactId})`;
        }

        setSubmitting(true);
        setFormError(null);
        try {
            await dataApi.createRow('cp_expenseheader', payload);
            onCreated();
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to create the expense.';
            setFormError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, d) => {
                if (!d.open) onClose();
            }}
            modalType="non-modal"
        >
            <DialogSurface mountNode={mountNode}>
                <DialogBody>
                    <DialogTitle>New expense</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogFields}>
                            {formError ? (
                                <MessageBar intent="error">
                                    <MessageBarBody>{formError}</MessageBarBody>
                                </MessageBar>
                            ) : null}
                            <Field label="Date" required>
                                <DatePicker
                                    mountNode={mountNode ?? undefined}
                                    value={date}
                                    onSelectDate={(d) => setDate(d ?? null)}
                                    placeholder="Select a date"
                                    aria-label="Expense date"
                                />
                            </Field>
                            <Field label="Description">
                                <Textarea
                                    value={description}
                                    onChange={(_, d) => setDescription(d.value)}
                                    placeholder="What was this expense for?"
                                    resize="vertical"
                                />
                            </Field>
                            <Field label="Total amount" required hint="In US dollars">
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={amount}
                                    onChange={(_, d) => setAmount(d.value)}
                                    contentBefore={<Text>$</Text>}
                                    placeholder="0.00"
                                />
                            </Field>
                            <Field label="Contact">
                                <Combobox
                                    placeholder="Select a contact"
                                    freeform
                                    value={contactQuery}
                                    selectedOptions={contactId ? [contactId] : []}
                                    onChange={(e) => {
                                        setContactQuery(e.target.value);
                                        if (!e.target.value) setContactId('');
                                    }}
                                    onOptionSelect={(_, d) => {
                                        setContactId(d.optionValue ?? '');
                                        setContactQuery(d.optionText ?? '');
                                    }}
                                >
                                    {contactMatches.map((c) => (
                                        <Option key={c.id} value={c.id} text={c.name}>
                                            {c.name}
                                        </Option>
                                    ))}
                                </Combobox>
                            </Field>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" icon={<DismissRegular />} onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button appearance="primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Creating…' : 'Create expense'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

// ---------- Main component ----------

type PageProps = GeneratedComponentProps & {
    pageInput?: { entityName?: string; recordId?: string; data?: Record<string, unknown> };
};

const GeneratedComponent = (props: PageProps) => {
    const { dataApi, pageInput } = props;
    void pageInput; // destructured per rules; this dashboard takes no page input
    const styles = useStyles();

    const looseApi = dataApi as unknown as LooseDataApi;
    const dataReady = !!dataApi;

    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
    const setContainer = useCallback((node: HTMLDivElement | null) => setMountNode(node), []);

    const [state, setState] = useState<DashboardState>(() => {
        const cached = winAny[CACHE_KEY] as DashboardData | undefined;
        return {
            headers: cached?.headers ?? [],
            lineCounts: cached?.lineCounts ?? {},
            contacts: cached?.contacts ?? [],
            loading: cached === undefined,
            error: null,
        };
    });
    const [reloadKey, setReloadKey] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!dataReady) return;

        const cached = winAny[CACHE_KEY] as DashboardData | undefined;
        if (cached !== undefined && reloadKey === 0) {
            setState((prev) =>
                prev.headers === cached.headers
                    ? prev
                    : { ...cached, loading: false, error: null },
            );
            return;
        }

        let cancelled = false;

        let inflight = winAny[INFLIGHT_KEY] as Promise<DashboardData> | undefined;
        if (!inflight) {
            inflight = fetchDashboardData(looseApi)
                .then((result) => {
                    winAny[CACHE_KEY] = result;
                    return result;
                })
                .finally(() => {
                    if (winAny[INFLIGHT_KEY] === inflight) delete winAny[INFLIGHT_KEY];
                });
            winAny[INFLIGHT_KEY] = inflight;
        }

        inflight
            .then((result) => {
                if (!cancelled) setState({ ...result, loading: false, error: null });
            })
            .catch(() => {
                if (!cancelled) {
                    setState({
                        headers: [],
                        lineCounts: {},
                        contacts: [],
                        loading: false,
                        error: 'Unable to load your expenses. Please try again.',
                    });
                }
            });

        return () => {
            cancelled = true;
        };
        // Depend on readiness + reloadKey only — never `dataApi` (new ref each render).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataReady, reloadKey]);

    const { headers, lineCounts, contacts } = state;

    const segments = useMemo(
        () =>
            STATUS_ORDER.map((code) => {
                const rows = headers.filter((h) => (h.statuscode ?? STATUS_OPEN) === code);
                const sum = rows.reduce((acc, h) => acc + (h.cp_totalamount ?? 0), 0);
                return { code, meta: statusMetaFor(code), rows, sum };
            }),
        [headers],
    );

    const kpis = useMemo(() => {
        const sumFor = (codes: number[]) =>
            headers
                .filter((h) => codes.includes(h.statuscode ?? STATUS_OPEN))
                .reduce((acc, h) => acc + (h.cp_totalamount ?? 0), 0);
        return {
            total: headers.length,
            outstanding: sumFor([STATUS_OPEN, STATUS_SUBMITTED]),
            awaiting: sumFor([STATUS_APPROVED]),
            reimbursed: sumFor([STATUS_PAID]),
        };
    }, [headers]);

    const statusChartData = useMemo<StatusDatum[]>(
        () =>
            segments
                .filter((s) => s.sum > 0)
                .map((s) => ({ label: s.meta.label, value: s.sum, color: s.meta.chartColor })),
        [segments],
    );

    const monthChartData = useMemo<MonthDatum[]>(() => {
        const map = new Map<string, { label: string; value: number; sort: number }>();
        headers.forEach((h) => {
            if (!h.cp_date) return;
            const d = new Date(h.cp_date);
            if (Number.isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const existing =
                map.get(key) ??
                {
                    label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    value: 0,
                    sort: d.getFullYear() * 12 + d.getMonth(),
                };
            existing.value += h.cp_totalamount ?? 0;
            map.set(key, existing);
        });
        return Array.from(map.values())
            .sort((a, b) => a.sort - b.sort)
            .map((m) => ({ label: m.label, value: m.value }));
    }, [headers]);

    const recent = useMemo(() => headers.slice(0, 8), [headers]);

    const navigateToDetail = useCallback((id: string) => {
        if (!id) return;
        const xrm = (window as unknown as { Xrm?: any }).Xrm;
        try {
            xrm?.Navigation?.navigateTo({
                pageType: 'generative',
                pageId: '3087885f-ddd8-43f3-b89e-e3cddfce72e2',
                entityName: 'cp_expenseheader',
                recordId: id,
                data: { expenseHeaderId: id, recordId: id },
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Navigation to expense detail failed', err);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        delete winAny[CACHE_KEY];
        delete winAny[INFLIGHT_KEY];
        setState((prev) => ({ ...prev, loading: true, error: null }));
        setReloadKey((k) => k + 1);
    }, []);

    const toggleSegment = useCallback((code: number) => {
        setCollapsed((prev) => ({ ...prev, [code]: !(prev[code] ?? false) }));
    }, []);

    if (state.loading && headers.length === 0) {
        return (
            <div ref={setContainer} className={styles.root}>
                <div className={styles.spinnerWrap}>
                    <Spinner labelPosition="below" label="Loading your expenses…" />
                </div>
            </div>
        );
    }

    return (
        <div ref={setContainer} className={styles.root}>
            <div className={styles.headerBar}>
                <div className={styles.titleGroup}>
                    <ReceiptRegular />
                    <Text as="h1" size={700} weight="semibold">
                        My expenses
                    </Text>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        appearance="secondary"
                        icon={<ArrowClockwiseRegular />}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                    <Button
                        appearance="primary"
                        icon={<AddRegular />}
                        onClick={() => setDialogOpen(true)}
                    >
                        New expense
                    </Button>
                </div>
            </div>

            {state.error ? (
                <MessageBar intent="error">
                    <MessageBarBody>{state.error}</MessageBarBody>
                </MessageBar>
            ) : null}

            <section className={styles.kpiRow} aria-label="Expense summary">
                <KpiCard
                    icon={<ReceiptRegular />}
                    label="Total expenses"
                    value={String(kpis.total)}
                    hint="All statuses"
                />
                <KpiCard
                    icon={<ClockRegular />}
                    label="Outstanding"
                    value={formatMoney(kpis.outstanding)}
                    hint="Open + submitted"
                />
                <KpiCard
                    icon={<CheckmarkCircleRegular />}
                    label="Awaiting payment"
                    value={formatMoney(kpis.awaiting)}
                    hint="Approved"
                />
                <KpiCard
                    icon={<MoneyRegular />}
                    label="Reimbursed"
                    value={formatMoney(kpis.reimbursed)}
                    hint="Paid"
                />
            </section>

            <section className={styles.chartsRow} aria-label="Spend charts">
                <Card className={styles.chartCard}>
                    <Text className={styles.chartTitle}>Spend by status</Text>
                    <SpendByStatusDonut data={statusChartData} />
                    <div className={styles.legend}>
                        {statusChartData.map((d) => (
                            <span key={d.label} className={styles.legendItem}>
                                <span
                                    className={styles.legendSwatch}
                                    style={{ backgroundColor: d.color }}
                                    aria-hidden
                                />
                                {d.label} · {formatMoney(d.value)}
                            </span>
                        ))}
                    </div>
                </Card>
                <Card className={styles.chartCard}>
                    <Text className={styles.chartTitle}>Spend by month</Text>
                    <SpendByMonthChart data={monthChartData} />
                </Card>
            </section>

            <Text as="h2" className={styles.sectionTitle}>
                Expenses by status
            </Text>
            <section className={styles.segmentsRow} aria-label="Expenses grouped by status">
                {segments.map((seg) => {
                    const isCollapsed = collapsed[seg.code] ?? false;
                    const regionId = `segment-region-${seg.code}`;
                    return (
                        <Card key={seg.code} className={styles.segmentCard}>
                            <button
                                type="button"
                                className={styles.segmentToggle}
                                aria-expanded={!isCollapsed}
                                aria-controls={regionId}
                                onClick={() => toggleSegment(seg.code)}
                            >
                                {isCollapsed ? <ChevronRightRegular /> : <ChevronDownRegular />}
                                <StatusBadge code={seg.code} />
                                <span className={styles.segmentToggleSpacer} />
                                <span className={styles.segmentCount}>{seg.rows.length}</span>
                                <span className={styles.segmentSum}>{formatMoney(seg.sum)}</span>
                            </button>
                            {!isCollapsed ? (
                                <div id={regionId} className={styles.segmentBody} role="region" aria-label={`${seg.meta.label} expenses`}>
                                    {seg.rows.length === 0 ? (
                                        <Text size={200} className={styles.muted}>
                                            No expenses in this status.
                                        </Text>
                                    ) : (
                                        seg.rows.map((h) => (
                                            <ExpenseHeaderRowItem
                                                key={h.cp_expenseheaderid}
                                                header={h}
                                                lineCount={lineCounts[guidOf(h.cp_expenseheaderid)] ?? 0}
                                                onOpen={() => navigateToDetail(h.cp_expenseheaderid)}
                                            />
                                        ))
                                    )}
                                </div>
                            ) : null}
                        </Card>
                    );
                })}
            </section>

            <Text as="h2" className={styles.sectionTitle}>
                Recent activity
            </Text>
            <Card className={styles.listCard} aria-label="Recent expense activity">
                {recent.length === 0 ? (
                    <Text className={styles.muted}>No expenses yet. Create one to get started.</Text>
                ) : (
                    recent.map((h, idx) => (
                        <React.Fragment key={h.cp_expenseheaderid}>
                            {idx > 0 ? <Divider /> : null}
                            <ExpenseHeaderRowItem
                                header={h}
                                lineCount={lineCounts[guidOf(h.cp_expenseheaderid)] ?? 0}
                                onOpen={() => navigateToDetail(h.cp_expenseheaderid)}
                            />
                        </React.Fragment>
                    ))
                )}
            </Card>

            <NewExpenseDialog
                open={dialogOpen}
                mountNode={mountNode}
                contacts={contacts}
                dataApi={looseApi}
                onClose={() => setDialogOpen(false)}
                onCreated={handleRefresh}
            />
        </div>
    );
};

export default GeneratedComponent;
