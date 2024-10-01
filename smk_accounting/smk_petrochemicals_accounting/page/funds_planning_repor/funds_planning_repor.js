frappe.pages['funds-planning-repor'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Funds Planning report for next 10 days',
        single_column: true
    });

    var today = frappe.datetime.get_today();
    let date_after_1_day = frappe.datetime.add_days(today, 0);
    let date_after_10_days = frappe.datetime.add_days(today, 9);

    // Fetch the data via a server call
    frappe.call({
        method: "smk_accounting.smk_petrochemicals_accounting.page.funds_planning_repor.funds_planning_repor.make_data",
        args: {
            date_after_1_day,
            date_after_10_days
        },
        callback: function (response) {
            const data = response.message;
            $(frappe.render_template("funds_planning_repor", { date_after_1_day, date_after_10_days, data })).appendTo(page.body);

            // Populate inputs from localStorage
            populateInputs(data);
            // Add event listeners to save input values
            setupInputListeners(data);
        }
    });
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