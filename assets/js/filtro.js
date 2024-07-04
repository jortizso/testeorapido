function showFilters() {
    var modal = document.getElementById("filterModal");
    var modalContent = document.querySelector(".modal-content");
    modal.style.display = "block";
    modal.classList.remove("closing");
    modalContent.classList.remove("closing");
}

function closeFilters() {
    var modal = document.getElementById("filterModal");
    var modalContent = document.querySelector(".modal-content");
    modal.classList.add("closing");
    modalContent.classList.add("closing");
    setTimeout(function () {
        modal.style.display = "none";
    }, 300); // Ajusta este valor al tiempo de tu animación en milisegundos (0.3s = 300ms)
}

function applyFilters() {
    var selectedZone = document.getElementById("zone").value;
    var url = selectedZone ? "escorts/" + selectedZone : "escorts/";
    window.location.href = url;
}

function updateUrl() {
    var selectedZone = document.getElementById("zone").value;
    var applyButton = document.querySelector("button");
    if (selectedZone) {
        applyButton.setAttribute("onclick", "applyFilters()");
    } else {
        applyButton.removeAttribute("onclick");
    }
}

