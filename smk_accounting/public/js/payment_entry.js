frappe.ui.form.on('Payment Entry', {
    on_submit: function(frm) {
        if (frm.doc.custom_is_advanced){
            let po_number = null;
            let pe_details = `
                <table border="1" cellpadding="5" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Payment Term</th>
                            <th>Grand Total (INR)</th>
                            <th>Outstanding (INR)</th>
                            <th>Allocated (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            frm.doc.references.forEach(reference => {
                if (reference.reference_doctype === "Purchase Order" && reference.reference_name) {
                    po_number = reference.reference_name;
                    const total_amount = format_currency(reference.total_amount, "INR", 3);
                    const outstanding_amount = format_currency(reference.outstanding_amount, "INR", 3);
                    const allocated_amount = format_currency(reference.allocated_amount, "INR", 3);
                    pe_details += `
                        <tr>
                            <td>${reference.payment_term}</td>
                            <td>${total_amount}</td>
                            <td>${outstanding_amount}</td>
                            <td>${allocated_amount}</td>
                        </tr>
                    `;
                }
            });
            pe_details += `
                    </tbody>
                </table>
            `;
            if (po_number){                
                frappe.call({
                    method: 'smk_accounting.public.py.payment_entry.send_email',
                    args: {
                        name: frm.doc.name,
                        doctype: frm.doc.doctype,
                        company: frm.doc.company,
                        po_number,
                        party_name: frm.doc.party_name,
                        pe_details
                    },
                    callback: function(response) {
                        if (response.message) {
                            frappe.msgprint('An Email sent successfully');
                        }
                    }
                });
            }
        }
    }
});
