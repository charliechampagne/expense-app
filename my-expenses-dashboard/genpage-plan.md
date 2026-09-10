# Genpage Plan

## User Requirements
**"My Expenses Dashboard"** — a submitter-focused page for the Expense App. The user chose: *"A submitter-focused page: my expense headers grouped by status, totals by status, recent activity, quick 'new expense' entry."* Interpret "my" as records owned by the current user. Desired elements: expense headers grouped/segmented by status reason, total amount rolled up per status, a recent-activity list, and a quick way to start a new expense. Include the related expense lines where it helps (drill-down and line count per header). Charts are in scope (spend by status / by month).

## Working Directory
C:/dev2026/expenseapp/my-expenses-dashboard

## Plugin Root
C:/Users/CharlesP/.claude/plugins/cache/power-platform-skills/model-apps/2.6.1

## Environment
- URL: https://legoland.crm3.dynamics.com
- App: create new: Expense App
- Languages: English (1033) only
- Solution: ExpenseApp
- Publisher Prefix: cp

## Pages
| Page | File | Purpose | Entities |
|------|------|---------|----------|
| My Expenses Dashboard | my-expenses-dashboard.tsx | Submitter overview of the current user's expense headers — grouped by status, per-status totals, spend charts, recent activity, quick new-expense dialog | cp_expenseheader, cp_expenseline, contact, systemuser |
| Expense Detail | expense-detail.tsx | Drill-down for a single expense header with its expense lines, totals reconciliation, and quick edit / add-line | cp_expenseheader, cp_expenseline, contact |

## Entity Creation Required
No entity creation required — all entities already exist.

## Existing Entities
cp_expenseheader, cp_expenseline, contact, systemuser

## Connector Bindings
No connector bindings.

## Custom API Bindings
No custom API bindings.

## Design Preferences
- Styling: Clean, professional finance/submitter aesthetic using the Fluent UI V9 default theme and design tokens (spacing, typography, color). Card-based layout with generous whitespace. Currency values formatted with `Intl.NumberFormat` (USD). Status reason is color-coded consistently across badges, segments and charts: Open = neutral/brand blue, Submitted = amber/warning, Approved = green/success, Paid = teal/strong success, Closed = neutral grey. Charts drawn as inline SVG with D3 (matching sample 8), each with a one-time animation guard.
- Features: Status-based grouping/segmentation of headers; per-status rollup of count and summed `cp_totalamount`; KPI summary cards (total headers, outstanding = Open+Submitted, awaiting payment = Approved, reimbursed = Paid); "Spend by status" chart (donut) and "Spend by month" chart (area/bar over `cp_date`); recent-activity list (latest headers by `modifiedon`); line count per header badge; quick "New Expense" create dialog; drill-down navigation to Expense Detail; on the detail page a header-total vs sum-of-lines reconciliation indicator, add-line and edit-header dialogs; manual refresh after mutations.
- Accessibility: WCAG AA. Status is always conveyed by a text label (and icon) in addition to color. Charts are `role="img"` with descriptive `aria-label` and a visually-hidden data summary. Dialogs are focus-trapped and restore focus on close. Grids and lists are fully keyboard navigable. Interactive cards/rows expose button/link semantics.

## Relevant Samples
| Page | Sample | Reason |
|------|--------|--------|
| My Expenses Dashboard | 8-dashboard-with-charts.tsx | KPI summary cards plus two D3/SVG charts and a metrics layout — direct structural match for the dashboard |
| My Expenses Dashboard | 12-dialog-form-overlay.tsx | Quick "New Expense" create form rendered as a modal dialog overlay |
| Expense Detail | 10-detail-with-pageinput.tsx | Single-record detail driven by `pageInput` recordId, with a related-rows grid and edit dialog |

## Per-Page Specifications

### My Expenses Dashboard
- **File:** my-expenses-dashboard.tsx
- **Purpose:** Submitter overview of the current user's expense headers — grouped by status, per-status totals, spend charts, recent activity, and a quick new-expense dialog.
- **Entities:** cp_expenseheader, cp_expenseline, contact, systemuser
- **Needs caching:** true
- **Key Features:**
  - Resolve the current user id (WhoAmI via the data API), then query `cp_expenseheader` filtered to `_ownerid_value eq <currentUserId>`.
  - Segment headers into the five `statuscode` buckets — Open (1), Submitted (121570000), Approved (121570001), Paid (121570002), Closed (2) — each shown as a collapsible section (Accordion on mobile, column/section on desktop) with record count and summed `cp_totalamount`.
  - KPI summary cards: total headers; outstanding amount (Open + Submitted); awaiting-payment amount (Approved); reimbursed amount (Paid).
  - "Spend by status" donut chart: sum of `cp_totalamount` grouped by `statuscode`.
  - "Spend by month" area/bar chart: sum of `cp_totalamount` grouped by month of `cp_date`.
  - Recent activity list: latest ~8 headers by `modifiedon` showing expense number (`cp_name`), `cp_date`, `cp_totalamount`, contact name, and a status badge.
  - Line count per header: aggregate `cp_expenseline` grouped by `_cp_expenseheaderid_value` (single grouped query), displayed as a badge on each header row.
  - Quick "New Expense" button opens a modal dialog with `cp_date` (DatePicker), `cp_description` (Textarea), `cp_totalamount` (currency Input), and `cp_contactid` (contact Combobox); on submit it creates the `cp_expenseheader` row (owner defaults to current user), closes the dialog and refreshes.
  - Clicking a header row navigates to the Expense Detail page via `PAGEREF_expense-detail`, passing the header id as recordId.
- **Components:** Fluent UI V9 — `Card`, `CardHeader`, `Text`, `Badge`/`CounterBadge`, `Button`, `Accordion`/`AccordionItem`, `Dialog`/`DialogSurface`/`DialogBody`, `Field`, `Input`, `Textarea`, `Combobox`/`Option`, `Spinner`, `MessageBar`; `DatePicker` from `@fluentui/react-datepicker-compat`; inline `<svg>` charts drawn with `d3` (per sample 8) with a one-time animation guard.
- **Layout:** Responsive. KPI cards in a wrapping flex/grid row. Charts two-up on desktop (`flex: 1 1 360px`), stacked on narrow viewports. Status segments render as side-by-side sections on wide screens and as a single-column Accordion on mobile.
- **Data Binding:** `dataApi` retrieveMultiple on `cp_expenseheader` with `$select` (`cp_name`, `cp_date`, `cp_description`, `cp_totalamount`, `statuscode`, `modifiedon`), `$filter` on `_ownerid_value`, `$orderby modifiedon desc`, `$expand cp_contactid($select=fullname)`; a second grouped/aggregate `dataApi` query on `cp_expenseline` for per-header line counts; WhoAmI call for the current user id. All grouping and summing for segments and charts done client-side from the fetched rows.
- **Interactions:** Expand/collapse status segments; open/close the New Expense dialog; submit create then refresh; click a header row or its "View" affordance to navigate to Expense Detail; manual "Refresh" button.

### Expense Detail
- **File:** expense-detail.tsx
- **Purpose:** Drill-down for a single expense header with its expense lines, header-vs-lines total reconciliation, and quick edit / add-line.
- **Entities:** cp_expenseheader, cp_expenseline, contact
- **Needs caching:** true
- **Key Features:**
  - Read `recordId` from `pageInput`; retrieve the `cp_expenseheader` row.
  - Header summary card: expense number (`cp_name`), `cp_date`, `cp_description`, `cp_totalamount`, contact name, and a status badge.
  - Expense lines DataGrid: `cp_name`, `cp_date`, `cp_amount`, `cp_description`, and a receipt-present indicator (`cp_receipt`).
  - Reconciliation indicator comparing `cp_totalamount` against the sum of line `cp_amount` (matched / mismatch by amount).
  - "Edit header" dialog for `cp_date`, `cp_description`, `cp_totalamount`, `cp_contactid`.
  - "Add line" dialog for `cp_date`, `cp_amount`, `cp_description`; creates a `cp_expenseline` linked to this header.
  - Back navigation to the dashboard.
- **Components:** Fluent UI V9 — `Card`, `CardHeader`, `Text`, `Badge`, `Button`, `DataGrid` (or `Table`), `Dialog`/`DialogSurface`/`DialogBody`, `Field`, `Input`, `Textarea`, `Combobox`, `Spinner`, `MessageBar`, `Breadcrumb`; `DatePicker` from `@fluentui/react-datepicker-compat`.
- **Layout:** Header summary card on top, lines grid below, single-column responsive; dialogs overlay.
- **Data Binding:** `dataApi` retrieve on `cp_expenseheader` by `recordId` with `$expand cp_contactid($select=fullname)`; `dataApi` retrieveMultiple on `cp_expenseline` with `$filter _cp_expenseheaderid_value eq <recordId>`, `$orderby cp_date`; create/update via `dataApi` for header edits and new lines.
- **Interactions:** Open/close edit-header and add-line dialogs; save then refresh; navigate back to My Expenses Dashboard.
