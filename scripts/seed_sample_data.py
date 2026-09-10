"""Seed sample Contacts + Expense Headers + Expense Lines into Legoland for dev/testing.

Idempotent: contacts matched by email, headers matched by (contact, description).
Re-running tops up only what's missing. Receipts (small .txt placeholders) are
uploaded to cp_expenseline.cp_receipt for lines that don't have one yet.

  python scripts/seed_sample_data.py
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client

client = get_client("dv-data")

# status: label -> (statecode, statuscode)
STATUS = {
    "Open": (0, 1),
    "Submitted": (0, 121570000),
    "Approved": (0, 121570001),
    "Paid": (0, 121570002),
    "Closed": (1, 2),
}

CONTACTS = [
    ("Ada", "Lovelace", "Analytics Lead"),
    ("Grace", "Hopper", "Principal Engineer"),
    ("Alan", "Turing", "Research Director"),
    ("Katherine", "Johnson", "Senior Analyst"),
    ("Linus", "Torvalds", "Platform Architect"),
    ("Margaret", "Hamilton", "Engineering Manager"),
    ("Dennis", "Ritchie", "Systems Developer"),
    ("Radia", "Perlman", "Network Engineer"),
]


def email_for(first, last):
    return f"{first}.{last}@example.com".lower()


# header spec: (contact_email, description, status, date, [ (line_date, amount, line_desc), ... ])
HEADERS = [
    (email_for("Ada", "Lovelace"), "Client onsite - Seattle", "Approved", "2026-07-10", [
        ("2026-07-08", 412.55, "Round-trip airfare SEA"),
        ("2026-07-08", 289.00, "Hotel - 2 nights"),
        ("2026-07-09", 64.20, "Client dinner"),
        ("2026-07-10", 38.75, "Airport rideshare"),
    ]),
    (email_for("Grace", "Hopper"), "Conference travel - PyCon", "Paid", "2026-05-22", [
        ("2026-05-18", 525.00, "Conference registration"),
        ("2026-05-19", 610.40, "Airfare"),
        ("2026-05-19", 432.10, "Hotel - 3 nights"),
        ("2026-05-21", 96.30, "Meals"),
    ]),
    (email_for("Alan", "Turing"), "Team offsite catering", "Submitted", "2026-08-28", [
        ("2026-08-28", 480.00, "Lunch catering - 12 people"),
        ("2026-08-28", 72.50, "Coffee and snacks"),
    ]),
    (email_for("Katherine", "Johnson"), "Home office equipment", "Open", "2026-09-05", [
        ("2026-09-03", 329.99, "Standing desk"),
        ("2026-09-03", 149.00, "Ergonomic chair mat + accessories"),
        ("2026-09-04", 89.95, "USB-C dock"),
    ]),
    (email_for("Linus", "Torvalds"), "Cloud infra reimbursement", "Approved", "2026-06-15", [
        ("2026-06-01", 220.00, "Personal cloud account - build agents"),
        ("2026-06-15", 180.00, "Container registry storage"),
    ]),
    (email_for("Margaret", "Hamilton"), "Recruiting dinner", "Closed", "2026-03-11", [
        ("2026-03-11", 214.80, "Dinner with 3 candidates"),
        ("2026-03-11", 32.00, "Parking"),
    ]),
    (email_for("Dennis", "Ritchie"), "Training course - Rust", "Submitted", "2026-09-01", [
        ("2026-08-25", 899.00, "Online course license"),
        ("2026-09-01", 45.00, "Reference books"),
    ]),
]


def ensure_contacts():
    wanted = {email_for(f, l): (f, l, t) for f, l, t in CONTACTS}
    existing = {}
    for r in client.records.list("contact", select=["contactid", "emailaddress1"],
                                 filter="emailaddress1 ne null"):
        if r.get("emailaddress1", "").lower() in wanted:
            existing[r["emailaddress1"].lower()] = r["contactid"]

    to_create = []
    for email, (first, last, title) in wanted.items():
        if email in existing:
            continue
        n = len(to_create)
        to_create.append({
            "firstname": first, "lastname": last, "emailaddress1": email,
            "jobtitle": title, "telephone1": f"555-01{20 + n:02d}",
        })
    if to_create:
        guids = client.records.create("contact", to_create)
        for rec, guid in zip(to_create, guids):
            existing[rec["emailaddress1"]] = guid
        print(f"contacts: +{len(guids)} created, {len(existing) - len(guids)} reused")
    else:
        print(f"contacts: 0 created, {len(existing)} reused")
    return existing


def ensure_headers_and_lines(contact_map):
    existing = {}
    for r in client.records.list("cp_expenseheader",
                                 select=["cp_expenseheaderid", "cp_description", "_cp_contactid_value"]):
        existing[(r.get("_cp_contactid_value"), r.get("cp_description"))] = r["cp_expenseheaderid"]

    receipts = []  # (line_guid, path)
    hdr_new = hdr_reused = line_new = 0

    for email, desc, status, hdate, lines in HEADERS:
        cid = contact_map.get(email)
        if not cid:
            print(f"  ! no contact for {email}, skipping header")
            continue
        state, statuscode = STATUS[status]
        total = round(sum(a for _, a, _ in lines), 2)
        key = (cid, desc)
        hid = existing.get(key)
        if hid:
            hdr_reused += 1
        else:
            body = {
                "cp_description": desc,
                "cp_date": hdate,
                "cp_totalamount": total,
                "cp_ContactId@odata.bind": f"/contacts({cid})",
            }
            hid = client.records.create("cp_expenseheader", body)
            hdr_new += 1
            # set status after create (Closed needs an inactive state transition)
            try:
                client.records.update("cp_expenseheader", hid,
                                      {"statecode": state, "statuscode": statuscode})
            except Exception as e:
                print(f"  ! status set failed for {desc}: {e}")

        # lines - only add if this header currently has none
        have_lines = list(client.records.list(
            "cp_expenseline", select=["cp_expenselineid"],
            filter=f"_cp_expenseheaderid_value eq {hid}"))
        if have_lines:
            continue
        line_bodies = [{
            "cp_description": ldesc,
            "cp_date": ldate,
            "cp_amount": amt,
            "cp_ExpenseHeaderId@odata.bind": f"/cp_expenseheaders({hid})",
        } for ldate, amt, ldesc in lines]
        line_guids = client.records.create("cp_expenseline", line_bodies)
        line_new += len(line_guids)
        for (ldate, amt, ldesc), lg in zip(lines, line_guids):
            receipts.append((lg, ldate, amt, ldesc))

    print(f"headers: +{hdr_new} created, {hdr_reused} reused")
    print(f"lines:   +{line_new} created")
    return receipts


def upload_receipts(receipts):
    if not receipts:
        print("receipts: none to upload")
        return
    done = 0
    tmpdir = tempfile.mkdtemp(prefix="receipts_")
    for lg, ldate, amt, ldesc in receipts:
        path = os.path.join(tmpdir, f"receipt_{lg[:8]}.txt")
        with open(path, "w", encoding="ascii") as f:
            f.write("SAMPLE RECEIPT\n")
            f.write(f"Date:   {ldate}\n")
            f.write(f"Item:   {ldesc}\n")
            f.write(f"Amount: {amt:.2f}\n")
            f.write("Merchant: Example Vendor Inc.\n")
            f.write("Payment: Corporate card ****0000\n")
        try:
            client.files.upload("cp_expenseline", lg, "cp_receipt", path)
            done += 1
        except Exception as e:
            print(f"  ! receipt upload failed for {lg}: {e}")
    print(f"receipts: {done}/{len(receipts)} uploaded")


if __name__ == "__main__":
    contact_map = ensure_contacts()
    receipts = ensure_headers_and_lines(contact_map)
    upload_receipts(receipts)
    print("\nDONE")
