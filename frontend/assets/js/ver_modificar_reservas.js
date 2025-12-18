// frontend/assets/js/ver_modificar_reservas.js

let allReservas = [];
let allUsuarios = [];
let allEstablecimientos = [];
let allCanchas = [];

let filtroUsuarioId = null;
let filtroEstablecimientoId = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarDatosIniciales();
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

    filtrarYMostrarReservas();

    loading.style.display = 'none';

  } catch (error) {
    console.error('Error cargando datos:', error);
    loading.style.display = 'none';
    mostrarMensaje('Error al cargar los datos');
  }
}

// Autocomplete para Usuario
function inicializarAutocompleteUsuario() {
  const input = document.getElementById('busqueda-usuario-filtro');
  const sugerencias = document.getElementById('sugerencias-usuario-filtro');

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    sugerencias.innerHTML = '';
    sugerencias.style.display = 'none';

    if (query.length < 2) {
      filtroUsuarioId = null;
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
        filtrarYMostrarReservas();
      }
      sugerencias.style.display = 'none';
    }, 200);
  });
}

// Autocomplete para Establecimiento
function inicializarAutocompleteEstablecimiento() {
  const input = document.getElementById('busqueda-establecimiento-filtro');
  const sugerencias = document.getElementById('sugerencias-establecimiento-filtro');

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    sugerencias.innerHTML = '';
    sugerencias.style.display = 'none';

    if (query.length < 2) {
      filtroEstablecimientoId = null;
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
        filtrarYMostrarReservas();
      }
      sugerencias.style.display = 'none';
    }, 200);
  });
}

// Filtrar y mostrar reservas
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

  // Orden descendente por fecha (futuras primero)
  reservasFiltradas.sort((a, b) => {
    const [da, ma, ya] = a.fecha_reserva.split('/');
    const [db, mb, yb] = b.fecha_reserva.split('/');
    return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
  });

  mostrarReservas(reservasFiltradas);
}

function mostrarReservas(reservas) {
  const lista = document.getElementById('lista-reservas');
  const sinReservas = document.getElementById('sin-reservas');

  lista.innerHTML = '';

  if (reservas.length === 0) {
    sinReservas.style.display = 'block';
    return;
  }

  sinReservas.style.display = 'none';

  // Fecha actual (solo día)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  reservas.forEach(reserva => {
    const cancha = allCanchas.find(c => c.id == reserva.cancha_id);
    const establecimiento = cancha ? allEstablecimientos.find(e => e.id == cancha.establecimiento_id) : null;

    // Convertir fecha "DD/MM/YYYY" a Date
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

    // ¿La reserva ya pasó o es hoy?
    const reservaPasada = fechaReserva <= hoy;

    const card = document.createElement('div');
    card.className = 'column is-full';

    card.innerHTML = `
      <div class="card mb-5">
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <figure class="image is-96x96">
                <img src="assets/img/cancha-placeholder.jpg" alt="Cancha" style="border-radius: 8px; object-fit: cover;">
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">${cancha?.nombre_cancha || 'Cancha desconocida'}</p>
              <p class="subtitle is-6">${establecimiento?.nombre || 'Establecimiento desconocido'} • ${cancha?.deporte || ''}</p>
              <div class="content mt-4">
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Horario:</strong> ${horaInicio} a ${horaFin} hs</p>
                <p><strong>Total pagado:</strong> $${Number(reserva.monto_pagado).toLocaleString('es-AR')}</p>
                ${reservaPasada ? '<p class="has-text-danger mt-3"><strong>No se puede modificar ni cancelar (reserva de hoy o pasada)</strong></p>' : ''}
              </div>
            </div>
          </div>
          <div class="has-text-right mt-4">
            <button class="button is-warning mr-3 btn-reagendar" data-id="${reserva.id}" ${reservaPasada ? 'disabled title="No se puede reagendar reservas de hoy o pasadas"' : ''}>
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

  // Eventos delegados solo para botones habilitados
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
  if (!confirm('¿Estás seguro de que querés cancelar esta reserva?')) return;

  fetch(`http://localhost:3000/reservas/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) throw new Error('Error al cancelar');
      return response.json();
    })
    .then(() => {
      mostrarMensaje('Reserva cancelada exitosamente');
      filtrarYMostrarReservas();
    })
    .catch(() => mostrarMensaje('Error al cancelar la reserva'));
}

function reagendarReserva(id) {
  localStorage.setItem('reservaAReagendar', id);
  window.location.href = 'crear_reservas.html';
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
  div.textContent = texto;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}