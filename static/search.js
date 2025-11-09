
document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input"); 

    searchForm.addEventListener("submit", function (event) {
        let searchQuery = searchInput.value.trim(); // Remove whitespace
        
        if (!searchQuery) {
            event.preventDefault(); // Stop form submission
            searchInput.value = ""; // Clear the search bar
            searchInput.focus(); // Keep focus in the search bar
        }
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
});

