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
        method: "smk_accounting.smk_petrochemicals_accounting.page.funds_planning_repor.funds_planning_repor.frm_call",
        args: {
            date_after_1_day,
            date_after_10_days
        },
        callback: function (response) {
            const data = response.message;
            console.log(data);
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


// frappe.pages['e-009'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'E-009',
// 		single_column: true
// 	});

//     let fields = [
//         {
//             label: 'From Date',
//             fieldtype: 'Date',
//             fieldname: 'from'
//         },
//         {
//             label: 'To Date',
//             fieldtype: 'Date',
//             fieldname: 'to'
//         },
//         {
//             label: 'Party Name',
//             fieldtype: 'Link',
//             options: 'Supplier',
//             fieldname: 'supplier'
//         },
//         {
//             label: 'Item Name',
//             fieldtype: 'Link',
//             options: 'Item',
//             fieldname: 'item_name'
//         }
//     ];
    
//     function convert_date_format(date){
//         var inputDate = new Date(date);
//         // Format the date using toLocaleDateString with the appropriate options
//         var formattedDate = inputDate.toLocaleDateString('en-GB'); // 'en-GB' for dd/mm/yyyy format
//         return formattedDate;
//     }

// 	// let fromDate = null
// 	// let toDate = null

// 	// Apply filters from localStorage after reloading
// 	function applyFiltersFromLocalStorage() {
// 		fromDate = localStorage.getItem('fromDate');
// 		toDate = localStorage.getItem('toDate');
// 		supplier = localStorage.getItem('supplier');
// 		item_name = localStorage.getItem('item_name');
//         // Set values in date fields if they exist
//         if (page.fields_dict['from']) {
//             page.fields_dict['from'].set_input(fromDate);
//         }
//         if (page.fields_dict['to']) {
//             page.fields_dict['to'].set_input(toDate);
//         }
//         if (page.fields_dict['supplier']) {
//             page.fields_dict['supplier'].set_input(supplier);
//         }
//         if (page.fields_dict['item_name']) {
//             page.fields_dict['item_name'].set_input(item_name);
//         }
// 	}
	
// 	fields.forEach(field => {
// 		let filterField = page.add_field(field);
// 		// Add an event listener for the "blur" event instead of "change"
// 		filterField.$input.on('blur', function() {
// 			var changing_value = filterField.get_value();
// 			// The code inside this block will be executed when the date is selected
// 			if (field.fieldname === 'from' && fromDate != changing_value && changing_value) {
// 				localStorage.setItem('fromDate', changing_value);
// 				if (toDate) {
// 					location.reload(true);
// 				}
// 			}
// 			if (field.fieldname === 'to' && toDate != changing_value && changing_value ) {
// 				localStorage.setItem('toDate', changing_value);
// 				if (fromDate) {
// 					location.reload(true);
// 				}
// 			}
// 			if (field.fieldname === 'supplier' && supplier != changing_value ) {
//                 localStorage.setItem('supplier', changing_value);
//                 location.reload(true);
//             }
// 			if (field.fieldname === 'item_name' && item_name != changing_value ) {
//                 localStorage.setItem('item_name', changing_value);
//                 location.reload(true);
//             }
// 		});
// 		applyFiltersFromLocalStorage();
// 	});

//     dateFrom = convert_date_format(fromDate)
//     dateTo = convert_date_format(toDate)

// 	var filters = { docstatus: 1};
// 	if (fromDate && toDate) {
// 		filters.date = ['between', [fromDate, toDate]] ;
// 	}
//     if (supplier) {
//         filters.party = supplier;
//     }
// 	frappe.call({
// 		method:
// 		"ambica_textile.ambica_textile.page.e_009.e_009.frm_call",
// 		args: {
// 			fromDate: fromDate,
// 			toDate: toDate,
// 			supplier: supplier,
// 			item_name: item_name
// 		},
// 		callback: function (response) {
// 			data = response.message;
// 			company = frappe.defaults.get_user_default("Company")
// 			$(frappe.render_template("e_009", { company, data })).appendTo(page.body);
// 		}
// 	});
// }