frappe.ui.form.on("Landed Cost Voucher", {
	custom_get_taxes_and_charges_from_purchase_receipts(frm) {
		frm.clear_table("taxes");
		let total_taxes_and_charges = 0
		frm.doc.purchase_receipts.forEach(pr => {
			if (pr.receipt_document_type && pr.receipt_document){
				frappe.db.get_doc(pr.receipt_document_type, pr.receipt_document)
				.then((pr_doc) => {
					pr_doc.taxes.forEach((taxes) => {
						let row = frm.add_child("taxes");
						row.description = taxes.description;
						row.expense_account = taxes.account_head;
						row.amount = taxes.base_tax_amount_after_discount_amount;
						total_taxes_and_charges += row.amount
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
});

function updateTotal(frm, cdt, cdn) {
	let total_taxes_and_charges = 0
	frm.doc.taxes.forEach(tax => {
		total_taxes_and_charges += tax.amount
	});
	frm.set_value("total_taxes_and_charges", total_taxes_and_charges)
}