import frappe
from frappe.utils import add_days

@frappe.whitelist()
def frm_call(date_after_1_day, date_after_10_days):
    grand_data = []

    # Initialize the date variable to start from date_after_1_day
    date = date_after_1_day

    # Loop from date_after_1_day to date_after_10_days
    while date <= date_after_10_days:
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
                PI.docstatus = 0 AND
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

        # Fetch Sales Invoice data for the current date
        si_data = frappe.db.sql(si_query, filters, as_dict=True)

        # Calculate the total payment amount for Sales Invoices
        for record in si_data:
            total_si_amount += record.get('payment_amount', 0)
            record.due_date = frappe.utils.formatdate(record.due_date, 'dd-mm-yyyy')


        # Append the data for the current date as a dictionary
        grand_data.append({
            "date": date,
            "pi_data": pi_data,
            "total_pi_amount": total_pi_amount,
            "si_data": si_data,
            "total_si_amount": total_si_amount,
            "pi_records" : len(pi_data),
            "si_records" : len(si_data) 
        })

        # Move to the next day
        date = add_days(date, 1)

    # Print or return the grand_data after loop completion
    print(grand_data)

















    # for pData in procurementData:
    #     pName = pData.name
    #     pData.date = (pData.date).strftime("%d-%m-%Y")
    #     query = f"""
    #         SELECT
    #             PI.item,
    #             PI.quantity,
    #             PI.uom
    #         FROM
    #             `tabProcurement Item` AS PI
    #         WHERE
    #             (%s = '' OR PI.item = %s) AND
    #             PI.parent = %s
    #         ORDER BY
    #             PI.item ASC
    #     """
    #     filters = (item_name, item_name, pName)
    #     procurementItemData = frappe.db.sql(query, filters, as_dict=True)
    #     for pIData in procurementItemData:
    #         pData["pIData"] = procurementItemData
    #         pItem = pIData.item
    #         query = f"""
    #             SELECT
    #                 PR.posting_date as grn_date,
    #                 PR.name as grn_no,
    #                 PRI.amount,
    #                 PR.custom_total_duty,
    #                 PRI.qty,
    #                 PR.bill_of_entry_number,
    #                 PR.custom_bill_date
    #             FROM
    #                 `tabPurchase Receipt` AS PR
    #             JOIN
    #                 `tabPurchase Receipt Item` AS PRI ON
    #                 PR.name = PRI.parent
    #             WHERE
    #                 PR.custom_procurement_id = %s AND
    #                 PR.docstatus = 1 AND
    #                 (PR.posting_date BETWEEN %s AND %s OR  %s = '' OR %s = '') AND
    #                 PRI.item_code = %s
    #             ORDER BY
    #                 grn_date DESC
    #         """
    #         filters = (pName, fromDate, toDate, fromDate, toDate, pItem)
            
    #         purchaseReceiptData = frappe.db.sql(query, filters, as_dict=True)
    #         for pRData in purchaseReceiptData:
    #             pRData.grn_date = frappe.utils.formatdate(pRData.grn_date, 'dd-mm-yyyy')
    #             pRData.custom_bill_date = (pRData.custom_bill_date).strftime("%d.%m.%Y")
    #             pIData["purchaseReceiptData"] = purchaseReceiptData
    #     grand_data.append(pData)
    return grand_data