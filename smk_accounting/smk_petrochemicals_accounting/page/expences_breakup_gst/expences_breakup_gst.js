frappe.pages['expences-breakup-gst'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Expences Breakup GST',
		single_column: true
	});

    // Fetch the data via a server call
    frappe.call({
        method: "smk_accounting.smk_petrochemicals_accounting.page.expences_breakup_gst.expences_breakup_gst.make_data",
        args: {
            // date_after_1_day,
            // date_after_10_days
			// { date_after_1_day, date_after_10_days, data }
        },
        callback: function (response) {
            const data = response.message
			console.log(data)
			const final_data = data[2]
			console.log(final_data)
            $(frappe.render_template("expences_breakup_gst", {final_data} )).appendTo(page.body);
        }
    });
}