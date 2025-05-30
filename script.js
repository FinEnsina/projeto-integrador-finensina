// Toggle entre login e signup 
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
}

// Toggle entre homepage e tela de login/signup
const homeLink = document.getElementById('homeLink');
const loginLink = document.getElementById('loginLink');
const homepage = document.getElementById('homepage');
const authContainer = document.getElementById('authContainer');

homeLink.addEventListener('click', function (e) {
    e.preventDefault();
    homepage.classList.add('active');
    authContainer.classList.remove('active');
    document.body.style.background = 'var(--color-header-purple)';
});

loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    authContainer.classList.add('active');
    homepage.classList.remove('active');
    document.body.style.background = 'var(--color-light-beige)';
    
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
});

// Inicializa homepage
window.addEventListener('DOMContentLoaded', function () {
    homepage.classList.add('active');
    authContainer.classList.remove('active');
    document.body.style.background = 'var(--color-header-purple)';
});