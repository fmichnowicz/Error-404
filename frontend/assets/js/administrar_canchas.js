// frontend/assets/js/administrar_canchas.js

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let allCanchas = [];
let canchasFiltradas = [];

let filtroEstablecimiento = '';
let filtroDeporte = '';

// Variables para el modal de eliminación
let idCanchaAEliminar = null;

// =============================================
//           MODAL AGREGAR CANCHA
// =============================================

const deportesPermitidos = [
  'Básquet 3v3', 'Básquet 5v5', 'Fútbol 4', 'Fútbol 5', 'Fútbol 6',
  'Fútbol 7', 'Fútbol 8', 'Fútbol 9', 'Fútbol 10', 'Fútbol 11',
  'Handball', 'Pádel', 'Tenis', 'Vóley'
];

let establecimientos = []; // Para el autocomplete del modal

document.addEventListener('DOMContentLoaded', async () => {
  cargarCanchas();
  inicializarFiltros();
  inicializarModalesEliminar();

  // Cargar lista de establecimientos al iniciar
  await cargarEstablecimientos();

  // Botón para abrir modal de agregar
  document.getElementById('btn-agregar-establecimiento').addEventListener('click', abrirModalAgregarCancha);

  inicializarModalAgregarCancha();
});

async function cargarEstablecimientos() {
  try {
    const res = await fetch('http://localhost:3000/establecimientos');
    if (!res.ok) throw new Error('Error al cargar establecimientos');
    establecimientos = await res.json();
  } catch (err) {
    console.error('Error cargando establecimientos:', err);
  }
}

function abrirModalAgregarCancha() {
  const modal = document.getElementById('modal-agregar-cancha');
  if (!modal) return;

  // Limpiar formulario
  document.getElementById('form-agregar-cancha').reset();
  document.getElementById('input-nombre').value = '';
  document.getElementById('establecimiento_id').value = '';
  document.getElementById('btn-confirmar-agregar').disabled = true;

  modal.classList.add('is-active');
}

function inicializarModalAgregarCancha() {
  const modal = document.getElementById('modal-agregar-cancha');
  if (!modal) return;

  // No permitir cerrar con background ni ESC
  modal.querySelector('.modal-background').style.pointerEvents = 'none';
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') e.preventDefault();
  });

  // Botón Cancelar
  document.getElementById('btn-cancelar-agregar').addEventListener('click', () => {
    modal.classList.remove('is-active');
  });

  // Autocomplete Establecimiento
  const inputEst = document.getElementById('input-establecimiento');
  const sugEst = document.getElementById('sugerencias-establecimiento-modal');
  const hiddenId = document.getElementById('establecimiento_id');

  inputEst.addEventListener('input', () => {
    const query = inputEst.value.trim();
    sugEst.innerHTML = '';
    sugEst.style.display = 'none';

    if (query.length < 2) {
      hiddenId.value = '';
      validarFormulario();
      return;
    }

    const normalized = normalizeString(query);
    const matches = establecimientos.filter(e => normalizeString(e.nombre).includes(normalized));

    if (matches.length === 0) return;

    matches.forEach(est => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = est.nombre;
      item.onclick = () => {
        inputEst.value = est.nombre;
        hiddenId.value = est.id;
        sugEst.style.display = 'none';
        calcularNombreCancha(); // Actualizar nombre cuando se selecciona establecimiento
        validarFormulario();
      };
      sugEst.appendChild(item);
    });

    sugEst.style.display = 'block';
  });

  // Autocomplete Deporte
  const inputDep = document.getElementById('input-deporte');
  const sugDep = document.getElementById('sugerencias-deporte-modal');

  inputDep.addEventListener('input', () => {
    const query = inputDep.value.trim();
    sugDep.innerHTML = '';
    sugDep.style.display = 'none';

    if (query.length < 1) {
      validarFormulario();
      return;
    }

    const normalized = normalizeString(query);
    const matches = deportesPermitidos.filter(d => normalizeString(d).includes(normalized));

    if (matches.length === 0) return;

    matches.forEach(dep => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = dep;
      item.onclick = () => {
        inputDep.value = dep;
        sugDep.style.display = 'none';
        calcularNombreCancha(); // Actualizar nombre cuando se selecciona deporte
        validarFormulario();
      };
      sugDep.appendChild(item);
    });

    sugDep.style.display = 'block';
  });

  // Contadores de caracteres
  const desc = document.getElementById('input-descripcion');
  const sup = document.getElementById('input-superficie');

  desc.addEventListener('input', () => {
    document.getElementById('contador-descripcion').textContent = desc.value.length;
    validarFormulario();
  });

  sup.addEventListener('input', () => {
    document.getElementById('contador-superficie').textContent = sup.value.length;
    validarFormulario();
  });

  // Validar en tiempo real
  ['input-establecimiento', 'input-deporte', 'input-precio', 'input-superficie'].forEach(id => {
    document.getElementById(id).addEventListener('input', validarFormulario);
  });

  // Confirmar
  document.getElementById('btn-confirmar-agregar').addEventListener('click', guardarNuevaCancha);

  // Cerrar sugerencias al hacer click fuera
  document.addEventListener('click', e => {
    if (!inputEst.contains(e.target) && !sugEst.contains(e.target)) sugEst.style.display = 'none';
    if (!inputDep.contains(e.target) && !sugDep.contains(e.target)) sugDep.style.display = 'none';
  });
}

async function calcularNombreCancha() {
  const estId = document.getElementById('establecimiento_id').value;
  const deporte = document.getElementById('input-deporte').value.trim();

  if (!estId || !deporte) {
    document.getElementById('input-nombre').value = '';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/canchas/next-number?establecimiento_id=${estId}&deporte=${encodeURIComponent(deporte)}`);
    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      return;
    }
    const { nombreSugerido } = await res.json();
    document.getElementById('input-nombre').value = nombreSugerido;
    validarFormulario();
  } catch (err) {
    console.error('Error al calcular nombre:', err);
  }
}

function validarFormulario() {
  const estId = document.getElementById('establecimiento_id').value;
  const deporte = document.getElementById('input-deporte').value.trim();
  const precio = document.getElementById('input-precio').value;
  const superficie = document.getElementById('input-superficie').value.trim();

  const btn = document.getElementById('btn-confirmar-agregar');
  btn.disabled = !(
    estId &&
    deporte &&
    precio && parseInt(precio) > 0 &&
    superficie
  );
}

async function guardarNuevaCancha() {
  const btn = document.getElementById('btn-confirmar-agregar');
  btn.disabled = true;

  const data = {
    establecimiento_id: document.getElementById('establecimiento_id').value,
    deporte: document.getElementById('input-deporte').value.trim(),
    nombre: document.getElementById('input-nombre').value.trim(),
    precio_hora: parseInt(document.getElementById('input-precio').value),
    descripcion: document.getElementById('input-descripcion').value.trim() || null,
    superficie: document.getElementById('input-superficie').value.trim(),
    iluminacion: document.getElementById('select-iluminacion').value === 'true',
    cubierta: document.getElementById('select-cubierta').value === 'true'
  };

  try {
    const res = await fetch('http://localhost:3000/canchas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Error al crear la cancha');
      console.error(err);
      btn.disabled = false;
      return;
    }

    // Éxito
    const modal = document.getElementById('modal-agregar-cancha');
    modal.classList.remove('is-active');

    alert('¡Cancha creada exitosamente!');
    
    // Recargar la lista
    location.reload();

  } catch (err) {
    console.error('Error al guardar cancha:', err);
    alert('Error de conexión');
    btn.disabled = false;
  }
}

// =============================================
//           CÓDIGO ANTERIOR (SIN CAMBIOS)
// =============================================

async function cargarCanchas() {
  const loading = document.getElementById('loading-message');
  const noCanchas = document.getElementById('no-canchas-message');

  try {
    const response = await fetch('http://localhost:3000/canchas');
    if (!response.ok) throw new Error('Error al cargar canchas');

    allCanchas = await response.json();

    // Ordenar las canchas UNA SOLA VEZ al cargar
    allCanchas = ordenarCanchas(allCanchas);

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

// Función para ordenar: establecimiento → deporte → nombre_cancha
function ordenarCanchas(canchas) {
  return canchas.sort((a, b) => {
    // 1. Nombre establecimiento (insensible a acentos/mayúsculas)
    const estA = normalizeString(a.nombre_establecimiento);
    const estB = normalizeString(b.nombre_establecimiento);
    if (estA !== estB) return estA.localeCompare(estB);

    // 2. Deporte
    const depA = normalizeString(a.deporte);
    const depB = normalizeString(b.deporte);
    if (depA !== depB) return depA.localeCompare(depB);

    // 3. Nombre cancha (orden numérico: Cancha 1 < Cancha 10 < Cancha 2)
    const nomA = normalizeString(a.nombre_cancha);
    const nomB = normalizeString(b.nombre_cancha);
    return nomA.localeCompare(nomB, undefined, { numeric: true });
  });
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

  // Permitir filtrar con Enter
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

  // Mantener el orden después de filtrar
  canchasFiltradas = ordenarCanchas(filtered);

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
                has-text-centered rounded-left">
                <h3 class="title is-3 has-text-white mb-4" style="width: 100%;">${cancha.nombre_establecimiento}</h3>
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

// Inicializar modales de eliminación
function inicializarModalesEliminar() {
  const modalEliminar = document.getElementById('modal-eliminar-cancha');
  if (!modalEliminar) {
    console.error('Modal de eliminación de cancha no encontrado');
    return;
  }

  const btnCancelar = document.getElementById('btn-cancelar-eliminar-cancha');
  const btnEliminarDef = document.getElementById('btn-eliminar-cancha-definitivo');

  btnCancelar.addEventListener('click', () => {
    modalEliminar.classList.remove('is-active');
    idCanchaAEliminar = null;
    document.getElementById('modal-nombre-cancha').textContent = '';
    document.getElementById('reservas-activas-cancha').textContent = '0';
    document.getElementById('usuarios-impactados-cancha').textContent = '0';
  });

  btnEliminarDef.addEventListener('click', async () => {
    if (!idCanchaAEliminar) return;

    try {
      const response = await fetch(`http://localhost:3000/canchas/${idCanchaAEliminar}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar la cancha');
        return;
      }

      mostrarModalExitoEliminar();
      modalEliminar.classList.remove('is-active');
      idCanchaAEliminar = null;

      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar cancha:', error);
      alert('Error de conexión');
    }
  });

  modalEliminar.querySelector('.modal-background').style.pointerEvents = 'none';
  modalEliminar.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') e.preventDefault();
  });

  const modalExito = document.getElementById('modal-exito-eliminar-cancha');
  if (modalExito) {
    modalExito.querySelector('.modal-background').style.pointerEvents = 'none';
    modalExito.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') e.preventDefault();
    });
  }
}

function mostrarModalExitoEliminar() {
  const modal = document.getElementById('modal-exito-eliminar-cancha');
  if (modal) {
    modal.classList.add('is-active');
  }
}

async function eliminarCancha(id) {
  idCanchaAEliminar = id;

  const cancha = allCanchas.find(c => c.id === id);
  if (!cancha) {
    alert('Cancha no encontrada');
    return;
  }

  let numReservas = 0;
  let numUsuarios = 0;

  try {
    const res = await fetch(`http://localhost:3000/reservas/by-cancha?cancha=${id}`);
    if (res.ok) {
      const reservas = await res.json();
      numReservas = reservas.length;
      const usuariosUnicos = new Set(reservas.map(r => r.usuario_id));
      numUsuarios = usuariosUnicos.size;
    }
  } catch (error) {
    console.error('Error al obtener reservas:', error);
  }

  const modal = document.getElementById('modal-eliminar-cancha');
  if (modal) {
    document.getElementById('modal-nombre-cancha').textContent = cancha.nombre_cancha;
    document.getElementById('reservas-activas-cancha').textContent = numReservas;
    document.getElementById('usuarios-impactados-cancha').textContent = numUsuarios;
    modal.classList.add('is-active');
  }
}



// Placeholder para modificar (puedes implementar después)
function modificarCancha(id) {
  console.log(`Modificar cancha ID: ${id}`);
}