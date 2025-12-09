//Menu hamburguesa en index-navbar para dispositivos móbiles
const burgerIcon = document.querySelector('#burger');
const navBarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', () => {
    burgerIcon.classList.toggle('is-active');
    navBarMenu.classList.toggle('is-active');
});