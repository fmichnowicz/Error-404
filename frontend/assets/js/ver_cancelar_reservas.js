// frontend/assets/js/ver_cancelar_reservas.js

let allReservas = [];
let allUsuarios = [];
let allEstablecimientos = [];
let allCanchas = [];

let filtroUsuarioId = null;
let filtroEstablecimientoId = null;
let filtroFecha = null;

let reservaACancelarId = null;

// === Funciones para guardar y cargar filtros en localStorage ===
function guardarFiltros() {
    const filtros = {
        usuarioId: filtroUsuarioId,
        establecimientoId: filtroEstablecimientoId,
        fecha: filtroFecha,
        textoUsuario: document.getElementById('busqueda-usuario-filtro').value,
        textoEstablecimiento: document.getElementById('busqueda-establecimiento-filtro').value,
        inputFecha: document.getElementById('filtro-fecha').value
    };
    localStorage.setItem('filtrosReservasAdmin', JSON.stringify(filtros));
    }

    function cargarFiltrosGuardados() {
    const guardado = localStorage.getItem('filtrosReservasAdmin');
    if (!guardado) return;

    const filtros = JSON.parse(guardado);

    // Restaurar valores en inputs
    document.getElementById('busqueda-usuario-filtro').value = filtros.textoUsuario || '';
    document.getElementById('busqueda-establecimiento-filtro').value = filtros.textoEstablecimiento || '';
    document.getElementById('filtro-fecha').value = filtros.inputFecha || '';

    // Restaurar variables de filtro
    filtroUsuarioId = filtros.usuarioId;
    filtroEstablecimientoId = filtros.establecimientoId;
    filtroFecha = filtros.fecha;

    // Mostrar/ocultar botón limpiar fecha
    const btnLimpiar = document.getElementById('limpiar-fecha');
    btnLimpiar.style.display = filtros.inputFecha ? 'block' : 'none';
    }

    document.addEventListener('DOMContentLoaded', () => {
    cargarDatosIniciales();
    inicializarFiltroFecha();

    // === Eventos del modal de cancelación ===
    const modal = document.getElementById('modal-cancelar');
    const btnConfirmar = document.getElementById('confirmar-cancelar');
    const btnCerrar = document.getElementById('cerrar-modal');
    const btnCerrarClose = document.getElementById('cerrar-modal-close');
    const background = modal.querySelector('.modal-background');

    const cerrarModal = () => {
        modal.classList.remove('is-active');
        reservaACancelarId = null;
    };

    btnCerrar.addEventListener('click', cerrarModal);
    btnCerrarClose.addEventListener('click', cerrarModal);
    background.addEventListener('click', cerrarModal);

    btnConfirmar.addEventListener('click', () => {
        if (!reservaACancelarId) return;

        fetch(`http://localhost:3000/reservas/${reservaACancelarId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Error al cancelar');
            return response.json();
        })
        .then(() => {
            mostrarMensaje('Reserva cancelada exitosamente');
            // Actualizamos datos y mantenemos filtros
            recargarReservasYMantenerFiltros();
            cerrarModal();
        })
        .catch(err => {
            console.error(err);
            mostrarMensaje('Error al cancelar la reserva');
            cerrarModal();
        });
    });
    });

    async function cargarDatosIniciales() {
    const loading = document.getElementById('loading');

    try {
        const [reservasRes, usuariosRes, establecimientosRes, canchasRes] = await Promise.all([
        fetch('http://localhost:3000/reservas').then(r => r.json()),
        fetch('http://localhost:3000/usuarios').then(r => r.json()),
        fetch('http://localhost:3000/establecimientos').then(r => r.json()),
        fetch('http://localhost:3000/canchas').then(r => r.json())
        ]);

        allReservas = reservasRes;
        allUsuarios = usuariosRes;
        allEstablecimientos = establecimientosRes;
        allCanchas = canchasRes;

        inicializarAutocompleteUsuario();
        inicializarAutocompleteEstablecimiento();

        // Cargamos filtros guardados (si existen) y mostramos reservas
        cargarFiltrosGuardados();
        filtrarYMostrarReservas();

        loading.style.display = 'none';

    } catch (error) {
        console.error('Error cargando datos:', error);
        loading.style.display = 'none';
        mostrarMensaje('Error al cargar los datos');
    }
    }

    // Función para recargar solo las reservas después de una acción (cancelar, etc.)
    async function recargarReservasYMantenerFiltros() {
    try {
        const reservasRes = await fetch('http://localhost:3000/reservas').then(r => r.json());
        allReservas = reservasRes;
        filtrarYMostrarReservas(); // Mantiene los filtros actuales
    } catch (error) {
        console.error('Error recargando reservas:', error);
        mostrarMensaje('Error al actualizar la lista de reservas');
    }
    }

    function inicializarFiltroFecha() {
    const inputFecha = document.getElementById('filtro-fecha');
    const btnLimpiar = document.getElementById('limpiar-fecha');

    inputFecha.addEventListener('input', () => {
        btnLimpiar.style.display = inputFecha.value ? 'block' : 'none';
    });

    inputFecha.addEventListener('change', (e) => {
        filtroFecha = e.target.value || null;
        guardarFiltros();
        filtrarYMostrarReservas();
    });

    btnLimpiar.addEventListener('click', () => {
        inputFecha.value = '';
        filtroFecha = null;
        btnLimpiar.style.display = 'none';
        guardarFiltros();
        filtrarYMostrarReservas();
    });
    }

    // Autocomplete para Usuario (con guardado de filtros)
    function inicializarAutocompleteUsuario() {
    const input = document.getElementById('busqueda-usuario-filtro');
    const sugerencias = document.getElementById('sugerencias-usuario-filtro');

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        sugerencias.innerHTML = '';
        sugerencias.style.display = 'none';

        if (query.length < 2) {
        filtroUsuarioId = null;
        guardarFiltros();
        filtrarYMostrarReservas();
        return;
        }

        const usuariosFiltrados = allUsuarios.filter(u => u.nombre.toLowerCase().includes(query));

        if (usuariosFiltrados.length === 0) return;

        usuariosFiltrados.forEach(user => {
        const item = document.createElement('a');
        item.className = 'panel-block is-clickable';
        item.innerHTML = `<strong>${user.nombre}</strong> (${user.email})`;
        item.onclick = () => {
            input.value = user.nombre;
            filtroUsuarioId = user.id;
            sugerencias.style.display = 'none';
            guardarFiltros();
            filtrarYMostrarReservas();
        };
        sugerencias.appendChild(item);
        });

        sugerencias.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
        if (input.value.trim() === '') {
            filtroUsuarioId = null;
            guardarFiltros();
            filtrarYMostrarReservas();
        }
        sugerencias.style.display = 'none';
        }, 200);
    });
    }

    // Autocomplete para Establecimiento (con guardado de filtros)
    function inicializarAutocompleteEstablecimiento() {
    const input = document.getElementById('busqueda-establecimiento-filtro');
    const sugerencias = document.getElementById('sugerencias-establecimiento-filtro');

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        sugerencias.innerHTML = '';
        sugerencias.style.display = 'none';

        if (query.length < 2) {
        filtroEstablecimientoId = null;
        guardarFiltros();
        filtrarYMostrarReservas();
        return;
        }

        const establecimientosFiltrados = allEstablecimientos.filter(e => e.nombre.toLowerCase().includes(query));

        if (establecimientosFiltrados.length === 0) return;

        establecimientosFiltrados.forEach(est => {
        const item = document.createElement('a');
        item.className = 'panel-block is-clickable';
        item.textContent = est.nombre;
        item.onclick = () => {
            input.value = est.nombre;
            filtroEstablecimientoId = est.id;
            sugerencias.style.display = 'none';
            guardarFiltros();
            filtrarYMostrarReservas();
        };
        sugerencias.appendChild(item);
        });

        sugerencias.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
        if (input.value.trim() === '') {
            filtroEstablecimientoId = null;
            guardarFiltros();
            filtrarYMostrarReservas();
        }
        sugerencias.style.display = 'none';
        }, 200);
    });
    }

    function filtrarYMostrarReservas() {
    let reservasFiltradas = allReservas;

    if (filtroUsuarioId) {
        reservasFiltradas = reservasFiltradas.filter(r => r.usuario_id == filtroUsuarioId);
    }

    if (filtroEstablecimientoId) {
        reservasFiltradas = reservasFiltradas.filter(r => {
        const cancha = allCanchas.find(c => c.id == r.cancha_id);
        return cancha && cancha.establecimiento_id == filtroEstablecimientoId;
        });
    }

    if (filtroFecha) {
        reservasFiltradas = reservasFiltradas.filter(r => {
        const [dia, mes, anio] = r.fecha_reserva.split('/');
        const fechaReservaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        return fechaReservaISO === filtroFecha;
        });
    }

    reservasFiltradas.sort((a, b) => {
        const [da, ma, ya] = a.fecha_reserva.split('/');
        const [db, mb, yb] = b.fecha_reserva.split('/');
        return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    });

    mostrarReservas(reservasFiltradas);
    }

    // ... (mostrarReservas, cancelarReserva, reagendarReserva, mostrarMensaje permanecen iguales)

    function mostrarReservas(reservas) {
    const lista = document.getElementById('lista-reservas');
    const sinReservas = document.getElementById('sin-reservas');

    lista.innerHTML = '';

    if (reservas.length === 0) {
        sinReservas.style.display = 'block';
        return;
    }

    sinReservas.style.display = 'none';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    reservas.forEach(reserva => {
        const cancha = allCanchas.find(c => c.id == reserva.cancha_id);
        const establecimiento = cancha ? allEstablecimientos.find(e => e.id == cancha.establecimiento_id) : null;
        const usuario = allUsuarios.find(u => u.id == reserva.usuario_id);

        const [day, month, year] = reserva.fecha_reserva.split('/');
        const fechaReserva = new Date(year, month - 1, day);
        fechaReserva.setHours(0, 0, 0, 0);

        const fechaFormateada = fechaReserva.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        });

        const horaInicio = reserva.reserva_hora_inicio.slice(0, 5);
        const horaFin = reserva.reserva_hora_fin.slice(0, 5);

        const reservaPasada = fechaReserva <= hoy;

        const card = document.createElement('div');
        card.className = 'column is-full';

        card.innerHTML = `
        <div class="card mb-5">
            <div class="card-content">
            <div class="content">
                <p class="title is-4">${cancha?.nombre_cancha || 'Cancha desconocida'}</p>
                <p class="subtitle is-6">
                ${establecimiento?.nombre || 'Establecimiento desconocido'} • ${cancha?.deporte || ''}
                </p>
                <p><strong>Usuario:</strong> ${usuario?.nombre || 'Desconocido'} (${usuario?.email || ''})</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Horario:</strong> ${horaInicio} a ${horaFin} hs</p>
                <p><strong>Total pagado:</strong> $${Number(reserva.monto_pagado).toLocaleString('es-AR')}</p>
                ${reservaPasada ? '<p class="has-text-danger mt-4"><strong>No se puede modificar ni cancelar (reserva de hoy o pasada)</strong></p>' : ''}
            </div>

            <div class="has-text-centered mt-5">
                <button class="button is-warning mb-3 btn-reagendar" data-id="${reserva.id}" ${reservaPasada ? 'disabled title="No se puede reagendar reservas de hoy o pasadas"' : ''}>
                <span class="icon"><i class="fas fa-calendar-alt"></i></span>
                <span>Reagendar</span>
                </button>
                <button class="button is-danger btn-cancelar" data-id="${reserva.id}" ${reservaPasada ? 'disabled title="No se puede cancelar reservas de hoy o pasadas"' : ''}>
                <span class="icon"><i class="fas fa-trash"></i></span>
                <span>Cancelar</span>
                </button>
            </div>
            </div>
        </div>
        `;

        lista.appendChild(card);
    });

    document.querySelectorAll('.btn-cancelar:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        cancelarReserva(id);
        });
    });

    document.querySelectorAll('.btn-reagendar:not([disabled])').forEach(btn => {
        btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        reagendarReserva(id);
        });
    });
    }

    function cancelarReserva(id) {
    reservaACancelarId = id;
    document.getElementById('modal-cancelar').classList.add('is-active');
    }

    function reagendarReserva(id) {
    localStorage.setItem('reservaAReagendar', id);
    window.location.href = 'reagendar_reservas.html';
    }

    function mostrarMensaje(texto) {
    const div = document.createElement('div');
    div.className = 'notification is-info is-light has-text-centered mensaje-flotante';
    div.style.position = 'fixed';
    div.style.top = '100px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.zIndex = '1000';
    div.style.padding = '1.5rem';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    div.textContent = texto;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 4000);
}