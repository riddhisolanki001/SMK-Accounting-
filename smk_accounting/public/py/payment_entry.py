import frappe
from frappe.email.queue import flush
from frappe.utils import get_url

@frappe.whitelist()
def send_email(name, doctype, company, po_number, party_name, pe_details):
    logo_url = get_url("/private/files/SMK logo.jpg")
    doctype_slug = frappe.scrub(doctype).replace("_", "-")
    document_url = frappe.utils.get_url(f"app/{doctype_slug}/{name}")
    logistics_id = frappe.db.get_value("Purchase Order", po_number, "custom_logistics_team")
    logistics_name = frappe.db.get_value("Purchase Order", po_number, "custom_logistics_team_name")
    message = f"""
    <p>Dear {logistics_name},</p>
    <p>I hope this message finds you well.
    <br>Please be informed that an advance payment has been made against Purchase Order "{ po_number }" for "{ party_name }". Kindly find the details below:
    <br>{pe_details}</p>
    <p>Click <a href="{document_url}">here</a> to open the Payment Entry.</p>
    <p>Please proceed with coordinating the delivery of the items as per the agreed terms. Let us know if any additional information is required.</p>
    <p>Best regards,<br>{company}</p>
    <img src="{logo_url}" alt="SMK Petrochemicals" width="200" />
    """
    frappe.sendmail(
        recipients=[logistics_id],
        subject="Advance Payment Made for Purchase Order - '" + po_number + "'",
        message=message
    )
    flush()