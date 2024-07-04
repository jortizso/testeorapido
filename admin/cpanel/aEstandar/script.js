import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getDatabase, ref, onChildAdded, remove, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Configuración de Firebase
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);
const panel = document.querySelector('.panel');
const container = document.querySelector('.container');
const loginContainer = document.querySelector('.login-container');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');
const closeMessageBtn = document.getElementById('close-message');

// Escuchar cambios en la autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario autenticado
        document.querySelector('header p').textContent = `Usuario: ${user.email}`;
        loginContainer.classList.add('hidden'); // Ocultar login
        container.style.display = 'block'; // Mostrar contenedor
        document.querySelector('header').style.display = 'flex';
        document.querySelector('.panel').style.display = 'flex';
        document.querySelector('footer').style.display = 'block';
        mostrarAnuncios();
    } else {
        // No hay usuario autenticado
        document.querySelector('header p').textContent = 'Usuario no autenticado';
        panel.innerHTML = ''; // Limpiar panel
    }
});

// Función para mostrar los anuncios
function mostrarAnuncios() {
    panel.innerHTML = ''; // Limpiar panel antes de mostrar nuevos anuncios
    const anunciosRef = ref(database, 'anuncios');
    onChildAdded(anunciosRef, (snapshot) => {
        const anuncio = snapshot.val();
        const rectangle = crearRectangle(anuncio, snapshot.key);
        panel.appendChild(rectangle);
    });
}

// Función para crear un elemento rectangle con los datos del anuncio
function crearRectangle(anuncio, key) {
    const rectangle = document.createElement('div');
    rectangle.classList.add('rectangle');

    // Ajustar el tamaño del rectángulo
    rectangle.style.width = '90%';
    rectangle.style.margin = '20px auto'; // Centrar el rectángulo horizontalmente

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    const image = document.createElement('img');
    image.src = anuncio.imageUrl;
    image.alt = anuncio.titulo;
    image.style.width = '10%'; // Asegurarse de que la imagen ocupe todo el ancho del rectángulo
    contentWrapper.appendChild(image);

    const textWrapper = document.createElement('div');
    textWrapper.classList.add('text-wrapper');

    const title = document.createElement('h2');
    const announcementText = document.createTextNode(`${anuncio.nombre}, ${anuncio.titulo}`);
    title.appendChild(announcementText);
    textWrapper.appendChild(title);


    const description = document.createElement('p');
    description.textContent = anuncio.descripcion;
    textWrapper.appendChild(description);

    contentWrapper.appendChild(textWrapper);

    rectangle.appendChild(contentWrapper);

    const infoWrapper = document.createElement('div');
    infoWrapper.classList.add('info');

    const correo = document.createElement('span');
    correo.textContent = `${anuncio.correo},`;
    infoWrapper.appendChild(correo);

    const telefono = document.createElement('span');
    telefono.textContent = `${anuncio.telefono},`;
    infoWrapper.appendChild(telefono);

    const edad = document.createElement('span');
    edad.textContent = `${anuncio.edad} años,`;
    infoWrapper.appendChild(edad);

    const zona = document.createElement('span');
    zona.textContent = `${anuncio.zona},`;
    infoWrapper.appendChild(zona);

    const direccion = document.createElement('span');
    direccion.textContent = `${anuncio.direccion},`;
    infoWrapper.appendChild(direccion);

    const ciudad = document.createElement('span');
    ciudad.textContent = `${anuncio.ciudad}`;
    infoWrapper.appendChild(ciudad);

    rectangle.appendChild(infoWrapper);

    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('buttons');

    const okButton = document.createElement('button');
    okButton.textContent = '✓';
    okButton.classList.add('ok');

    // Agregar event listener al botón okButton
    okButton.addEventListener('click', () => {
        const datosAnuncio = {
            titulo: anuncio.titulo,
            descripcion: anuncio.descripcion,
            zona: anuncio.zona,
            direccion: anuncio.direccion,
            ciudad: anuncio.ciudad,
            edad: anuncio.edad,
            tarifa: anuncio.tarifa,
            nombre: anuncio.nombre,
            correo: anuncio.correo,
            telefono: anuncio.telefono,
            imageUrl: anuncio.imageUrl,
            ubicacionUrl: anuncio.ubicacionUrl,
            capacidad: anuncio.capacidad,
            servicios: anuncio.servicios,
            tipoServicio: anuncio.tipoServicio,
            horario: anuncio.horario,
            IP: anuncio.ipUsuario,
            ID: anuncio.codigoUnico,
            Dect: "%2F"
        };

        // Llamar a la función guardarAnuncioAceptado
        guardarAnuncioAceptado(datosAnuncio, key, rectangle);
    });
    buttonsWrapper.appendChild(okButton);

    const delButton = document.createElement('button');
    delButton.textContent = '✖';
    delButton.classList.add('del');
    delButton.addEventListener('click', () => {
        // Aquí agregar la lógica para eliminar el anuncio de la base de datos
        remove(ref(database, `anuncios/${key}`))
            .then(() => {
                showMessage('Anuncio eliminado');
                rectangle.remove(); // Eliminar el rectángulo del DOM
            })
            .catch((error) => {
                console.error('Error al eliminar el anuncio:', error);
            });
    });
    buttonsWrapper.appendChild(delButton);

    rectangle.appendChild(buttonsWrapper);

    // Crear enlace "Ver detalles"
    const verDetallesLink = document.createElement('a');
    verDetallesLink.href = '#';
    verDetallesLink.textContent = 'Ver detalles';
    verDetallesLink.classList.add('ver-detalles');
    verDetallesLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDetallesAnuncio(key, rectangle, verDetallesLink);
    });
    rectangle.appendChild(verDetallesLink);

    return rectangle;
}

// Función para alternar la visualización de los detalles adicionales del anuncio
function toggleDetallesAnuncio(key, rectangle, verDetallesLink) {
    const existingDetails = rectangle.querySelector('.detalles-wrapper');
    if (existingDetails) {
        // Si los detalles ya están visibles, ocultarlos
        existingDetails.remove();
        verDetallesLink.textContent = 'Ver detalles';
    } else {
        // Si los detalles no están visibles, mostrarlos
        mostrarDetallesAnuncio(key, rectangle, verDetallesLink);
    }
}

// Función para mostrar detalles adicionales del anuncio
function mostrarDetallesAnuncio(key, rectangle, verDetallesLink) {
    const anuncioRef = ref(database, `anuncios/${key}`);
    get(anuncioRef).then((snapshot) => {
        if (snapshot.exists()) {
            const anuncio = snapshot.val();

            // Crear caja de detalles
            const detallesWrapper = document.createElement('div');
            detallesWrapper.classList.add('detalles-wrapper');

            const horario = document.createElement('p');
            const horarioSpan = document.createElement('span');
            horarioSpan.textContent = 'Horario: ';
            horario.appendChild(horarioSpan);
            horario.appendChild(document.createTextNode(`de ${anuncio.horario.de} a ${anuncio.horario.a}`));

            const dias = document.createElement('p');
            const diasSpan = document.createElement('span');
            diasSpan.textContent = 'Los días: ';
            dias.appendChild(diasSpan);

            const diasArray = [
                anuncio.horario.dias.a,
                anuncio.horario.dias.b,
                anuncio.horario.dias.c,
                anuncio.horario.dias.d,
                anuncio.horario.dias.e,
                anuncio.horario.dias.f,
                anuncio.horario.dias.g,
            ];

            // Filtrar los días que no son undefined
            const diasFiltrados = diasArray.filter(dia => dia !== undefined);

            // Crear el texto con los días filtrados
            const diasTexto = diasFiltrados.join(', ');
            dias.appendChild(document.createTextNode(diasTexto));


            // Capacidad

            const capacidad = document.createElement('p');
            const capacidadSpan = document.createElement('span');
            capacidadSpan.textContent = 'Capacidad: ';
            capacidad.appendChild(capacidadSpan);

            const capacidadArray = [
                anuncio.capacidad.a,
                anuncio.capacidad.b,
                anuncio.capacidad.c,
                anuncio.capacidad.d,
                anuncio.capacidad.e,
                anuncio.capacidad.f,
                anuncio.capacidad.g,
            ];

            // Filtrar los días que no son undefined
            const capacidadFiltrados = capacidadArray.filter(capacidad => capacidad !== undefined);

            // Crear el texto con los días filtrados
            const capacidadTexto = capacidadFiltrados.join(', ');
            capacidad.appendChild(document.createTextNode(capacidadTexto));

            // Servicios

            const servicios = document.createElement('p');
            const serviciosSpan = document.createElement('span');
            serviciosSpan.textContent = 'Servicios: ';
            servicios.appendChild(serviciosSpan);

            const serviciosArray = [
                anuncio.servicios.a,
                anuncio.servicios.b,
                anuncio.servicios.c,
                anuncio.servicios.d,
                anuncio.servicios.e,
                anuncio.servicios.f,
                anuncio.servicios.g,
            ];

            // Filtrar los días que no son undefined
            const serviciosFiltrados = serviciosArray.filter(servicios => servicios !== undefined);

            // Crear el texto con los días filtrados
            const serviciosTexto = serviciosFiltrados.join(', ');
            servicios.appendChild(document.createTextNode(serviciosTexto));

            //    Tarifa

            const tarifa = document.createElement('p');
            const tarifaSpan = document.createElement('span');
            tarifaSpan.textContent = 'Tarifa: ';
            tarifa.appendChild(tarifaSpan);
            tarifa.appendChild(document.createTextNode(anuncio.tarifa));

            // tipoServicio

            const tipoServicio = document.createElement('p');
            const tipoServicioSpan = document.createElement('span');
            tipoServicioSpan.textContent = 'Los días: ';
            tipoServicio.appendChild(tipoServicioSpan);

            const tipoServicioArray = [
                anuncio.tipoServicio.a,
                anuncio.tipoServicio.b,
                anuncio.tipoServicio.c,
                anuncio.tipoServicio.d,
                anuncio.tipoServicio.e,
                anuncio.tipoServicio.f,
                anuncio.tipoServicio.g,
            ];

            const tipoServicioFiltrados = tipoServicioArray.filter(tipoServicio => tipoServicio !== undefined);

            const tipoServicioTexto = tipoServicioFiltrados.join(', ');
            tipoServicio.appendChild(document.createTextNode(tipoServicioTexto));

            const ID = document.createElement('p');
            const IDSpan = document.createElement('span');
            IDSpan.textContent = 'ID: ';
            ID.appendChild(IDSpan);
            ID.appendChild(document.createTextNode(anuncio.codigoUnico));

            const IP = document.createElement('p');
            const IPSpan = document.createElement('span');
            IPSpan.textContent = 'IP: ';
            IP.appendChild(IPSpan);
            IP.appendChild(document.createTextNode(anuncio.ipUsuario));

            detallesWrapper.appendChild(horario);
            detallesWrapper.appendChild(dias);
            detallesWrapper.appendChild(servicios);
            detallesWrapper.appendChild(capacidad);
            detallesWrapper.appendChild(tarifa);
            detallesWrapper.appendChild(IP);
            detallesWrapper.appendChild(ID);
            detallesWrapper.appendChild(tipoServicio);

            const ubicacion = document.createElement('p');
            const ubicacionUrl = document.createElement('a');
            ubicacionUrl.href = `${anuncio.ubicacionUrl}`;
            ubicacionUrl.textContent = anuncio.ubicacionUrl;
            const ubicacionSpan = document.createElement('span');
            ubicacionSpan.textContent = 'Ubicación: ';
            ubicacion.appendChild(ubicacionSpan);
            ubicacion.appendChild(ubicacionUrl);

            detallesWrapper.appendChild(ubicacion);


            rectangle.appendChild(detallesWrapper);
            verDetallesLink.textContent = 'Ocultar detalles';
        } else {
            console.log('No se encontraron detalles adicionales');
        }
    }).catch((error) => {
        console.error('Error al obtener detalles del anuncio:', error);
    });
}

// Función para mostrar el mensaje
function showMessage(message) {
    messageText.textContent = message;
    messageContainer.classList.remove('hidden');
    messageContainer.classList.add('show');

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// Función para ocultar el mensaje
function hideMessage() {
    messageContainer.classList.remove('show');
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 500);
}

// Manejar el cierre del mensaje
closeMessageBtn.addEventListener('click', hideMessage);

// Manejo del formulario de inicio de sesión
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Usuario autenticado correctamente
            const user = userCredential.user;
            console.log('Usuario autenticado:', user);
        })
        .catch((error) => {
            console.error('Error en la autenticación:', error);
            const errorMessage = document.getElementById('loginError');
            errorMessage.textContent = 'Correo o contraseña incorrecta.';
            errorMessage.style.display = 'block'; // Mostrar el mensaje de error
        });
});

function guardarAnuncioAceptado(datosAnuncio, key, rectangle) {
    const nombreArchivo = `${datosAnuncio.ID}.html`; // Utilizar el ID como nombre del archivo
    const contenidoHTML = `
<!DOCTYPE html>
<html lang="es-PY">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Éxtasis | ${datosAnuncio.ID}</title>
</head>
<body>
        ${datosAnuncio.titulo} ${datosAnuncio.descripcion} ${datosAnuncio.ID} ${datosAnuncio.IP} ${datosAnuncio.servicios}
</body>
</html>
    `;

    // Crear un Blob con el contenido HTML
    const blob = new Blob([contenidoHTML], { type: 'text/html' });

    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', new File([blob], nombreArchivo));

    // Enviar el archivo al servidor utilizando fetch
    fetch('../upload.php', {
        method: 'POST',
        body: formData
    })
    
    .then(response => response.text())
    .then(text => {
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error('Error al parsear la respuesta JSON:', text);
            return;
        }

        if (data.status === 'success') {
            console.log('Archivo subido exitosamente:', data.url);

            // Eliminar el anuncio de la base de datos original
            remove(ref(database, `anuncios/${key}`))
                .then(() => {
                    console.log('Anuncio eliminado de la base de datos original');
                    showMessage('Anuncio aceptado y eliminado');
                    rectangle.remove(); // Eliminar el rectángulo del DOM
                })
                .catch((error) => {
                    console.error('Error al eliminar el anuncio:', error);
                });
        } else {
            console.error('Error al subir el archivo:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error en la solicitud de subida:', error);
    });
}

