frappe.ui.form.on('Purchase Invoice', {
	custom_purchase_type(frm) {
        if (frm.is_new()){
            if (frm.doc.custom_purchase_type == "Local"){
                frm.set_value("naming_series", "PI/LO/.FY./.#####")
                frm.set_df_property('supplier', 'label', `Supplier`);
                frm.set_value("supplier", null);
                frm.set_query("supplier", function() {
                    return {
                        filters: {
                            supplier_type: ["!=", "Forwarder"]
                        }
                    };
                });
            }
            else if (frm.doc.custom_purchase_type == "Import"){
                frm.set_value("naming_series", "PI/IM/.FY./.#####")
                frm.set_df_property('supplier', 'label', `Supplier`);
                frm.set_value("supplier", null);
                frm.set_query("supplier", function() {
                    return {
                        filters: {
                            supplier_type: ["!=", "Forwarder"]
                        }
                    };
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
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.set_df_property('custom_purchase_type', 'read_only', 1);
        }
        else {
            if (frm.doc.custom_purchase_type == "CHA"){
                frm.set_value("naming_series", "PI/CHA/.FY./.#####");
                frm.set_df_property('supplier', 'label', `Forwarder`);
                frm.set_query("supplier", function() {
                    return {
                        filters: {
                            supplier_type: "Forwarder"
                        }
                    };
                });
            }
            else {
                frm.set_df_property('supplier', 'label', `Supplier`);
                frm.set_query("supplier", function() {
                    return {
                        filters: {
                            supplier_type: ["!=", "Forwarder"]
                        }
                    };
                });
                if (frm.doc.custom_purchase_type == "Local"){
                    frm.set_value("naming_series", "PI/LO/.FY./.#####");
                } else {
                    frm.set_value("naming_series", "PI/IM/.FY./.#####");
                }
            }
        }
    },
    custom_invoice_type (frm) {
        if (frm.doc.custom_invoice_type == 'Service') {
            frm.fields_dict['items'].grid.get_field('item_code').get_query = function(frm, cdt, cdn) {
                return {
                    filters: {
                        item_group: 'Services'
                    }
                };
            };
        }
        else {
            frm.fields_dict['items'].grid.get_field('item_code').get_query = function(frm, cdt, cdn) {
                return {
                    filters: {
                        item_group: ["!=", "Services"]
                    }
                };
            };
        }
    },
});