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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function obtenerIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error('Error al obtener la IP');
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error al obtener la IP:', error);
        return null;
    }
}

function obtenerIdAnuncio() {
    const idContainer = document.querySelector('.ID__orig');
    if (idContainer) {
        // Obtener el texto dentro de .ID y eliminar "ID: " y el span adentro
        const idText = idContainer.innerText.trim();
        const id = idText.replace('ID: ', ''); // Eliminar "ID: "
        return id;
    }
    return null;
}

let enviando = false;  

function validarFormulario() {
    const razon = document.getElementById('razon').value.trim();
    let checked = false;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            checked = true;
        }
    });

    const botonEnviar = document.getElementById('enviarReporte');
    botonEnviar.disabled = !(razon && checked);

    // Ajustar el estilo del botÃ³n segÃºn la validaciÃ³n
    if (razon && checked && !enviando) {
        botonEnviar.style.opacity = 1; // Restaurar opacidad normal
        botonEnviar.style.cursor = 'pointer'; // Cambiar cursor a pointer
    } else {
        botonEnviar.style.opacity = 0.5; // Mantener opacidad reducida
        botonEnviar.style.cursor = 'not-allowed'; // Mantener cursor predeterminado
    }
}

document.getElementById('reportar').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita el envÃ­o por defecto del formulario

    if (enviando) {
        console.log('El formulario ya estÃ¡ siendo enviado. Por favor espera.');
        return;
    }

    // Ocultar el botÃ³n de enviar
    document.getElementById('enviarReporte').style.display = 'none';

    // Cambiar estado a enviando
    enviando = true;

    // Obtener los valores del formulario
    const razon = document.getElementById('razon').value.trim();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkboxIds = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id);

    // Obtener la IP del usuario
    const ip = await obtenerIP();

    // Obtener el ID del anuncio
    const idAnuncio = obtenerIdAnuncio();

    // Construir la URL del anuncio
    const urlAnuncio = `https://extasis.com/anuncio/${idAnuncio}.html`;

    // Guardar el reporte en Firebase
    const timestamp = new Date().getTime();
    try {
        await database.ref('reportes/' + timestamp).set({
            razon: razon,
            checkboxIds: checkboxIds,
            ip: ip,
            idAnuncio: idAnuncio,
            urlAnuncio: urlAnuncio  // Agregar la URL del anuncio
        });
        const notificacion = document.getElementById('reporteEnviado');
        notificacion.style.display = 'block';

        document.getElementById('razon').value = '';
        checkboxes.forEach(checkbox => checkbox.checked = false);

        setTimeout(() => {
            notificacion.style.display = 'none'; // Ocultar la notificaciÃ³n
            validarFormulario(); // Restablecer el estado del botÃ³n de enviar
            document.getElementById('enviarReporte').style.display = 'block'; // Mostrar de nuevo el botÃ³n de enviar
        }, 1000);

    } catch (error) {
        console.error('Error al enviar el reporte:', error);
        // Manejar el error aquÃ­ segÃºn tus necesidades
    } finally {
        enviando = false; // Restablecer enviando a false
    }
});

document.getElementById('razon').addEventListener('input', validarFormulario);
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => checkbox.addEventListener('change', validarFormulario));

document.querySelector('.reportar').addEventListener('click', (event) => {
    event.preventDefault(); // Evitar que haga scroll hacia arriba
    document.getElementById('modalReportar').style.display = 'block';
});

document.querySelector('.compartir').addEventListener('click', (event) => {
    event.preventDefault(); // Evitar que haga scroll hacia arriba
    document.getElementById('modalCompartir').style.display = 'block';
});

window.onclick = function (event) {
    if (event.target == document.getElementById('modalAdquirir')) {
        document.getElementById('modalAdquirir').style.display = 'none';
    }
    if (event.target == document.getElementById('modalReportar')) {
        document.getElementById('modalReportar').style.display = 'none';
    }
    if (event.target == document.getElementById('modalCompartir')) {
        document.getElementById('modalCompartir').style.display = 'none';
    }
};

// Función para abrir el modal de compartir
function abrirModalCompartir() {
    document.getElementById('modalCompartir').style.display = 'block';
}

// Función para cerrar el modal de compartir
function cerrarModalCompartir() {
    document.getElementById('modalCompartir').style.display = 'none';
}
