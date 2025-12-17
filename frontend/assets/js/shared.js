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