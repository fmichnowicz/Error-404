// frontend/assets/js/shared.js

function mostrarMensaje(texto, tipo = 'success') {
  const existente = document.querySelector('.mensaje-flotante');
  if (existente) existente.remove();

  const div = document.createElement('div');
  div.className = `notification is-${tipo} is-light mensaje-flotante`;
  div.style.position = 'fixed';
  div.style.top = '100px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.zIndex = '1000';
  div.style.padding = '1.5rem';
  div.style.borderRadius = '8px';
  div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  div.textContent = texto;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}

function cargarNavbar() {
  fetch('navbar.html')
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar navbar');
      return response.text();
    })
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;

      activarBurgerMenu();
      manejarModalReservas();
      manejarModalUsuarios();
      manejarModalRegistroUsuario();
    })
    .catch(err => {
      console.error('Error cargando navbar:', err);
      document.getElementById('navbar-container').innerHTML = 
        '<p class="has-text-danger">Error al cargar el menú</p>';
    });
}

function activarBurgerMenu() {
  const burger = document.querySelector('.navbar-burger');
  const menu = document.querySelector('.navbar-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  }
}

function manejarModalReservas() {
  const trigger = document.getElementById('reservas-trigger');
  if (!trigger) return;

  let oldModal = document.getElementById('modal-reservas');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-reservas';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-6-mobile">Gestión de Reservas</p>
        <button class="delete is-large" aria-label="close"></button>
      </header>
      <section class="modal-card-body has-text-centered">
        <p class="title is-5 mb-5 is-size-6-mobile">¿Qué deseas hacer?</p>
        <div class="buttons is-centered">
          <a href="crear_reservas.html" class="button is-primary is-large mr-4">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span class="has-text-weight-semibold is-size-6-mobile">Crear Reserva</span>
          </a>
          <a href="ver_cancelar_reservas.html" class="button is-warning is-large">
            <span class="icon"><i class="fas fa-edit"></i></span>
            <span class="has-text-weight-semibold is-size-6-mobile">Reagendar / Cancelar</span>
          </a>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(modal);

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.zIndex = '1986';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
    modal.classList.add('is-active');
    document.body.classList.add('is-clipped');
  });

  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete') || e.target.closest('.delete')) {
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      document.body.classList.remove('is-clipped');
    }
  });
}

// Modal de Gestión de Usuarios con 4 botones
function manejarModalUsuarios() {
  const trigger = document.getElementById('usuarios-trigger');
  if (!trigger) return;

  let oldModal = document.getElementById('modal-usuarios');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-usuarios';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Gestión de Usuarios</p>
        <button class="delete is-large" aria-label="close"></button>
      </header>
      <section class="modal-card-body has-text-centered">
        <p class="title is-5 mb-5">¿Qué deseas hacer?</p>
        <div class="buttons is-centered is-multiline">
          <button id="btn-abrir-registro-usuario" class="button is-primary is-large m-2">
            <span class="icon"><i class="fas fa-user-plus"></i></span>
            <span>Registrar</span>
          </button>
          <button class="button is-info is-large m-2" disabled>
            <span class="icon"><i class="fas fa-user-edit"></i></span>
            <span>Modificar</span>
          </button>
          <button class="button is-danger is-large m-2" disabled>
            <span class="icon"><i class="fas fa-user-minus"></i></span>
            <span>Eliminar</span>
          </button>
          <button class="button is-dark is-large m-2" disabled>
            <span class="icon"><i class="fas fa-users"></i></span>
            <span>Ver</span>
          </button>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(modal);

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.zIndex = '1986';
  modal.style.display = 'none';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
    modal.classList.add('is-active');
    document.body.classList.add('is-clipped');
  });

  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete') || e.target.closest('.delete')) {
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      document.body.classList.remove('is-clipped');
    }
  });

  // Botón Registrar → cerrar gestión y abrir registro
  const btnAbrirRegistro = modal.querySelector('#btn-abrir-registro-usuario');
  btnAbrirRegistro.addEventListener('click', () => {
    // Cerrar modal de gestión automáticamente
    modal.classList.remove('is-active');
    modal.style.display = 'none';
    document.body.classList.remove('is-clipped');

    // Abrir modal de registro
    const registroModal = document.getElementById('modal-registrar-usuario');
    if (registroModal) {
      registroModal.style.zIndex = '1988'; // Mayor z-index para que esté encima
      registroModal.classList.add('is-active');
      registroModal.style.display = 'flex';
      document.body.classList.add('is-clipped');
    }
  });
}

// Modal de Registro de Usuario (estático)
function manejarModalRegistroUsuario() {
  const modal = document.getElementById('modal-registrar-usuario');
  if (!modal) return;

  // Cerrar solo con X (listener directo y robusto)
  const closeButtons = modal.querySelectorAll('.delete');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      document.body.classList.remove('is-clipped');
      document.getElementById('form-registro-usuario')?.reset();
      document.getElementById('error-registro').style.display = 'none';
      document.getElementById('btn-registrar-usuario').disabled = true;
    });
  });

  // Deshabilitar cierre con background
  const background = modal.querySelector('.modal-background');
  if (background) {
    background.style.pointerEvents = 'none';
  }

  const form = document.getElementById('form-registro-usuario');
  const btnRegistrar = document.getElementById('btn-registrar-usuario');
  const errorDiv = document.getElementById('error-registro');

  function validarFormularioRegistro() {
    const nombre = document.getElementById('registro-nombre')?.value.trim() || '';
    const email = document.getElementById('registro-email')?.value.trim() || '';
    const telefono = document.getElementById('registro-telefono')?.value.trim() || '';
    const dni = document.getElementById('registro-dni')?.value.trim() || '';
    const domicilio = document.getElementById('registro-domicilio')?.value.trim() || '';

    const emailValido = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const todosLlenos = nombre && email && telefono && dni && domicilio;

    btnRegistrar.disabled = !(todosLlenos && emailValido);
  }

  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validarFormularioRegistro);
  });

  // Validación inicial
  setTimeout(validarFormularioRegistro, 100);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const datos = {
      nombre: document.getElementById('registro-nombre')?.value.trim(),
      email: document.getElementById('registro-email')?.value.trim(),
      telefono: document.getElementById('registro-telefono')?.value.trim(),
      dni: document.getElementById('registro-dni')?.value.trim(),
      domicilio: document.getElementById('registro-domicilio')?.value.trim()
    };

    try {
      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const result = await response.json();

      if (!response.ok) {
        errorDiv.textContent = result.error || 
          (result.detalles ? result.detalles.join('. ') : 'Error al registrar');
        errorDiv.style.display = 'block';
        return;
      }

      // Cerrar modal antes de mostrar mensajes
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      document.body.classList.remove('is-clipped');

      // Éxito - mensajes con delays
      mostrarMensaje('¡Usuario registrado exitosamente!', 'success');

      setTimeout(() => {
        mostrarMensaje('Ahora ya puedes crear reservas', 'info');
      }, 1000);

      setTimeout(() => {
        window.location.href = 'crear_reservas.html';
      }, 2000);

      form.reset();
      btnRegistrar.disabled = true;
    } catch (error) {
      errorDiv.textContent = 'Error de conexión al servidor';
      errorDiv.style.display = 'block';
    }
  });
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarNavbar();
});