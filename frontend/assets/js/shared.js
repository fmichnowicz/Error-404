// frontend/assets/js/shared.js

// Función para mostrar mensajes flotantes
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

// Cargar navbar
function cargarNavbar() {
    fetch('navbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar navbar');
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            activarBurgerMenu();
            manejarModalRegistroUsuario();

            // Llamamos a manejarModalReservas DESPUÉS de insertar el navbar
            manejarModalReservas();
        })
        .catch(err => {
            console.error('Error cargando navbar:', err);
            document.getElementById('navbar-container').innerHTML = 
                '<p class="has-text-danger">Error al cargar el menú</p>';
        });
}

// Burger menu
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

// Modal de Reservas - SOLO cierra con la X
function manejarModalReservas() {
    const trigger = document.getElementById('reservas-trigger');
    if (!trigger) {
        console.log('Trigger reservas no encontrado');
        return;
    }

    // Limpiar cualquier modal viejo que pueda quedar
    let oldModal = document.getElementById('modal-reservas');
    if (oldModal) {
        oldModal.remove(); // Borramos el viejo para evitar duplicados
    }

    // Crear el modal fresco
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

    // Forzar estilos de Bulma
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.zIndex = '1986';
    modal.style.display = 'none'; // Empieza oculto
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    // Abrir con click
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Click en Reservas detectado - abriendo modal');
        modal.style.display = 'flex'; // Mostrar con flex para centrar
        modal.classList.add('is-active');
        document.body.classList.add('is-clipped'); // Bloquea scroll
    });

    // Cerrar con X o fondo
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete') || 
            e.target.closest('.delete')) {
            modal.classList.remove('is-active');
            modal.style.display = 'none';
            document.body.classList.remove('is-clipped');
        }
    });
}

// Modal de Registro de Usuario - SOLO cierra con la X
function manejarModalRegistroUsuario() {
  const trigger = document.querySelector('.modal-trigger[data-target="modal-registrar-usuario"]');
  const modal = document.getElementById('modal-registrar-usuario');

  if (!trigger || !modal) return;

  // Abrir
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('is-active');
  });

  // SOLO cerrar con la X
  modal.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('is-active');
      document.getElementById('form-registro-usuario').reset();
      document.getElementById('error-registro').style.display = 'none';
      document.getElementById('btn-registrar-usuario').disabled = true;
    });
  });

  // Deshabilitar cierre con background
  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  // Formulario
  const form = document.getElementById('form-registro-usuario');
  const btnRegistrar = document.getElementById('btn-registrar-usuario');
  const errorDiv = document.getElementById('error-registro');

  // Validación en tiempo real
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validarFormularioRegistro);
  });

  function validarFormularioRegistro() {
    const nombre = document.getElementById('registro-nombre').value.trim();
    const email = document.getElementById('registro-email').value.trim();
    const telefono = document.getElementById('registro-telefono').value.trim();
    const dni = document.getElementById('registro-dni').value.trim();
    const domicilio = document.getElementById('registro-domicilio').value.trim();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const todosLlenos = nombre && email && telefono && dni && domicilio;
    btnRegistrar.disabled = !(todosLlenos && emailValido);
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const datos = {
      nombre: document.getElementById('registro-nombre').value.trim(),
      email: document.getElementById('registro-email').value.trim(),
      telefono: document.getElementById('registro-telefono').value.trim(),
      dni: document.getElementById('registro-dni').value.trim(),
      domicilio: document.getElementById('registro-domicilio').value.trim()
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

      // Éxito
      mostrarMensaje('¡Usuario registrado exitosamente!', 'success');

      setTimeout(() => {
        mostrarMensaje('Ahora ya puedes crear reservas', 'info');
      }, 1000);

      setTimeout(() => {
        window.location.href = 'crear_reservas.html';
      }, 2000);

      // Limpiar
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