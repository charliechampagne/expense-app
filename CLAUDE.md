# expenseapp — Dataverse project

## Environment

| | |
|---|---|
| **Dataverse URL** | https://legoland.crm3.dynamics.com/ |
| **Organization** | Legoland |
| **Tenant ID** | 671cd1ad-93ea-4de6-a5b7-bf10fa4375a1 |
| **Environment ID** | 97396214-f419-e308-88d9-ddef5812bdf2 |
| **Account** | Data@alphahousecalgary.com |
| **PAC auth profile** | `legoland` |
| **Solution** | `ExpenseApp` (display: "Expense App"), v1.0.0.0 |
| **Publisher** | Charles Paulinus (`Charles_Paulinus`) |
| **Publisher prefix** | `cp_` |

## Auth

- Dataverse CLI / MCP / Python SDK: shared MSAL cache from `dataverse auth create` (profile → Legoland).
- PAC CLI (`dv-solution`, `dv-admin`): `pac auth select --name legoland`.
- Python: `python scripts/auth.py --check` makes a real data-plane call.

## Data model (solution `ExpenseApp`)

Built by `scripts/build_expense_model.py` (idempotent; `--reset` drops the two tables first).

### `cp_expenseheader` — Expense Header
| Column | Logical name | Type | Notes |
|---|---|---|---|
| Expense Number | `cp_name` | Text (primary) | Autonumber `EXP-{SEQNUM:5}` |
| Date | `cp_date` | Date only | |
| Description | `cp_description` | Multiline text (2000) | |
| Total Amount | `cp_totalamount` | Currency | Manual (not a rollup) |
| Contact | `cp_contactid` | Lookup → `contact` | Delete: remove link |

**Status Reason (`statuscode`)**: Open (1, Active) · Submitted (121570000) · Approved (121570001) · Paid (121570002) · Closed (2, Inactive)

### `cp_expenseline` — Expense Line
| Column | Logical name | Type | Notes |
|---|---|---|---|
| Line Number | `cp_name` | Text (primary) | Autonumber `EXP-LINE-{SEQNUM:5}` |
| Date | `cp_date` | Date only | |
| Amount | `cp_amount` | Currency | |
| Description | `cp_description` | Multiline text (2000) | |
| Receipt | `cp_receipt` | File (32 MB) | |
| Expense Header | `cp_expenseheaderid` | Lookup → `cp_expenseheader` | Required; delete: **cascade** (parental) |

Relationships: `cp_expenseline_expenseheader` (1:N header→lines, cascade), `cp_expenseheader_contact` (N:1 header→contact).

### Sample data

`scripts/seed_sample_data.py` (idempotent) seeds 8 `contact` records (`*.example.com`), 7 expense headers (`EXP-1000`–`EXP-1006`, one per status incl. Closed), 19 expense lines (`EXP-LINE-1000`+), each line with a placeholder `.txt` receipt in `cp_receipt`. Header totals are set to the sum of their lines.

## Conventions

- Environment-first: create metadata in the environment via API/SDK, then `pac solution export` + `unpack` into `./solutions/`. The repo is the source of truth.
- Never hand-write solution XML.
- Config lives in `.env` (git-ignored).
