//Menu hamburguesa en dispositivos móbiles
const burgerIcon = document.querySelector('#burger');
const navBarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', () => {
    burgerIcon.classList.toggle('is-active');
    navBarMenu.classList.toggle('is-active');
});

//Menú desplegable en sección preguntas frecuentes
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