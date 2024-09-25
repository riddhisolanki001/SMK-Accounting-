frappe.ui.form.on('Purchase Invoice', {
	custom_purchase_type(frm) {
        if (frm.is_new()){
            if (frm.doc.custom_purchase_type == "Local"){
                frm.set_value("naming_series", "PI/LO/.FY./.#####")
                frm.set_df_property('supplier', 'label', `Supplier`);
                frm.set_value("supplier", null);
                frm.set_query("supplier", function() {
                    return {};
                });
            }
            else if (frm.doc.custom_purchase_type == "Import"){
                frm.set_value("naming_series", "PI/IM/.FY./.#####")
                frm.set_df_property('supplier', 'label', `Supplier`);
                frm.set_value("supplier", null);
                frm.set_query("supplier", function() {
                    return {};
                });
            }
            else {
                frm.set_value("naming_series", "PI/CHA/.FY./.#####");
                frm.set_df_property('supplier', 'label', `Forwarder`);
                frm.set_value("supplier", null);
                frm.set_query("supplier", function() {
                    return {
                        filters: {
                            supplier_type: "Forwarder"
                        }
                    };
                });
            }
        }
	},
    after_save: function(frm) {
        frm.set_df_property('custom_purchase_type', 'read_only', 1);
    },
});