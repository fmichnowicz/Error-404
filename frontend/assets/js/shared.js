// Función para cargar el navbar desde navbar.html
function cargarNavbar() {
    fetch('navbar.html')
        .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el navbar');
        }
        return response.text();
        })
        .then(data => {
        // Insertamos el navbar en el contenedor
        document.getElementById('navbar-container').innerHTML = data;

        // Activamos el burger menu después de cargar el navbar
        activarBurgerMenu();
        })
        .catch(err => {
        console.error('Error cargando navbar:', err);
        document.getElementById('navbar-container').innerHTML = 
            '<p class="has-text-danger">Error al cargar el menú</p>';
        });
}

// Función para activar el menú burger (responsive)
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

// Cuando el DOM esté listo, cargamos el navbar
document.addEventListener('DOMContentLoaded', () => {
    cargarNavbar();
});

// Función para manejar el modal de Reservas
function manejarModalReservas() {
    const trigger = document.querySelector('.modal-trigger[data-target="modal-reservas"]');
    const modal = document.getElementById('modal-reservas');
    const closeBtn = modal.querySelector('.delete');
    const background = modal.querySelector('.modal-background');

    if (!trigger || !modal) return;

    // Abrir modal
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('is-active');
    });

    // Cerrar con la X
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('is-active');
    });

  // NO cerrar al hacer click en el fondo (como pediste)
  // background.addEventListener('click', () => modal.classList.remove('is-active'));

  // NO cerrar con Escape (opcional, comentado)
  // document.addEventListener('keydown', (e) => {
  //   if (e.key === 'Escape') modal.classList.remove('is-active');
  // });
}

// Llamar después de cargar el navbar
function cargarNavbar() {
    fetch('navbar.html')
        .then(response => {
        if (!response.ok) throw new Error('Error al cargar navbar');
        return response.text();
        })
        .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        activarBurgerMenu();
        manejarModalReservas(); // ← Activar el modal
        })
        .catch(err => {
        console.error(err);
        document.getElementById('navbar-container').innerHTML = '<p class="has-text-danger">Error al cargar menú</p>';
        });
}