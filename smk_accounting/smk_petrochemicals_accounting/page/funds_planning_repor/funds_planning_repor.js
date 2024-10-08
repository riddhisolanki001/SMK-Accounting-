frappe.pages['funds-planning-repor'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Funds Planning Report',
        single_column: true
    });

    // Define the fields for the filters with default values
    let fields = [
        {
            label: 'From Date',
            fieldtype: 'Date',
            fieldname: 'from',
            default: frappe.datetime.nowdate() // Default to current date
        },
        {
            label: 'To Date',
            fieldtype: 'Date',
            fieldname: 'to',
            default: frappe.datetime.add_days(frappe.datetime.nowdate(), 9) // Default to 1 month ago
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

    // var today = frappe.datetime.get_today();
    // let date_after_1_day = frappe.datetime.add_days(today, 0);
    // let date_after_10_days = frappe.datetime.add_days(today, 9);

        // Fetch the data via a server call
        frappe.call({
            method: "smk_accounting.smk_petrochemicals_accounting.page.funds_planning_repor.funds_planning_repor.make_data",
            args: {
                from_date: from_date || '',
                to_date: to_date || '',
            },
            callback: function (response) {
                const data = response.message;
                console.log(data);

                // Clear only the data container and render new content
                $data_container.empty();
                $(frappe.render_template("funds_planning_repor", { from_date, to_date, data })).appendTo($data_container);

                // Populate inputs from localStorage
                populateInputs(data);
                // Add event listeners to save input values
                setupInputListeners(data);
            }
        });
    }

    // Initial call with default values
    fetch_and_render_data(filter_values['from'], filter_values['to']);
}

// Function to populate inputs from localStorage
function populateInputs(data) {
    data.forEach(date_data => {
        date_data.pi_data.forEach(pi_data => {
            const inputElement = document.getElementById(`${pi_data.due_date}_${pi_data.name}`);
            if (inputElement) {
                inputElement.value = localStorage.getItem(`${pi_data.due_date}_${pi_data.name}`) || '';
            }
        });
        date_data.si_data.forEach(si_data => {
            const inputElement = document.getElementById(`${si_data.due_date}_${si_data.name}`);
            if (inputElement) {
                inputElement.value = localStorage.getItem(`${si_data.due_date}_${si_data.name}`) || '';
            }
        });
    });
}

// Function to set up input listeners
function setupInputListeners(data) {
    data.forEach(date_data => {
        date_data.pi_data.forEach(pi_data => {
            const inputElement = document.getElementById(`${pi_data.due_date}_${pi_data.name}`);
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    localStorage.setItem(`${pi_data.due_date}_${pi_data.name}`, inputElement.value);
                });
            }
        });
        date_data.si_data.forEach(si_data => {
            const inputElement = document.getElementById(`${si_data.due_date}_${si_data.name}`);
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    localStorage.setItem(`${si_data.due_date}_${si_data.name}`, inputElement.value);
                });
            }
        });
    });
}