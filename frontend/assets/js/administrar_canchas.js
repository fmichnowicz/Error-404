// frontend/assets/js/administrar_canchas.js

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allCanchas = [];
let canchasFiltradas = [];

let filtroEstablecimiento = '';
let filtroDeporte = '';

document.addEventListener('DOMContentLoaded', () => {
  cargarCanchas();
  inicializarFiltros();
});

async function cargarCanchas() {
  const loading = document.getElementById('loading-message');
  const noCanchas = document.getElementById('no-canchas-message');

  try {
    const response = await fetch('http://localhost:3000/canchas');
    if (!response.ok) throw new Error('Error al cargar canchas');

    allCanchas = await response.json();
    canchasFiltradas = [...allCanchas];

    loading.style.display = 'none';

    if (allCanchas.length === 0) {
      noCanchas.style.display = 'block';
      return;
    }

    renderizarPagina(1);
  } catch (error) {
    console.error('Error:', error);
    loading.innerHTML = '<p class="subtitle has-text-danger">Error al cargar las canchas</p>';
  }
}

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inicializarFiltros() {
  const inputEst = document.getElementById('filtro-establecimiento');
  const inputDep = document.getElementById('filtro-deporte');

  const sugEst = document.getElementById('sugerencias-establecimiento');
  const sugDep = document.getElementById('sugerencias-deporte');

  // Filtro Establecimiento
  inputEst.addEventListener('input', () => {
    const query = inputEst.value.trim();
    sugEst.innerHTML = '';
    sugEst.style.display = 'none';

    if (query.length < 2) {
      filtroEstablecimiento = '';
      filtrarCanchas();
      return;
    }

    const normalizedQuery = normalizeString(query);

    // Filtrar establecimientos según el deporte seleccionado (si hay)
    let establecimientosDisponibles = [...new Set(allCanchas.map(c => c.nombre_establecimiento))];

    if (filtroDeporte) {
      establecimientosDisponibles = [...new Set(
        allCanchas
          .filter(c => normalizeString(c.deporte) === filtroDeporte)
          .map(c => c.nombre_establecimiento)
      )];
    }

    const matches = establecimientosDisponibles.filter(est => 
      normalizeString(est).includes(normalizedQuery)
    );

    if (matches.length === 0) return;

    matches.forEach(est => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = est;
      item.onclick = () => {
        inputEst.value = est;
        sugEst.style.display = 'none';
        filtroEstablecimiento = normalizeString(est);
        filtrarCanchas();
      };
      sugEst.appendChild(item);
    });

    sugEst.style.display = 'block';
  });

  // Filtro Deporte
  inputDep.addEventListener('input', () => {
    const query = inputDep.value.trim();
    sugDep.innerHTML = '';
    sugDep.style.display = 'none';

    if (query.length < 2) {
      filtroDeporte = '';
      filtrarCanchas();
      return;
    }

    const normalizedQuery = normalizeString(query);

    // Filtrar deportes según el establecimiento seleccionado (si hay)
    let deportesDisponibles = [...new Set(allCanchas.map(c => c.deporte))];

    if (filtroEstablecimiento) {
      deportesDisponibles = [...new Set(
        allCanchas
          .filter(c => normalizeString(c.nombre_establecimiento) === filtroEstablecimiento)
          .map(c => c.deporte)
      )];
    }

    const matches = deportesDisponibles.filter(dep => 
      normalizeString(dep).includes(normalizedQuery)
    );

    if (matches.length === 0) return;

    matches.forEach(dep => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = dep;
      item.onclick = () => {
        inputDep.value = dep;
        sugDep.style.display = 'none';
        filtroDeporte = normalizeString(dep);
        filtrarCanchas();
      };
      sugDep.appendChild(item);
    });

    sugDep.style.display = 'block';
  });

  // Cerrar sugerencias al clic fuera
  document.addEventListener('click', (e) => {
    if (!inputEst.contains(e.target) && !sugEst.contains(e.target)) {
      sugEst.style.display = 'none';
    }
    if (!inputDep.contains(e.target) && !sugDep.contains(e.target)) {
      sugDep.style.display = 'none';
    }
  });

  // Permitir filtrar también escribiendo y presionando Enter (opcional pero útil)
  inputEst.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = inputEst.value.trim();
      if (query.length >= 2) {
        filtroEstablecimiento = normalizeString(query);
        filtrarCanchas();
        sugEst.style.display = 'none';
      }
    }
  });

  inputDep.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = inputDep.value.trim();
      if (query.length >= 2) {
        filtroDeporte = normalizeString(query);
        filtrarCanchas();
        sugDep.style.display = 'none';
      }
    }
  });
}

function filtrarCanchas() {
  let filtered = allCanchas;

  if (filtroEstablecimiento) {
    filtered = filtered.filter(c => 
      normalizeString(c.nombre_establecimiento) === filtroEstablecimiento
    );
  }

  if (filtroDeporte) {
    filtered = filtered.filter(c => 
      normalizeString(c.deporte) === filtroDeporte
    );
  }

  canchasFiltradas = filtered;
  currentPage = 1;
  renderizarPagina(1);
}

function renderizarPagina(page) {
  const grid = document.getElementById('canchas-grid');
  const paginacion = document.getElementById('paginacion');

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const itemsPagina = canchasFiltradas.slice(start, end);

  grid.innerHTML = '';
  paginacion.innerHTML = '';

  itemsPagina.forEach(cancha => {
    const iluminacion = cancha.iluminacion ? 'Sí' : 'No';
    const cubierta = cancha.cubierta ? 'Sí' : 'No';
    const descripcion = cancha.descripcion || 'No especificada';

    const cardHTML = `
      <div class="column is-full">
        <div class="card mb-5 shadow">
          <div class="card-content p-0">
            <div class="columns is-gapless">
              <div class="column is-one-third has-background-primary has-text-white p-5 
                          is-flex is-flex-direction-column is-justify-content-center is-align-items-center 
                          rounded-left">
                <h3 class="title is-3 has-text-white mb-4">${cancha.nombre_establecimiento}</h3>
                <p class="subtitle is-4 has-text-white mb-3"><strong>Cancha:</strong> ${cancha.nombre_cancha}</p>
                <p class="subtitle is-4 has-text-white"><strong>Deporte:</strong> ${cancha.deporte}</p>
              </div>

              <div class="column p-6 mx-3 pb-7">
                <div class="content">
                  <p><strong>Precio por hora:</strong> $${cancha.precio_hora}</p>
                  <p><strong>Descripción:</strong> ${descripcion}</p>
                  <p><strong>Superficie:</strong> ${cancha.superficie}</p>
                  <p><strong>Iluminación:</strong> ${iluminacion}</p>
                  <p><strong>Cubierta:</strong> ${cubierta}</p>
                </div>

                <div class="buttons mt-5 mb-5 is-centered">
                  <button class="button is-info" onclick="modificarCancha(${cancha.id})">
                    <span class="icon"><i class="fas fa-edit"></i></span>
                    <span>Modificar</span>
                  </button>
                  <button class="button is-danger ml-3" onclick="eliminarCancha(${cancha.id})">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('beforeend', cardHTML);
  });

  crearPaginacion(page);
}

function crearPaginacion(page) {
  const totalPages = Math.ceil(canchasFiltradas.length / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  const paginacion = document.getElementById('paginacion');

  let paginasHTML = '<nav class="pagination is-centered" role="navigation" aria-label="pagination">';

  paginasHTML += `
    <a class="pagination-previous ${page === 1 ? 'is-disabled' : ''}" 
       onclick="${page > 1 ? 'renderizarPagina(' + (page - 1) + ')' : ''}">
      Anterior
    </a>
  `;

  paginasHTML += `
    <a class="pagination-next ${page === totalPages ? 'is-disabled' : ''}" 
       onclick="${page < totalPages ? 'renderizarPagina(' + (page + 1) + ')' : ''}">
      Siguiente
    </a>
  `;

  paginasHTML += '<ul class="pagination-list">';
  for (let i = 1; i <= totalPages; i++) {
    paginasHTML += `
      <li>
        <a class="pagination-link ${i === page ? 'is-current' : ''}" 
           onclick="renderizarPagina(${i})">${i}</a>
      </li>
    `;
  }
  paginasHTML += '</ul></nav>';

  paginacion.innerHTML = paginasHTML;
}

// Funciones placeholder
function modificarCancha(id) {
  console.log(`Modificar cancha ID: ${id}`);
}

function eliminarCancha(id) {
  console.log(`Eliminar cancha ID: ${id}`);
}