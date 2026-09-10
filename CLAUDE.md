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

## Conventions

- Environment-first: create metadata in the environment via API/SDK, then `pac solution export` + `unpack` into `./solutions/`. The repo is the source of truth.
- Never hand-write solution XML.
- Config lives in `.env` (git-ignored).
