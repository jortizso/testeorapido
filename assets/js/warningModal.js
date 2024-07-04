
// Modal de advertencia

  // Función para mostrar el modal después de 3 segundos
  setTimeout(function () {
    openModal_warning('ageWarningModal_warning');
  }, 3000);

  // Funciones JavaScript para abrir y cerrar los modales
  function openModal_warning(modalId) {
    var modalWarning = document.getElementById(modalId);
    modalWarning.style.display = "block";
  }

  function closeModal_warning(modalId) {
    var modalWarning = document.getElementById(modalId);
    modalWarning.style.animation = "fadeOut 0.5s ease-in-out";
    setTimeout(function () {
      modalWarning.style.display = "none";
      modalWarning.style.animation = "";
    }, 500);
  }

  // Función para aceptar la advertencia
  function acceptAgeWarning_warning() {
    closeModal_warning('ageWarningModal_warning');
    // Aquí puedes redirigir al usuario a la página principal u otra página del sitio
  }

  // Función para salir del sitio
  function exitPage_warning() {
    window.close();
  }