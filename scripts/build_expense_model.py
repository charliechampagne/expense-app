"""Build the Expense App data model in Dataverse.

Solution: ExpenseApp   Publisher prefix: cp_

Idempotent: creates what's missing, leaves what exists. Pass --reset to drop the
two custom tables first (only safe while they hold no data).

Model
  cp_expenseheader
    cp_name          Primary, autonumber  EXP-{SEQNUM:00000}
    cp_date          Date only
    cp_description    Multiline text (2000)
    cp_totalamount   Currency (manual)
    cp_contactid     Lookup -> contact              (delete: remove link)
    statuscode       Open(1) / Submitted / Approved / Paid / Closed(2)
  cp_expenseline
    cp_name          Primary, autonumber  EXP-LINE-{SEQNUM:00000}
    cp_date          Date only
    cp_amount        Currency
    cp_description    Multiline text (2000)
    cp_receipt       File (receipt, 32 MB)
    cp_expenseheaderid  Lookup -> cp_expenseheader  (delete: cascade, required)
"""
import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client, get_token, get_plugin_headers, load_env

load_env()
SOLUTION = "ExpenseApp"
BASE = os.environ["DATAVERSE_URL"].rstrip("/")
RESET = "--reset" in sys.argv
TRANSIENT = ("0x80040216", "0x80060891", "Filtered", "another customization",
             "MetadataCache", "0x80071c86", "0x80072560")

client = get_client("dv-metadata")
_token = get_token()


def api(method, path, body=None, extra=None, quiet=False):
    url = path if path.startswith("http") else f"{BASE}/api/data/v9.2/{path}"
    h = get_plugin_headers("dv-metadata", _token)
    h.update({"Content-Type": "application/json", "Accept": "application/json",
              "OData-MaxVersion": "4.0", "OData-Version": "4.0"})
    if extra:
        h.update(extra)
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, method=method, headers=h)
    with urlopen(req) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


def retry(fn, what, tries=6, wait=12):
    for i in range(1, tries + 1):
        try:
            return fn()
        except HTTPError as e:
            detail = e.read().decode()
            if i < tries and any(t in detail for t in TRANSIENT):
                print(f"  ~ transient {what} (try {i}) - wait {wait}s")
                time.sleep(wait)
                continue
            print(f"  ! {what}: {e.code}\n    {detail[:1200]}")
            raise
    return None


def L(text):
    return {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [
        {"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": text, "LanguageCode": 1033}]}


def table_exists(logical):
    try:
        api("GET", f"EntityDefinitions(LogicalName='{logical}')?$select=LogicalName", quiet=True)
        return True
    except HTTPError as e:
        if e.code == 404:
            return False
        raise


def wait_for_table(logical, tries=20):
    for _ in range(tries):
        if table_exists(logical):
            return
        time.sleep(6)
    raise RuntimeError(f"table {logical} did not materialize")


def string_primary(schema, fmt, display):
    return {
        "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
        "SchemaName": schema, "DisplayName": L(display),
        "RequiredLevel": {"Value": "None"}, "MaxLength": 100,
        "FormatName": {"Value": "Text"}, "IsPrimaryName": True,
        "AutoNumberFormat": fmt,
    }


def memo(schema, display):
    return {"@odata.type": "Microsoft.Dynamics.CRM.MemoAttributeMetadata",
            "SchemaName": schema, "DisplayName": L(display),
            "RequiredLevel": {"Value": "None"}, "MaxLength": 2000, "Format": "TextArea"}


def date_only(schema, display):
    return {"@odata.type": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
            "SchemaName": schema, "DisplayName": L(display),
            "RequiredLevel": {"Value": "None"},
            "Format": "DateOnly", "DateTimeBehavior": {"Value": "DateOnly"}}


def money(schema, display):
    return {"@odata.type": "Microsoft.Dynamics.CRM.MoneyAttributeMetadata",
            "SchemaName": schema, "DisplayName": L(display),
            "RequiredLevel": {"Value": "None"},
            "MinValue": 0, "MaxValue": 100000000000, "Precision": 2, "PrecisionSource": 2}


def file_col(schema, display):
    return {"@odata.type": "Microsoft.Dynamics.CRM.FileAttributeMetadata",
            "SchemaName": schema, "DisplayName": L(display),
            "RequiredLevel": {"Value": "None"}, "MaxSizeInKB": 32768}


def entity(schema, plural, primary_attr, attrs):
    return {
        "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
        "SchemaName": schema,
        "DisplayName": L(schema.replace("cp_", "").replace("Expense", "Expense ").strip()),
        "DisplayCollectionName": L(plural),
        "OwnershipType": "UserOwned",
        "HasActivities": False, "HasNotes": False, "IsActivity": False,
        "PrimaryNameAttribute": primary_attr,
        "Attributes": attrs,
    }


def create_entity(body, logical):
    if table_exists(logical):
        print(f"= table {logical}")
        return
    retry(lambda: api("POST", "EntityDefinitions", body, {"MSCRM.SolutionUniqueName": SOLUTION}),
          f"create {logical}")
    wait_for_table(logical)
    print(f"+ table {logical}")


def create_lookup(rel_schema, referenced, referencing, lookup_schema, display, cascade, required):
    # already there?
    try:
        api("GET", f"EntityDefinitions(LogicalName='{referencing}')/Attributes(LogicalName='{lookup_schema.lower()}')"
            "?$select=LogicalName", quiet=True)
        print(f"= lookup {referencing}.{lookup_schema}")
        return
    except HTTPError as e:
        if e.code != 404:
            raise
    cc = {"Delete": cascade, "Assign": "NoCascade", "Share": "NoCascade", "Unshare": "NoCascade",
          "Reparent": "NoCascade", "Merge": "NoCascade", "RollupView": "NoCascade"}
    if cascade == "Cascade":
        cc.update({"Assign": "Cascade", "Share": "Cascade", "Unshare": "Cascade", "Reparent": "Cascade"})
    body = {
        "@odata.type": "Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata",
        "SchemaName": rel_schema, "ReferencedEntity": referenced, "ReferencingEntity": referencing,
        "CascadeConfiguration": cc,
        "Lookup": {"@odata.type": "Microsoft.Dynamics.CRM.LookupAttributeMetadata",
                   "SchemaName": lookup_schema, "DisplayName": L(display),
                   "RequiredLevel": {"Value": "ApplicationRequired" if required else "None"}},
    }
    retry(lambda: api("POST", "RelationshipDefinitions", body, {"MSCRM.SolutionUniqueName": SOLUTION}),
          f"lookup {referencing}.{lookup_schema}")
    print(f"+ lookup {referencing}.{lookup_schema} -> {referenced} (delete={cascade})")


def ensure_status(logical):
    data = api("GET", f"EntityDefinitions(LogicalName='{logical}')/Attributes(LogicalName='statuscode')"
               "/Microsoft.Dynamics.CRM.StatusAttributeMetadata?$select=LogicalName&$expand=OptionSet")
    have = {(o["Label"]["LocalizedLabels"] or [{}])[0].get("Label"): o["Value"]
            for o in data["OptionSet"]["Options"]}
    for value, name in ((1, "Open"), (2, "Closed")):
        if name in have:
            continue
        retry(lambda v=value, n=name: api("POST", "UpdateOptionValue", {
            "EntityLogicalName": logical, "AttributeLogicalName": "statuscode",
            "Value": v, "Label": L(n), "MergeLabels": True, "SolutionUniqueName": SOLUTION}),
            f"rename statuscode {value}")
        print(f"+ statuscode {value} -> {name}")
    for name in ("Submitted", "Approved", "Paid"):
        if name in have:
            continue
        resp = retry(lambda n=name: api("POST", "InsertStatusValue", {
            "EntityLogicalName": logical, "AttributeLogicalName": "statuscode",
            "StateCode": 0, "Label": L(n), "SolutionUniqueName": SOLUTION}), f"insert {name}")
        print(f"+ statuscode +{name} = {resp['NewOptionValue']}")


def publish(logical):
    retry(lambda: api("POST", "PublishXml", {
        "ParameterXml": f"<importexportxml><entities><entity>{logical}</entity></entities></importexportxml>"}),
        f"publish {logical}")
    print(f"~ published {logical}")


if RESET:
    print("== reset: dropping tables ==")
    for lg in ("cp_expenseline", "cp_expenseheader"):
        if table_exists(lg):
            retry(lambda lg=lg: api("DELETE", f"EntityDefinitions(LogicalName='{lg}')"), f"drop {lg}")
            print(f"- dropped {lg}")
            time.sleep(10)

print("\n== Phase 1: tables ==")
create_entity(entity("cp_ExpenseHeader", "Expense Headers", "cp_name", [
    string_primary("cp_Name", "EXP-{SEQNUM:00000}", "Expense Number"),
    date_only("cp_Date", "Date"),
    memo("cp_Description", "Description"),
    money("cp_TotalAmount", "Total Amount"),
]), "cp_expenseheader")
create_entity(entity("cp_ExpenseLine", "Expense Lines", "cp_name", [
    string_primary("cp_Name", "EXP-LINE-{SEQNUM:00000}", "Line Number"),
    date_only("cp_Date", "Date"),
    money("cp_Amount", "Amount"),
    memo("cp_Description", "Description"),
    file_col("cp_Receipt", "Receipt"),
]), "cp_expenseline")
time.sleep(15)

print("\n== Phase 2: lookups ==")
create_lookup("cp_expenseheader_contact", "contact", "cp_expenseheader",
              "cp_ContactId", "Contact", "RemoveLink", required=False)
time.sleep(12)
create_lookup("cp_expenseline_expenseheader", "cp_expenseheader", "cp_expenseline",
              "cp_ExpenseHeaderId", "Expense Header", "Cascade", required=True)
time.sleep(12)

print("\n== Phase 3: status reasons ==")
ensure_status("cp_expenseheader")

print("\n== Phase 4: publish ==")
publish("cp_expenseheader")
publish("cp_expenseline")
print("\nDONE")
