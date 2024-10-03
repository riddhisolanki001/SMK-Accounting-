frappe.pages['expenses-breakup-gst'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Expenses Breakup GST',
        single_column: true
    });

    // Define the fields for the filters with default values
    let fields = [
        {
            label: 'From Date',
            fieldtype: 'Date',
            fieldname: 'from',
            default: frappe.datetime.add_months(frappe.datetime.nowdate(), -1) // Default to 1 month ago
        },
        {
            label: 'To Date',
            fieldtype: 'Date',
            fieldname: 'to',
            default: frappe.datetime.nowdate() // Default to current date
        },        
    ];

    let filter_values = {};

    // Create a separate container for the data
    let $data_container = $('<div id="data-container"></div>').appendTo(page.body);

    // Create filter fields and set the default values
    fields.forEach(field => {
        let filterField = page.add_field(field);
        // Set the initial value to the default specified in the field definition
        filterField.set_input(field.default);
        filter_values[field.fieldname] = field.default;

        // Listen for changes in the filter values
        filterField.$input.on('change', function() {
            filter_values[field.fieldname] = filterField.get_value();
            if (filter_values['from'] && filter_values['to']) {
                fetch_and_render_data(filter_values['from'], filter_values['to']);
            }
        });
    });

    // Function to fetch and render data based on the filters
    function fetch_and_render_data(from_date, to_date) {
        frappe.call({
            method: "smk_accounting.smk_petrochemicals_accounting.page.expenses_breakup_gst.expenses_breakup_gst.make_data",
            args: {
                from_date: from_date || '',
                to_date: to_date || '',
            },
            callback: function(response) {
                const data = response.message;
                console.log(data);

                // Clear only the data container and render new content
                $data_container.empty();
                $(frappe.render_template("expenses_breakup_gst", { data })).appendTo($data_container);
            }
        });
    }

    // Initial call with default values
    fetch_and_render_data(filter_values['from'], filter_values['to']);
}