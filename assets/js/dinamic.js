import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onChildAdded, remove, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const database = getDatabase(app);
const auth = getAuth(app);

// Elementos del DOM
const panel = document.querySelector('.panel');
const loginContainer = document.querySelector('.login-container');
const container = document.querySelector('.container');
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

    // Contenido del rectángulo
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content-wrapper');

    // Crear y configurar la imagen
    const image = document.createElement('img');
    image.classList.add('foto');
    image.src = anuncio.imageUrl;
    image.style.cursor = 'zoom-in'; // Añadir estilo cursor pointer

    // Agregar la imagen al contenedor del contenido
    contentWrapper.appendChild(image);

    // Event listener para abrir el modal al hacer clic en la imagen
    image.addEventListener('click', function () {
        const modal = document.getElementById('myModal');
        const modalImg = document.getElementById('modalImage');
        const captionText = document.getElementById('caption');

        modal.style.display = 'block'; // Mostrar el modal

        modalImg.src = this.src; // Establecer la imagen del modal igual a la imagen clicada
        captionText.innerHTML = this.alt; // Establecer el texto del título de la imagen

        // Función para cerrar el modal al hacer clic en la "X"
        const closeModal = document.getElementsByClassName('close')[0];
        closeModal.addEventListener('click', function () {
            modal.style.display = 'none'; // Ocultar el modal al hacer clic en la "X"
        });

        // Cerrar el modal si se hace clic fuera de él
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });


    const textWrapper = document.createElement('div');
    textWrapper.classList.add('text-wrapper');

    const title = document.createElement('h2');
    title.innerHTML = `<span>${anuncio.nombre},</span> ${anuncio.titulo}`;
    textWrapper.appendChild(title);

    const description = document.createElement('p');
    description.textContent = anuncio.descripcion;
    description.classList.add('descripcion-anuncio');
    textWrapper.appendChild(description);

    contentWrapper.appendChild(textWrapper);
    rectangle.appendChild(contentWrapper);

    // Información adicional
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

    const ciudad = document.createElement('span');
    ciudad.textContent = `${anuncio.ciudad},`;
    infoWrapper.appendChild(ciudad);

    const direccion = document.createElement('span');
    direccion.textContent = `${anuncio.direccion}`;
    infoWrapper.appendChild(direccion);

    rectangle.appendChild(infoWrapper);

    // Botones para aceptar y eliminar anuncio
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('buttons');

    const okButton = document.createElement('button');
    okButton.textContent = '✓';
    okButton.classList.add('ok');
    okButton.addEventListener('click', () => {
        aceptarAnuncio(key, anuncio, rectangle);
    });
    okButton.addEventListener('click', () => {
        guardarAnuncioAceptado(anuncio, key, rectangle); // Llama a guardarAnuncioAceptado
    });
    buttonsWrapper.appendChild(okButton);

    const delButton = document.createElement('button');
    delButton.textContent = '✖';
    delButton.classList.add('del');
    delButton.addEventListener('click', () => {
        eliminarAnuncio(key, rectangle);
    });
    buttonsWrapper.appendChild(delButton);

    rectangle.appendChild(buttonsWrapper);

    // Enlace "Ver detalles"
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

// Función para aceptar un anuncio
function aceptarAnuncio(key, anuncio, rectangle) {
    const anuncioRef = ref(database, `anuncios/${key}`);
    const anuncioAceptadoRef = ref(database, `escorts/${key}`);

    get(anuncioRef).then((snapshot) => {
        if (snapshot.exists()) {
            const anuncioOriginal = snapshot.val();

            // Almacenar el anuncio aceptado en escorts
            set(anuncioAceptadoRef, {
                ...datosAnuncio,
                fechaGuardado: obtenerFechaActual(),
                horaGuardado: obtenerHoraActual()
            })
                .then(() => {
                    console.log('Anuncio agregado a escorts exitosamente');
                })
                .catch((error) => {
                    console.error('Error al mover el anuncio:', error);
                });

            // Almacenar en la nueva carpeta de zona
            set(zonaRef, {
                ...datosAnuncio,
                fechaGuardado: obtenerFechaActual(),
                horaGuardado: obtenerHoraActual()
            })
                .then(() => {
                    console.log(`Anuncio agregado a la carpeta de zona ${zonaNombre} exitosamente`);
                })
                .catch((error) => {
                    console.error('Error al mover el anuncio a la carpeta de zona:', error);
                });


            // Guardar el anuncio aceptado en la carpeta escorts
            set(anuncioAceptadoRef, anuncioOriginal)
                .then(() => {
                    console.log('Anuncio aceptado movido a la carpeta escorts');
                    showMessage('Anuncio agregado.');
                    // Eliminar el anuncio de la carpeta anuncios
                    remove(anuncioRef)
                        .then(() => {
                            console.log('Anuncio eliminado de la carpeta anuncios');
                            rectangle.remove(); // Eliminar el rectángulo del DOM
                        })
                        .catch((error) => {
                            console.error('Error al eliminar el anuncio de la carpeta anuncios:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error al mover el anuncio a la carpeta escorts:', error);
                });
        } else {
            console.log('El anuncio original no existe');
        }
    }).catch((error) => {
        console.error('Error al obtener el anuncio original:', error);
    });
}

// Función para eliminar un anuncio
function eliminarAnuncio(key, rectangle) {
    const anuncioRef = ref(database, `anuncios/${key}`);

    // Eliminar el anuncio de la base de datos
    remove(anuncioRef)
        .then(() => {
            console.log('Anuncio eliminado de la carpeta anuncios');
            showMessage('Anuncio eliminado');
            rectangle.remove(); // Eliminar el rectángulo del DOM
        })
        .catch((error) => {
            console.error('Error al eliminar el anuncio:', error);
        });
}

// Función para alternar la visualización de los detalles adicionales del anuncio
function toggleDetallesAnuncio(key, rectangle, verDetallesLink) {
    const existingDetails = rectangle.querySelector('.detalles-wrapper');
    if (existingDetails) {
        existingDetails.remove(); // Si los detalles ya están visibles, ocultarlos
        verDetallesLink.textContent = 'Ver detalles';
    } else {
        mostrarDetallesAnuncio(key, rectangle, verDetallesLink); // Si los detalles no están visibles, mostrarlos
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

            const ID = document.createElement('p');
            ID.innerHTML = `<span>ID:</span> <a target="_blank" href="../../../anuncio/${anuncio.codigoUnico}.html">${anuncio.codigoUnico}</a>`;

            const IP = document.createElement('p');
            IP.innerHTML = `<span>IP:</span> <a target="_blank" href="https://www.geolocation.com/es?ip=${anuncio.ipUsuario}#ipresult">${anuncio.ipUsuario}</a>`;

            const precio = document.createElement('p');
            precio.innerHTML = `<span>Precio:</span> ${anuncio.tarifa} Gs / hora`;

            const capacidad = document.createElement('p');
            capacidad.innerHTML = `<span>Capacidad:</span> ${Object.values(anuncio.capacidad).join(', ')}`;

            const servicios = document.createElement('p');
            servicios.innerHTML = `<span>Servicios:</span> ${Object.values(anuncio.servicios).join(', ')}`;

            const aceptoA = document.createElement('p');
            aceptoA.innerHTML = `<span>Disponible para:</span> ${Object.values(anuncio.aceptoA).join(', ')}`;

            const tipoServicio = document.createElement('p');
            tipoServicio.innerHTML = `<span>Tipo de servicio:</span> ${Object.values(anuncio.tipoServicio).join(', ')}`;

            const horario = document.createElement('p');
            horario.innerHTML = `<span>Horario:</span> de ${anuncio.horario.de} a ${anuncio.horario.a}`;

            const dias = document.createElement('p');
            dias.innerHTML = `<span>Los días:</span> ${Object.values(anuncio.horario.dias).join(', ')}`;

            const ubicacion = document.createElement('p');
            ubicacion.innerHTML = `<span>Ubicación:</span> <a target="_blank" href="${anuncio.ubicacionUrl}">${anuncio.ubicacionUrl}</a>`;

            detallesWrapper.appendChild(ID);
            detallesWrapper.appendChild(IP);
            detallesWrapper.appendChild(precio);
            detallesWrapper.appendChild(capacidad);
            detallesWrapper.appendChild(servicios);
            detallesWrapper.appendChild(aceptoA);
            detallesWrapper.appendChild(horario);
            detallesWrapper.appendChild(dias);
            detallesWrapper.appendChild(tipoServicio);
            detallesWrapper.appendChild(ubicacion);

            rectangle.appendChild(detallesWrapper);
            verDetallesLink.textContent = 'Ocultar detalles';
        } else {
            console.log('El anuncio no existe');
        }
    }).catch((error) => {
        console.error('Error al obtener el anuncio:', error);
    });
}

// Función para crear un anuncio en el panel
function createAnuncio(anuncio, key) {
    const anuncioSection = document.createElement('section');
    anuncioSection.classList.add('anuncio');
    let descripcion = anuncio.descripcion;
    let descripcionCorta = descripcion;
    let tieneVerMas = false;

    if (descripcion.length > 150) {
        descripcionCorta = descripcion.substring(0, 150);
        tieneVerMas = true;
    }

    anuncioSection.innerHTML = `
        <div class="portada">
            <img class="foto" src="">
        </div>
        <div class="encabezado">
            <span class="zona">${anuncio.zona},</span>
            <span class="ciudad-barrio">${anuncio.ciudad},</span>
            <span class="ciudad-barrio">${anuncio.direccion}</span>
            <h3 class="titulo">${anuncio.titulo}</h3>
        </div>
        <p class="descripcion">
            ${descripcionCorta}
            ${tieneVerMas ? '<a href="../anuncio/${datosAnuncio.codigoUnico}.html" class="ver-mas">...Ver más</a>' : ''}
        </p>
        <div class="datos">
            <span class="edad">${anuncio.edad} años</span>
        </div>
        <div class="contacto">
            <button class="ok">Aceptar</button>
        </div>
    `;

    // Agregar evento al botón "Aceptar" para aceptar el anuncio
    const okButton = anuncioSection.querySelector('.ok');
    okButton.addEventListener('click', () => {
        aceptarAnuncio(key, anuncio, anuncioSection);
    });

    panel.appendChild(anuncioSection);
}

// Obtener los datos del anuncio original
get(anuncioRef).then((snapshot) => {
    if (snapshot.exists()) {
        const anuncioOriginal = snapshot.val();

        // Crear una referencia al nuevo anuncio aceptado en 'escorts'
        const anuncioAceptadoRef = ref(database, `escorts/${key}`);

        // Guardar los datos del anuncio aceptado en la nueva ubicación
        set(anuncioAceptadoRef, anuncioOriginal)
            .then(() => {
                console.log('Anuncio agregado exitosamente');
                showMessage('Anuncio agregado exitosamente'); // Muestra un mensaje de éxito (implementa showMessage según tu implementación)
                // Eliminar el anuncio de la carpeta 'anuncios'
                remove(anuncioRef)
                    .then(() => {
                        console.log('Anuncio eliminado de la carpeta anuncios');
                        anuncioSection.remove(); // Eliminar el anuncio del DOM
                    })
                    .catch((error) => {
                        console.error('Error al eliminar el anuncio de la carpeta anuncios:', error);
                    });
            })
            .catch((error) => {
                console.error('Error al mover el anuncio:', error);
            });
    } else {
        console.log('El anuncio original no existe');
    }
}).catch((error) => {
    console.error('Error al obtener el anuncio original:', error);
});

anuncioContainer.appendChild(anuncioSection);


function guardarAnuncioAceptado(datosAnuncio, key, rectangle) {
    const nombreArchivo = `${datosAnuncio.codigoUnico}.html`; // Utilizar el ID como nombre del archivo

    // Calcular la tarifa aumentada en un 6.6%
    const tarifaOriginal = parseFloat(datosAnuncio.tarifa);
    const tarifaConAumento = tarifaOriginal * 1.066;
    const tarifaConAumentoConComa = tarifaConAumento.toFixed(3).replace('.', ',');
    const nuevoPrecio = tarifaConAumentoConComa; // Guardar el nuevo precio en una variable

    const contenidoHTML = `
    
<!DOCTYPE html>
<html lang="es-PY">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#5213ff">
    <meta name="title" content="Éxtasis | ${datosAnuncio.nombre}, ${datosAnuncio.titulo}">
    <meta name="description" content="Éxtasis ${datosAnuncio.zona} | ${datosAnuncio.descripcion}">
    <meta name="keywords"
        content="anuncios eróticos, servicios eróticos, entretenimiento para adultos, Paraguay, ${datosAnuncio.nombre}, ${datosAnuncio.titulo}, ${datosAnuncio.descripcion}, citas adultas, acompañantes, anuncios de escorts, anuncios para adultos, servicios para adultos, mejores anuncios eróticos, Éxtasis Paraguay, contactos adultos, encuentros eróticos, experiencias íntimas, anuncios para citas, mujeres escorts, anuncios de acompañantes, servicios de acompañantes, placer y compañía, servicios discretos, placer adulto, experiencias eróticas, contacto para adultos en Paraguay, servicios de citas eróticas, encuentros discretos, servicios premium para adultos, mejores servicios eróticos en Paraguay, mujeres bellas, compañía íntima, placer garantizado, satisfacción asegurada, encuentros íntimos Paraguay, entretenimiento exclusivo para adultos, anuncios para adultos verificados, anuncios eróticos seguros, servicios adultos confiables, citas eróticas, compañía adulta profesional, anuncios premium eróticos, placer y diversión, acompañantes profesionales, servicios de calidad, experiencias únicas">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://extasis.com.py">
    <meta property="og:title" content="${datosAnuncio.nombre}, ${datosAnuncio.titulo}">
    <meta property="og:description" content="Éxtasis ${datosAnuncio.zona} | ${datosAnuncio.descripcion}">
    <meta property="og:image" content="${datosAnuncio.imageUrl}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://www.extasis.com.py">
    <meta property="twitter:title" content="Éxtasis | ${datosAnuncio.nombre}, ${datosAnuncio.titulo}">
    <meta property="twitter:description" content="Éxtasis ${datosAnuncio.zona} | ${datosAnuncio.descripcion}">
    <meta property="twitter:image" content="${datosAnuncio.imageUrl}">


    <link rel="stylesheet" href="../assets/css/anuncio.css">
    <link rel="stylesheet" href="../assets/css/escorts.css">
    <link rel="stylesheet" href="../assets/css/estilos.css">
    <link rel="stylesheet" href="../assets/css/publicar.css">
    <script src="https://kit.fontawesome.com/c15b744a04.js" crossorigin="anonymous"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-database.js"></script>
    <link rel="shortcut icon" href="../assets/images/fuego.png" type="image/x-icon">
    <title>Éxtasis | ${datosAnuncio.nombre}</title>
</head>

<body>
    <nav class="nav container">
        <div class="nav__logo">
            <h2 class="nav__title"><a href="../index.html"><img src="../assets/images/logo2.png" alt="logo"></a></h2>
        </div>

        <ul class="nav__link nav__link--menu">
            <li class="nav__items">
                <a href="../index.html" class="nav__links">Inicio</a>
            </li>
            <li class="nav__items">
                <a href="../escorts/" class="nav__links">Escorts</a>
            </li>
            <li class="nav__items">
                <a href="../index.html#lomejor" class="nav__links">Zonas</a>
            </li>
            <li class="nav__items">
                <a href="../index.html#ExtaZone" class="nav__links">ExtaZone</a>
            </li>
            <li class="nav__items">
                <a href="../publicar/" class="nav__links publica">Publica tu anuncio</a>
            </li>

            <img src="../assets/images/x.png" class="nav__close">
        </ul>

        <div class="nav__menu">
            <img src="../assets/images/menu.png" class="nav__img">
        </div>
    </nav>

    <main>
        <div class="container__cont__orig"> <br>
            <p class="ID__orig"><span class="ID">ID:</span> ${datosAnuncio.codigoUnico}</p>
            <div class="info__orig">
                <span class="edad__orig">${datosAnuncio.edad} años,</span>
                <span class="zona__orig">${datosAnuncio.zona},</span>
                <span class="ciudad__orig">${datosAnuncio.ciudad},</span>
                <span class="direccion__orig">${datosAnuncio.direccion}</span>
            </div>
            <h1 class="titulo__orig"><span>${datosAnuncio.nombre},</span> ${datosAnuncio.titulo}</h1>
            <img class="foto__orig" src="${datosAnuncio.imageUrl}" alt="${datosAnuncio.nombre}">
            <p class="descripcion__orig">${datosAnuncio.descripcion}</p>
            <p class="precio__orig" translate="no">${nuevoPrecio}Gs <span>/ hora</span></p>

            <div class="buy__orig">
                <a target="_blank" class="contratar__orig"
                    href="https://wa.me/595983293074/?text=> ¡Hola! He visto el anuncio *${datosAnuncio.nombre}, ${datosAnuncio.titulo}* (${datosAnuncio.codigoUnico}) en *Éxtasis Paraguay* y estoy interesado en él. Me gustaría obtener más información y saber cómo proceder para adquirir el servicio.">
                    <img src="../assets/images/whatsappp.png">
                    Adquirir servicio
                </a>
                <a class="reportar" href="#" onclick="return false;">
                    <img src="../assets/images/alerta.png">
                </a>
                <a class="compartir" href="#" onclick="return false;">
                    <img src="../assets/images/compartir.png">
                </a>
            </div>
            <p class="capacidad__orig">
            <h3 class="titlesex__orig">Capacidad de personas</h3>
            ${datosAnuncio.capacidad.a ? `<span class="box__orig">${datosAnuncio.capacidad.a}</span>` : ''}
            ${datosAnuncio.capacidad.b ? `<span class="box__orig">${datosAnuncio.capacidad.b}</span>` : ''}
            ${datosAnuncio.capacidad.c ? `<span class="box__orig">${datosAnuncio.capacidad.c}</span>` : ''}
            ${datosAnuncio.capacidad.d ? `<span class="box__orig">${datosAnuncio.capacidad.d}</span>` : ''}

            </p>

            <p class="tipoServicio__orig">
            <h3 class="titlesex__orig">Disponible a</h3>
            ${datosAnuncio.tipoServicio.a ? `<span class="box__orig">${datosAnuncio.tipoServicio.a}</span>` : ''}
            ${datosAnuncio.tipoServicio.b ? `<span class="box__orig">${datosAnuncio.tipoServicio.b}</span>` : ''}
            ${datosAnuncio.tipoServicio.c ? `<span class="box__orig">${datosAnuncio.tipoServicio.c}</span>` : ''}
            </p>

            <p class="servicios__orig">
            <h3 class="titlesex__orig">Disponible para</h3>
            ${datosAnuncio.aceptoA.a ? `<span class="box__orig">${datosAnuncio.aceptoA.a}</span>` : ''}
            ${datosAnuncio.aceptoA.b ? `<span class="box__orig">${datosAnuncio.aceptoA.b}</span>` : ''}
            ${datosAnuncio.aceptoA.c ? `<span class="box__orig">${datosAnuncio.aceptoA.c}</span>` : ''}
            ${datosAnuncio.aceptoA.d ? `<span class="box__orig">${datosAnuncio.aceptoA.d}</span>` : ''}
            </p>

            <p class="servicios__orig">
            <h3 class="titlesex__orig">Servicios</h3>
            ${datosAnuncio.servicios.a ? `<span class="box__orig">${datosAnuncio.servicios.a}</span>` : ''}
            ${datosAnuncio.servicios.b ? `<span class="box__orig">${datosAnuncio.servicios.b}</span>` : ''}
            ${datosAnuncio.servicios.c ? `<span class="box__orig">${datosAnuncio.servicios.c}</span>` : ''}
            ${datosAnuncio.servicios.d ? `<span class="box__orig">${datosAnuncio.servicios.d}</span>` : ''}
            ${datosAnuncio.servicios.e ? `<span class="box__orig">${datosAnuncio.servicios.e}</span>` : ''}
            ${datosAnuncio.servicios.f ? `<span class="box__orig">${datosAnuncio.servicios.f}</span>` : ''}
            </p>

            <p class="disponibilidad__orig">
            <h3 class="titlesex__orig">Horario de disponibilidad</h3>
            <div class="horas__orig">
                <span class="de__orig">de <span class="color__hora">${datosAnuncio.horario.de}</span></span>
                <span class="de__orig">a <span class="color__hora">${datosAnuncio.horario.a}</span> hs</span>
            </div>
            ${datosAnuncio.horario.dias.a ? `<span class="box__orig">${datosAnuncio.horario.dias.a}</span>` : ''}
            ${datosAnuncio.horario.dias.b ? `<span class="box__orig">${datosAnuncio.horario.dias.b}</span>` : ''}
            ${datosAnuncio.horario.dias.c ? `<span class="box__orig">${datosAnuncio.horario.dias.c}</span>` : ''}
            ${datosAnuncio.horario.dias.d ? `<span class="box__orig">${datosAnuncio.horario.dias.d}</span>` : ''}
            ${datosAnuncio.horario.dias.e ? `<span class="box__orig">${datosAnuncio.horario.dias.e}</span>` : ''}
            ${datosAnuncio.horario.dias.f ? `<span class="box__orig">${datosAnuncio.horario.dias.f}</span>` : ''}
            ${datosAnuncio.horario.dias.g ? `<span class="box__orig">${datosAnuncio.horario.dias.g}</span>` : ''}
            </p>
        </div>

        <!-- Modales -->

        <div id="modalReportar" class="modal">
            <div class="modal-content">
                <span class="close"
                    onclick="document.getElementById('modalReportar').style.display='none'">&times;</span>
                <h3 class="subtitle">Reportar <span>este anuncio</span></h3>
                <form class="reportar" id="reportar" method="post">
                    <input type="text" name="razon" id="razon" class="razon" placeholder="Descripción del reporte *">
                    <label for="Contenido Inapropiado o Explícito">
                        <input type="checkbox" name="inapropiado" id="Contenido Inapropiado o Explícito"
                            class="inapropiado">
                        Contenido Inapropiado o Explícito
                    </label>
                    <label for="Violación de Términos de Servicio">
                        <input type="checkbox" name="terminosViolados" id="Violación de Términos de Servicio"
                            class="terminosViolados">
                        Violación de Términos de Servicio
                    </label>
                    <label for="Explotación o Tráfico Humano">
                        <input type="checkbox" name="explotacionOTrafico" id="Explotación o Tráfico Humano"
                            class="explotacionOTrafico">
                        Explotación o Tráfico Humano
                    </label>
                    <label for="Promoción de Servicios Ilegales">
                        <input type="checkbox" name="serviciosIlegales" id="Promoción de Servicios Ilegales"
                            class="serviciosIlegales">
                        Promoción de Servicios Ilegales
                    </label>
                    <label for="Spam o Contenido No Solicitado">
                        <input type="checkbox" name="spam" id="Spam o Contenido No Solicitado" class="spam">
                        Spam o Contenido No Solicitado
                    </label>
                    <label for="Contenido Ofensivo">
                        <input type="checkbox" name="ofensivo" id="Contenido Ofensivo" class="ofensivo">
                        Contenido Ofensivo
                    </label>
                    <label for="Fraude o Estafa">
                        <input type="checkbox" name="fraude" id="Fraude o Estafa" class="fraude">
                        Fraude o Estafa
                    </label>
                    <button type="submit" id="enviarReporte" disabled>Enviar</button>
                </form>
                <div class="hecho" id="reporteEnviado">¡Reporte enviado con éxito!</div>
            </div>
        </div>

        <div id="modalCompartir" class="modal">
            <div class="modal-content">
                <span class="close"
                    onclick="document.getElementById('modalCompartir').style.display='none'">&times;</span>
                <h3 class="subtitle">Compartí este <span>anuncio</span></h3>
                <a href="https://api.whatsapp.com/send?text=Visita este anuncio: https://extasis.com.py/anuncios/${datosAnuncio.codigoUnico}.html"
                    target="_blank" onclick="compartirPorWhatsApp()">
                    <img src="../assets/images/whatsappp.png" alt="WhatsApp" title="Compartir por WhatsApp"
                        class="whatsapp-icon">
                </a>
                <a href="javascript:void(0);" onclick="copiarEnlace()">
                    <img src="../assets/images/cadena.png" alt="Copiar" title="Copiar enlace" class="link-icon">
                </a>
            </div>
        </div>
        </div>
    </main>

    <footer class="footer">
        <section class="footer__container container">
            <nav class="nav nav--footer">
                <a href="../index.html">
                    <img class="footer__title" src="../assets/images/logo.png" alt="logo">
                </a>
                <ul class="nav__link nav__link--footer">
                    <li class="nav__items">
                        <a href="../index.html" class="nav__links">Inicio</a>
                    </li>
                    <li class="nav__items">
                        <a href="../legal/terminos-y-condiciones.html" class="nav__links">Términos y Condiciones </a>
                    </li>
                    <li class="nav__items">
                        <a href="../legal/politica-de-privacidad.html" class="nav__links">Política de Privacidad</a>
                    </li>
                    <li class="nav__items">
                        <a href="../legal/politica-de-comisiones-y-pagos.html" class="nav__links">Política de Comisiones
                            y
                            Pagos</a>
                    </li>
                    <li class="nav__items">
                        <a href="../legal/politica-de-contenido-y-uso-aceptable.html" class="nav__links">Política de
                            Contenido y Uso Aceptable</a>
                    </li>
                    <li class="nav__items">
                        <a href="../legal/descargo-de-responsabilidad.html" class="nav__links">Descargo de
                            Responsabilidad</a>
                    </li>
                    <li class="nav__items">
                        <a href="mailto:hola@extasis.com.py" class="nav__links">Contacto</a>
                    </li>
                </ul>
            </nav>
            <div class="metodos__pago">
                <img src="../assets/images/rta.png" alt="RTA">
            </div>
        </section>
        <section class="footer__copy container">
            <div class="footer__social">
                <a target="_blank" href="https://instagram.com/extasis__py" class="footer__icons"><img src="../assets/images/instagram.png" class="footer__img"></a>
                <a target="_blank" href="https://wa.me/595983293074" class="footer__icons"><img src="../assets/images/whatsapp.png" class="footer__img"></a>
                <a target="_blank" href="mailto:contacto@extasis.com.py" class="footer__icons"><img src="../assets/images/telegram.png"
                        class="footer__img"></a>
            </div>
            <h3 class="footer__copyright">&copy; 2024 Éxtasis</h3>
        </section>
    </footer>

    <script type="module" src="../assets/js/anuncio.js"></script>
    <script src="../assets/js/menu.js"></script>
    <script>

        // Función para copiar el enlace al portapapeles
        function copiarEnlace() {
            // Crear el elemento para el mensaje
            var mensaje = document.createElement('div');
            mensaje.textContent = 'Enlace copiado.';
            mensaje.style.backgroundColor = '#5213ff'; // Color de fondo
            mensaje.style.color = '#ffffff'; // Color de texto
            mensaje.style.position = 'fixed'; // Posición fija para que aparezca arriba
            mensaje.style.top = '20px'; // Distancia desde la parte superior
            mensaje.style.left = '50%'; // Centrar horizontalmente
            mensaje.style.transform = 'translateX(-50%)'; // Centrar horizontalmente
            mensaje.style.padding = '10px 20px'; // Espacio interior
            mensaje.style.borderRadius = '5px'; // Borde redondeado
            mensaje.style.zIndex = '1000'; // Z-index alto para que esté por encima de otros elementos
            mensaje.style.opacity = '0'; // Comienza invisible
            mensaje.style.transition = 'opacity .3s ease-in-out'; // Animación de entrada y salida
            document.body.appendChild(mensaje); // Agregar mensaje al DOM

            // Mostrar el mensaje
            setTimeout(function () {
                mensaje.style.opacity = '1'; // Mostrar mensaje
            }, 50); // Pequeño retraso para asegurar la animación

            // Ocultar y eliminar el mensaje después de 3 segundos
            setTimeout(function () {
                mensaje.style.opacity = '0'; // Ocultar mensaje
                setTimeout(function () {
                    document.body.removeChild(mensaje); // Eliminar mensaje del DOM
                }, 500); // Esperar a que termine la animación de salida
            }, 3000); // 3 segundos después de mostrar el mensaje

            // Copiar el enlace al portapapeles
            var enlace = document.createElement('textarea');
            enlace.value = window.location.href;
            enlace.setAttribute('readonly', '');
            enlace.style.position = 'absolute';
            enlace.style.left = '-9999px';
            document.body.appendChild(enlace);
            enlace.select();
            document.execCommand('copy');
            document.body.removeChild(enlace);
        }
    </script>
</body>

</html>
    `;

    // Crear un Blob con el contenido HTML
    const blob = new Blob([contenidoHTML], { type: 'text/html' });

    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', new File([blob], nombreArchivo));

    // Enviar el archivo al servidor utilizando fetch
    fetch('../../../backend/upload.php', {
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
                const anuncioRef = ref(database, `anuncios/${key}`);

                remove(anuncioRef)
                    .then(() => {
                        console.log('Anuncio eliminado de la base de datos original');
                        showMessage('Anuncio agregado.');
                        rectangle.remove(); // Eliminar el rectángulo del DOM
                    })
                    .catch((error) => {
                        console.error('Error al eliminar el anuncio:', error);
                    });

                // Guardar en escorts
                const anuncioAceptadoRef = ref(database, `escorts/${key}`);
                set(anuncioAceptadoRef, datosAnuncio)
                    .then(() => {
                        console.log('Anuncio agregado a escorts exitosamente');
                    })
                    .catch((error) => {
                        console.error('Error al mover el anuncio:', error);
                    });

                // Guardar en la nueva carpeta de zona
                const zonaNombre = datosAnuncio.zona.toLowerCase().replace(/\s+/g, ''); // Nombre de la zona en minúsculas y sin espacios
                const zonaRef = ref(database, `escorts/zona/${zonaNombre}/${key}`);
                set(zonaRef, datosAnuncio)
                    .then(() => {
                        console.log(`Anuncio agregado a la carpeta de zona ${zonaNombre} exitosamente`);
                    })
                    .catch((error) => {
                        console.error('Error al mover el anuncio a la carpeta de zona:', error);
                    });

            } else {
                console.error('Error al subir el archivo:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error en la solicitud de subida:', error);
        });
}
