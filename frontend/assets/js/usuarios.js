const BASE_URL = 'http://localhost:3000';
let usuariosGlobal = [];
let usuarioSeleccionado = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarNavbar();
  cargarUsuarios();
  configurarTabs();
  configurarFormularios();
});

async function cargarUsuarios() {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`);
    if (!response.ok) throw new Error('Error al cargar usuarios');

    const data = await response.json();
    usuariosGlobal = data;

    mostrarUsuarios();
    poblarSelectUsuarios();
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('tabla-usuarios').innerHTML = `
      <tr>
        <td colspan="6" class="has-text-danger has-text-centered">
          Error al cargar usuarios: ${error.message}
        </td>
      </tr>
    `;
  }
}

function mostrarUsuarios(usuarios = usuariosGlobal) {
  const tbody = document.getElementById('tabla-usuarios');

  if (usuarios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="has-text-centered">
          <p>No hay usuarios registrados</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = usuarios.map(usuario => `
    <tr>
      <td>${usuario.nombre}</td>
      <td>${usuario.email}</td>
      <td>${usuario.telefono}</td>
      <td>${usuario.dni}</td>
      <td>${usuario.domicilio}</td>
      <td>
        <button class="button is-small is-warning" onclick="irAEditarUsuario(${usuario.id})">
          <span class="icon"><i class="fas fa-edit"></i></span>
        </button>
      </td>
    </tr>
  `).join('');
}

function poblarSelectUsuarios() {
  const select = document.getElementById('seleccionar-usuario');
  const options = usuariosGlobal.map(u => `<option value="${u.id}">${u.nombre} (${u.email})</option>`).join('');
  
  select.innerHTML = '<option value="">-- Selecciona un usuario --</option>' + options;
}

document.addEventListener('DOMContentLoaded', () => {
  const filtro = document.getElementById('filtro-usuarios');
  if (filtro) {
    filtro.addEventListener('input', () => {
      const termino = filtro.value.toLowerCase();
      const usuariosFiltrados = usuariosGlobal.filter(u =>
        u.nombre.toLowerCase().includes(termino) ||
        u.email.toLowerCase().includes(termino)
      );
      mostrarUsuarios(usuariosFiltrados);
    });
  }
});

function configurarTabs() {
  const tabs = document.querySelectorAll('.tabs li');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tabContents.forEach(c => c.classList.remove('is-active'));

      tab.classList.add('is-active');
      const tabName = tab.dataset.tab;
      document.getElementById(`tab-${tabName}`).classList.add('is-active');
    });
  });
}

function configurarFormularios() {
  const formCrear = document.getElementById('form-crear-usuario');
  if (formCrear) {
    formCrear.addEventListener('submit', crearUsuario);
  }

  const selectUsuario = document.getElementById('seleccionar-usuario');
  if (selectUsuario) {
    selectUsuario.addEventListener('change', cargarDatosUsuario);
  }

  const formEditar = document.getElementById('form-editar-usuario');
  if (formEditar) {
    formEditar.addEventListener('submit', editarUsuario);
  }

  const btnEliminar = document.getElementById('btn-eliminar-usuario');
  if (btnEliminar) {
    btnEliminar.addEventListener('click', abrirModalEliminar);
  }

  const modalEliminar = document.getElementById('modal-eliminar');
  if (modalEliminar) {
    document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => {
      modalEliminar.classList.remove('is-active');
    });

    modalEliminar.querySelector('.delete')?.addEventListener('click', () => {
      modalEliminar.classList.remove('is-active');
    });

    modalEliminar.querySelector('.modal-background').addEventListener('click', () => {
      modalEliminar.classList.remove('is-active');
    });

    document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', eliminarUsuario);
  }
}

async function crearUsuario(e) {
  e.preventDefault();

  const nombre = document.getElementById('crear-nombre').value.trim();
  const email = document.getElementById('crear-email').value.trim();
  const telefono = document.getElementById('crear-telefono').value.trim();
  const dni = document.getElementById('crear-dni').value.trim();
  const domicilio = document.getElementById('crear-domicilio').value.trim();

  const errorDiv = document.getElementById('error-crear');
  const exitoDiv = document.getElementById('exito-crear');
  errorDiv.style.display = 'none';
  exitoDiv.style.display = 'none';

  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, dni, domicilio })
    });

    const result = await response.json();

    if (!response.ok) {
      errorDiv.textContent = result.error || (result.detalles ? result.detalles.join('. ') : 'Error al crear');
      errorDiv.style.display = 'block';
      return;
    }

    exitoDiv.textContent = '✅ Usuario creado exitosamente';
    exitoDiv.style.display = 'block';

    document.getElementById('form-crear-usuario').reset();
    
    setTimeout(() => {
      cargarUsuarios();
      document.getElementById('filtro-usuarios').value = '';
    }, 500);

  } catch (error) {
    errorDiv.textContent = 'Error de conexión: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

function cargarDatosUsuario() {
  const select = document.getElementById('seleccionar-usuario');
  const id = select.value;
  const form = document.getElementById('form-editar-usuario');

  if (!id) {
    form.style.display = 'none';
    return;
  }

  const usuario = usuariosGlobal.find(u => u.id === parseInt(id));

  if (usuario) {
    document.getElementById('editar-nombre').value = usuario.nombre;
    document.getElementById('editar-email').value = usuario.email;
    document.getElementById('editar-telefono').value = usuario.telefono;
    document.getElementById('editar-dni').value = usuario.dni;
    document.getElementById('editar-domicilio').value = usuario.domicilio;

    usuarioSeleccionado = usuario;
    form.style.display = 'block';
  }
}

async function editarUsuario(e) {
  e.preventDefault();

  if (!usuarioSeleccionado) return;

  const nombre = document.getElementById('editar-nombre').value.trim();
  const email = document.getElementById('editar-email').value.trim();
  const telefono = document.getElementById('editar-telefono').value.trim();
  const dni = document.getElementById('editar-dni').value.trim();
  const domicilio = document.getElementById('editar-domicilio').value.trim();

  const errorDiv = document.getElementById('error-editar');
  const exitoDiv = document.getElementById('exito-editar');
  errorDiv.style.display = 'none';
  exitoDiv.style.display = 'none';

  try {
    const response = await fetch(`${BASE_URL}/usuarios/${usuarioSeleccionado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, dni, domicilio })
    });

    const result = await response.json();

    if (!response.ok) {
      errorDiv.textContent = result.error || (result.detalles ? result.detalles.join('. ') : 'Error al editar');
      errorDiv.style.display = 'block';
      return;
    }

    exitoDiv.textContent = '✅ Usuario actualizado exitosamente';
    exitoDiv.style.display = 'block';

    setTimeout(() => {
      cargarUsuarios();
      document.getElementById('seleccionar-usuario').value = '';
      document.getElementById('form-editar-usuario').style.display = 'none';
    }, 500);

  } catch (error) {
    errorDiv.textContent = 'Error de conexión: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

function abrirModalEliminar() {
  if (!usuarioSeleccionado) {
    alert('Por favor selecciona un usuario');
    return;
  }

  document.getElementById('nombre-eliminar').textContent = usuarioSeleccionado.nombre;
  document.getElementById('modal-eliminar').classList.add('is-active');
}

async function eliminarUsuario() {
  if (!usuarioSeleccionado) return;

  const modal = document.getElementById('modal-eliminar');
  modal.classList.remove('is-active');

  try {
    const response = await fetch(`${BASE_URL}/usuarios/${usuarioSeleccionado.id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      mostrarMensaje(result.error || 'Error al eliminar', 'danger');
      return;
    }

    mostrarMensaje('✅ Usuario eliminado exitosamente', 'success');

    setTimeout(() => {
      cargarUsuarios();
      document.getElementById('seleccionar-usuario').value = '';
      document.getElementById('form-editar-usuario').style.display = 'none';
    }, 500);

  } catch (error) {
    mostrarMensaje('Error de conexión: ' + error.message, 'danger');
  }
}

function irAEditarUsuario(id) {
  document.getElementById('seleccionar-usuario').value = id;
  cargarDatosUsuario();

  document.querySelectorAll('.tabs li').forEach(t => t.classList.remove('is-active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('is-active'));
  document.querySelector('[data-tab="editar"]').classList.add('is-active');
  document.getElementById('tab-editar').classList.add('is-active');
}
