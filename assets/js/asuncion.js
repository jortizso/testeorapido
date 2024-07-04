import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const loader = document.getElementById('loader');
const nav = document.querySelector('nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const anuncioContainer = document.getElementById('anuncio-container');

function createAnuncio(anuncio) {
    const anuncioSection = document.createElement('section');
    anuncioSection.classList.add('anuncio');
    let descripcion = anuncio.descripcion || ''; // Asigna un valor por defecto si descripcion es undefined
    
    let descripcionCorta = descripcion;
    let tieneVerMas = false;

    if (!anuncio || !anuncio.descripcion || !anuncio.codigoUnico || !anuncio.imageUrl || !anuncio.zona || !anuncio.ciudad || !anuncio.direccion || !anuncio.nombre || !anuncio.titulo || !anuncio.edad) {
        console.warn('Anuncio inválido:', anuncio);
        return; // Sale de la función si el anuncio no tiene datos válidos
    }

    if (descripcion.length > 150) {
        descripcionCorta = descripcion.substring(0, 150);
        tieneVerMas = true;
    }

    anuncioSection.innerHTML = `
        <a href="../../anuncio/${anuncio.codigoUnico}.html">
            <div class="portada">
                <img class="foto" src="${anuncio.imageUrl}">
            </div>
            <div class="encabezado">
                <span class="zona">${anuncio.zona},</span>
                <span class="ciudad-barrio">${anuncio.ciudad},</span>
                <span class="ciudad-barrio">${anuncio.direccion}</span>
                <h3 class="titulo">${anuncio.nombre}, ${anuncio.titulo}</h3>
            </div>
            <p class="descripcion">
                ${descripcionCorta}
                ${tieneVerMas ? `<a href="../../anuncio/${anuncio.codigoUnico}.html" class="ver-mas">...Ver más</a>` : ''}
            </p>
            <div class="datos">
                <span class="edad">${anuncio.edad} años</span>
            </div>
            <div class="contacto">
                <a target="_blank" class="contratar" href="https://wa.me/595983293074/?text=> ¡Hola! He visto el anuncio *${anuncio.nombre}, ${anuncio.titulo}* (${anuncio.codigoUnico}) en *Éxtasis Paraguay* y estoy interesado en él. Me gustaría obtener más información y saber cómo proceder para adquirir el servicio.">
                    <img src="../../assets/images/compra.png"> Adquirir servicio
                </a>        
            </div>
        </a>
    `;

    anuncioContainer.appendChild(anuncioSection);
}

function fetchAnuncios() {
    const dbRef = ref(database);
    get(child(dbRef, 'escorts/zona/asunción')).then((snapshot) => {
        if (snapshot.exists()) {
            const anuncios = snapshot.val();
            const keys = Object.keys(anuncios);
            // Iterar en reversa sobre las claves
            for (let i = keys.length - 1; i >= 0; i--) {
                createAnuncio(anuncios[keys[i]]);
            }
        } else {
            console.log("No data available");
        }
        loader.classList.add('hidden');
        nav.classList.remove('hidden');
        main.classList.remove('hidden');
        footer.classList.remove('hidden');
    }).catch((error) => {
        console.error(error);
        loader.classList.add('hidden');
        nav.classList.remove('hidden');
        main.classList.remove('hidden');
        footer.classList.remove('hidden');
    });
}

fetchAnuncios();