frappe.ui.form.on("Landed Cost Voucher", {
    after_save(frm) {
        frm.doc.purchase_receipts.forEach(purchase_receipt => {
            if (purchase_receipt.receipt_document_type == 'Purchase Receipt') {
                // Fetch the Purchase Receipt document
                frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Purchase Receipt",
                        name: purchase_receipt.receipt_document
                    },
                    callback: function(r) {
                        if (r.message) {
                            let pr_item_codes = [];
                            // Get all item codes from the Purchase Receipt
                            r.message.items.forEach(item => {
                                pr_item_codes.push(item.item_code);
                            });
                            console.log("Purchase Receipt Item Codes:", pr_item_codes);

                            // Fetch Landed Cost Vouchers to check item codes
                            frappe.call({
                                method: "frappe.client.get_list",
                                args: {
                                    doctype: "Landed Cost Voucher",
                                    fields: ['items.item_code', 'items.receipt_document', 'docstatus'],
                                    filters: {
										'docstatus': ['not in', ['2']]
									}
                                },
                                callback: function(r) {
                                    if (r.message) {
                                        let lcv_item_codes = [];
										console.log(r.message)
                                        r.message.forEach(lcv => {
											if (lcv.receipt_document == purchase_receipt.receipt_document) {
												lcv_item_codes.push(lcv.item_code);
											}
										});
                                        console.log("Landed Cost Voucher Item Codes:", lcv_item_codes);

                                        // Check if all PR item codes are in LCV item codes
                                        const allExist = pr_item_codes.every(itemCode => lcv_item_codes.includes(itemCode));
                                        console.log("All PR item codes in LCV item codes:", allExist);

                                        // Update custom_lcv_created checkbox in Purchase Receipt
                                        if (allExist) {
                                            frappe.call({
                                                method: "frappe.client.set_value",
                                                args: {
                                                    doctype: "Purchase Receipt",
                                                    name: purchase_receipt.receipt_document,
                                                    fieldname: {
                                                        custom_lcv_created: 1 
                                                    }
                                                },
                                                callback: function() {
                                                    console.log("custom_lcv_created checkbox checked in Purchase Receipt");
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    },
	custom_get_purchase_invoices(frm) {
		frm.clear_table("custom_purchase_invoices");
		frm.doc.purchase_receipts.forEach(pr => {			
			if (pr.receipt_document_type == 'Purchase Receipt') {
				frappe.call({
					method: "frappe.client.get_list",
					args: {
						doctype: "Purchase Invoice",
						fields: ['posting_date', 'grand_total', 'supplier', 'name'],
						filters: {'custom_purchase_receipt':pr.receipt_document, 'docstatus':1}
					},
					callback: function(r) {
						if (r.message) {
							console.log(r.message);
							let purchase_invoice_data = r.message;
							purchase_invoice_data.forEach(pi => {
								let row = frm.add_child("custom_purchase_invoices")
								row.receipt_document_type = 'Purchase Invoice';
								row.receipt_document = pi.name;
								row.supplier = pi.supplier;
								row.grand_total = pi.grand_total;
								row.posting_date = pi.posting_date;
							});
							frm.refresh_field("custom_purchase_invoices");
						}
					}
				});
			}
		});
	},
	custom_get_taxes_and_charges_from_purchase_receipts(frm) {
		frm.clear_table("taxes");
		let account_wise_totals = {};  // Create a dictionary to store totals for each account
		let total_taxes_and_charges = 0;
		frm.doc.purchase_receipts.forEach(pr => {
			if (pr.receipt_document_type && pr.receipt_document) {
				frappe.db.get_doc(pr.receipt_document_type, pr.receipt_document).then((pr_doc) => {
					pr_doc.taxes.forEach((taxes) => {
						// Aggregate the amounts for each unique account head
						if (!account_wise_totals[taxes.account_head]) {
							account_wise_totals[taxes.account_head] = 0;
						}
						account_wise_totals[taxes.account_head] += taxes.base_tax_amount_after_discount_amount;
						total_taxes_and_charges += taxes.base_tax_amount_after_discount_amount;
					});
					// Clear the taxes table again and populate it with consolidated data
					frm.clear_table("taxes");
					Object.keys(account_wise_totals).forEach(account_head => {
						let row = frm.add_child("taxes");
						row.description = `Total for ${account_head}`;
						row.expense_account = account_head;
						row.amount = account_wise_totals[account_head];
					});
					// Refresh the field to update the UI
					frm.refresh_field("taxes");
					frm.set_value("total_taxes_and_charges", total_taxes_and_charges)
				});
			}
		});
		frm.doc.custom_purchase_invoices.forEach(pi => {
			if (pi.receipt_document_type && pi.receipt_document) {
				frappe.db.get_doc(pi.receipt_document_type, pi.receipt_document).then((pi_doc) => {
					pi_doc.taxes.forEach((taxes) => {
						// Aggregate the amounts for each unique account head
						if (!account_wise_totals[taxes.account_head]) {
							account_wise_totals[taxes.account_head] = 0;
						}
						account_wise_totals[taxes.account_head] += taxes.base_tax_amount_after_discount_amount;
						total_taxes_and_charges += taxes.base_tax_amount_after_discount_amount;
					});
					// Clear the taxes table again and populate it with consolidated data
					frm.clear_table("taxes");
					Object.keys(account_wise_totals).forEach(account_head => {
						let row = frm.add_child("taxes");
						row.description = `Total for ${account_head}`;
						row.expense_account = account_head;
						row.amount = account_wise_totals[account_head];
					});
					// Refresh the field to update the UI
					frm.refresh_field("taxes");
					frm.set_value("total_taxes_and_charges", total_taxes_and_charges)
				});
			}
		});
	},
});

frappe.ui.form.on("Landed Cost Taxes and Charges", {
	taxes_remove: function (frm, cdt, cdn) {
		updateTotal(frm, cdt, cdn)
	},
	amount: function (frm, cdt, cdn) {
		updateTotal(frm, cdt, cdn)
	},
});

function updateTotal(frm, cdt, cdn) {
	let total_taxes_and_charges = 0;
	frm.doc.taxes.forEach(tax => {
		total_taxes_and_charges += tax.amount
		frm.set_value("total_taxes_and_charges", total_taxes_and_charges)
	});
}