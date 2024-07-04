function filterResults() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const anuncios = document.querySelectorAll('.anuncio');
    let hasResults = false;

    anuncios.forEach(anuncio => {
        const text = anuncio.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (text.includes(input)) {
            anuncio.classList.remove('hidden');
            hasResults = true;
        } else {
            anuncio.classList.add('hidden');
        }
    });

    const noResults = document.getElementById('noResults');
    if (hasResults) {
        noResults.classList.add('hidden');
    } else {
        noResults.classList.remove('hidden');
    }
}function filterResults() {
    const input = document.querySelector('.search-input').value.toLowerCase();
    const anuncios = document.querySelectorAll('.anuncio');
    let hasResults = false;

    anuncios.forEach(anuncio => {
        const text = anuncio.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (text.includes(input)) {
            anuncio.classList.remove('hidden');
            hasResults = true;
        } else {
            anuncio.classList.add('hidden');
        }
    });

    const noResults = document.getElementById('noResults');
    if (hasResults) {
        noResults.classList.add('hidden');
    } else {
        noResults.classList.remove('hidden');
    }
}