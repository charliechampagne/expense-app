import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { TableRow, GeneratedComponentProps } from "./RuntimeTypes";
import {
    makeStyles,
    tokens,
    Text,
    Spinner,
    Button,
    Card,
    CardHeader,
    Badge,
    Divider,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbButton,
    BreadcrumbDivider,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    MessageBarActions,
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
    DataGrid,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridRow,
    DataGridBody,
    DataGridCell,
    TableCellLayout,
    createTableColumn,
} from "@fluentui/react-components";
import type { TableColumnDefinition, TableColumnSizingOptions } from "@fluentui/react-components";
import { DatePicker } from "@fluentui/react-datepicker-compat";
import {
    ArrowLeftRegular,
    ArrowSyncRegular,
    EditRegular,
    AddRegular,
    CheckmarkCircleRegular,
    WarningRegular,
    AttachRegular,
    DocumentRegular,
    SendRegular,
    MoneyRegular,
    LockClosedRegular,
    DismissRegular,
} from "@fluentui/react-icons";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type PageProps = GeneratedComponentProps & {
    pageInput?: {
        entityName?: string;
        recordId?: string;
        data?: Record<string, unknown>;
    };
};

type ExpenseHeaderRow = TableRow<{
    readonly cp_expenseheaderid: string;
    cp_name?: string;
    cp_date?: Date | string | null;
    cp_description?: string;
    cp_totalamount?: number;
    statuscode?: number;
    _cp_contactid_value?: string | null;
}>;

type ExpenseLineRow = TableRow<{
    readonly cp_expenselineid: string;
    cp_name?: string;
    cp_date?: Date | string | null;
    cp_amount?: number;
    cp_description?: string;
    readonly cp_receipt_name?: string;
    _cp_expenseheaderid_value?: string;
}>;

type ContactOption = TableRow<{
    readonly contactid: string;
    fullname?: string;
}>;

type DetailPayload = {
    header: ExpenseHeaderRow | null;
    lines: ExpenseLineRow[];
    contacts: ContactOption[];
};

type BadgeColor =
    | "brand"
    | "danger"
    | "important"
    | "informative"
    | "severe"
    | "subtle"
    | "success"
    | "warning";

// ----------------------------------------------------------------------------
// Constants / utilities
// ----------------------------------------------------------------------------

const STATUS_OPEN = 1;
const STATUS_SUBMITTED = 121570000;
const STATUS_APPROVED = 121570001;
const STATUS_PAID = 121570002;
const STATUS_CLOSED = 2;

const STATUS_META: Record<number, { label: string; color: BadgeColor }> = {
    [STATUS_OPEN]: { label: "Open", color: "brand" },
    [STATUS_SUBMITTED]: { label: "Submitted", color: "warning" },
    [STATUS_APPROVED]: { label: "Approved", color: "success" },
    [STATUS_PAID]: { label: "Paid", color: "important" },
    [STATUS_CLOSED]: { label: "Closed", color: "informative" },
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

function formatCurrency(value: unknown): string {
    const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(n);
}

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === "string") {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function formatDate(value: unknown): string {
    const d = toDate(value);
    if (!d) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Normalise a picked date to local noon so a date-only value is not shifted a
// day when the DataAPI serialises it to UTC.
function atNoon(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function extractGuid(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const match = value.match(/\(([^)]+)\)/);
    const raw = match ? match[1] : value;
    return raw.replace(/[{}]/g, "").toLowerCase();
}

function errorText(err: unknown, fallback: string): string {
    return err instanceof Error && err.message ? err.message : fallback;
}

// ----------------------------------------------------------------------------
// Window-scoped cache + in-flight de-dupe (survives the host double-mount and
// module re-evaluation on back navigation). Keyed by recordId.
// ----------------------------------------------------------------------------

const CACHE_KEY = "__ppExpenseDetail_payloadCache";
const INFLIGHT_KEY = "__ppExpenseDetail_payloadInflight";
const winAny = window as unknown as Record<string, unknown>;

const payloadCache: Map<string, DetailPayload> =
    (winAny[CACHE_KEY] as Map<string, DetailPayload> | undefined) ?? new Map();
winAny[CACHE_KEY] = payloadCache;

const payloadInflight: Map<string, Promise<DetailPayload>> =
    (winAny[INFLIGHT_KEY] as Map<string, Promise<DetailPayload>> | undefined) ?? new Map();
winAny[INFLIGHT_KEY] = payloadInflight;

const HEADER_SELECT = [
    "cp_expenseheaderid",
    "cp_name",
    "cp_date",
    "cp_description",
    "cp_totalamount",
    "statuscode",
    "_cp_contactid_value",
];

const LINE_SELECT = [
    "cp_expenselineid",
    "cp_name",
    "cp_date",
    "cp_amount",
    "cp_description",
    "cp_receipt_name",
    "_cp_expenseheaderid_value",
];

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const useStyles = makeStyles({
    root: {
        position: "relative",
        contain: "layout",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalXL,
        backgroundColor: tokens.colorNeutralBackground2,
        color: tokens.colorNeutralForeground1,
    },
    headerBar: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacingHorizontalM,
    },
    headerActions: {
        display: "flex",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalS,
    },
    titleRow: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    card: {
        padding: tokens.spacingHorizontalL,
    },
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: tokens.spacingVerticalM,
        marginTop: tokens.spacingVerticalM,
    },
    fieldLabel: {
        display: "block",
        color: tokens.colorNeutralForeground2,
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase200,
        marginBottom: tokens.spacingVerticalXXS,
    },
    fieldValue: {
        display: "block",
        fontSize: tokens.fontSizeBase300,
        whiteSpace: "pre-wrap",
    },
    reconRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    },
    reconText: {
        display: "flex",
        flexDirection: "column",
    },
    sectionTitle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalS,
    },
    gridWrap: {
        overflowX: "auto",
    },
    emptyLines: {
        padding: tokens.spacingVerticalXL,
        textAlign: "center",
        color: tokens.colorNeutralForeground2,
    },
    dialogFields: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        minWidth: "280px",
    },
    spinnerWrap: {
        display: "flex",
        justifyContent: "center",
        padding: tokens.spacingVerticalXXL,
    },
    truncate: {
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    srOnly: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
    },
});

// ----------------------------------------------------------------------------
// Small presentational helpers
// ----------------------------------------------------------------------------

function statusIcon(code: number | undefined): ReactNode {
    switch (code) {
        case STATUS_SUBMITTED:
            return <SendRegular />;
        case STATUS_APPROVED:
            return <CheckmarkCircleRegular />;
        case STATUS_PAID:
            return <MoneyRegular />;
        case STATUS_CLOSED:
            return <LockClosedRegular />;
        default:
            return <DocumentRegular />;
    }
}

const StatusBadge = (props: { code: number | undefined; label?: string }) => {
    const meta = props.code != null ? STATUS_META[props.code] : undefined;
    const color: BadgeColor = meta?.color ?? "subtle";
    const label = props.label || meta?.label || "Unknown";
    return (
        <Badge appearance="filled" color={color} icon={statusIcon(props.code)}>
            {label}
        </Badge>
    );
};

const FieldRow = (props: { label: string; children: ReactNode }) => {
    const styles = useStyles();
    return (
        <div>
            <Text as="span" className={styles.fieldLabel}>
                {props.label}
            </Text>
            <Text as="span" className={styles.fieldValue}>
                {props.children}
            </Text>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Lines grid
// ----------------------------------------------------------------------------

const lineColumns: TableColumnDefinition<ExpenseLineRow>[] = [
    createTableColumn<ExpenseLineRow>({
        columnId: "cp_name",
        compare: (a, b) => (a.cp_name ?? "").localeCompare(b.cp_name ?? ""),
        renderHeaderCell: () => "Line number",
        renderCell: (item) => (
            <TableCellLayout style={{ minWidth: 0 }}>
                <span title={item.cp_name ?? ""}>{item.cp_name ?? "—"}</span>
            </TableCellLayout>
        ),
    }),
    createTableColumn<ExpenseLineRow>({
        columnId: "cp_date",
        compare: (a, b) => (toDate(a.cp_date)?.getTime() ?? 0) - (toDate(b.cp_date)?.getTime() ?? 0),
        renderHeaderCell: () => "Date",
        renderCell: (item) => <TableCellLayout>{formatDate(item.cp_date)}</TableCellLayout>,
    }),
    createTableColumn<ExpenseLineRow>({
        columnId: "cp_amount",
        compare: (a, b) => (a.cp_amount ?? 0) - (b.cp_amount ?? 0),
        renderHeaderCell: () => "Amount",
        renderCell: (item) => <TableCellLayout>{formatCurrency(item.cp_amount)}</TableCellLayout>,
    }),
    createTableColumn<ExpenseLineRow>({
        columnId: "cp_description",
        compare: (a, b) => (a.cp_description ?? "").localeCompare(b.cp_description ?? ""),
        renderHeaderCell: () => "Description",
        renderCell: (item) => (
            <TableCellLayout style={{ minWidth: 0 }}>
                <span
                    title={item.cp_description ?? ""}
                    style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.cp_description ?? "—"}
                </span>
            </TableCellLayout>
        ),
    }),
    createTableColumn<ExpenseLineRow>({
        columnId: "receipt",
        compare: (a, b) => Number(!!a.cp_receipt_name) - Number(!!b.cp_receipt_name),
        renderHeaderCell: () => "Receipt",
        renderCell: (item) =>
            item.cp_receipt_name ? (
                <TableCellLayout media={<AttachRegular />}>Attached</TableCellLayout>
            ) : (
                <TableCellLayout>None</TableCellLayout>
            ),
    }),
];

const lineColumnSizing: TableColumnSizingOptions = {
    cp_name: { defaultWidth: 150, minWidth: 110 },
    cp_date: { defaultWidth: 130, minWidth: 100 },
    cp_amount: { defaultWidth: 130, minWidth: 100 },
    cp_description: { defaultWidth: 280, minWidth: 140 },
    receipt: { defaultWidth: 130, minWidth: 90 },
};

const ExpenseLinesGrid = (props: { lines: ExpenseLineRow[] }) => {
    const styles = useStyles();
    if (props.lines.length === 0) {
        return (
            <div className={styles.emptyLines}>
                <Text>No expense lines yet. Use &ldquo;Add line&rdquo; to record the first one.</Text>
            </div>
        );
    }
    return (
        <div className={styles.gridWrap}>
            <DataGrid
                items={props.lines}
                columns={lineColumns}
                getRowId={(item) => item.cp_expenselineid}
                sortable
                resizableColumns
                columnSizingOptions={lineColumnSizing}
                aria-label="Expense lines"
            >
                <DataGridHeader>
                    <DataGridRow>
                        {({ renderHeaderCell }) => (
                            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                        )}
                    </DataGridRow>
                </DataGridHeader>
                <DataGridBody<ExpenseLineRow>>
                    {({ item, rowId }) => (
                        <DataGridRow<ExpenseLineRow> key={rowId}>
                            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                        </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Edit header dialog
// ----------------------------------------------------------------------------

type EditHeaderResult = {
    date: Date;
    description: string;
    totalAmount: number;
    contactId: string | undefined;
};

const EditHeaderDialog = (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mountNode: HTMLElement | null;
    header: ExpenseHeaderRow | null;
    contacts: ContactOption[];
    onSave: (result: EditHeaderResult) => Promise<void>;
}) => {
    const styles = useStyles();
    const [date, setDate] = useState<Date | null>(null);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [contactId, setContactId] = useState<string | undefined>(undefined);
    const [contactQuery, setContactQuery] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!props.open) return;
        const h = props.header;
        setDate(toDate(h?.cp_date));
        setDescription(h?.cp_description ?? "");
        setAmount(h?.cp_totalamount != null ? String(h.cp_totalamount) : "");
        const cid = extractGuid(h?._cp_contactid_value ?? undefined);
        setContactId(cid);
        const cname = h?.[
            "_cp_contactid_value@OData.Community.Display.V1.FormattedValue"
        ] as string | undefined;
        setContactQuery(cname ?? "");
        setError(null);
        setSaving(false);
    }, [props.open, props.header]);

    const filteredContacts = useMemo(() => {
        const q = contactQuery.trim().toLowerCase();
        const list = props.contacts;
        if (!q) return list.slice(0, 50);
        return list.filter((c) => (c.fullname ?? "").toLowerCase().includes(q)).slice(0, 50);
    }, [contactQuery, props.contacts]);

    const submit = async () => {
        if (!date) {
            setError("Select a date.");
            return;
        }
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
            setError("Enter a valid non-negative total amount.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await props.onSave({
                date: atNoon(date),
                description: description.trim(),
                totalAmount: parsedAmount,
                contactId,
            });
            props.onOpenChange(false);
        } catch (err) {
            setError(errorText(err, "Unable to save the expense header."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, d) => props.onOpenChange(d.open)}
            modalType="non-modal"
        >
            <DialogSurface mountNode={props.mountNode}>
                <DialogBody>
                    <DialogTitle>Edit expense header</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogFields}>
                            {error && (
                                <MessageBar intent="error">
                                    <MessageBarBody>{error}</MessageBarBody>
                                </MessageBar>
                            )}
                            <Field label="Date" required>
                                <DatePicker
                                    mountNode={props.mountNode}
                                    value={date}
                                    onSelectDate={(d) => setDate(d ?? null)}
                                    formatDate={(d) => (d ? d.toLocaleDateString() : "")}
                                    placeholder="Select a date"
                                />
                            </Field>
                            <Field label="Description">
                                <Textarea
                                    value={description}
                                    onChange={(_, d) => setDescription(d.value)}
                                    resize="vertical"
                                />
                            </Field>
                            <Field label="Total amount" required>
                                <Input
                                    type="number"
                                    value={amount}
                                    contentBefore={<Text>$</Text>}
                                    onChange={(_, d) => setAmount(d.value)}
                                />
                            </Field>
                            <Field label="Contact">
                                <Combobox
                                    mountNode={props.mountNode}
                                    placeholder="Select a contact"
                                    value={contactQuery}
                                    selectedOptions={contactId ? [contactId] : []}
                                    onChange={(e) => {
                                        setContactQuery(e.target.value);
                                    }}
                                    onOptionSelect={(_, d) => {
                                        setContactId(d.optionValue);
                                        setContactQuery(d.optionText ?? "");
                                    }}
                                >
                                    {contactId && (
                                        <Option value="" text="">
                                            (Clear selection)
                                        </Option>
                                    )}
                                    {filteredContacts.map((c) => (
                                        <Option
                                            key={c.contactid}
                                            value={c.contactid}
                                            text={c.fullname ?? "(no name)"}
                                        >
                                            {c.fullname ?? "(no name)"}
                                        </Option>
                                    ))}
                                </Combobox>
                            </Field>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            onClick={() => props.onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button appearance="primary" onClick={submit} disabled={saving}>
                            {saving ? "Saving…" : "Save"}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

// ----------------------------------------------------------------------------
// Add line dialog
// ----------------------------------------------------------------------------

type AddLineResult = {
    date: Date;
    amount: number;
    description: string;
};

const AddLineDialog = (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mountNode: HTMLElement | null;
    onSave: (result: AddLineResult) => Promise<void>;
}) => {
    const styles = useStyles();
    const [date, setDate] = useState<Date | null>(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!props.open) return;
        setDate(null);
        setAmount("");
        setDescription("");
        setError(null);
        setSaving(false);
    }, [props.open]);

    const submit = async () => {
        if (!date) {
            setError("Select a date.");
            return;
        }
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError("Enter an amount greater than zero.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await props.onSave({
                date: atNoon(date),
                amount: parsedAmount,
                description: description.trim(),
            });
            props.onOpenChange(false);
        } catch (err) {
            setError(errorText(err, "Unable to add the expense line."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, d) => props.onOpenChange(d.open)}
            modalType="non-modal"
        >
            <DialogSurface mountNode={props.mountNode}>
                <DialogBody>
                    <DialogTitle>Add expense line</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogFields}>
                            {error && (
                                <MessageBar intent="error">
                                    <MessageBarBody>{error}</MessageBarBody>
                                </MessageBar>
                            )}
                            <Field label="Date" required>
                                <DatePicker
                                    mountNode={props.mountNode}
                                    value={date}
                                    onSelectDate={(d) => setDate(d ?? null)}
                                    formatDate={(d) => (d ? d.toLocaleDateString() : "")}
                                    placeholder="Select a date"
                                />
                            </Field>
                            <Field label="Amount" required>
                                <Input
                                    type="number"
                                    value={amount}
                                    contentBefore={<Text>$</Text>}
                                    onChange={(_, d) => setAmount(d.value)}
                                />
                            </Field>
                            <Field label="Description">
                                <Textarea
                                    value={description}
                                    onChange={(_, d) => setDescription(d.value)}
                                    resize="vertical"
                                />
                            </Field>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            onClick={() => props.onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button appearance="primary" onClick={submit} disabled={saving}>
                            {saving ? "Saving…" : "Add line"}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

// ----------------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------------

const GeneratedComponent = (props: PageProps) => {
    const { dataApi, pageInput } = props;
    const styles = useStyles();

    // Primary channel is pageInput.recordId (how the dashboard passes the header
    // id); fall back to a custom data field if a caller uses that instead.
    const dataRecordId =
        typeof pageInput?.data?.recordId === "string"
            ? (pageInput.data.recordId as string)
            : typeof pageInput?.data?.expenseHeaderId === "string"
              ? (pageInput.data.expenseHeaderId as string)
              : undefined;
    const recordId = pageInput?.recordId ?? dataRecordId;

    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
    const setContainer = useCallback((node: HTMLDivElement | null) => setMountNode(node), []);

    const dataReady = !!dataApi && !!recordId;
    const cachedPayload = recordId ? payloadCache.get(recordId) ?? null : null;

    const [data, setData] = useState<{
        payload: DetailPayload | null;
        loading: boolean;
        error: string | null;
    }>(() => ({
        payload: cachedPayload,
        loading: !!recordId && cachedPayload === null,
        error: null,
    }));

    const [reloadKey, setReloadKey] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [banner, setBanner] = useState<string | null>(null);

    useEffect(() => {
        if (!dataReady || !recordId) return;
        const id = recordId;

        const hit = payloadCache.get(id);
        if (hit) {
            setData((prev) => (prev.payload === hit ? prev : { payload: hit, loading: false, error: null }));
            return;
        }

        let cancelled = false;
        let pending = payloadInflight.get(id);
        if (!pending) {
            pending = (async (): Promise<DetailPayload> => {
                const [header, linesResult, contactsResult] = await Promise.all([
                    dataApi.retrieveRow("cp_expenseheader", { id, select: HEADER_SELECT }),
                    dataApi.queryTable("cp_expenseline", {
                        select: LINE_SELECT,
                        filter: `_cp_expenseheaderid_value eq ${id}`,
                        orderBy: "cp_date asc",
                        pageSize: 250,
                    }),
                    dataApi.queryTable("contact", {
                        select: ["contactid", "fullname"],
                        orderBy: "fullname asc",
                        pageSize: 500,
                    }),
                ]);
                return {
                    header: header as unknown as ExpenseHeaderRow,
                    lines: ((linesResult.rows as unknown as ExpenseLineRow[]) ?? []),
                    contacts: ((contactsResult.rows as unknown as ContactOption[]) ?? []),
                };
            })()
                .then((payload) => {
                    payloadCache.set(id, payload);
                    return payload;
                })
                .finally(() => {
                    if (payloadInflight.get(id) === pending) payloadInflight.delete(id);
                });
            payloadInflight.set(id, pending);
        }

        pending
            .then((payload) => {
                if (!cancelled) setData({ payload, loading: false, error: null });
            })
            .catch((err) => {
                if (!cancelled) {
                    setData({
                        payload: null,
                        loading: false,
                        error: errorText(err, "Unable to load this expense."),
                    });
                }
            });

        return () => {
            cancelled = true;
        };
        // Readiness + recordId + reloadKey only — never `dataApi` (new ref each render).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataReady, recordId, reloadKey]);

    const lineSum = useMemo(
        () =>
            (data.payload?.lines ?? []).reduce(
                (sum, line) => sum + (typeof line.cp_amount === "number" ? line.cp_amount : 0),
                0,
            ),
        [data.payload],
    );

    const invalidateAndReload = useCallback(() => {
        if (recordId) {
            payloadCache.delete(recordId);
            payloadInflight.delete(recordId);
        }
        setData((prev) => ({ ...prev, loading: true }));
        setReloadKey((k) => k + 1);
    }, [recordId]);

    const goBack = useCallback(() => {
        const xrm = (
            window as unknown as {
                Xrm?: { Navigation?: { navigateTo: (opts: unknown) => unknown } };
            }
        ).Xrm;
        xrm?.Navigation?.navigateTo({
            pageType: "generative",
            pageId: "9d22cb9b-32da-4af9-a6c7-41432ca89843",
        });
    }, []);

    const handleEditSave = useCallback(
        async (result: EditHeaderResult) => {
            if (!recordId) return;
            await dataApi.updateRow("cp_expenseheader", recordId, {
                cp_date: result.date,
                cp_description: result.description,
                cp_totalamount: result.totalAmount,
                _cp_contactid_value: (result.contactId
                    ? `/contact(${result.contactId})`
                    : null) as unknown as `/contact(${string})`,
            });
            setBanner("Expense header updated.");
            invalidateAndReload();
        },
        [dataApi, recordId, invalidateAndReload],
    );

    const handleAddLine = useCallback(
        async (result: AddLineResult) => {
            if (!recordId) return;
            await dataApi.createRow("cp_expenseline", {
                cp_date: result.date,
                cp_amount: result.amount,
                cp_description: result.description,
                _cp_expenseheaderid_value: `/cp_expenseheader(${recordId})`,
            });
            setBanner("Expense line added.");
            invalidateAndReload();
        },
        [dataApi, recordId, invalidateAndReload],
    );

    // ----- Early returns (after all hooks) -----

    if (!recordId) {
        return (
            <div ref={setContainer} className={styles.root}>
                <MessageBar intent="warning">
                    <MessageBarBody>
                        <MessageBarTitle>No expense selected</MessageBarTitle>
                        Open this page from the My expenses dashboard to view an expense.
                    </MessageBarBody>
                </MessageBar>
                <div>
                    <Button appearance="primary" icon={<ArrowLeftRegular />} onClick={goBack}>
                        Back to dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (data.loading) {
        return (
            <div ref={setContainer} className={styles.root}>
                <div className={styles.spinnerWrap}>
                    <Spinner labelPosition="below" label="Loading expense…" />
                </div>
            </div>
        );
    }

    const header = data.payload?.header ?? null;

    if (data.error || !header) {
        return (
            <div ref={setContainer} className={styles.root}>
                <MessageBar intent="error">
                    <MessageBarBody>
                        <MessageBarTitle>Unable to load expense</MessageBarTitle>
                        {data.error ?? "This expense could not be found."}
                    </MessageBarBody>
                </MessageBar>
                <div className={styles.headerActions}>
                    <Button appearance="secondary" icon={<ArrowLeftRegular />} onClick={goBack}>
                        Back to dashboard
                    </Button>
                    <Button appearance="primary" icon={<ArrowSyncRegular />} onClick={invalidateAndReload}>
                        Try again
                    </Button>
                </div>
            </div>
        );
    }

    const lines = data.payload?.lines ?? [];
    const contacts = data.payload?.contacts ?? [];
    const statusCode = header.statuscode;
    const statusLabel =
        (header["statuscode@OData.Community.Display.V1.FormattedValue"] as string | undefined) ??
        (statusCode != null ? STATUS_META[statusCode]?.label : undefined);
    const contactName =
        (header["_cp_contactid_value@OData.Community.Display.V1.FormattedValue"] as
            | string
            | undefined) ?? "—";
    const expenseNumber = header.cp_name ?? "Expense";
    const headerTotal =
        typeof header.cp_totalamount === "number" ? header.cp_totalamount : 0;
    const difference = headerTotal - lineSum;
    const reconciled = Math.abs(difference) < 0.005;

    return (
        <div ref={setContainer} className={styles.root}>
            <div className={styles.headerBar}>
                <Breadcrumb aria-label="Breadcrumb">
                    <BreadcrumbItem>
                        <BreadcrumbButton onClick={goBack}>My expenses dashboard</BreadcrumbButton>
                    </BreadcrumbItem>
                    <BreadcrumbDivider />
                    <BreadcrumbItem>
                        <BreadcrumbButton current>{expenseNumber}</BreadcrumbButton>
                    </BreadcrumbItem>
                </Breadcrumb>
                <div className={styles.headerActions}>
                    <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={goBack}>
                        Back
                    </Button>
                    <Button
                        appearance="subtle"
                        icon={<ArrowSyncRegular />}
                        onClick={invalidateAndReload}
                    >
                        Refresh
                    </Button>
                    <Button
                        appearance="secondary"
                        icon={<EditRegular />}
                        onClick={() => setEditOpen(true)}
                        disabled={!dataApi}
                    >
                        Edit header
                    </Button>
                    <Button
                        appearance="primary"
                        icon={<AddRegular />}
                        onClick={() => setAddOpen(true)}
                        disabled={!dataApi}
                    >
                        Add line
                    </Button>
                </div>
            </div>

            {banner && (
                <MessageBar intent="success">
                    <MessageBarBody>{banner}</MessageBarBody>
                    <MessageBarActions
                        containerAction={
                            <Button
                                appearance="transparent"
                                icon={<DismissRegular />}
                                aria-label="Dismiss message"
                                onClick={() => setBanner(null)}
                            />
                        }
                    />
                </MessageBar>
            )}

            <Card className={styles.card}>
                <CardHeader
                    header={
                        <div className={styles.titleRow}>
                            <Text as="h1" size={600} weight="semibold">
                                {expenseNumber}
                            </Text>
                            <StatusBadge code={statusCode} label={statusLabel} />
                        </div>
                    }
                    description={
                        <Text size={200}>
                            {formatDate(header.cp_date)} &middot; {formatCurrency(headerTotal)}
                        </Text>
                    }
                />
                <div className={styles.summaryGrid}>
                    <FieldRow label="Expense number">{expenseNumber}</FieldRow>
                    <FieldRow label="Date">{formatDate(header.cp_date)}</FieldRow>
                    <FieldRow label="Total amount">{formatCurrency(headerTotal)}</FieldRow>
                    <FieldRow label="Status">{statusLabel ?? "Unknown"}</FieldRow>
                    <FieldRow label="Contact">{contactName}</FieldRow>
                    <FieldRow label="Description">{header.cp_description || "—"}</FieldRow>
                </div>
            </Card>

            <div
                className={styles.reconRow}
                role="status"
                aria-live="polite"
                style={{
                    borderColor: reconciled
                        ? tokens.colorStatusSuccessBorder1
                        : tokens.colorStatusWarningBorder1,
                    backgroundColor: reconciled
                        ? tokens.colorStatusSuccessBackground1
                        : tokens.colorStatusWarningBackground1,
                }}
            >
                {reconciled ? (
                    <CheckmarkCircleRegular
                        aria-hidden
                        style={{ color: tokens.colorStatusSuccessForeground1 }}
                    />
                ) : (
                    <WarningRegular
                        aria-hidden
                        style={{ color: tokens.colorStatusWarningForeground1 }}
                    />
                )}
                <span className={styles.reconText}>
                    <Text weight="semibold">
                        {reconciled
                            ? "Header total matches the sum of lines"
                            : "Header total does not match the sum of lines"}
                    </Text>
                    <Text size={200}>
                        Header {formatCurrency(headerTotal)} &middot; Lines {formatCurrency(lineSum)}
                        {!reconciled && (
                            <> &middot; Difference {formatCurrency(Math.abs(difference))}</>
                        )}
                    </Text>
                </span>
            </div>

            <Card className={styles.card}>
                <div className={styles.sectionTitle}>
                    <Text as="h2" size={500} weight="semibold">
                        Expense lines ({lines.length})
                    </Text>
                    <Button
                        appearance="secondary"
                        icon={<AddRegular />}
                        onClick={() => setAddOpen(true)}
                        disabled={!dataApi}
                    >
                        Add line
                    </Button>
                </div>
                <Divider />
                <div style={{ marginTop: tokens.spacingVerticalM }}>
                    <ExpenseLinesGrid lines={lines} />
                </div>
            </Card>

            <EditHeaderDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                mountNode={mountNode}
                header={header}
                contacts={contacts}
                onSave={handleEditSave}
            />
            <AddLineDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                mountNode={mountNode}
                onSave={handleAddLine}
            />
        </div>
    );
};

export default GeneratedComponent;
