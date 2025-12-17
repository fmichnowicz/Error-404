// frontend/js/establecimientos.js

document.addEventListener('DOMContentLoaded', () => {
    cargarEstablecimientos();
    });

    async function cargarEstablecimientos() {
    const grid = document.getElementById('establecimientos-grid');
    const loadingMessage = document.getElementById('loading-message');

    try {
        const response = await fetch('http://localhost:3000/establecimientos');

        if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
        }

        const establecimientos = await response.json();

        // Limpiar mensaje de carga
        loadingMessage.remove();

        if (establecimientos.length === 0) {
        grid.innerHTML = '<p class="subtitle has-text-centered">No hay establecimientos disponibles.</p>';
        return;
        }

        // Generar una card por cada establecimiento
        establecimientos.forEach(est => {
        const cardHTML = `
            <div class="column is-one-fifth-desktop is-one-third-tablet is-half-mobile">
            <div class="card has-equal-height">
                <div class="card-image">
                <figure class="image is-4by3">
                    <img src="assets/images/establecimientos/${est.id}.jpg" 
                        alt="${est.nombre}" 
                        style="object-fit: cover;">
                </figure>
                </div>
                <div class="card-content">
                <p class="title is-5 has-text-centered">${est.nombre}</p>
                <p class="subtitle is-6 has-text-centered has-text-grey">${est.barrio}</p>
                </div>
                <footer class="card-footer mt-auto">
                <a href="reservas.html?establecimiento=${est.id}" 
                    class="card-footer-item has-text-weight-bold has-background-primary has-text-white">
                    Ver reservas
                </a>
                </footer>
            </div>
            </div>
        `;

        grid.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error('Error al cargar establecimientos:', error);
        loadingMessage.innerHTML = '<p class="subtitle has-text-danger has-text-centered">Error al cargar los establecimientos. Intenta más tarde.</p>';
    }
}