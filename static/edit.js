function edit_item(formData){
    $.ajax({
        url: `/edit_item/${data.id}`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
            // alert("Entry updated successfully!");
            window.location.href = `/defix/${data.id}`; // Redirect to view page
        },
        error: function (xhr) {
            console.log("fail?")
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
    $("#id").prop("disabled", true);
    let itemId = data.id;
    // console.log(data)
    // console.log(keys)

    if (!itemId) {
        alert("Error: ID not found.");
        // window.location.href = "/";
    }

    populate_dropdowns();
    update_autocomplete();
    
    // Populate form fields dynamically
    $("#id").val(data.id);
    $("#area").val(data.area);
    $("#provenance").val(data.provenance);
    $("#location").val(data.location);
    $("#date").val(data.date);
    $("#date_from").val(data.date_val[0]);
    $("#date_to").val(data.date_val[1]);
    $("#material").val(data.material.join(", "));
    $("#language").val(data.language);
    $("#grouping").val(data.grouping);
    $("#image").val(data.image);
    $("#translation").val(data.translation);

    // Handle form submission via AJAX
    $("#edit-form").submit(function (event) {
        event.preventDefault();
        let formArray = $(this).serializeArray();
        // console.log(formData)
        let formData = {}; 
        $.each(formArray, function (_, field) {
            formData[field.name] = field.value;
        });
        console.log(formData);
        edit_item(formData);
    });

    // Handle discard button click
    $("#discard-btn").click(function () {
        if (confirm("Are you sure you want to discard changes?")) {
            window.location.href = `/defix/${data.id}`;
        }
    });
});