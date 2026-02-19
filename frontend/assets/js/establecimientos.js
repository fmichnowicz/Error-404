// frontend/assets/js/establecimientos.js
import { API_URL } from "./shared.js";

const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let allEstablecimientos = [];
let allCanchas = [];
let establecimientosFiltrados = [];

let filtroDeporteActual = '';
let idEstablecimientoAEliminar = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  inicializarFiltros();
  inicializarModalEliminar();
  inicializarModalExito();
  inicializarModalExitoEditar();
  inicializarModalEditar();
  inicializarModalAgregar();

  // Evento del botón Agregar establecimiento
  document.getElementById('btn-agregar-establecimiento')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-agregar-establecimiento');
    if (modal) {
      modal.classList.add('is-active');
      // Inicializar contadores en 0 y deshabilitar botón
      document.getElementById('contador-nombre-establecimientos').textContent = '0';
      document.getElementById('contador-barrio').textContent = '0';
      document.getElementById('contador-torneo').textContent = '0';
      document.getElementById('btn-crear-establecimiento').disabled = true;
    }
  });
});

async function cargarDatos() {
  const loadingMessage = document.getElementById('loading-message');

  try {
    const [establecimientosRes, canchasRes] = await Promise.all([
      fetch(`${API_URL}/establecimientos`).then(r => r.json()),
      fetch(`${API_URL}/canchas`).then(r => r.json())
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
    console.error('Error al cargar datos:', error);
    loadingMessage.innerHTML = '<p class="subtitle has-text-danger has-text-centered">Error al cargar los establecimientos</p>';
  }
}

// Variables globales para referencias del modal
let modalEliminarRefs = {
    modal: null,
    nombre: null,
    canchas: null,
    reservas: null,
    usuarios: null,
    texto: null
};

function inicializarModalEliminar() {
    modalEliminarRefs.modal = document.getElementById('modal-eliminar');
    if (!modalEliminarRefs.modal) {
        console.error('Modal de eliminación no encontrado');
        return;
    }

    modalEliminarRefs.nombre = document.getElementById('modal-nombre');
    modalEliminarRefs.canchas = document.getElementById('modal-canchas');
    modalEliminarRefs.reservas = document.getElementById('reservas-activas');
    modalEliminarRefs.usuarios = document.getElementById('modal-usuarios-impactados');
    modalEliminarRefs.texto = document.getElementById('modal-texto');

    const btnCancelar = document.getElementById('btn-cancelar');
    const btnEliminarDef = document.getElementById('btn-eliminar-definitivo');

    const cerrarModal = () => {
        modalEliminarRefs.modal.classList.remove('is-active');
        idEstablecimientoAEliminar = null;

        // Limpiamos siempre con las referencias seguras
        if (modalEliminarRefs.nombre) modalEliminarRefs.nombre.textContent = '';
        if (modalEliminarRefs.canchas) modalEliminarRefs.canchas.textContent = '0';
        if (modalEliminarRefs.reservas) modalEliminarRefs.reservas.textContent = '0';
        if (modalEliminarRefs.usuarios) modalEliminarRefs.usuarios.textContent = '0';
        if (modalEliminarRefs.texto) modalEliminarRefs.texto.innerHTML = '¿Estás seguro de eliminar el establecimiento?';
    };

    btnCancelar.addEventListener('click', cerrarModal);

    // Cerrar también con click en fondo
    modalEliminarRefs.modal.querySelector('.modal-background').addEventListener('click', cerrarModal);

    btnEliminarDef.addEventListener('click', async () => {
        if (!idEstablecimientoAEliminar) return;

        try {
            const response = await fetch(`${API_URL}/establecimientos/${idEstablecimientoAEliminar}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                mostrarModalExito();
                cerrarModal();
                setTimeout(() => location.reload(), 2000);
            } else {
                alert('Error al eliminar el establecimiento');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error de conexión');
        }
    });
}

function inicializarModalExito() {
  const modalExito = document.getElementById('modal-exito');
  if (!modalExito) return;

  modalExito.querySelector('.modal-background').style.pointerEvents = 'none';
}

function mostrarModalExito() {
  const modalExito = document.getElementById('modal-exito');
  if (modalExito) {
    modalExito.classList.add('is-active');
    setTimeout(() => {
      modalExito.classList.remove('is-active');
    }, 2000);
  }
}

function inicializarModalExitoEditar() {
  const modal = document.getElementById('modal-exito-editar');
  if (!modal) return;

  modal.querySelector('.modal-background').style.pointerEvents = 'none';
}

function mostrarModalExitoEditar() {
  const modal = document.getElementById('modal-exito-editar');
  if (modal) {
    modal.classList.add('is-active');
    setTimeout(() => {
      modal.classList.remove('is-active');
      location.reload();
    }, 2000);
  }
}

async function mostrarModalEliminar(id) {
    idEstablecimientoAEliminar = id;

    const est = allEstablecimientos.find(e => e.id === id);
    if (!est) {
        alert('No se encontró el establecimiento');
        return;
    }

    const canchas = allCanchas.filter(c => c.establecimiento_id === id);
    const numCanchas = canchas.length;

    let numReservas = 0;
    let numUsuarios = 0;

    try {
        const res = await fetch(`${API_URL}/reservas/by-establecimiento?establecimiento=${id}`);
        if (res.ok) {
            const reservas = await res.json();
            numReservas = reservas.length;
            const usuariosUnicos = new Set(reservas.map(r => r.usuario_id));
            numUsuarios = usuariosUnicos.size;
        }
    } catch (error) {
        console.error('Error al obtener reservas:', error);
    }

    // Usamos las referencias guardadas
    if (modalEliminarRefs.modal) {
        modalEliminarRefs.modal.classList.add('is-active');
    }

    if (modalEliminarRefs.nombre) {
        modalEliminarRefs.nombre.textContent = est.nombre;
    }

    if (modalEliminarRefs.canchas) {
        modalEliminarRefs.canchas.textContent = numCanchas;
    }

    if (modalEliminarRefs.reservas) {
        modalEliminarRefs.reservas.textContent = numReservas;
    }

    if (modalEliminarRefs.usuarios) {
        modalEliminarRefs.usuarios.textContent = numUsuarios;
    }

    if (modalEliminarRefs.texto) {
        modalEliminarRefs.texto.innerHTML = `¿Estás seguro de eliminar el establecimiento <strong>${est.nombre}</strong>?`;
    }
}

function inicializarModalEditar() {
  const modal = document.getElementById('modal-editar');
  if (!modal) return;

  const btnCancelar = document.getElementById('btn-cancelar-edit');
  const btnGuardar = document.getElementById('btn-guardar-edit');

  const inputNombre = document.getElementById('edit-nombre');
  const inputBarrio = document.getElementById('edit-barrio');
  const inputTorneo = document.getElementById('edit-torneo');

  const contadorNombre = document.getElementById('contador-edit-nombre');
  const contadorBarrio = document.getElementById('contador-edit-barrio');
  const contadorTorneo = document.getElementById('contador-edit-torneo');

  // Contadores en tiempo real + validación
  inputNombre.addEventListener('input', () => {
    contadorNombre.textContent = inputNombre.value.length;
    validarFormularioEditar();
  });
  inputBarrio.addEventListener('input', () => {
    contadorBarrio.textContent = inputBarrio.value.length;
    validarFormularioEditar();
  });
  inputTorneo.addEventListener('input', () => {
    contadorTorneo.textContent = inputTorneo.value.length;
  });

  btnCancelar.addEventListener('click', () => {
    modal.classList.remove('is-active');
    inputNombre.value = '';
    inputBarrio.value = '';
    inputTorneo.value = '';
    contadorNombre.textContent = '0';
    contadorBarrio.textContent = '0';
    contadorTorneo.textContent = '0';
    btnGuardar.disabled = true;
  });

  btnGuardar.addEventListener('click', async () => {
    const id = modal.dataset.id;
    if (!id) return;

    const nombre = inputNombre.value.trim();
    const barrio = inputBarrio.value.trim();
    const torneo = inputTorneo.value.trim() || null;

    try {
      const response = await fetch(`${API_URL}/establecimientos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, barrio, torneo })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al actualizar el establecimiento');
        return;
      }

      mostrarModalExitoEditar();
      modal.classList.remove('is-active');
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error de conexión');
    }
  });

  modal.querySelector('.modal-background').style.pointerEvents = 'none';
}

// Validación para habilitar/deshabilitar botón en modal editar
function validarFormularioEditar() {
  const nombre = document.getElementById('edit-nombre').value.trim();
  const barrio = document.getElementById('edit-barrio').value.trim();
  const btn = document.getElementById('btn-guardar-edit');

  btn.disabled = !(nombre && barrio);
}

async function mostrarModalEditar(id) {
  const est = allEstablecimientos.find(e => e.id === id);
  if (!est) {
    alert('No se encontró el establecimiento');
    return;
  }

  const modal = document.getElementById('modal-editar');
  if (!modal) return;

  modal.classList.add('is-active');

  document.getElementById('edit-nombre').value = est.nombre || '';
  document.getElementById('edit-barrio').value = est.barrio || '';
  document.getElementById('edit-torneo').value = est.torneo || '';

  document.getElementById('contador-edit-nombre').textContent = est.nombre.length;
  document.getElementById('contador-edit-barrio').textContent = est.barrio.length;
  document.getElementById('contador-edit-torneo').textContent = (est.torneo || '').length;

  // Validar al cargar
  validarFormularioEditar();

  modal.dataset.id = id;
}

// -----------------------
// AGREGAR NUEVO ESTABLECIMIENTO
// -----------------------

function inicializarModalAgregar() {
  const modal = document.getElementById('modal-agregar-establecimiento');
  if (!modal) return;

  const btnCancelar = document.getElementById('btn-cancelar-agregar');
  const btnCrear = document.getElementById('btn-crear-establecimiento');

  const inputNombre = document.getElementById('agregar-nombre');
  const inputBarrio = document.getElementById('agregar-barrio');
  const inputTorneo = document.getElementById('agregar-torneo');

  const contadorNombre = document.getElementById('contador-nombre-establecimientos');
  const contadorBarrio = document.getElementById('contador-barrio');
  const contadorTorneo = document.getElementById('contador-torneo');

  // Contadores en tiempo real + validación
  inputNombre.addEventListener('input', () => {
    contadorNombre.textContent = inputNombre.value.length;
    validarFormularioAgregar();
  });
  inputBarrio.addEventListener('input', () => {
    contadorBarrio.textContent = inputBarrio.value.length;
    validarFormularioAgregar();
  });
  inputTorneo.addEventListener('input', () => {
    contadorTorneo.textContent = inputTorneo.value.length;
  });

  btnCancelar.addEventListener('click', () => {
    modal.classList.remove('is-active');
    inputNombre.value = '';
    inputBarrio.value = '';
    inputTorneo.value = '';
    contadorNombre.textContent = '0';
    contadorBarrio.textContent = '0';
    contadorTorneo.textContent = '0';
    btnCrear.disabled = true;
  });

  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  btnCrear.addEventListener('click', async () => {
    const nombre = inputNombre.value.trim();
    const barrio = inputBarrio.value.trim();
    const torneo = inputTorneo.value.trim() || null;

    if (!nombre || nombre.length > 50) {
      alert('El nombre es obligatorio y no debe superar 50 caracteres');
      return;
    }
    if (!barrio || barrio.length > 25) {
      alert('El barrio es obligatorio y no debe superar 25 caracteres');
      return;
    }
    if (torneo && torneo.length > 50) {
      alert('La descripción de torneos no debe superar 50 caracteres');
      return;
    }

    const existe = allEstablecimientos.some(est => normalizeString(est.nombre) === normalizeString(nombre));
    if (existe) {
      alert('Ya existe un establecimiento con ese nombre');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/establecimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, barrio, torneo })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al crear el establecimiento');
        return;
      }

      modal.classList.remove('is-active');
      mostrarModalAsignarCanchas();
    } catch (error) {
      console.error('Error al crear:', error);
      alert('Error de conexión');
    }
  });
}

// Validación para habilitar/deshabilitar botón en modal agregar
function validarFormularioAgregar() {
  const nombre = document.getElementById('agregar-nombre').value.trim();
  const barrio = document.getElementById('agregar-barrio').value.trim();
  const btn = document.getElementById('btn-crear-establecimiento');

  btn.disabled = !(nombre && barrio);
}

function mostrarModalAsignarCanchas() {
  const modal = document.getElementById('modal-asignar-canchas');
  if (!modal) return;

  modal.classList.add('is-active');

  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  document.getElementById('btn-si-asignar').onclick = () => {
    modal.classList.remove('is-active');
    mostrarModalExitoCrear(true); // true = redirigir a canchas
  };

  document.getElementById('btn-no-asignar').onclick = () => {
    modal.classList.remove('is-active');
    mostrarModalExitoCrear(false); // false = recargar página
  };
}

function mostrarModalExitoCrear(redirigirACanchas) {
  const modal = document.getElementById('modal-exito-crear');
  if (!modal) return;

  const mensaje = document.getElementById('mensaje-exito-crear');
  mensaje.textContent = redirigirACanchas
    ? 'Redirigiendo a administrar canchas...'
    : 'Refrescando la página...';

  modal.classList.add('is-active');

  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  setTimeout(() => {
    modal.classList.remove('is-active');
    if (redirigirACanchas) {
      window.location.href = 'administrar_canchas.html';
    } else {
      location.reload();
    }
  }, 2000);
}

function inicializarFiltros() {
  const inputBarrio = document.getElementById('filtro-barrio');
  const inputEstablecimiento = document.getElementById('filtro-establecimiento');
  const inputDeporte = document.getElementById('filtro-deporte');

  const sugerenciasBarrio = document.getElementById('sugerencias-barrio');
  const sugerenciasEstablecimiento = document.getElementById('sugerencias-establecimiento');
  const sugerenciasDeporte = document.getElementById('sugerencias-deporte');

  inputBarrio.addEventListener('input', () => {
    const query = inputBarrio.value.trim().toLowerCase();
    sugerenciasBarrio.innerHTML = '';
    sugerenciasBarrio.style.display = 'none';

    filtrarEstablecimientos();

    if (query.length < 2) return;

    const barriosUnicos = [...new Set(allEstablecimientos.map(est => est.barrio))];
    const matches = barriosUnicos.filter(barrio => normalizeString(barrio).includes(normalizeString(query)));

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

  inputEstablecimiento.addEventListener('input', () => {
    const query = inputEstablecimiento.value.trim().toLowerCase();
    sugerenciasEstablecimiento.innerHTML = '';
    sugerenciasEstablecimiento.style.display = 'none';

    filtrarEstablecimientos();

    if (query.length < 2) return;

    const matches = allEstablecimientos.filter(est => normalizeString(est.nombre).includes(normalizeString(query)));

    if (matches.length === 0) return;

    matches.forEach(est => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = est.nombre;
      item.onclick = () => {
        inputEstablecimiento.value = est.nombre;
        sugerenciasEstablecimiento.style.display = 'none';
        filtrarEstablecimientos();
      };
      sugerenciasEstablecimiento.appendChild(item);
    });

    sugerenciasEstablecimiento.style.display = 'block';
  });

  inputDeporte.addEventListener('input', () => {
    const query = inputDeporte.value.trim().toLowerCase();
    sugerenciasDeporte.innerHTML = '';
    sugerenciasDeporte.style.display = 'none';

    filtrarEstablecimientos();

    if (query.length < 2) {
      filtroDeporteActual = '';
      return;
    }

    const deportesUnicos = [...new Set(allCanchas.map(c => c.deporte))];
    const matches = deportesUnicos.filter(dep => normalizeString(dep).includes(normalizeString(query)));

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

  document.addEventListener('click', (e) => {
    if (!inputBarrio.contains(e.target) && !sugerenciasBarrio.contains(e.target)) {
      sugerenciasBarrio.style.display = 'none';
    }
    if (!inputEstablecimiento.contains(e.target) && !sugerenciasEstablecimiento.contains(e.target)) {
      sugerenciasEstablecimiento.style.display = 'none';
    }
    if (!inputDeporte.contains(e.target) && !sugerenciasDeporte.contains(e.target)) {
      sugerenciasDeporte.style.display = 'none';
    }
  });
}

function filtrarEstablecimientos() {
  const barrio = normalizeString(document.getElementById('filtro-barrio').value.trim());
  const establecimiento = normalizeString(document.getElementById('filtro-establecimiento').value.trim());
  const deporte = normalizeString(document.getElementById('filtro-deporte').value.trim());

  let filtered = allEstablecimientos;

  if (barrio) {
    filtered = filtered.filter(est => normalizeString(est.barrio).includes(barrio));
  }

  if (establecimiento) {
    filtered = filtered.filter(est => normalizeString(est.nombre).includes(establecimiento));
  }

  if (deporte) {
    const canchasConDeporte = allCanchas
      .filter(c => normalizeString(c.deporte).includes(deporte))
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
    const deportesDelEst = [...new Set(
      allCanchas
        .filter(c => c.establecimiento_id === est.id)
        .map(c => c.deporte)
    )].join(', ') || 'No disponible';

    const textoTorneos = est.torneo ? est.torneo : 'No';

    let url = `crear_reservas.html?establecimiento=${est.id}`;
    if (filtroDeporteActual) {
      url += `&deporte=${encodeURIComponent(filtroDeporteActual)}`;
    }

    const cardHTML = `
      <div class="column is-one-third-desktop is-half-tablet is-full-mobile">
        <div class="card has-background-image mx-4 my-4" style="display: flex; flex-direction: column; height: 100%; min-height: 520px;">
          <div class="card-background-container"></div>
          <div class="card-content-overlay has-text-centered" style="flex-grow: 1; display: flex; flex-direction: column;">
            <div class="content has-text-white flex-grow-1 p-5">
              <p class="title is-3 has-text-white mb-4">${est.nombre}</p>
              <p class="title is-5 has-text-white mb-5">${est.barrio}</p>
              <div class="mt-6">
                <p class="title is-5 has-text-white has-text-weight-bold">Se realizan torneos:</p>
                <p class="subtitle is-4 has-text-white-light m-2">${textoTorneos}</p>
                <p class="title is-5 has-text-white has-text-weight-bold">Deportes disponibles:</p>
                <p class="subtitle is-4 has-text-white-light m-2">${deportesDelEst}</p>
              </div>
            </div>
            <footer class="card-footer-overlay mt-auto p-4">
              <a href="${url}" class="button is-primary is-large is-fullwidth has-text-weight-bold mb-4">
                Crear reservas
              </a>
              <div class="columns is-mobile">
                <div class="column is-half">
                  <button class="button is-info is-medium is-fullwidth" onclick="actualizarEstablecimiento(${est.id})">
                    <span class="is-block">Actualizar</span>
                  </button>
                </div>
                <div class="column is-half">
                  <button class="button is-danger is-medium is-fullwidth" onclick="eliminarEstablecimiento(${est.id})">
                    Eliminar
                  </button>
                </div>
              </div>
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
          <span class="pagination-ellipsis">Página ${page} de ${totalPages}</span>
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

function actualizarEstablecimiento(id) {
  mostrarModalEditar(id);
}

function eliminarEstablecimiento(id) {
  mostrarModalEliminar(id);
}

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}