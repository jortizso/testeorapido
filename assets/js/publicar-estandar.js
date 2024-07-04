import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// API para obtener la IP del usuario
const getIP = async () => {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
};

const generateUniqueCode = () => {
    return Math.floor(100000000000000 + Math.random() * 900000000000000);
};

// Verifica la inicialización de Firebase
let app;
if (!getApps().length) {
    const firebaseConfig = {
        apiKey: "AIzaSyA80NCrZjSt4B6c2YP_fXKSXeMQa2GvqvY",
        authDomain: "publicar-anuncio.firebaseapp.com",
        databaseURL: "https://publicar-anuncio-default-rtdb.firebaseio.com",
        projectId: "publicar-anuncio",
        storageBucket: "publicar-anuncio.appspot.com",
        messagingSenderId: "353743994233",
        appId: "1:353743994233:web:2be4b2a4fb85eb192c03a8",
        measurementId: "G-0SJDYSTHZT"
    };
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

signInAnonymously(auth)
    .then(() => {
        console.log('Usuario autenticado anónimamente');
    })
    .catch((error) => {
        console.error('Error al autenticar al usuario', error);
    });

// Obtener referencias a los campos del formulario
const zonaInput = document.getElementById('zona');
const ciudadInput = document.getElementById('ciudad');
const correoInput = document.getElementById('correo');
const nombreInput = document.getElementById('nombre');
const telefonoInput = document.getElementById('telefono');
const edadInput = document.getElementById('edad');
const tarifaInput = document.getElementById('tarifa');
const tituloInput = document.getElementById('titulo');
const descripcionInput = document.getElementById('descripcion');
const terminosInput = document.getElementById('terminos');
const imagenInput = document.getElementById('imagen');
const recaptcha = document.getElementById('recaptcha');
const submitButton = document.querySelector('button[type="submit"]');

// Función para validar y formatear el campo de teléfono
telefonoInput.addEventListener('input', () => {
    let telefonoValue = telefonoInput.value.trim();
    telefonoValue = telefonoValue.replace(/\D/g, '');
    if (/^9/.test(telefonoValue)) {
        telefonoValue = telefonoValue.replace(/^(\d{3})(\d{1,})/, '$1 $2');
    }
    telefonoInput.value = telefonoValue;
});

// Función para validar y limitar el campo de edad
edadInput.addEventListener('input', () => {
    let edadValue = edadInput.value.trim();
    edadValue = edadValue.replace(/\D/g, '');
    if (edadValue.length > 2) {
        edadValue = edadValue.slice(0, 2);
    }
    edadInput.value = edadValue;
});

// Validar la edad y manejar el envío del formulario
document.getElementById('adForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const edadValue = parseInt(edadInput.value.trim());
    if (isNaN(edadValue) || edadValue < 18 || edadValue > 70) {
        displayErrorMessage("La edad debe estar entre 18 y 70 años.");
        edadInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    try {
        submitButton.style.backgroundColor = '#8470ba';

        // Obtener datos del formulario
        const zona = zonaInput.value;
        const ciudad = ciudadInput.value;
        const direccion = document.getElementById('direccion').value;
        const correo = correoInput.value;
        const nombre = nombreInput.value;
        const telefono = telefonoInput.value;
        const edad = edadInput.value;
        const tarifa = tarifaInput.value;
        const titulo = tituloInput.value;
        const descripcion = descripcionInput.value;
        const servicios = obtenerServiciosSeleccionados();
        const aceptoA = obtenerAceptoASeleccionados();
        const capacidad = obtenerCapacidadSeleccionada();
        const horario = obtenerHorarioSeleccionado();
        const tipoServicio = obtenerTipoServicioSeleccionado();
        const ubicacionUrl = document.getElementById('ubicacion-url').value;
        const imagen = imagenInput.files[0];

        // Procesar la imagen y obtener la URL de descarga
        const processedImageBlob = await processImage(imagen);
        const timestamp = Date.now().toString();
        const storageRef = sRef(storage, `images/${timestamp}/${imagen.name}`);
        await uploadBytes(storageRef, processedImageBlob);
        const imageUrl = await getDownloadURL(storageRef);

        // Obtener la IP del usuario y generar un código único
        const ip = await getIP();
        const ID = generateUniqueCode();

        // Crear el objeto de anuncio
        const anuncio = {
            zona: zona,
            ciudad: ciudad,
            direccion: direccion,
            correo: correo,
            nombre: nombre,
            telefono: telefono,
            edad: edad,
            tarifa: tarifa,
            titulo: titulo,
            descripcion: descripcion,
            servicios: servicios,
            aceptoA: aceptoA,
            capacidad: capacidad,
            horario: horario,
            tipoServicio: tipoServicio,
            ubicacionUrl: ubicacionUrl,
            imageUrl: imageUrl,
            ipUsuario: ip,
            codigoUnico: ID.toString() // Convertir a cadena
        };

        // Guardar en Firebase
        const adRef = ref(database, 'anuncios/' + Date.now());
        await set(adRef, anuncio);

        // Reiniciar el formulario y redirigir
        document.getElementById('adForm').reset();
        window.location.href = 'enviado.html';

    } catch (error) {
        displayErrorMessage("Error al publicar el anuncio: " + error.message);
    }
});

function obtenerDiasSeleccionados() {
    const diasSeleccionados = {};
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    document.querySelectorAll('.horario .seleccionable.selected').forEach(function (element, index) {
        diasSeleccionados[letras[index]] = element.id;
    });
    return diasSeleccionados;
}

function obtenerServiciosSeleccionados() {
    const serviciosSeleccionados = {};
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    document.querySelectorAll('.servicios .seleccionable.selected').forEach(function (element, index) {
        serviciosSeleccionados[letras[index]] = element.id;
    });
    return serviciosSeleccionados;
}

function obtenerAceptoASeleccionados() {
    const aceptoASeleccionados = {};
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    document.querySelectorAll('.aceptoA .seleccionable.selected').forEach(function (element, index) {
        aceptoASeleccionados[letras[index]] = element.id;
    });
    return aceptoASeleccionados;
}

function obtenerCapacidadSeleccionada() {
    const capacidadSeleccionada = {};
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    document.querySelectorAll('.capacidad .seleccionable.selected').forEach(function (element, index) {
        capacidadSeleccionada[letras[index]] = element.id;
    });
    return capacidadSeleccionada;
}

function obtenerHorarioSeleccionado() {
    const horarioSeleccionado = {
        de: document.getElementById('hora').value,
        a: document.getElementById('hora2').value,
        dias: obtenerDiasSeleccionados()
    };

    return horarioSeleccionado;
}

function obtenerTipoServicioSeleccionado() {
    const tipoServicioSeleccionado = {};
    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');
    document.querySelectorAll('.servicio-tipo .seleccionable.selected').forEach(function (element, index) {
        tipoServicioSeleccionado[letras[index]] = element.id;
    });
    return tipoServicioSeleccionado;
}


function validateForm() {
    let isValid = true;
    const textInputs = [
        // categoriaInput,
        zonaInput, ciudadInput, telefonoInput, edadInput, tarifaInput, tituloInput, descripcionInput];
    textInputs.forEach(input => {
        if (!input.value.trim()) {
            displayErrorMessage(`${input.name} es obligatorio.`);
            isValid = false;
        }
    });
    if (!validateEmail(correoInput.value)) {
        displayErrorMessage("El correo electrónico debe tener un formato válido.");
        isValid = false;
    }
    if (!imagenInput.files.length) {
        displayErrorMessage("La imagen es obligatoria.");
        isValid = false;
    }
    if (!terminosInput.checked) {
        displayErrorMessage("Debe aceptar los términos y condiciones.");
        isValid = false;
    }
    // Verificar si el reCAPTCHA se ha completado
    if (grecaptcha && !grecaptcha.getResponse()) {
        displayErrorMessage("Complete el reCAPTCHA.");
        isValid = false;
    }
    return isValid;
}


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function displayErrorMessage(message) {
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.classList.add('error-message');
    errorMessageContainer.textContent = message;
    const closeButton = document.createElement('span');
    closeButton.textContent = 'x';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        errorMessageContainer.remove();
    });
    errorMessageContainer.appendChild(closeButton);
    document.body.appendChild(errorMessageContainer);
    setTimeout(() => {
        errorMessageContainer.style.opacity = 0;
        setTimeout(() => {
            errorMessageContainer.remove();
        }, 1000);
    }, 5000);
}

// categoriaInput.required = true;
zonaInput.required = true;
ciudadInput.required = true;
telefonoInput.required = true;
edadInput.required = true;
tarifaInput.required = true;
tituloInput.required = true;
descripcionInput.required = true;
terminosInput.required = true;
imagenInput.required = true;

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");
    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });
    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
            showPublishButton();
        }
    });
    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });
    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });
    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            showPublishButton();
        }
        dropZoneElement.classList.remove("drop-zone--over");
    });
});

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }
    document.getElementById("placeholder-image").style.display = "none";

    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }
    thumbnailElement.dataset.label = file.name;
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}

function showPublishButton() {
    document.getElementById("uploadButton").style.display = "block";
}



async function processImage(file) {
    // Verificar el tipo de archivo
    const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!acceptedFormats.includes(file.type)) {
        throw new Error('Formato de archivo no soportado. Por favor, sube un archivo JPG, JPEG o PNG.');
    }

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);

    const logoImg = new Image();
    logoImg.src = '../assets/images/logo-opaco.png';

    return new Promise((resolve) => {
        logoImg.onload = () => {
            const logoWidth = canvas.width * 0.5; // Ancho del logo al 40% del ancho de la imagen
            const scaleFactor = logoWidth / logoImg.width;
            const logoHeight = logoImg.height * scaleFactor;

            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = (canvas.height - logoHeight) / 2;
            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        };
    });
}


// Mapa

let map; // Declara map como una variable global
let marker;

document.addEventListener('DOMContentLoaded', () => {
    const localDiv = document.querySelector('.local');
    const mapContainer = document.getElementById('map-container');
    const ubicacionManual = document.getElementById('ubicacion-manual');
    const ubicacionMensaje = document.getElementById('ubicacion-mensaje');

    localDiv.addEventListener('click', () => {
        if (localDiv.classList.contains('active')) {
            mapContainer.style.display = 'block';
            ubicacionManual.style.display = 'block';
            ubicacionMensaje.style.display = 'block';
            if (!map) {
                iniciarMap();
            }
        } else {
            mapContainer.style.display = 'none';
            ubicacionManual.style.display = 'none';
            ubicacionMensaje.style.display = 'none';
        }
    });

    const elements = document.querySelectorAll('.selecciones div');
    elements.forEach(element => {
        element.addEventListener('click', function () {
            const ubicacionManual = document.getElementById('ubicacion-manual');

            if (this.classList.contains('active')) {
                this.classList.remove('active');
                ubicacionManual.style.display = 'none';
                ubicacionMensaje.style.display = 'none';
                mapContainer.style.display = 'none';
            } else {
                this.classList.add('active');
                if (this === localDiv) {
                    mapContainer.style.display = 'block';
                    ubicacionManual.style.display = 'block';
                    ubicacionMensaje.style.display = 'block';
                    if (!map) {
                        iniciarMap();
                    }
                }
            }
        });

        const closeButton = document.createElement('span');
        closeButton.innerText = '×';
        closeButton.className = 'close';
        closeButton.addEventListener('click', function (e) {
            e.stopPropagation();
            this.parentElement.classList.remove('active');
            document.getElementById('ubicacion-manual').style.display = 'none';
            document.getElementById('ubicacion-mensaje').style.display = 'none';
            mapContainer.style.display = 'none';
        });
        element.appendChild(closeButton);
    });
});

function iniciarMap() {
    map = L.map('map-container').setView([47.3769, 8.5417], 12); // Zúrich, Suiza

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            map.setView([latitude, longitude], 12);
            marker = L.marker([latitude, longitude]).addTo(map);
            const urlInicial = `https://www.google.com/maps?q=${latitude},${longitude}`;
            document.getElementById('ubicacion-url').value = urlInicial;
        }, function (error) { });
    } else {
        alert('Tu navegador no soporta geolocalización.');
    }

    map.on('click', function (e) {
        const latitude = e.latlng.lat;
        const longitude = e.latlng.lng;

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }

        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        document.getElementById('ubicacion-url').value = url;
    });
}



// Time
document.addEventListener('DOMContentLoaded', function () {

    const horaInputs = document.querySelectorAll('.hora input');

    horaInputs.forEach(function (input) {
        input.addEventListener('input', function (event) {
            const value = event.target.value.replace(/\D/g, '');
            const formattedValue = formatTime(value);
            event.target.value = formattedValue;
        });
    });
});

function formatTime(value) {
    if (value.length > 2) {
        return value.slice(0, 2) + ':' + value.slice(2, 4);
    }
    return value;
}

document.getElementById('adForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var zona = document.getElementById('zona').value.trim();
    var ciudad = document.getElementById('ciudad').value.trim();
    var direccion = document.getElementById('direccion').value.trim();
    var correo = document.getElementById('correo').value.trim();
    var nombre = document.getElementById('nombre').value.trim();
    var telefono = document.getElementById('telefono').value.trim();
    var edad = document.getElementById('edad').value.trim();
    var tarifa = document.getElementById('tarifa').value.trim();
    var titulo = document.getElementById('titulo').value.trim();
    var descripcion = document.getElementById('descripcion').value.trim();
    var ubicacionUrl = document.getElementById('ubicacion-url').value.trim();

    // Validar que todos los campos obligatorios estén llenos
    if (zona === '' || ciudad === '' || direccion === '' || correo === '' || nombre === '' ||
        telefono === '' || edad === '' || tarifa === '' || titulo === '' || descripcion === '' ||
        ubicacionUrl === '') {
        // alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // Validar que al menos un servicio esté seleccionado
    var serviciosSeleccionados = document.querySelectorAll('.servicios .seleccionable.selected');
    if (serviciosSeleccionados.length === 0) {
        // alert('Debe seleccionar al menos un servicio.');
        return;
    }


    // Validar que al menos un servicio esté seleccionado
    var aceptoASeleccionados = document.querySelectorAll('.aceptoA .seleccionable.selected');
    if (aceptoASeleccionados.length === 0) {
        // alert('Debe seleccionar al menos un servicio.');
        return;
    }

    // Validar que al menos una capacidad esté seleccionada
    var capacidadesSeleccionadas = document.querySelectorAll('.capacidad .seleccionable.selected');
    if (capacidadesSeleccionadas.length === 0) {
        // alert('Debe seleccionar al menos una capacidad.');
        return;
    }

    // Validar que se haya seleccionado un horario
    var hora = document.getElementById('hora').value.trim();
    var hora2 = document.getElementById('hora2').value.trim();
    if (hora === '' || hora2 === '') {
        // alert('Debe seleccionar una hora de apertura y cierre.');
        return;
    }

    // Validar que al menos un tipo de servicio esté seleccionado
    var tiposServicioSeleccionados = document.querySelectorAll('.servicio-tipo .seleccionable.selected');
    if (tiposServicioSeleccionados.length === 0) {
        // alert('Debe seleccionar al menos un tipo de servicio.');
        return;
    }

    var anuncio = {
        zona: zona,
        ciudad: ciudad,
        direccion: direccion,
        correo: correo,
        nombre: nombre,
        telefono: telefono,
        edad: edad,
        tarifa: tarifa,
        titulo: titulo,
        descripcion: descripcion,
        servicios: obtenerSeleccionados('.servicios .seleccionable.selected'),
        aceptoA: obtenerSeleccionados('.aceptoA .seleccionable.selected'),
        capacidad: obtenerSeleccionados('.capacidad .seleccionable.selected'),
        horario: {
            de: horaApertura,
            a: horaCierre,
            dias: obtenerDiasSeleccionados() // Suponiendo que tienes una función obtenerDiasSeleccionados definida
        },
        tipoServicio: obtenerSeleccionados('.servicio-tipo .seleccionable.selected'),
        ubicacionUrl: ubicacionUrl,
        imageUrl: imageUrl,
        ipUsuario: ip,
        codigoUnico: ID.toString() // Convertir a cadena
    };

    // Enviar datos a Firebase
    firebase.database().ref('anuncios').push(anuncio, function (error) {
        if (error) {
            console.error('Error al enviar los datos a Firebase:', error);
        } else {
            console.log('Datos enviados exitosamente a Firebase.');
        }
    });
});

document.querySelectorAll('.seleccionable').forEach(function (element) {
    element.addEventListener('click', function () {
        element.classList.toggle('selected');
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('adForm');
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
    const servicios = document.querySelectorAll('.servicios .seleccionable');
    const aceptoA = document.querySelectorAll('.aceptoA .seleccionable');
    const capacidad = document.querySelectorAll('.capacidad .seleccionable');
    const horario = document.querySelectorAll('.horario .seleccionable');
    const servicioTipo = document.querySelectorAll('.servicio-tipo .seleccionable');
    const terminos = document.getElementById('terminos');
    const telefonoInput = document.getElementById('telefono');
    const tarifaInput = document.getElementById('tarifa');
    const textareaDescripcion = document.getElementById('descripcion');
    const enviarButton = document.getElementById('enviarButton');

    // Event listener para submit del formulario
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        resetErrorStyles();

        let valid = true;

        // Validar todos los campos
        inputs.forEach(input => {
            if (!validateField(input)) {
                valid = false;
            }
        });

        // Validar selecciones
        if (!validateSelections(servicios)) {
            scrollToFirstIncomplete('.servicios');
            valid = false;
        }
        if (!validateSelections(aceptoA)) {
            scrollToFirstIncomplete('.aceptoA');
            valid = false;
        }
        if (!validateSelections(capacidad)) {
            scrollToFirstIncomplete('.capacidad');
            valid = false;
        }
        if (!validateSelections(horario)) {
            scrollToFirstIncomplete('.horario');
            valid = false;
        }
        if (!validateSelections(servicioTipo)) {
            scrollToFirstIncomplete('.servicio-tipo');
            valid = false;
        }

        // Validar términos y condiciones
        if (!terminos.checked) {
            setError(terminos.parentNode, 'Debe aceptar los términos y condiciones');
            valid = false;
        }

        // Si todo es válido, enviar el formulario
        if (valid) {
            form.submit();
        } else {
            // Mostrar notificación de error en la parte superior
            showNotification('Debe corregir los errores antes de enviar el formulario.');
        }
    });

    // Validar cada campo individualmente al perder foco
    inputs.forEach(input => {
        // Validación específica para teléfono
        if (input.id === 'telefono') {
            input.addEventListener('input', function () {
                // Eliminar automáticamente el primer '0' si lo hay
                if (input.value.charAt(0) === '0') {
                    input.value = input.value.slice(1);
                }
                // Agregar automáticamente espacio después de los primeros 3 dígitos si no hay espacio
                if (input.value.length === 3 && !input.value.includes(' ')) {
                    input.value += ' ';
                }
            });
        }

        // Validación específica para tarifa (agregar comas automáticamente y máximo 7 dígitos)
        if (input.id === 'tarifa') {
            input.addEventListener('input', function () {
                let formattedValue = input.value.replace(/\D/g, '');
                if (formattedValue.length > 7) {
                    formattedValue = formattedValue.slice(0, 7);
                }
                formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                input.value = formattedValue;
            });
        }

        // Validación específica para textarea (descripción)
        if (input.id === 'descripcion') {
            input.addEventListener('input', function () {
                // Permitir letras, números, espacios, guiones, comas, puntos, tildes y emojis
                input.value = input.value.replace(/[^\p{L}\p{N}\s\-.,áéíóúÁÉÍÓÚüÜñÑ\p{Emoji}]/gu, '');
                // Limitar la longitud a 400 caracteres
                if (input.value.length > 400) {
                    input.value = input.value.slice(0, 400);
                }
            });
        }

        // Validación específica para hora (hora y hora2)
        if (input.id === 'hora' || input.id === 'hora2') {
            input.addEventListener('input', function () {
                const formattedValue = input.value.replace(/\D/g, '');
                if (formattedValue.length > 4) {
                    input.value = formattedValue.slice(0, 4);
                }
                const hours = parseInt(input.value.substring(0, 2), 10);
                const minutes = parseInt(input.value.substring(2, 4), 10);
                if (hours > 23 || minutes > 59) {
                    input.value = '';
                }
            });
        }
    });

    // Función para resetear estilos de error
    function resetErrorStyles() {
        const errorElements = document.querySelectorAll('.has-error');
        errorElements.forEach(element => {
            element.classList.remove('has-error');
            const errorMessage = element.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }

    // Función para mostrar mensaje de error
    function setError(element, message) {
        const parent = element.closest('.input-container') || element.parentNode;
        parent.classList.add('has-error');
        displayErrorMessage(parent, message);
    }

    // Función para mostrar mensaje de error en el DOM
    function displayErrorMessage(parent, message) {
        const errorElement = parent.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.textContent = message;
            parent.appendChild(errorDiv);
        }
    }

    // Validar selecciones (servicios, capacidad, horario, tipo de servicio)
    function validateSelections(selections) {
        let selected = false;
        selections.forEach(selection => {
            if (selection.classList.contains('selected')) {
                selected = true;
            }
        });
        if (!selected) {
            // setError(selections[0], 'Seleccione al menos una opción.');
        }
        return selected;
    }

    // Validación genérica para campos de texto
    function validateField(input, maxLength = 150) {
        const value = input.value.trim();
        if (value === '' || value.length > maxLength) {
            // setError(input, `Campo requerido, máximo ${maxLength} caracteres.`);
            return false;
        }

        const regex = /^[a-zA-Z0-9\s\-.,áéíóúÁÉÍÓÚüÜñÑ]+$/;
        if (!regex.test(value)) {
            // setError(input, 'Solo letras, números, espacios, guiones, comas, puntos y tildes.');
            return false;
        }

        // Validaciones específicas según el ID del campo
        const id = input.id;
        switch (id) {
            case 'correo':
                if (!validateEmail(input)) {
                    return false;
                }
                break;
            case 'telefono':
                if (!validatePhoneNumber(input)) {
                    return false;
                }
                break;
            case 'edad':
                if (!validateAge(input)) {
                    return false;
                }
                break;
            case 'descripcion':
                // La validación para textarea se maneja en el event listener
                break;
            case 'hora':
            case 'hora2':
                if (!validateTime(input)) {
                    return false;
                }
                break;
            case 'imagen':
                if (!validateImage(input)) {
                    return false;
                }
                break;
            default:
                break;
        }

        // Limpiar estilos de error si es válido
        const parent = input.closest('.input-container') || input.parentNode;
        parent.classList.remove('has-error');
        const errorMessage = parent.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }

        return true;
    }

    // Validación específica para teléfono
    function validatePhoneNumber(input) {
        const value = input.value.trim();
        if (value.charAt(0) === '0') {
            // setError(input, 'El primer dígito no puede ser 0.');
            return false;
        }
        const regex = /^[a-zA-Z0-9\s\-.,áéíóúÁÉÍÓÚüÜñÑ]+$/;
        if (!regex.test(value)) {
            // setError(input, 'Solo letras, números, espacios, guiones, comas, puntos y tildes.');
            return false;
        }
        return true;
    }

    // Validación específica para edad
    function validateAge(input) {
        const value = parseInt(input.value.trim(), 10);
        if (isNaN(value) || value < 18 || value > 70 || input.value.length > 2) {
            setError(input, 'La edad debe ser entre 18 y 70 años.');
            return false;
        }
        return true;
    }

    // Validación específica para formato de hora
    function validateTime(input) {
        const value = input.value.trim();
        const regex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        if (!regex.test(value)) {
            setError(input, 'Formato de hora inválido. Utilice formato HH:mm (00:00 - 23:59).');
            return false;
        }
        return true;
    }

    // Validación específica para imagen
    function validateImage(input) {
        const file = input.files[0];
        if (!file) {
            setError(input, 'Seleccione una imagen.');
            return false;
        }
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (!allowedExtensions.exec(input.value)) {
            setError(input, 'Formato de imagen inválido. Use formatos .jpg, .jpeg o .png.');
            return false;
        }
        return true;
    }

    // Validación genérica para correo electrónico
    function validateEmail(input) {
        const value = input.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            setError(input, 'Ingrese un correo electrónico válido.');
            return false;
        }
        return true;
    }

    // Función para mostrar notificación en la parte superior
    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');

        // Ocultar la notificación después de 5 segundos
        setTimeout(function () {
            notification.classList.remove('show');
        }, 5000);
    }

    // Función para hacer scroll al primer campo incompleto
    function scrollToFirstIncomplete(sectionClass) {
        const firstIncomplete = document.querySelector(`${sectionClass} .has-error`);
        if (firstIncomplete) {
            firstIncomplete.scrollIntoView({ behavior: 'smooth' });
        }
    }
});
