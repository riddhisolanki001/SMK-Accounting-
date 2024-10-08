import frappe
from frappe.utils import add_days

@frappe.whitelist()
def make_data(from_date, to_date):
    grand_data = []

    # Initialize the date variable to start from from_date
    date = from_date

    # Loop from from_date to to_date
    while date <= to_date:
        total_pi_amount = 0
        total_si_amount = 0
        pi_query = """
            SELECT
                PI.name,
                PI.supplier_name,
                PS.due_date,
                PS.payment_amount
            FROM
                `tabPurchase Invoice` AS PI
            JOIN
                `tabPayment Schedule` AS PS ON
                PI.name = PS.parent
            WHERE
                PI.docstatus = 1 AND
                PS.due_date = %s
        """
        filters = (date,)
        
        # Fetch pi data for the current date
        pi_data = frappe.db.sql(pi_query, filters, as_dict=True)

        # Calculate the total payment amount for the current date
        for record in pi_data:
            total_pi_amount += record.get('payment_amount', 0)
            record.due_date = frappe.utils.formatdate(record.due_date, 'dd-mm-yyyy')

        
        # Query for Sales Invoices (si_data)
        si_query = """
            SELECT
                SI.name,
                SI.customer_name,
                PS.due_date,
                PS.payment_amount
            FROM
                `tabSales Invoice` AS SI
            JOIN
                `tabPayment Schedule` AS PS ON
                SI.name = PS.parent
            WHERE
                SI.docstatus = 0 AND
                PS.due_date = %s
        """

        # Fetch Sales Invoice data for the date
        si_data = frappe.db.sql(si_query, filters, as_dict=True)

        # Calculate the total payment amount for Sales Invoices
        for record in si_data:
            total_si_amount += record.get('payment_amount', 0)
            record.due_date = frappe.utils.formatdate(record.due_date, 'dd-mm-yyyy')

        diff = abs(len(si_data) - len(pi_data))
        diff_array = [i for i in range(diff)]

        # Append the data for the current date as a dictionary
        grand_data.append({
            "date": date,
            "pi_data": pi_data,
            "total_pi_amount": total_pi_amount,
            "si_data": si_data,
            "total_si_amount": total_si_amount,
            "pi_records" : len(pi_data),
            "si_records" : len(si_data),
            "diff_array": diff_array
        })
        # Move to the next day
        date = add_days(date, 1)
    return grand_data