// frontend/assets/js/establecimientos.js

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
    inicializarModalExito(); // Nuevo: inicializar modal de éxito
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
        console.error('Error al cargar datos:', error);
        loadingMessage.innerHTML = '<p class="subtitle has-text-danger has-text-centered">Error al cargar los establecimientos</p>';
    }
}

function inicializarModalEliminar() {
    const modal = document.getElementById('modal-eliminar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnCerrar = document.getElementById('cerrar-modal');
    const btnEliminarDef = document.getElementById('btn-eliminar-definitivo');

    if (!modal) {
        console.error('Modal no encontrado en el DOM');
        return;
    }

    const cerrarModal = () => {
        modal.classList.remove('is-active');
        idEstablecimientoAEliminar = null;

        // Limpieza segura
        const nombreEl = document.getElementById('modal-nombre');
        if (nombreEl) nombreEl.textContent = '';

        const canchasEl = document.getElementById('modal-canchas');
        if (canchasEl) canchasEl.textContent = '0';

        const reservasEl = document.getElementById('modal-reservas');
        if (reservasEl) reservasEl.textContent = '0';

        const usuariosEl = document.getElementById('modal-usuarios');
        if (usuariosEl) usuariosEl.textContent = '0';

        const textoEl = document.getElementById('modal-texto');
        if (textoEl) textoEl.innerHTML = '';

        // console.log('Modal cerrado y estado limpiado');
    };

    btnCancelar.addEventListener('click', cerrarModal);
    btnCerrar.addEventListener('click', cerrarModal);

    btnEliminarDef.addEventListener('click', async () => {
        if (!idEstablecimientoAEliminar) {
            console.warn('No hay ID para eliminar');
            return;
        }

        // console.log('Eliminando establecimiento ID:', idEstablecimientoAEliminar);
        try {
            const response = await fetch(`http://localhost:3000/establecimientos/${idEstablecimientoAEliminar}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Mostrar modal de éxito
                mostrarModalExito();
                cerrarModal();
                // Refrescar después de 2 segundos
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                alert('Error al eliminar el establecimiento');
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error de conexión');
        }
    });
}

// Nuevo: Inicializar y manejar modal de éxito
function inicializarModalExito() {
    const modalExito = document.getElementById('modal-exito');
    if (!modalExito) return;

    const cerrarModalExito = () => {
        modalExito.classList.remove('is-active');
    };

    document.getElementById('cerrar-modal-exito')?.addEventListener('click', cerrarModalExito);
}

function mostrarModalExito() {
    const modalExito = document.getElementById('modal-exito');
    if (modalExito) {
        modalExito.classList.add('is-active');
    }
}

async function mostrarModalEliminar(id) {
    // console.log('Intentando abrir modal para ID:', id);
    idEstablecimientoAEliminar = id;

    const est = allEstablecimientos.find(e => e.id === id);
    if (!est) {
        console.error('Establecimiento no encontrado con ID:', id);
        alert('No se encontró el establecimiento');
        return;
    }

    // Conteos
    const canchas = allCanchas.filter(c => c.establecimiento_id === id);
    const numCanchas = canchas.length;

    let reservas = [];
    let numReservas = 0;
    let numUsuarios = 0;

    try {
        // console.log('Fetch reservas para establecimiento:', id);
        const res = await fetch(`http://localhost:3000/reservas/by-establecimiento?establecimiento=${id}`);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error en fetch reservas:', res.status, errorText);
            throw new Error(`Error ${res.status}: ${errorText}`);
        }

        reservas = await res.json();
        numReservas = reservas.length;

        const usuariosUnicos = new Set(reservas.map(res => res.usuario_id));
        numUsuarios = usuariosUnicos.size;

        // console.log(`Reservas obtenidas: ${numReservas}, Usuarios únicos: ${numUsuarios}`);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        numReservas = 0;
        numUsuarios = 0;
    }

    // Abrir el modal primero
    const modal = document.getElementById('modal-eliminar');
    if (modal) {
        modal.classList.add('is-active');
        // console.log('Modal abierto');
    } else {
        console.error('Modal no encontrado');
        return;
    }

    // Esperar a que Bulma clone y renderice el modal visible
    setTimeout(() => {
        // Buscar el span EN EL MODAL ABIERTO (el clon de Bulma)
        const visibleReservasSpan = document.querySelector('.modal.is-active #modal-reservas');
        const visibleUsuariosSpan = document.querySelector('.modal.is-active #modal-usuarios');
        const visibleCanchasSpan = document.querySelector('.modal.is-active #modal-canchas');

        if (visibleReservasSpan) {
            visibleReservasSpan.textContent = numReservas;
            // console.log('Actualización en modal visible (clonado):', numReservas);
        } else {
            console.warn('No se encontró #modal-reservas en el modal abierto');
        }

        if (visibleUsuariosSpan) visibleUsuariosSpan.textContent = numUsuarios;
        if (visibleCanchasSpan) visibleCanchasSpan.textContent = numCanchas;

        // Forzar reflow
        modal.offsetHeight;
    }, 300);
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

        const textoTorneos = est.torneo ? 'Sí' : 'No';

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
                                <p class="title is-4 has-text-white mb-4">${textoTorneos}</p>
                                <p class="title is-5 has-text-white has-text-weight-bold">Deportes disponibles:</p>
                                <p class="subtitle is-4 has-text-white-light">${deportesDelEst}</p>
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
    window.location.href = `editar_establecimiento.html?id=${id}`;
}

function eliminarEstablecimiento(id) {
    // console.log('Click en Eliminar para ID:', id);
    mostrarModalEliminar(id);
}

function normalizeString(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}