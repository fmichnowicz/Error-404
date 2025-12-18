<<<<<<< HEAD
// Función para mostrar mensajes flotantes, con tipo
function mostrarMensaje(texto, tipo = 'success') {
    const existente = document.querySelector('.mensaje-flotante');
    if (existente) existente.remove();

    const div = document.createElement('div');
    div.className = `notification is-${tipo} mensaje-flotante`;
    div.style.position = 'fixed';
    div.style.top = '100px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.zIndex = '1000';
    div.style.padding = '1.5rem 2rem';
    div.style.borderRadius = '12px';
    div.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    div.style.fontWeight = '600';
    div.style.minWidth = '300px';
    div.style.textAlign = 'center';
    div.style.backdropFilter = 'blur(10px)';
    div.textContent = texto;

    document.body.appendChild(div);

    div.style.opacity = '0';
    div.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => {
        div.style.transition = 'all 0.3s ease';
        div.style.opacity = '1';
        div.style.transform = 'translateX(-50%)';
    }, 10);

    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => div.remove(), 300);
    }, 4000);
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
            manejarModalReservas();
            manejarModalRegistroUsuario();
        })
        .catch(err => {
            console.error('Error cargando navbar:', err);
            document.getElementById('navbar-container').innerHTML =
                '<p class="has-text-danger">Error al cargar el menú</p>';
        });
}

=======
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
      manejarModalReservas();
      manejarModalRegistroUsuario();
    })
    .catch(err => {
      console.error('Error cargando navbar:', err);
      document.getElementById('navbar-container').innerHTML = 
        '<p class="has-text-danger">Error al cargar el menú</p>';
    });
}

>>>>>>> eb02c3594591941bf4c615f2b4634071ccfbc85e
// Burger menu
function activarBurgerMenu() {
  const burger = document.querySelector('.navbar-burger');
  const menu = document.querySelector('.navbar-menu');

<<<<<<< HEAD
    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }
=======
  if (burger && menu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  }
>>>>>>> eb02c3594591941bf4c615f2b4634071ccfbc85e
}

// Modal de Reservas - SOLO cierra con la X
function manejarModalReservas() {
<<<<<<< HEAD
    const trigger = document.querySelector('.modal-trigger[data-target="modal-reservas"]');
    const modal = document.getElementById('modal-reservas');
=======
  const trigger = document.querySelector('.modal-trigger[data-target="modal-reservas"]');
  const modal = document.getElementById('modal-reservas');
>>>>>>> eb02c3594591941bf4c615f2b4634071ccfbc85e

  if (!trigger || !modal) return;

<<<<<<< HEAD
    // Abrir
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('is-active');
=======
  // Abrir
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('is-active');
  });

  // SOLO cerrar con la X (class="delete")
  modal.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('is-active');
>>>>>>> eb02c3594591941bf4c615f2b4634071ccfbc85e
    });
  });

<<<<<<< HEAD
    // SOLO cerrar con la X (class="delete")
    modal.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('is-active');
        });
    });

    // Deshabilitar cierre con background
    modal.querySelector('.modal-background').style.pointerEvents = 'none';
}

function manejarModalRegistroUsuario() {
    const trigger = document.querySelector('.modal-trigger[data-target="modal-registrar-usuario"]');
    const modal = document.getElementById('modal-registrar-usuario');

    if (!trigger || !modal) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('is-active');
    });

    modal.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('is-active');
            document.getElementById('form-registro-usuario').reset();
            document.getElementById('error-registro').style.display = 'none';
            document.getElementById('btn-registrar-usuario').disabled = true;
        });
    });

    modal.querySelector('.modal-background').style.pointerEvents = 'none';

    // Formulario
    const form = document.getElementById('form-registro-usuario');
    const btnRegistrar = document.getElementById('btn-registrar-usuario');
    const errorDiv = document.getElementById('error-registro');

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

document.addEventListener('DOMContentLoaded', () => {
    cargarNavbar();
=======
  // Deshabilitar cierre con background
  modal.querySelector('.modal-background').style.pointerEvents = 'none';
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
>>>>>>> eb02c3594591941bf4c615f2b4634071ccfbc85e
});