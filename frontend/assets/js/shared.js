// frontend/assets/js/shared.js

function normalizeString(str) {
    if (!str) return '';
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

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
          <button id="btn-abrir-modificar-usuario" class="button is-info is-large m-2">
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

  // Botón Modificar → cerrar gestión y abrir modal de modificación
  const btnModificar = modal.querySelector('#btn-abrir-modificar-usuario');
  btnModificar.addEventListener('click', () => {
    // Cerrar modal de gestión
    modal.classList.remove('is-active');
    modal.style.display = 'none';
    document.body.classList.remove('is-clipped');

    // Abrir modal de modificación
    abrirModalModificarUsuario();
  });

}

// Modal de Registro de Usuario
function manejarModalRegistroUsuario() {
  const modal = document.getElementById('modal-registrar-usuario');
  if (!modal) return;

  // Cerrar solo con X
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
    const query = normalizeString(filtroInput.value.trim());

    listaUsuarios.innerHTML = '';

    if (query.length < 2) {
        infoUsuario.style.display = 'none';
        btnConfirmar.disabled = true;
        return;
    }

    const coincidencias = usuarios.filter(u => normalizeString(u.nombre).includes(query));

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
            filtroInput.value = u.nombre;
            listaUsuarios.innerHTML = '';
            listaUsuarios.style.display = 'none';

            usuarioSeleccionado = u;
            document.getElementById('elim-email').textContent = u.email;
            document.getElementById('elim-telefono').textContent = u.telefono;
            document.getElementById('elim-dni').textContent = u.dni;
            document.getElementById('elim-domicilio').textContent = u.domicilio;

            try {
                const res = await fetch(`http://localhost:3000/reservas/count/${u.id}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                const count = data.count || 0;
                document.getElementById('elim-reservas-count').textContent = `${count} reserva${count === 1 ? '' : 's'}`;
            } catch (err) {
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

  // Confirmar eliminación
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

// Modal para modificar usuario
async function abrirModalModificarUsuario() {
  // Limpiar modal viejo si existe
  let oldModal = document.getElementById('modal-modificar-usuario');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-modificar-usuario';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Modificar Usuario</p>
        <button class="delete is-large" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <form id="form-modificar-usuario">
          <div class="field">
            <label class="label">Buscar usuario por nombre</label>
            <div class="control">
              <input class="input" type="text" id="filtro-nombre-modificar" placeholder="Escribe al menos 2 letras...">
            </div>
          </div>
          <div id="lista-usuarios-modificar" class="menu mt-3" style="max-height: 200px; overflow-y: auto; display: none;"></div>

          <div id="campos-edicion" style="display: none;">
            <input type="hidden" id="modificar-id">

            <div class="field mt-5">
              <label class="label">Nombre completo <span class="has-text-danger">*</span></label>
              <div class="control has-icons-left">
                <input class="input" type="text" id="modificar-nombre" maxlength="50" required>
                <span class="icon is-left"><i class="fas fa-user"></i></span>
              </div>
              <div class="is-flex is-justify-content-space-between is-align-items-center mt-2">
                <p class="help has-text-grey">Ej: Fernando Martínez</p>
                <p class="help contador-caracteres" id="contador-mod-nombre">0 / 50</p>
              </div>
            </div>

            <div class="field">
              <label class="label">Email <span class="has-text-danger">*</span></label>
              <div class="control has-icons-left">
                <input class="input" type="email" id="modificar-email" maxlength="75" required>
                <span class="icon is-left"><i class="fas fa-envelope"></i></span>
              </div>
              <div class="is-flex is-justify-content-space-between is-align-items-center mt-2">
                <p class="help has-text-grey">Ej: usuario@dominio.com</p>
                <p class="help contador-caracteres" id="contador-mod-email">0 / 75</p>
              </div>
            </div>

            <div class="field">
              <label class="label">Teléfono <span class="has-text-danger">*</span></label>
              <div class="control has-icons-left">
                <input class="input" type="text" id="modificar-telefono" maxlength="30" required>
                <span class="icon is-left"><i class="fas fa-phone"></i></span>
              </div>
              <div class="is-flex is-justify-content-flex-end is-align-items-center mt-2">
                <p class="help contador-caracteres" id="contador-mod-telefono">0 / 30</p>
              </div>
            </div>

            <div class="field">
              <label class="label">DNI <span class="has-text-danger">*</span></label>
              <div class="control">
                <input class="input" type="text" id="modificar-dni" maxlength="20" required>
              </div>
              <div class="is-flex is-justify-content-flex-end is-align-items-center mt-2">
                <p class="help contador-caracteres" id="contador-mod-dni">0 / 20</p>
              </div>
            </div>

            <div class="field">
              <label class="label">Domicilio <span class="has-text-danger">*</span></label>
              <div class="control">
                <input class="input" type="text" id="modificar-domicilio" maxlength="75" required>
              </div>
              <div class="is-flex is-justify-content-flex-end is-align-items-center mt-2">
                <p class="help contador-caracteres" id="contador-mod-domicilio">0 / 75</p>
              </div>
            </div>

            <div id="error-modificar" class="notification is-danger is-light mt-4" style="display: none;"></div>

            <div class="field is-grouped is-grouped-centered mt-5">
              <div class="control">
                <button type="button" id="btn-cancelar-modificar" class="button is-light">Cancelar</button>
              </div>
              <div class="control">
                <button type="submit" class="button is-primary" id="btn-confirmar-cambios" disabled>Confirmar cambios</button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  `;

  document.body.appendChild(modal);

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.zIndex = '1990';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.classList.add('is-active');
  document.body.classList.add('is-clipped');

  // Cerrar con X o Cancelar
  modal.querySelector('.delete').addEventListener('click', cerrarModal);
  document.getElementById('btn-cancelar-modificar').addEventListener('click', cerrarModal);

  function cerrarModal() {
    modal.remove();
    document.body.classList.remove('is-clipped');
  }

  // Deshabilitar background click
  modal.querySelector('.modal-background').style.pointerEvents = 'none';

  const filtroInput = document.getElementById('filtro-nombre-modificar');
  const listaUsuarios = document.getElementById('lista-usuarios-modificar');
  const camposEdicion = document.getElementById('campos-edicion');
  const errorDiv = document.getElementById('error-modificar');
  const btnConfirmar = document.getElementById('btn-confirmar-cambios');

  let usuarios = [];
  let usuarioSeleccionado = null;

  // Cargar usuarios
  try {
    const res = await fetch('http://localhost:3000/usuarios');
    if (!res.ok) throw new Error();
    usuarios = await res.json();
  } catch (err) {
    errorDiv.textContent = 'Error al cargar usuarios';
    errorDiv.style.display = 'block';
    return;
  }

  // Normalizar nombre (quitar acentos y pasar a minúsculas)
  function normalizar(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function filtrarUsuarios() {
    const query = normalizar(filtroInput.value.trim());
    listaUsuarios.innerHTML = '';
    listaUsuarios.style.display = 'none';

    if (query.length < 2) {
      camposEdicion.style.display = 'none';
      btnConfirmar.disabled = true;
      return;
    }

    const coincidencias = usuarios.filter(u => normalizar(u.nombre).includes(query));

    if (coincidencias.length === 0) {
      listaUsuarios.innerHTML = '<p class="panel-block has-text-danger">No se encontraron usuarios</p>';
      listaUsuarios.style.display = 'block';
      return;
    }

    coincidencias.forEach(u => {
      const item = document.createElement('a');
      item.className = 'panel-block is-clickable';
      item.textContent = u.nombre;
      item.addEventListener('click', () => {
        usuarioSeleccionado = u;
        document.getElementById('modificar-id').value = u.id;
        document.getElementById('modificar-nombre').value = u.nombre;
        document.getElementById('modificar-email').value = u.email;
        document.getElementById('modificar-telefono').value = u.telefono;
        document.getElementById('modificar-dni').value = u.dni;
        document.getElementById('modificar-domicilio').value = u.domicilio;

        // Actualizar contadores
        actualizarContadores();

        listaUsuarios.style.display = 'none';
        filtroInput.value = u.nombre;
        camposEdicion.style.display = 'block';
        validarFormularioModificar();
      });
      listaUsuarios.appendChild(item);
    });

    listaUsuarios.style.display = 'block';
  }

  filtroInput.addEventListener('input', filtrarUsuarios);

  // Contadores
  const contadoresMod = [
    { input: 'modificar-nombre', contador: 'contador-mod-nombre', max: 50 },
    { input: 'modificar-email', contador: 'contador-mod-email', max: 75 },
    { input: 'modificar-telefono', contador: 'contador-mod-telefono', max: 30 },
    { input: 'modificar-dni', contador: 'contador-mod-dni', max: 20 },
    { input: 'modificar-domicilio', contador: 'contador-mod-domicilio', max: 75 }
  ];

  function actualizarContadores() {
    contadoresMod.forEach(({ input, contador, max }) => {
      const inputEl = document.getElementById(input);
      const contadorEl = document.getElementById(contador);
      if (inputEl && contadorEl) {
        const len = inputEl.value.length;
        contadorEl.textContent = `${len} / ${max}`;
        contadorEl.classList.toggle('maximo', len >= max);
      }
    });
  }

  contadoresMod.forEach(({ input }) => {
    document.getElementById(input).addEventListener('input', () => {
      actualizarContadores();
      validarFormularioModificar();
    });
  });

  // Validación del formulario
  function validarFormularioModificar() {
    const nombre = document.getElementById('modificar-nombre').value.trim();
    const email = document.getElementById('modificar-email').value.trim();
    const telefono = document.getElementById('modificar-telefono').value.trim();
    const dni = document.getElementById('modificar-dni').value.trim();
    const domicilio = document.getElementById('modificar-domicilio').value.trim();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const todosLlenos = nombre && email && telefono && dni && domicilio;

    btnConfirmar.disabled = !(todosLlenos && emailValido);
  }

  // Submit
  document.getElementById('form-modificar-usuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const datos = {
      nombre: document.getElementById('modificar-nombre').value.trim(),
      email: document.getElementById('modificar-email').value.trim(),
      telefono: document.getElementById('modificar-telefono').value.trim(),
      dni: document.getElementById('modificar-dni').value.trim(),
      domicilio: document.getElementById('modificar-domicilio').value.trim()
    };

    const id = document.getElementById('modificar-id').value;

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const result = await response.json();

      if (!response.ok) {
        let mensaje = result.detalles || result.error || 'Error al actualizar usuario';
        if (Array.isArray(result.detalles)) mensaje = result.detalles.join('. ');
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        return;
      }

      // Éxito
      cerrarModal();
      mostrarMensaje('Usuario actualizado exitosamente', 'success');

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      errorDiv.textContent = 'Error de conexión al servidor';
      errorDiv.style.display = 'block';
    }
  });
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarNavbar();
});

export const API_URL = "postgresql://postgres.xlksloighorolqdqimtv:[TrabajoFinalDesarrollo2025]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres";