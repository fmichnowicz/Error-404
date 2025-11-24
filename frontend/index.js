//Menu hamburguesa en index-navbar para dispositivos móbiles
const burgerIcon = document.querySelector('#burger');
const navBarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', () => {
    burgerIcon.classList.toggle('is-active');
    navBarMenu.classList.toggle('is-active');
});

//Menú desplegable en index-FAQ en sección preguntas frecuentes 
document.addEventListener('DOMContentLoaded', function () {
    const toggles = document.querySelectorAll('.boton-desplegar');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const header = this.closest('.card-header');
            const content = header.nextElementSibling;
            const icon = this.querySelector('i');
            const wasOpen = !content.classList.contains('is-hidden');

            // Cerrar todas
            document.querySelectorAll('.contenido-desplegable').forEach(c => c.classList.add('is-hidden'));
            document.querySelectorAll('.boton-desplegar i').forEach(i => i.classList.replace('fa-minus', 'fa-plus'));

            // Abrir la que tocamos (si no estaba ya abierta)
            if (!wasOpen) {
                content.classList.remove('is-hidden');
                icon.classList.replace('fa-plus', 'fa-minus');
            }
        });
    });
});

//Transición de imágenes de fondo en navbar-hero
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const totalSlides = slides.length;
    const intervalTime = 3500; // Cambia cada 3 segundos y medio

    // Función para ir al siguiente slide
    function nextSlide() {
        // Oculta el actual
        slides[currentSlide].classList.remove('active');
        
        // Siguiente (vuelve al primero si es el último)
        currentSlide = (currentSlide + 1) % totalSlides;
        
        // Muestra el nuevo
        slides[currentSlide].classList.add('active');
    }

    // Cambia automáticamente
    setInterval(nextSlide, intervalTime);
});