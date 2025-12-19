// frontend/assets/js/establecimientos.js

const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let allEstablecimientos = [];
let allCanchas = [];
let establecimientosFiltrados = [];

let filtroDeporteActual = ''; // Para pasar el deporte en la URL

document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  inicializarFiltros();
});

async function cargarDatos() {
  const loadingMessage = document.getElementById('loading-message');

  try {
    const [establecimientosRes, canchasRes] = await Promise.all([
      fetch('http://localhost:3000/establecimientos').then(r => r.json()),
      fetch('http://localhost:3000/canchas').then(r => r.json())
    ]);

    allEstablecimientos = establecimientosRes;
    allCanchas = canchasRes;
    establecimientosFiltrados = [...allEstablecimientos];

    loadingMessage.style.display = 'none';

    if (allEstablecimientos.length === 0) {
      document.getElementById('establecimientos-grid').innerHTML =
        '<div class="column is-full"><p class="subtitle has-text-centered has-text-grey">No hay establecimientos disponibles.</p></div>';
      return;
    }

    renderizarPagina(1);

  } catch (error) {
    console.error('Error:', error);
    loadingMessage.innerHTML = '<p class="subtitle has-text-danger has-text-centered">Error al cargar los establecimientos</p>';
  }
}

function inicializarFiltros() {
  const inputBarrio = document.getElementById('filtro-barrio');
  const inputDeporte = document.getElementById('filtro-deporte');
  const sugerenciasBarrio = document.getElementById('sugerencias-barrio');
  const sugerenciasDeporte = document.getElementById('sugerencias-deporte');

  // Filtro por barrio
  inputBarrio.addEventListener('input', () => {
    const query = inputBarrio.value.trim().toLowerCase();
    sugerenciasBarrio.innerHTML = '';
    sugerenciasBarrio.style.display = 'none';

    if (query.length < 2) {
      filtrarEstablecimientos();
      return;
    }

    const barriosUnicos = [...new Set(allEstablecimientos.map(est => est.barrio.toLowerCase()))]
      .map(b => allEstablecimientos.find(est => est.barrio.toLowerCase() === b).barrio);

    const matches = barriosUnicos.filter(barrio => barrio.toLowerCase().includes(query));

    if (matches.length === 0) return;

    matches.forEach(barrio => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = barrio;
      item.onclick = () => {
        inputBarrio.value = barrio;
        sugerenciasBarrio.style.display = 'none';
        filtrarEstablecimientos();
      };
      sugerenciasBarrio.appendChild(item);
    });

    sugerenciasBarrio.style.display = 'block';
  });

  // Filtro por deporte
  inputDeporte.addEventListener('input', () => {
    const query = inputDeporte.value.trim().toLowerCase();
    sugerenciasDeporte.innerHTML = '';
    sugerenciasDeporte.style.display = 'none';

    if (query.length < 2) {
      filtroDeporteActual = '';
      filtrarEstablecimientos();
      return;
    }

    const deportesUnicos = [...new Set(allCanchas.map(c => c.deporte))].sort();

    const matches = deportesUnicos.filter(dep => dep.toLowerCase().includes(query));

    if (matches.length === 0) return;

    matches.forEach(dep => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = dep;
      item.onclick = () => {
        inputDeporte.value = dep;
        filtroDeporteActual = dep;
        sugerenciasDeporte.style.display = 'none';
        filtrarEstablecimientos();
      };
      sugerenciasDeporte.appendChild(item);
    });

    sugerenciasDeporte.style.display = 'block';
  });

  // Cerrar sugerencias al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!inputBarrio.contains(e.target) && !sugerenciasBarrio.contains(e.target)) {
      sugerenciasBarrio.style.display = 'none';
    }
    if (!inputDeporte.contains(e.target) && !sugerenciasDeporte.contains(e.target)) {
      sugerenciasDeporte.style.display = 'none';
    }
  });
}

function filtrarEstablecimientos() {
  const barrio = document.getElementById('filtro-barrio').value.trim().toLowerCase();
  const deporte = document.getElementById('filtro-deporte').value.trim().toLowerCase();

  let filtered = allEstablecimientos;

  if (barrio) {
    filtered = filtered.filter(est => est.barrio.toLowerCase().includes(barrio));
  }

  if (deporte) {
    const canchasConDeporte = allCanchas
      .filter(c => c.deporte.toLowerCase() === deporte)
      .map(c => c.establecimiento_id);

    filtered = filtered.filter(est => canchasConDeporte.includes(est.id));
  }

  establecimientosFiltrados = filtered;
  currentPage = 1;
  renderizarPagina(1);
}

function renderizarPagina(page) {
  const grid = document.getElementById('establecimientos-grid');
  const paginacionContainer = document.getElementById('boton_paginacion');

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const itemsPagina = establecimientosFiltrados.slice(start, end);

  grid.innerHTML = '';
  paginacionContainer.innerHTML = '';

  if (itemsPagina.length === 0) {
    grid.innerHTML = '<div class="column is-full"><p class="subtitle has-text-centered has-text-grey">No se encontraron establecimientos con los filtros aplicados.</p></div>';
    return;
  }

  itemsPagina.forEach(est => {
    // Deportes únicos del establecimiento
    const deportesDelEst = [...new Set(
      allCanchas
        .filter(c => c.establecimiento_id === est.id)
        .map(c => c.deporte)
    )].join(', ') || 'No disponible';

    // Torneos
    const textoTorneos = est.torneo ? 'Sí' : 'No';

    // URL con parámetros
    let url = `crear_reservas.html?establecimiento=${est.id}`;
    if (filtroDeporteActual) {
      url += `&deporte=${encodeURIComponent(filtroDeporteActual)}`;
    }

    const cardHTML = `
    <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
        <div class="card has-background-image mx-4 my-4">
        <div class="card-background-container"></div>
        <div class="card-content-overlay has-text-centered">
            <div class="content has-text-white">
            <p class="title is-3 has-text-white mb-4">${est.nombre}</p>
            <p class="title is-5 has-text-white mb-5">${est.barrio}</p>
            <div class="mt-6">
                <p class="title is-5 has-text-white has-text-weight-bold">Se realizan torneos:</p>
                <p class="title is-4 has-text-white mb-4">${textoTorneos}</p>
                <p class="title is-5 has-text-white has-text-weight-bold">Deportes disponibles:</p>
                <p class="subtitle is-4 has-text-white-light">${deportesDelEst}</p>
            </div>
            </div>
            <footer class="card-footer-overlay">
            <a href="${url}" class="button is-primary is-large is-fullwidth has-text-weight-bold">
                Crear reservas
            </a>
            </footer>
        </div>
        </div>
    </div>
    `;
    grid.insertAdjacentHTML('beforeend', cardHTML);
  });

  crearPaginacion(page);
}

function crearPaginacion(page) {
  const totalPages = Math.ceil(establecimientosFiltrados.length / ITEMS_PER_PAGE);
  const paginacionContainer = document.getElementById('boton_paginacion');

  if (totalPages <= 1) return;

  const paginacionHTML = `
    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <button id="btn-anterior" class="button pagination-previous" ${page === 1 ? 'disabled' : ''}>
        Anterior
      </button>
      <button id="btn-siguiente" class="button pagination-next" ${page >= totalPages ? 'disabled' : ''}>
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

  document.getElementById('btn-anterior')?.addEventListener('click', () => {
    if (currentPage > 1) renderizarPagina(currentPage - 1);
  });

  document.getElementById('btn-siguiente')?.addEventListener('click', () => {
    if (currentPage < totalPages) renderizarPagina(currentPage + 1);
  });

  currentPage = page;
}