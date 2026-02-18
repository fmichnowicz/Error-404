// frontend/assets/js/ver_usuarios.js

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('usuarios-container');
  const filtroInput = document.getElementById('filtro-nombre-ver-usuarios');
  const paginacion = document.getElementById('paginacion');

  let usuarios = [];
  let paginaActual = 1;
  const cardsPorPagina = 12; // 3 filas × 4 cards

  // Cargar usuarios
  try {
    const response = await fetch('http://localhost:3000/usuarios');
    if (!response.ok) throw new Error('Error al cargar usuarios');
    usuarios = await response.json();

    if (usuarios.length === 0) {
      container.innerHTML = '<p class="has-text-centered has-text-grey">No hay usuarios registrados aún.</p>';
      return;
    }

    mostrarUsuarios(usuarios);
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p class="has-text-danger has-text-centered">Error al cargar los usuarios</p>';
  }

  // Función para mostrar usuarios (con paginación y filtro)
  function mostrarUsuarios(lista) {
    container.innerHTML = '';

    const inicio = (paginaActual - 1) * cardsPorPagina;
    const fin = inicio + cardsPorPagina;
    const paginaUsuarios = lista.slice(inicio, fin);

    paginaUsuarios.forEach(usuario => {
      const card = document.createElement('div');
      card.className = 'hex-card';
      card.innerHTML = `
        <div class="hex-card-content">
          <div class="hex-card-title">${usuario.nombre}</div>
          <div class="hex-card-info">
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
            <p><strong>DNI:</strong> ${usuario.dni}</p>
            <p><strong>Domicilio:</strong> ${usuario.domicilio}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Paginación
    const totalPaginas = Math.ceil(lista.length / cardsPorPagina);
    paginacion.innerHTML = '';

    if (totalPaginas > 1) {
      paginacion.style.display = 'flex';

      // Anterior
      const anterior = document.createElement('div');
      anterior.className = 'pagination-button';
      anterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
      anterior.addEventListener('click', () => {
        if (paginaActual > 1) {
          paginaActual--;
          mostrarUsuarios(lista);
        }
      });
      paginacion.appendChild(anterior);

      // Números
      for (let i = 1; i <= totalPaginas; i++) {
        const num = document.createElement('div');
        num.className = 'pagination-number';
        num.textContent = i;
        if (i === paginaActual) num.classList.add('active');
        num.addEventListener('click', () => {
          paginaActual = i;
          mostrarUsuarios(lista);
        });
        paginacion.appendChild(num);
      }

      // Siguiente
      const siguiente = document.createElement('div');
      siguiente.className = 'pagination-button';
      siguiente.innerHTML = '<i class="fas fa-chevron-right"></i>';
      siguiente.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
          paginaActual++;
          mostrarUsuarios(lista);
        }
      });
      paginacion.appendChild(siguiente);
    } else {
      paginacion.style.display = 'none';
    }
  }

  // Filtro por nombre (ignora mayúsculas, acentos y espacios extra)
  filtroInput.addEventListener('input', () => {
    const query = filtroInput.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtrados = usuarios.filter(u => {
      const nombreNormalizado = u.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return nombreNormalizado.includes(query);
    });

    paginaActual = 1; // Resetear a página 1 al filtrar
    mostrarUsuarios(filtrados);
  });
});