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

// Modal para reservas
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
          <button id="btn-eliminar-usuario" class="button is-danger is-large m-2">
            <span class="icon"><i class="fas fa-user-minus"></i></span>
            <span>Eliminar</span>
          </button>
          <button id="btn-ver-usuarios" class="button is-dark is-large m-2">
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

  // Botón Eliminar
  const btnEliminar = modal.querySelector('#btn-eliminar-usuario');
  btnEliminar.addEventListener('click', () => {

    // Cerrar modal de gestión
    modal.classList.remove('is-active');
    modal.style.display = 'none';
    document.body.classList.remove('is-clipped');

    // Abrir modal de eliminación
    abrirModalEliminarUsuario();
  });

  // Botón Ver → redirige a ver_usuarios.html
  const btnVer = modal.querySelector('#btn-ver-usuarios');
  btnVer.addEventListener('click', () => {
    window.location.href = 'ver_usuarios.html';
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

  // === CONTADORES DE CARACTERES EN TIEMPO REAL ===
  const contadoresConfig = [
    { input: 'registro-nombre', contador: 'contador-nombre', max: 50 },
    { input: 'registro-email', contador: 'contador-email', max: 75 },
    { input: 'registro-telefono', contador: 'contador-telefono', max: 30 },
    { input: 'registro-dni', contador: 'contador-dni', max: 20 },
    { input: 'registro-domicilio', contador: 'contador-domicilio', max: 75 }
  ];

  contadoresConfig.forEach(({ input, contador, max }) => {
    const inputEl = document.getElementById(input);
    const contadorEl = document.getElementById(contador);

    if (!inputEl || !contadorEl) return;

    const actualizar = () => {
      const len = inputEl.value.length;
      contadorEl.textContent = `${len} / ${max}`;
      if (len >= max) {
        contadorEl.classList.add('maximo');
      } else {
        contadorEl.classList.remove('maximo');
      }
    };

    inputEl.addEventListener('input', actualizar);
    actualizar(); // Inicial
  });

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
        let mensajeError = 'Error al registrar usuario';

        // Si el backend nos da detalles claros (como en duplicados), los usamos directamente
        if (result.detalles) {
          if (Array.isArray(result.detalles)) {
            mensajeError = result.detalles.join('. ');
          } else {
            mensajeError = result.detalles;
          }
        } else if (result.error) {
          mensajeError = result.error;
        }

        errorDiv.textContent = mensajeError;
        errorDiv.style.display = 'block';
        return;
      }

      // Éxito
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      document.body.classList.remove('is-clipped');

      mostrarMensaje('¡Usuario registrado exitosamente!', 'success');

      setTimeout(() => {
        mostrarMensaje('Ahora ya puedes crear reservas', 'info');
      }, 1000);

      setTimeout(() => {
        window.location.href = 'crear_reservas.html';
      }, 2000);

      form.reset();
      btnRegistrar.disabled = true;

      // Resetear contadores
      document.querySelectorAll('.contador-caracteres').forEach(el => {
        const max = el.id.includes('nombre') ? 50 :
                    el.id.includes('email') ? 75 :
                    el.id.includes('telefono') ? 30 :
                    el.id.includes('dni') ? 20 : 75;
        el.textContent = `0 / ${max}`;
        el.classList.remove('maximo');
      });

    } catch (error) {
      errorDiv.textContent = 'Error de conexión al servidor';
      errorDiv.style.display = 'block';
    }
  });
}

// Modal para eliminar usuario
async function abrirModalEliminarUsuario() {
  // Limpiar modal viejo si existe
  let oldModal = document.getElementById('modal-eliminar-usuario');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-eliminar-usuario';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Eliminar Usuario</p>
        <!-- Ocultamos la cruz -->
        <button class="delete is-large" aria-label="close" style="display: none;"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Buscar por nombre</label>
          <div class="control">
            <input class="input" type="text" id="filtro-nombre-eliminar" placeholder="Escribe el nombre...">
          </div>
        </div>
        <div id="lista-usuarios-eliminar" class="menu mt-3" style="max-height: 200px; overflow-y: auto;"></div>
        <div id="info-usuario-seleccionado" class="mt-5" style="display: none;">
          <p><strong>Email:</strong> <span id="elim-email"></span></p>
          <p><strong>Teléfono:</strong> <span id="elim-telefono"></span></p>
          <p><strong>DNI:</strong> <span id="elim-dni"></span></p>
          <p><strong>Domicilio:</strong> <span id="elim-domicilio"></span></p>
          <p class="mt-3"><strong>Reservas a eliminar:</strong> <span id="elim-reservas-count" class="has-text-danger"></span></p>
        </div>
        <div class="field is-grouped is-grouped-centered mt-5">
          <div class="control">
            <button id="btn-cancelar-eliminar" class="button is-light">Cancelar</button>
          </div>
          <div class="control">
            <button id="btn-confirmar-eliminar" class="button is-danger" disabled>Confirmar eliminación</button>
          </div>
        </div>
      </section>
    </div>
  `;
  document.body.appendChild(modal);

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.zIndex = '1989';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  modal.classList.add('is-active');
  document.body.classList.add('is-clipped');

  // Cerrar solo con Cancelar
  document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
    modal.remove();
    document.body.classList.remove('is-clipped');
  });

  // Deshabilitar cierre con background
  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  const filtroInput = document.getElementById('filtro-nombre-eliminar');
  const listaUsuarios = document.getElementById('lista-usuarios-eliminar');
  const infoUsuario = document.getElementById('info-usuario-seleccionado');
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  let usuarioSeleccionado = null;

  // Fetch de usuarios
  const usuarios = await (async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  })();

  function filtrarYMostrarUsuarios() {
    const query = filtroInput.value.trim().toLowerCase();
    listaUsuarios.innerHTML = '';

    if (query.length < 2) {
      infoUsuario.style.display = 'none';
      btnConfirmar.disabled = true;
      return;
    }

    const coincidencias = usuarios.filter(u => u.nombre.toLowerCase().includes(query));

    if (coincidencias.length === 0) {
      listaUsuarios.innerHTML = '<p class="has-text-danger">No se encontraron usuarios</p>';
      infoUsuario.style.display = 'none';
      btnConfirmar.disabled = true;
      return;
    }

    coincidencias.forEach(u => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = u.nombre;
      item.addEventListener('click', async () => {
        // Actualizar el campo de búsqueda con el nombre seleccionado
        filtroInput.value = u.nombre;

        // Limpiar y ocultar la lista
        listaUsuarios.innerHTML = '';
        listaUsuarios.style.display = 'none';

        // Mostrar info del usuario seleccionado
        usuarioSeleccionado = u;
        document.getElementById('elim-email').textContent = u.email;
        document.getElementById('elim-telefono').textContent = u.telefono;
        document.getElementById('elim-dni').textContent = u.dni;
        document.getElementById('elim-domicilio').textContent = u.domicilio;

        // Fetch de cantidad de reservas
        try {
          const res = await fetch(`http://localhost:3000/reservas/count/${u.id}`);
          if (!res.ok) throw new Error('Error al contar reservas');
          const data = await res.json();
          const count = data.count || 0;
          document.getElementById('elim-reservas-count').textContent = `${count} reserva${count === 1 ? '' : 's'}`;
        } catch (err) {
          console.error(err);
          document.getElementById('elim-reservas-count').textContent = 'Error al contar reservas';
        }

        infoUsuario.style.display = 'block';
        btnConfirmar.disabled = false;
      });
      listaUsuarios.appendChild(item);
    });

    listaUsuarios.style.display = 'block';
  }

  filtroInput.addEventListener('input', filtrarYMostrarUsuarios);

  // Confirmar eliminación (sin modal adicional)
  btnConfirmar.addEventListener('click', async () => {
    if (!usuarioSeleccionado) return;

    try {
      const res = await fetch(`http://localhost:3000/usuarios/${usuarioSeleccionado.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');

      // Mensaje de éxito
      mostrarMensaje('Usuario eliminado exitosamente', 'success');

      // Refrescar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      modal.remove();
      document.body.classList.remove('is-clipped');
    } catch (err) {
      mostrarMensaje('Error al eliminar usuario', 'danger');
    }
  });
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarNavbar();
});