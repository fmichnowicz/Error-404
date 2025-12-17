// frontend/assets/js/reservas.js

const HORARIOS = [];
for (let h = 7; h <= 22; h++) {
  HORARIOS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) HORARIOS.push(`${h.toString().padStart(2, '0')}:30`);
}
// → 30 horarios: "07:00" a "22:00"

let allCanchas = [];
let allReservas = [];
let fechaSeleccionada = null;

let seleccionActual = {
  canchaId: null,
  horarios: []
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarFiltros();
});

async function inicializarFiltros() {
  // Fecha mínima: mañana
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);
  const minDate = mañana.toISOString().split('T')[0];
  document.getElementById('filtro-fecha').min = minDate;
  document.getElementById('filtro-fecha').value = minDate;
  fechaSeleccionada = minDate;

  // Cargar establecimientos
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

  // Evento cambio en establecimientos → actualizar deportes
  document.getElementById('filtro-establecimiento').addEventListener('change', actualizarFiltroDeportes);

  // Botón aplicar filtros
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);

  // Cargar inicial
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

  // Deseleccionar todo al cambiar filtros
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

  // === BLOQUEO DE HORARIOS OCUPADOS ===
const reservasOcupadas = {};

allReservas.forEach(res => {
    if (!reservasOcupadas[res.cancha_id]) reservasOcupadas[res.cancha_id] = [];

    // El backend ya normalizó las horas a "HH:MM"
    // Bloqueamos inicio y todos los slots hasta fin (excluyendo fin)
    const inicio = res.reserva_hora_inicio;
    const fin = res.reserva_hora_fin;

    let current = inicio;
    while (current < fin) {
        if (!reservasOcupadas[res.cancha_id].includes(current)) {
        reservasOcupadas[res.cancha_id].push(current);
        }
        // Sumar 30 minutos
        const [h, m] = current.split(':').map(Number);
        let newMin = h * 60 + m + 30;
        const newH = Math.floor(newMin / 60);
        const newM = newMin % 60;
        current = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    }
    });

  renderizarTabla(canchasFiltradas, reservasOcupadas);
}

function renderizarTabla(canchas, reservasOcupadas) {
  const header = document.getElementById('tabla-header');
  const body = document.getElementById('tabla-body');

  // Header con columna de precio
  let headerHTML = `
    <tr>
      <th class="has-background-primary has-text-white" style="width: 250px;">Cancha</th>
      <th class="has-background-light has-text-centered has-text-weight-bold" style="width: 100px;">Precio por hora</th>`;
  HORARIOS.forEach(hora => {
    headerHTML += `<th class="has-text-centered has-background-grey-lighter">${hora}</th>`;
  });
  headerHTML += '</tr>';
  header.innerHTML = headerHTML;

  // Body
  let bodyHTML = '';
  if (canchas.length === 0) {
    bodyHTML = '<tr><td colspan="32" class="has-text-centered">No hay canchas disponibles con estos filtros</td></tr>';
  } else {
    canchas.forEach(cancha => {
      bodyHTML += `<tr>
        <td class="has-background-primary has-text-white has-text-weight-bold" style="width: 250px; line-height: 1.5;">
        <div class="is-size-5 mb-2">${cancha.nombre_establecimiento}</div>
        <div class="is-size-6 mb-2">${cancha.deporte}</div>
        <div class="is-size-5 mb-3">${cancha.nombre_cancha}</div>
        
        <!-- Superficie -->
        <div class="is-size-7 mb-2 has-text-grey-lighter">
            ${cancha.superficie}
        </div>

        <!-- Iluminación y Cubierta (solo si son true) -->
        <div class="is-size-7 has-text-grey-lighter">
            ${cancha.iluminacion ? 'Iluminación' : ''}
            ${cancha.iluminacion && cancha.cubierta ? ' | ' : ''}
            ${cancha.cubierta ? 'Cubierta' : ''}
        </div>
        </td>

        <td class="has-background-light has-text-centered has-text-weight-bold" style="width: 100px;">
          $${Number(cancha.precio_hora).toLocaleString('es-AR')}
          <br>
          <small class="has-text-grey">por hora</small>
        </td>`;

      HORARIOS.forEach(hora => {
        const ocupado = reservasOcupadas[cancha.id]?.includes(hora);
        const seleccionado = seleccionActual.canchaId === cancha.id && seleccionActual.horarios.includes(hora);

        if (ocupado) {
          bodyHTML += `
            <td>
              <button class="boton-horario ocupado" disabled></button>
            </td>`;
        } else {
          bodyHTML += `
            <td>
              <button class="boton-horario ${seleccionado ? 'seleccionado' : ''}"
                      data-cancha="${cancha.id}"
                      data-hora="${hora}"
                      onclick="toggleHorario(this)">
              </button>
            </td>`;
        }
      });

      bodyHTML += '</tr>';
    });
  }

  body.innerHTML = bodyHTML;
}

// Toggle selección
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
    return;
  }
}

// Funciones auxiliares
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