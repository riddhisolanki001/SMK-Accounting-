import frappe
# from frappe.utils import add_days

@frappe.whitelist()
def make_data():
    pi_query = """
        SELECT
            PI.name,
            PII.expense_account,
            PII.base_amount,
            PII.is_ineligible_for_itc
        FROM
            `tabPurchase Invoice` AS PI
        JOIN
            `tabPurchase Invoice Item` AS PII ON
            PI.name = PII.parent
        WHERE
            PI.docstatus = 1
    """
    pi_data = frappe.db.sql(pi_query, as_dict=True)
    pi_query = """
        SELECT
            PII.expense_account,
            SUM(PII.base_amount) AS total_base_amount,
            PII.is_ineligible_for_itc
        FROM
            `tabPurchase Invoice` AS PI
        JOIN
            `tabPurchase Invoice Item` AS PII ON
            PI.name = PII.parent
        WHERE
            PI.docstatus = 1
        GROUP BY
            PII.expense_account, PII.is_ineligible_for_itc
    """
    pii_data = frappe.db.sql(pi_query, as_dict=True)
    pi_query = """
        SELECT
            PII.expense_account,
            SUM(CASE WHEN PII.is_ineligible_for_itc = 1 THEN PII.base_amount ELSE 0 END) AS ineligible_amount,
            SUM(CASE WHEN PII.is_ineligible_for_itc = 0 THEN PII.base_amount ELSE 0 END) AS eligible_amount,
            SUM(PII.base_amount) AS total_amount
        FROM
            `tabPurchase Invoice` AS PI
        JOIN
            `tabPurchase Invoice Item` AS PII ON PI.name = PII.parent
        WHERE
            PI.docstatus = 1
        GROUP BY
            PII.expense_account
    """
    piii_data = frappe.db.sql(pi_query, as_dict=True)
    return pi_data, pii_data, piii_data