function populate_popular(){
    const popularItems = ["5", "72", "299"];

    // get container
    let container = $("#popular-items");

    popularItems.forEach(id => {
        let item = data[id];
        placeholder = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcgnVxALFx6TkJAHJ44kGbsmty3hf-bp1uEYk03xccnzvqqB4XdmMKHdaALnNQO5eWKhuN1cKWx-Gx6MIPh_S7_eP7d4JtaFcadP8MCQW0FoVfiKa9_uGwC9ipDZvGb93yxONbxXe6mKM/s1600/graffiti-aphrodisias2.jpg";
        let itemHTML = `
            <div class="col-md-4 p-2">
                <div class="card">
                    <a href="/defix/${item.id}">
                        <img src="static/images/${item.image}" class="card-img-top" alt="Sketch of original defixio">
                    </a>
                    <div class="card-body py-2.5 px-3.5"> 
                        <a href="/defix/${item.id}"><h5 class="card-title">${item.id}. ${item.area}</h5></a>
                        <h6 class="card-subtitle mb-">
                            ${item.location}, ${item.date} <br>
                            <i>${item.grouping}</i>
                        </h6>
                    </div>
                </div>
            </div>`;
        container.append(itemHTML);
    });
}

function populate_filter(){
    const filtersContainer = $('#filtersContainer');
    $.each(keys, function(key, values) {
        if (key === 'date_val') {
            filtersContainer.append(`
                <div class="col-md-4">
                    <label for="date_before" class="form-label">Date Range</label>
                    <div class="d-flex">
                        <input type="number" id="date_before" class="form-control me-2" min="-4" max="5" placeholder="From">
                        <input type="number" id="date_after" class="form-control" min="-4" max="5" placeholder="To">
                    </div>
                </div>`);
        } else {
            let options = '<option value="">Any</option>';
            $.each(values, function(index, value) {
                options += `<option value="${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</option>`;
            });
            filtersContainer.append(`
                <div class="col-md-4">
                    <label for="${key}" class="form-label">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <select id="${key}" class="form-select">${options}</select>
                </div>`);
        }
    });
}

$('#searchForm').submit(function(event) {
    event.preventDefault();
    const dateBefore = parseInt($('#date_before').val());
    const dateAfter = parseInt($('#date_after').val());
    if (!isNaN(dateBefore) && !isNaN(dateAfter) && dateBefore > dateAfter) {
        alert('The "From" date must be smaller than the "To" date.');
        return;
    }
    
    const filters = {
        provenance: $('#provenance').val() || "",
        location: $('#location').val() || "",
        material: $('#material').val() || "",
        language: $('#language').val() || "",
        grouping: $('#grouping').val() || "",
        date_before: dateBefore,
        date_after: dateAfter
    };
    
    $.ajax({
        url: '/search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(filters),
        success: function(data) {
            $('#results').text(JSON.stringify(data, null, 2));
        }
    });
});

$(document).ready(function() {
    // populate_filter();
    populate_popular();
});