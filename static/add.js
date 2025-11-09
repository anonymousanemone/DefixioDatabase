function add_item(formData){
    $.ajax({
        url: "/add_item",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
            // console.log("success save_sale")
            // console.log(all_sales)
            $("#success-message").removeClass("d-none");
            $("#view-item-link").attr("href", `/defix/${response.id}`);
            $('#add-form')[0].reset();
            $('html,body').scrollTop(0);
            $("#id").focus();
        },
        error: function(xhr){
            alert("Error: " + xhr.responseJSON.error);
        }
    });
}

function populate_dropdowns(){
    let dropdowns = {
        "date_from": keys.date_val,
        "date_to": keys.date_val,
        "grouping": keys.grouping
    };

    // Populate dropdowns
    $.each(dropdowns, function(field, options) {
        var $select = $("#" + field);
        $.each(options, function(index, value) {
            $select.append($("<option>").attr("value", value).text(value));
        });
    });
}

function update_autocomplete(){
    // Enable autocomplete for text inputs
    $("#provenance").autocomplete({ source: keys.provenance });
    $("#location").autocomplete({ source: keys.location });
    $("#material").autocomplete({ source: keys.material });
    $("#language").autocomplete({ source: keys.language });
}

$(document).ready(function () {
    populate_dropdowns();
    update_autocomplete();

    $("#add-form").submit(function (event) {
        event.preventDefault();
        let formArray = $(this).serializeArray(); 
        let formData = {}; 
        $.each(formArray, function (_, field) {
            formData[field.name] = field.value;
        });
        console.log(formData);
        add_item(formData)
    });

});
