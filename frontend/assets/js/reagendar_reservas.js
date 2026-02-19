// frontend/assets/js/reagendar_reservas.js
import { API_URL } from "./shared.js";

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

let reservaOriginal = null;

const reservaId = localStorage.getItem('reservaAReagendar');

// Función para ordenar: establecimiento → deporte → nombre_cancha (con orden numérico natural)
function ordenarCanchas(canchas) {
  return canchas.sort((a, b) => {
    // 1. Por establecimiento (alfabético, ignorando acentos y mayúsculas)
    const estA = normalizeString(a.nombre_establecimiento);
    const estB = normalizeString(b.nombre_establecimiento);
    if (estA !== estB) return estA.localeCompare(estB);

    // 2. Por deporte con ordenamiento NATURAL (Fútbol 4 < Fútbol 8 < Fútbol 11)
    const depComparison = a.deporte.localeCompare(b.deporte, undefined, {
      numeric: true,
      sensitivity: 'base'  // ignora acentos y mayúsculas
    });
    if (depComparison !== 0) return depComparison;

    // 3. Por nombre de cancha con ordenamiento natural (Cancha 1, 2, ..., 10, 11)
    return a.nombre_cancha.localeCompare(b.nombre_cancha, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });
}

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// === CARGA PROGRESIVA ===
const CANTIDAD_INICIAL = 10;
const INCREMENTO = 10;
let canchasMostradas = CANTIDAD_INICIAL;

document.addEventListener('DOMContentLoaded', async () => {
  if (!reservaId) {
    mostrarMensaje('No se encontró la reserva a reagendar. Volviendo a la lista...');
    setTimeout(() => window.location.href = 'ver_cancelar_reservas.html', 3000);
    return;
  }

  await cargarDatosIniciales();
  await cargarReservaOriginal();
  inicializarFecha();
  await cargarDatosYRenderizar();

  // Evento del botón "Mostrar más canchas"
  document.getElementById('btn-mostrar-mas').addEventListener('click', () => {
    canchasMostradas += INCREMENTO;
    renderizarTablaFiltrada();
  });
});

async function cargarDatosIniciales() {
  try {
    const [canchasRes] = await Promise.all([
      fetch(`${API_URL}/canchas`).then(r => r.json())
    ]);
    allCanchas = canchasRes;
  } catch (error) {
    console.error('Error cargando canchas:', error);
    mostrarMensaje('Error al cargar datos iniciales');
  }
}

async function cargarReservaOriginal() {
  try {
    const resReserva = await fetch(`${API_URL}/reservas/${reservaId}`);
    if (!resReserva.ok) throw new Error('Reserva no encontrada');
    reservaOriginal = await resReserva.json();

    const cancha = allCanchas.find(c => c.id === reservaOriginal.cancha_id);
    if (!cancha) {
      mostrarMensaje('Error: cancha no encontrada');
      return;
    }

    let nombreUsuario = 'Desconocido';
    if (reservaOriginal.usuario_id) {
      try {
        const resUsuario = await fetch(`${API_URL}/usuarios/${reservaOriginal.usuario_id}`);
        if (resUsuario.ok) {
          const usuario = await resUsuario.json();
          nombreUsuario = usuario.nombre || 'Desconocido';
        }
      } catch (err) {
        console.warn('No se pudo cargar el nombre del usuario:', err);
      }
    }

    const horaInicio = reservaOriginal.reserva_hora_inicio.slice(0, 5);
    const horaFin = reservaOriginal.reserva_hora_fin.slice(0, 5);
    const horarioActual = `${horaInicio} a ${horaFin} hs`;

    document.getElementById('info-establecimiento').textContent = cancha.nombre_establecimiento || 'Desconocido';
    document.getElementById('info-deporte').textContent = cancha.deporte || 'Desconocido';
    document.getElementById('info-usuario').textContent = nombreUsuario;
    document.getElementById('info-fecha-actual').textContent = reservaOriginal.fecha_reserva;
    document.getElementById('info-horario-actual').textContent = horarioActual;

  } catch (error) {
    console.error('Error cargando reserva original:', error);
    mostrarMensaje('No se pudo cargar la información de la reserva original');
  }
}

function inicializarFecha() {
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);
  const minDate = mañana.toISOString().split('T')[0];

  const inputFecha = document.getElementById('filtro-fecha');
  const btnBuscar = document.getElementById('btn-aplicar-filtros');
  inputFecha.min = minDate;
  inputFecha.value = minDate;
  fechaSeleccionada = minDate;

  inputFecha.addEventListener('change', () => {
    btnBuscar.classList.add('is-loading');
    btnBuscar.classList.add('has-background-primary-dark');
    setTimeout(() => {
      btnBuscar.classList.remove('is-loading');
      btnBuscar.classList.remove('has-background-primary-dark');
    }, 800);
  });

  btnBuscar.addEventListener('click', () => {
    const nuevaFecha = inputFecha.value;
    if (!nuevaFecha) {
      mostrarMensaje('Selecciona una fecha válida');
      return;
    }
    if (nuevaFecha === reservaOriginal.fecha_reserva) {
      mostrarMensaje('No puedes seleccionar la misma fecha que la reserva actual. Elige otra.');
      return;
    }
    fechaSeleccionada = nuevaFecha;
    deseleccionarTodo();
    canchasMostradas = CANTIDAD_INICIAL; // Resetear cantidad mostrada al cambiar fecha
    cargarDatosYRenderizar();
  });
}

async function cargarDatosYRenderizar() {
  try {
    const reservasRes = await fetch(`${API_URL}/reservas/grilla?fecha=${fechaSeleccionada}`).then(r => r.json());
    allReservas = reservasRes;
    renderizarTablaFiltrada();
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('tabla-body').innerHTML =
      '<tr><td colspan="32" class="has-text-danger has-text-centered">Error al cargar horarios</td></tr>';
  }
}

function renderizarTablaFiltrada() {
  if (!reservaOriginal || allCanchas.length === 0) return;

  const canchaOriginal = allCanchas.find(c => c.id === reservaOriginal.cancha_id);
  if (!canchaOriginal) return;

  const establecimientoId = canchaOriginal.establecimiento_id;
  const deporte = canchaOriginal.deporte;

  let canchasFiltradas = allCanchas.filter(c =>
    c.establecimiento_id === establecimientoId && c.deporte === deporte
  );

  // === ORDENAR LAS CANCHAS FILTRADAS ===
  canchasFiltradas = ordenarCanchas(canchasFiltradas);

  const reservasOcupadas = {};

  allReservas
    .filter(res => res.id != reservaId)
    .forEach(res => {
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

  // Mostrar solo las primeras N canchas
  const canchasAMostrar = canchasFiltradas.slice(0, canchasMostradas);

  renderizarTabla(canchasAMostrar, reservasOcupadas);

  // Mostrar/Ocultar botón "Mostrar más"
  const btnMostrarMas = document.getElementById('btn-mostrar-mas');
  if (canchasMostradas < canchasFiltradas.length) {
    btnMostrarMas.style.display = 'block';
  } else {
    btnMostrarMas.style.display = 'none';
  }
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
    bodyHTML = '<tr><td colspan="32" class="has-text-centered">No hay canchas disponibles</td></tr>';
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

        let clase = '';
        if (ocupado) {
          clase = 'ocupado';
        } else if (seleccionado) {
          clase = 'seleccionado';
        }

        bodyHTML += `<td><button class="boton-horario-reagendar ${clase}"
          data-cancha="${cancha.id}" data-hora="${hora}" 
          ${ocupado ? 'disabled title="Horario ocupado por otro usuario"' : ''}></button></td>`;
      });

      bodyHTML += '</tr>';
    });
  }

  body.innerHTML = bodyHTML;

  // Agregar listeners a botones libres
  document.querySelectorAll('.boton-horario-reagendar:not(.ocupado)').forEach(btn => {
    btn.addEventListener('click', () => toggleHorario(btn));
  });
}

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
  if (seleccionActual.horarios.length === 0) {
    document.getElementById('seccion-resumen').style.display = 'none';
    return;
  }

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
      mostrarMensaje("Solo puedes reservar hasta 2 horas.");
      deseleccionarTodo();
    }
    return;
  }

  mostrarResumenReserva();
}

function mostrarResumenReserva() {
  const horariosOrdenados = [...seleccionActual.horarios].sort();
  const horaInicio = horariosOrdenados[0];
  const ultimaHora = horariosOrdenados[horariosOrdenados.length - 1];
  const [h, m] = ultimaHora.split(':').map(Number);
  const horaFinMin = h * 60 + m + 30;
  const horaFinH = Math.floor(horaFinMin / 60).toString().padStart(2, '0');
  const horaFinM = (horaFinMin % 60).toString().padStart(2, '0');
  const horaFin = `${horaFinH}:${horaFinM}`;

  const cancha = allCanchas.find(c => c.id == seleccionActual.canchaId);
  if (!cancha) return;

  const slots = horariosOrdenados.length;
  const montoNuevo = cancha.precio_hora * (slots / 2);
  const montoOriginal = reservaOriginal.monto_pagado;

  const [year, month, day] = fechaSeleccionada.split('-');
  const fechaFormateada = `${day}/${month}/${year}`;

  document.getElementById('resumen-cancha').textContent = cancha.nombre_cancha;
  document.getElementById('resumen-establecimiento').textContent = cancha.nombre_establecimiento;
  document.getElementById('resumen-deporte').textContent = cancha.deporte;
  document.getElementById('resumen-fecha').textContent = fechaFormateada;
  document.getElementById('resumen-hora-inicio').textContent = horaInicio;
  document.getElementById('resumen-hora-fin').textContent = horaFin;

  const saldoDiv = document.getElementById('resumen-saldo');
  const saldoTexto = document.getElementById('resumen-saldo-texto');

  const diferencia = montoNuevo - montoOriginal;

  if (Math.abs(diferencia) < 0.01) {
    saldoDiv.style.display = 'none';
  } else if (diferencia > 0) {
    saldoTexto.textContent = `Saldo adicional a pagar: $${diferencia.toLocaleString('es-AR')}`;
    saldoTexto.className = 'title is-4 has-text-centered has-text-danger';
    saldoDiv.style.display = 'block';
  } else {
    const aFavor = Math.abs(diferencia);
    saldoTexto.textContent = `Saldo a favor del usuario: $${aFavor.toLocaleString('es-AR')}`;
    saldoTexto.className = 'title is-4 has-text-centered has-text-success';
    saldoDiv.style.display = 'block';
  }

  document.getElementById('seccion-resumen').style.display = 'block';
  document.getElementById('btn-confirmar-reagendar').disabled = false;
}

function actualizarBotonConfirmar() {
  const tieneHorarioValido = [2, 3, 4].includes(seleccionActual.horarios.length);
  document.getElementById('btn-confirmar-reagendar').disabled = !tieneHorarioValido;
}

document.getElementById('btn-confirmar-reagendar').addEventListener('click', confirmarReagenda);

async function confirmarReagenda() {
  const horariosOrdenados = [...seleccionActual.horarios].sort();
  const horaInicio = horariosOrdenados[0] + ':00';
  const ultimaHora = horariosOrdenados[horariosOrdenados.length - 1];
  const [h, m] = ultimaHora.split(':').map(Number);
  const horaFinMin = h * 60 + m + 30;
  const horaFinH = Math.floor(horaFinMin / 60).toString().padStart(2, '0');
  const horaFinM = (horaFinMin % 60).toString().padStart(2, '0');
  const horaFin = `${horaFinH}:${horaFinM}:00`;

  const cancha = allCanchas.find(c => c.id == seleccionActual.canchaId);
  const slots = horariosOrdenados.length;
  const montoPagado = cancha.precio_hora * (slots / 2);

  const datosNuevos = {
    cancha_id: seleccionActual.canchaId,
    fecha_reserva: fechaSeleccionada,
    reserva_hora_inicio: horaInicio,
    reserva_hora_fin: horaFin,
    monto_pagado: montoPagado,
    usuario_id: reservaOriginal.usuario_id
  };

  try {
    const response = await fetch(`${API_URL}/reservas/${reservaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosNuevos)
    });

    if (!response.ok) {
      const error = await response.json();
      mostrarMensaje(error.error || 'Error al reagendar');
      return;
    }

    mostrarMensaje('¡Reserva reagendada exitosamente!');
    localStorage.removeItem('reservaAReagendar');
    setTimeout(() => {
      window.location.href = 'ver_cancelar_reservas.html';
    }, 2000);

  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión al reagendar');
  }
}

function deseleccionarTodo() {
  document.querySelectorAll('.boton-horario-reagendar.seleccionado').forEach(btn => btn.classList.remove('seleccionado'));
  seleccionActual = { canchaId: null, horarios: [] };
  document.getElementById('seccion-resumen').style.display = 'none';
  document.getElementById('btn-confirmar-reagendar').disabled = true;
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