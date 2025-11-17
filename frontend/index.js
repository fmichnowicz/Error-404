//Menu hamburguesa en dispositivos móbiles
const burgerIcon = document.querySelector('#burger');
const navBarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', () => {
    burgerIcon.classList.toggle('is-active');
    navBarMenu.classList.toggle('is-active');
});

//Menú desplegable en sección preguntas frecuentes
document.addEventListener('DOMContentLoaded', () => {
    const headings = document.querySelectorAll('.faq-panel .panel-heading');

    headings.forEach(heading => {
        heading.addEventListener('click', () => {
            const block = heading.nextElementSibling;      // el .panel-block
            const arrow = heading.querySelector('.arrow'); // la flechita

            // Alternar visibilidad
            block.classList.toggle('is-hidden');

            // Cambiar estado aria y flecha
            const isExpanded = !block.classList.contains('is-hidden');
            heading.setAttribute('aria-expanded', isExpanded);
            arrow.textContent = isExpanded ? '▲' : '▼';
        });
    });
});