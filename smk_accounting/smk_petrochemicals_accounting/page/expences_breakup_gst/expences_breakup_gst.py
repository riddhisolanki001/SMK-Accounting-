import frappe

@frappe.whitelist()
def make_data(from_date=None, to_date=None):
    pi_query = """
        SELECT
            PII.expense_account,
            SUM(CASE WHEN PI.gst_category="Unregistered" THEN PII.base_amount ELSE 0 END) AS unreg_supp_amount,
            SUM(CASE WHEN PI.gst_category="Registered Regular" AND PII.is_ineligible_for_itc = 1 THEN PII.base_amount ELSE 0 END) AS ineligible_amount,
            SUM(CASE WHEN PI.gst_category="Registered Regular" AND PII.is_ineligible_for_itc = 0 THEN PII.base_amount ELSE 0 END) AS eligible_amount,
            SUM(CASE WHEN PI.gst_category="Registered Regular" THEN PII.base_amount ELSE 0 END) AS reg_supp_amount,
            SUM(PII.base_amount) AS total_amount
        FROM
            `tabPurchase Invoice` AS PI
        JOIN
            `tabPurchase Invoice Item` AS PII ON PI.name = PII.parent
        WHERE
            PI.docstatus = 1
            AND (PI.posting_date BETWEEN %s AND %s OR  %s = '' OR %s = '')
        GROUP BY
            PII.expense_account
    """
    pi_data = frappe.db.sql(pi_query, (from_date, to_date, from_date, to_date), as_dict=True)
    return pi_data