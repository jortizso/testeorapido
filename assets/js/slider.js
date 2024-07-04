document.addEventListener('DOMContentLoaded', function () {
    const carrusel = document.getElementById('carrusel');
    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollSpeed = 20; // menor valor = movimiento más rápido
    const delayBetweenLoops = 2000; // milisegundos

    function autoScroll() {
        if (scrollAmount >= carrusel.scrollWidth - carrusel.clientWidth) {
            setTimeout(() => {
                carrusel.scrollTo({ left: 0, behavior: 'smooth' });
                scrollAmount = 0;
                setTimeout(autoScroll, delayBetweenLoops);
            }, delayBetweenLoops);
        } else {
            carrusel.scrollBy({ left: scrollStep });
            scrollAmount += scrollStep;
            setTimeout(autoScroll, scrollSpeed);
        }
    }

    setTimeout(autoScroll, delayBetweenLoops);
});