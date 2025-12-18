const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allEstablecimientos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarEstablecimientos();
    });

    async function cargarEstablecimientos() {
    const grid = document.getElementById('establecimientos-grid');
    const loadingMessage = document.getElementById('loading-message');

    try {
        const response = await fetch('http://localhost:3000/establecimientos');
        if (!response.ok) throw new Error('Error de red');

        allEstablecimientos = await response.json();

        loadingMessage.remove();

        if (allEstablecimientos.length === 0) {
        grid.innerHTML = '<p class="subtitle has-text-centered">No hay establecimientos disponibles.</p>';
        return;
        }

        // Mostrar primera página
        renderizarPagina(1);

    } catch (error) {
        console.error('Error:', error);
        loadingMessage.innerHTML = '<p class="subtitle has-text-danger has-text-centered">Error al cargar los establecimientos</p>';
    }
    }

    function renderizarPagina(page) {
    const grid = document.getElementById('establecimientos-grid');
    const paginacionContainer = document.getElementById('boton_paginación'); // ← Nueva ubicación

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsPagina = allEstablecimientos.slice(start, end);

    // Limpiar paginación anterior si existe
    paginacionContainer.innerHTML = '';

    // Limpiar cards anteriores
    grid.innerHTML = '';

    // Generar cards
    itemsPagina.forEach(est => {
        const cardHTML = `
        <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
            <div class="card has-same-height mx-4 my-4">
            <div class="card-image">
                <figure class="image is-4by3">
                <img src="https://placehold.co/600x400" 
                    alt="${est.nombre}" 
                    style="object-fit: cover;">
                </figure>
            </div>

            <div class="card-content has-text-centered flex-grow">
                <p class="title is-5 mb-2">${est.nombre}</p>
                <p class="subtitle is-6 has-text-grey">${est.barrio}</p>
            </div>

            <footer class="card-footer mt-auto">
                <a href="crear_reservas.html?establecimiento=${est.id}" 
                class="card-footer-item has-text-weight-bold has-background-primary has-text-white">
                Crear reservas
                </a>
            </footer>
            </div>
        </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Crear paginación en la nueva sección
    crearPaginacion(page);

    currentPage = page;
    }

    function crearPaginacion(page) {
    const totalPages = Math.ceil(allEstablecimientos.length / ITEMS_PER_PAGE);
    const paginacionContainer = document.getElementById('boton_paginación');

    const paginacionHTML = `
        <nav class="pagination is-centered" role="navigation" aria-label="pagination">
        <button id="btn-anterior" class="button pagination-previous" ${page === 1 ? 'style="display:none"' : ''}>
            Anterior
        </button>
        <button id="btn-siguiente" class="button pagination-next" ${page >= totalPages ? 'style="display:none"' : ''}>
            Siguiente
        </button>
        <ul class="pagination-list">
            <li>
            <span class="pagination-ellipsis">&nbsp;Página ${page} de ${totalPages}&nbsp;</span>
            </li>
        </ul>
        </nav>
    `;

    paginacionContainer.innerHTML = paginacionHTML;

    // Eventos de botones
    document.getElementById('btn-anterior')?.addEventListener('click', () => {
        if (currentPage > 1) renderizarPagina(currentPage - 1);
    });

    document.getElementById('btn-siguiente')?.addEventListener('click', () => {
        if (currentPage < totalPages) renderizarPagina(currentPage + 1);
    });
}