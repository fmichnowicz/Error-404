// frontend/assets/js/reservas.js

const HORARIOS = [];
for (let h = 7; h <= 22; h++) {
  HORARIOS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) HORARIOS.push(`${h.toString().padStart(2, '0')}:30`);
}

let allCanchas = [];
let allReservas = [];
let fechaSeleccionada = null;

let seleccionActual = {
  canchaId: null,
  horarios: []
};

let usuarioSeleccionado = null; // { id, nombre, email, telefono }

document.addEventListener('DOMContentLoaded', () => {
  inicializarFiltros();
  inicializarBusquedaUsuario();
});

async function inicializarFiltros() {
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);
  const minDate = mañana.toISOString().split('T')[0];
  document.getElementById('filtro-fecha').min = minDate;
  document.getElementById('filtro-fecha').value = minDate;
  fechaSeleccionada = minDate;

  try {
    const response = await fetch('http://localhost:3000/establecimientos');
    if (!response.ok) throw new Error('Error establecimientos');
    const establecimientos = await response.json();

    const selectEst = document.getElementById('filtro-establecimiento');
    selectEst.innerHTML = '<option value="" selected>Todos los establecimientos</option>';

    establecimientos.forEach(est => {
      const option = document.createElement('option');
      option.value = est.id;
      option.textContent = est.nombre;
      selectEst.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando establecimientos:', error);
  }

  document.getElementById('filtro-establecimiento').addEventListener('change', actualizarFiltroDeportes);
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);

  await aplicarFiltros();
}

async function actualizarFiltroDeportes() {
  const selectEst = document.getElementById('filtro-establecimiento');
  const selectDep = document.getElementById('filtro-deporte');

  const estSeleccionados = Array.from(selectEst.selectedOptions)
    .map(o => o.value)
    .filter(v => v !== '');

  selectDep.innerHTML = '<option value="" selected>Todos los deportes</option>';

  try {
    const response = await fetch('http://localhost:3000/canchas');
    if (!response.ok) throw new Error('Error canchas');
    const canchas = await response.json();

    let canchasFiltradas = canchas;
    if (estSeleccionados.length > 0) {
      canchasFiltradas = canchas.filter(c => estSeleccionados.includes(c.establecimiento_id.toString()));
    }

    const deportesUnicos = [...new Set(canchasFiltradas.map(c => c.deporte))].sort();

    deportesUnicos.forEach(dep => {
      const option = document.createElement('option');
      option.value = dep;
      option.textContent = dep;
      selectDep.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando deportes:', error);
  }
}

async function aplicarFiltros() {
  const fecha = document.getElementById('filtro-fecha').value;
  if (!fecha) {
    mostrarMensaje('Por favor selecciona una fecha.');
    return;
  }

  fechaSeleccionada = fecha;
  deseleccionarTodo();
  await cargarDatosYRenderizar();
}

async function cargarDatosYRenderizar() {
  try {
    const [canchasRes, reservasRes] = await Promise.all([
      fetch('http://localhost:3000/canchas').then(r => r.json()),
      fetch(`http://localhost:3000/reservas/grilla?fecha=${fechaSeleccionada}`).then(r => r.json())
    ]);

    allCanchas = canchasRes;
    allReservas = reservasRes;

    renderizarTablaFiltrada();

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('tabla-body').innerHTML = 
      '<tr><td colspan="32" class="has-text-danger has-text-centered">Error al cargar datos</td></tr>';
  }
}

function renderizarTablaFiltrada() {
  const estSeleccionados = Array.from(document.getElementById('filtro-establecimiento').selectedOptions)
    .map(o => o.value).filter(v => v !== '');
  const deportesSeleccionados = Array.from(document.getElementById('filtro-deporte').selectedOptions)
    .map(o => o.value).filter(v => v !== '');

  let canchasFiltradas = allCanchas;

  if (estSeleccionados.length > 0) {
    canchasFiltradas = canchasFiltradas.filter(c => estSeleccionados.includes(c.establecimiento_id.toString()));
  }
  if (deportesSeleccionados.length > 0) {
    canchasFiltradas = canchasFiltradas.filter(c => deportesSeleccionados.includes(c.deporte));
  }

  const reservasOcupadas = {};

  allReservas.forEach(res => {
    if (!reservasOcupadas[res.cancha_id]) reservasOcupadas[res.cancha_id] = [];

    const inicioMin = horaToMinutos(res.reserva_hora_inicio);
    const finMin = horaToMinutos(res.reserva_hora_fin);

    let currentMin = inicioMin;
    while (currentMin < finMin) {
      const horaStr = minutosToHora(currentMin);
      if (!reservasOcupadas[res.cancha_id].includes(horaStr)) {
        reservasOcupadas[res.cancha_id].push(horaStr);
      }
      currentMin += 30;
    }
  });

  renderizarTabla(canchasFiltradas, reservasOcupadas);
}

function renderizarTabla(canchas, reservasOcupadas) {
  const header = document.getElementById('tabla-header');
  const body = document.getElementById('tabla-body');

  let headerHTML = `
    <tr>
      <th class="has-background-primary has-text-white" style="width: 260px;">Cancha</th>
      <th class="has-background-light has-text-centered has-text-weight-bold" style="width: 120px;">Precio por hora</th>`;
  HORARIOS.forEach(hora => {
    headerHTML += `<th class="has-text-centered has-background-grey-lighter">${hora}</th>`;
  });
  headerHTML += '</tr>';
  header.innerHTML = headerHTML;

  let bodyHTML = '';
  if (canchas.length === 0) {
    bodyHTML = '<tr><td colspan="32" class="has-text-centered">No hay canchas disponibles con estos filtros</td></tr>';
  } else {
    canchas.forEach(cancha => {
      bodyHTML += `<tr>
        <td class="has-background-primary has-text-white has-text-weight-bold" style="width: 260px; line-height: 1.5;">
          <div class="is-size-5 mb-2">${cancha.nombre_establecimiento}</div>
          <div class="is-size-6 mb-2">${cancha.deporte}</div>
          <div class="is-size-5 mb-3">${cancha.nombre_cancha}</div>
          <div class="info-adicional">${cancha.superficie}</div>
          <div class="info-adicional mt-2">
            ${cancha.iluminacion ? 'Iluminación' : ''}
            ${cancha.iluminacion && cancha.cubierta ? '<span class="separador">|</span>' : ''}
            ${cancha.cubierta ? 'Cubierta' : ''}
          </div>
        </td>

        <td class="has-background-light has-text-centered has-text-weight-bold" style="width: 120px;">
          $${Number(cancha.precio_hora).toLocaleString('es-AR')}
          <br><small class="has-text-grey">por hora</small>
        </td>`;

      HORARIOS.forEach(hora => {
        const ocupado = reservasOcupadas[cancha.id]?.includes(hora);
        const seleccionado = seleccionActual.canchaId === cancha.id && seleccionActual.horarios.includes(hora);

        if (ocupado) {
          bodyHTML += `<td><button class="boton-horario ocupado" disabled></button></td>`;
        } else {
          bodyHTML += `<td><button class="boton-horario ${seleccionado ? 'seleccionado' : ''}"
            data-cancha="${cancha.id}" data-hora="${hora}" onclick="toggleHorario(this)"></button></td>`;
        }
      });

      bodyHTML += '</tr>';
    });
  }

  body.innerHTML = bodyHTML;
}

// Búsqueda de usuario existente
function inicializarBusquedaUsuario() {
  const input = document.getElementById('busqueda-usuario');
  const sugerencias = document.getElementById('sugerencias-usuario');
  const usuarioSel = document.getElementById('usuario-seleccionado');
  const noEncontrado = document.getElementById('usuario-no-encontrado');

  input.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    sugerencias.innerHTML = '';
    sugerencias.style.display = 'none';
    usuarioSel.style.display = 'none';
    noEncontrado.style.display = 'none';
    usuarioSeleccionado = null;
    actualizarBotonConfirmar();

    if (query.length < 2) return;

    try {
      const response = await fetch(`http://localhost:3000/usuarios/buscar?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error búsqueda');
      const usuarios = await response.json();

      if (usuarios.length === 0) {
        noEncontrado.style.display = 'block';
        return;
      }

      usuarios.forEach(user => {
        const item = document.createElement('a');
        item.className = 'panel-block is-clickable';
        item.innerHTML = `
          <span class="panel-icon"><i class="fas fa-user"></i></span>
          <strong>${user.nombre}</strong> - ${user.email}
        `;
        item.onclick = () => {
          input.value = user.nombre;
          usuarioSeleccionado = user;
          document.getElementById('nombre-seleccionado').textContent = user.nombre;
          document.getElementById('email-seleccionado').textContent = user.email;
          document.getElementById('telefono-seleccionado').textContent = user.telefono;
          sugerencias.style.display = 'none';
          usuarioSel.style.display = 'block';
          actualizarBotonConfirmar();
        };
        sugerencias.appendChild(item);
      });

      sugerencias.style.display = 'block';
    } catch (error) {
      console.error('Error búsqueda usuario:', error);
      mostrarMensaje('Error al buscar usuario');
    }
  });
}

// Mostrar resumen de reserva
function mostrarResumenReserva() {
  const resumenDiv = document.getElementById('resumen-reserva');
  if (!usuarioSeleccionado || seleccionActual.horarios.length === 0 || ![2, 3, 4].includes(seleccionActual.horarios.length)) {
    resumenDiv.style.display = 'none';
    return;
  }

  // Horarios
  const horariosOrdenados = [...seleccionActual.horarios].sort();
  const horaInicio = horariosOrdenados[0];
  const ultimaHora = horariosOrdenados[horariosOrdenados.length - 1];
  const [h, m] = ultimaHora.split(':').map(Number);
  const horaFinMin = h * 60 + m + 30;
  const horaFinH = Math.floor(horaFinMin / 60).toString().padStart(2, '0');
  const horaFinM = (horaFinMin % 60).toString().padStart(2, '0');
  const horaFin = `${horaFinH}:${horaFinM}`;

  // Cancha
  const cancha = allCanchas.find(c => c.id == seleccionActual.canchaId);
  if (!cancha) return;

  // Monto
  const slots = horariosOrdenados.length;
  const monto = cancha.precio_hora * (slots / 2);

  // Formatear fecha
  const [year, month, day] = fechaSeleccionada.split('-');
  const fechaFormateada = `${day}/${month}/${year}`;

  // Llenar resumen
  document.getElementById('resumen-cancha').textContent = cancha.nombre_cancha;
  document.getElementById('resumen-establecimiento').textContent = cancha.nombre_establecimiento;
  document.getElementById('resumen-deporte').textContent = cancha.deporte;
  document.getElementById('resumen-fecha').textContent = fechaFormateada;
  document.getElementById('resumen-hora-inicio').textContent = horaInicio;
  document.getElementById('resumen-hora-fin').textContent = horaFin;
  document.getElementById('resumen-monto').textContent = monto.toLocaleString('es-AR');

  resumenDiv.style.display = 'block';
}

// Habilitar/deshabilitar botón y mostrar resumen
function actualizarBotonConfirmar() {
  const btn = document.getElementById('btn-confirmar-reserva');
  const tieneHorarioValido = [2, 3, 4].includes(seleccionActual.horarios.length);
  const tieneUsuario = usuarioSeleccionado !== null;

  btn.disabled = !(tieneHorarioValido && tieneUsuario);

  // Mostrar u ocultar resumen
  mostrarResumenReserva();
}

// Confirmar reserva
document.getElementById('btn-confirmar-reserva').addEventListener('click', confirmarReserva);

async function confirmarReserva() {
  if (!usuarioSeleccionado) {
    mostrarMensaje('Debes seleccionar un usuario registrado');
    return;
  }

  if (seleccionActual.horarios.length === 0) {
    mostrarMensaje('Selecciona un horario válido');
    return;
  }

  const horariosOrdenados = [...seleccionActual.horarios].sort();
  const horaInicio = horariosOrdenados[0] + ':00';
  const ultimaHora = horariosOrdenados[horariosOrdenados.length - 1];
  const [h, m] = ultimaHora.split(':').map(Number);
  const horaFinMin = h * 60 + m + 30;
  const horaFinH = Math.floor(horaFinMin / 60).toString().padStart(2, '0');
  const horaFinM = (horaFinMin % 60).toString().padStart(2, '0');
  const horaFin = `${horaFinH}:${horaFinM}:00`;

  const cancha = allCanchas.find(c => c.id == seleccionActual.canchaId);
  if (!cancha) {
    mostrarMensaje('Error al obtener la cancha');
    return;
  }

  const slots = horariosOrdenados.length;
  const montoPagado = cancha.precio_hora * (slots / 2);

  const datosReserva = {
    cancha_id: seleccionActual.canchaId,
    usuario_id: usuarioSeleccionado.id,
    fecha_reserva: fechaSeleccionada,
    reserva_hora_inicio: horaInicio,
    reserva_hora_fin: horaFin,
    monto_pagado: montoPagado
  };

  try {
    const response = await fetch('http://localhost:3000/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosReserva)
    });

    if (!response.ok) {
      const error = await response.json();
      mostrarMensaje(error.error || 'Error al crear reserva');
      return;
    }

    mostrarMensaje('¡Reserva creada exitosamente!');
    deseleccionarTodo();
    document.getElementById('busqueda-usuario').value = '';
    usuarioSeleccionado = null;
    document.getElementById('usuario-seleccionado').style.display = 'none';
    document.getElementById('resumen-reserva').style.display = 'none';
    await cargarDatosYRenderizar();

  } catch (error) {
    console.error('Error al crear reserva:', error);
    mostrarMensaje('Error de conexión');
  }
}

// Toggle horario
function toggleHorario(btn) {
  const canchaId = btn.dataset.cancha;
  const hora = btn.dataset.hora;

  if (seleccionActual.canchaId && seleccionActual.canchaId !== canchaId && seleccionActual.horarios.length > 0) {
    mostrarMensaje("Para seleccionar otra cancha, primero deselecciona los horarios anteriores.");
    return;
  }

  btn.classList.toggle('seleccionado');

  if (btn.classList.contains('seleccionado')) {
    if (seleccionActual.canchaId === null) seleccionActual.canchaId = canchaId;
    seleccionActual.horarios.push(hora);
  } else {
    seleccionActual.horarios = seleccionActual.horarios.filter(h => h !== hora);
    if (seleccionActual.horarios.length === 0) seleccionActual.canchaId = null;
  }

  validarSeleccion();
  actualizarBotonConfirmar();
}

function validarSeleccion() {
  if (seleccionActual.horarios.length === 0) return;

  const horarios = [...seleccionActual.horarios].sort();

  for (let i = 1; i < horarios.length; i++) {
    const diff = horaToMinutos(horarios[i]) - horaToMinutos(horarios[i - 1]);
    if (diff !== 30) {
      mostrarMensaje("Los horarios deben ser consecutivos sin huecos.");
      deseleccionarTodo();
      return;
    }
  }

  const slots = horarios.length;
  if (![2, 3, 4].includes(slots)) {
    if (slots > 4) {
      mostrarMensaje("Solo puedes reservar hasta 2 horas (4 slots).");
      deseleccionarTodo();
      return;
    }
  }
}

function horaToMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function minutosToHora(minutos) {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function deseleccionarTodo() {
  document.querySelectorAll('.boton-horario.seleccionado').forEach(btn => {
    btn.classList.remove('seleccionado');
  });
  seleccionActual = { canchaId: null, horarios: [] };
  actualizarBotonConfirmar();
}

function mostrarMensaje(texto) {
  const existente = document.getElementById('mensaje-error');
  if (existente) existente.remove();

  const div = document.createElement('div');
  div.id = 'mensaje-error';
  div.className = 'mensaje-error';
  div.textContent = texto;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}