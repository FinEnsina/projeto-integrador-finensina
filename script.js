// ========================================
// FINENSINA - SCRIPT PRINCIPAL
// ========================================

// ========================================
// FUNÇÕES DE AUTENTICAÇÃO
// ========================================

// Toggle entre login e signup 
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
}

// Função para atualizar interface do usuário
function updateUserInterface() {
    const userName = localStorage.getItem('user_name');
    const userId = localStorage.getItem('usuario_id');
    const userNameElement = document.getElementById('userName');
    const loginLink = document.getElementById('loginLink');
    const hamburgerMenu = document.getElementById('hamburgerMenu');

    if (userName && userId) {
        // Usuário logado
        userNameElement.textContent = `Olá, ${userName.split(' ')[0]}!`;
        userNameElement.style.display = 'inline';
        loginLink.style.display = 'none';
        hamburgerMenu.style.display = 'block';
    } else {
        // Usuário não logado
        userNameElement.style.display = 'none';
        loginLink.style.display = 'inline-block';
        hamburgerMenu.style.display = 'none';
        hamburgerMenu.classList.remove('active');
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('user_name');
    updateUserInterface();
    
    // Voltar para homepage
    homepage.classList.add('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'none';
    document.body.style.background = 'var(--color-header-purple)';
    
    // Remover classe quiz-active
    document.querySelector('.main-content').classList.remove('quiz-active');
    document.body.classList.remove('quiz-active');
    
    showMessage('Logout realizado com sucesso!', false);
}

// ========================================
// ELEMENTOS DOM
// ========================================

const homeLink = document.getElementById('homeLink');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');
const hamburgerIcon = document.getElementById('hamburgerIcon');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const profileLink = document.getElementById('profileLink');
const progressLink = document.getElementById('progressLink');
const homepage = document.getElementById('homepage');
const authContainer = document.getElementById('authContainer');

// ========================================
// MENU HAMBÚRGUER
// ========================================

// Função para alternar menu hambúrguer
function toggleHamburgerMenu() {
    hamburgerMenu.classList.toggle('active');
}

// Fechar menu ao clicar fora
document.addEventListener('click', function(e) {
    if (!hamburgerMenu.contains(e.target)) {
        hamburgerMenu.classList.remove('active');
    }
});

hamburgerIcon.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleHamburgerMenu();
});

logoutLink.addEventListener('click', function (e) {
    e.preventDefault();
    logout();
    hamburgerMenu.classList.remove('active');
});

profileLink.addEventListener('click', function (e) {
    e.preventDefault();
    showMessage('Funcionalidade em desenvolvimento!', false);
    hamburgerMenu.classList.remove('active');
});

progressLink.addEventListener('click', function (e) {
    e.preventDefault();
    showMessage('Funcionalidade em desenvolvimento!', false);
    hamburgerMenu.classList.remove('active');
});

// ========================================
// NAVEGAÇÃO
// ========================================

homeLink.addEventListener('click', function (e) {
    e.preventDefault();
    homepage.classList.add('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'none';
    document.body.style.background = 'var(--color-header-purple)';
    
    // Remover classe quiz-active
    document.querySelector('.main-content').classList.remove('quiz-active');
    document.body.classList.remove('quiz-active');
});

loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    authContainer.classList.add('active');
    homepage.classList.remove('active');
    quizContainer.style.display = 'none';
    document.body.style.background = 'var(--color-light-beige)';
    
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    
    // Remover classe quiz-active
    document.querySelector('.main-content').classList.remove('quiz-active');
    document.body.classList.remove('quiz-active');
});

// ========================================
// INICIALIZAÇÃO
// ========================================

window.addEventListener('DOMContentLoaded', function () {
    homepage.classList.add('active');
    authContainer.classList.remove('active');
    document.body.style.background = 'var(--color-header-purple)';
    
    // Verificar se usuário está logado
    updateUserInterface();
    
    // Adiciona listener para o botão do quiz na homepage
    const playQuizBtn = document.getElementById('playQuizBtn');
    if (playQuizBtn) {
        playQuizBtn.addEventListener('click', function() {
            startQuiz();
        });
    }
});

// ========================================
// UTILITÁRIOS
// ========================================

// Função para exibir mensagens
function showMessage(message, isError = true) {
    let msgDiv = document.getElementById('msgBox');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'msgBox';
        msgDiv.style.position = 'fixed';
        msgDiv.style.top = '20px';
        msgDiv.style.left = '50%';
        msgDiv.style.transform = 'translateX(-50%)';
        msgDiv.style.padding = '12px 24px';
        msgDiv.style.borderRadius = '8px';
        msgDiv.style.zIndex = '9999';
        msgDiv.style.fontWeight = 'bold';
        msgDiv.style.fontSize = '1rem';
        document.body.appendChild(msgDiv);
    }
    msgDiv.style.background = isError ? '#ffb3b3' : '#b3ffb3';
    msgDiv.style.color = isError ? '#900' : '#060';
    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
    setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

// ========================================
// AUTENTICAÇÃO
// ========================================

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const senha = loginForm.querySelector('input[type="password"]').value;
    
    const res = await fetch('backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    
    if (data.success) {
        // Salva usuario_id e nome no localStorage
        localStorage.setItem('usuario_id', data.id);
        localStorage.setItem('user_name', data.nome);
        
        // Atualiza interface
        updateUserInterface();
        
        showMessage('Login realizado com sucesso!', false);
        
        // Sincroniza progresso local com backend
        syncLocalProgress(data.id);
        
        setTimeout(() => { startQuiz(); }, 1200);
    } else {
        showMessage(data.message || 'Erro ao fazer login.');
    }
});

// Cadastro
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const nome = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelectorAll('input[type="email"]')[0].value;
    const senha = signupForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmar = signupForm.querySelectorAll('input[type="password"]')[1].value;
    
    if (senha !== confirmar) {
        showMessage('As senhas não coincidem!');
        return;
    }
    
    const res = await fetch('backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();
    
    if (data.success) {
        showMessage('Cadastro realizado! Faça login.', false);
        toggleForms();
    } else {
        showMessage(data.message || 'Erro ao cadastrar.');
    }
});

// ========================================
// QUIZ
// ========================================

// Perguntas do quiz
const quizQuestions = [
    {
        question: 'O que é um orçamento?',
        options: [
            'Um tipo de investimento',
            'Um planejamento de receitas e despesas',
            'Um imposto cobrado pelo governo',
            'Uma conta bancária especial'
        ],
        answer: 1
    },
    {
        question: 'Qual destas é uma boa prática financeira?',
        options: [
            'Gastar todo o dinheiro assim que receber',
            'Guardar parte do dinheiro para emergências',
            'Comprar tudo parcelado',
            'Nunca anotar os gastos'
        ],
        answer: 1
    },
    {
        question: 'O que significa investir?',
        options: [
            'Guardar dinheiro embaixo do colchão',
            'Aplicar dinheiro para tentar obter mais no futuro',
            'Gastar em jogos e brinquedos',
            'Pagar contas atrasadas'
        ],
        answer: 1
    },
    {
        question: 'O que é uma despesa?',
        options: [
            'Dinheiro que você recebe',
            'Dinheiro que você gasta',
            'Dinheiro que você empresta',
            'Dinheiro que você encontra na rua'
        ],
        answer: 1
    },
    {
        question: 'Por que é importante comparar preços antes de comprar?',
        options: [
            'Para gastar mais',
            'Para economizar e fazer boas escolhas',
            'Para perder tempo',
            'Para agradar os vendedores'
        ],
        answer: 1
    }
];

let currentQuestion = 0;
let score = 0;

const quizContainer = document.getElementById('quizContainer');
const quizContent = document.getElementById('quizContent');
const quizProgress = document.getElementById('quizProgress');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const quizResult = document.getElementById('quizResult');

// Função para salvar progresso localmente
function saveLocalProgress(pontuacao) {
    const progressData = {
        pontuacao: pontuacao,
        data: new Date().toISOString(),
        quiz_id: 1
    };
    localStorage.setItem('quiz_progress', JSON.stringify(progressData));
}

// Função para sincronizar progresso local com backend
function syncLocalProgress(usuario_id) {
    const localProgress = localStorage.getItem('quiz_progress');
    if (localProgress) {
        const progress = JSON.parse(localProgress);
        fetch('backend/save_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuario_id, 
                quiz_id: progress.quiz_id, 
                pontuacao: progress.pontuacao 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('quiz_progress');
                showMessage('Progresso sincronizado!', false);
            }
        })
        .catch(() => {
            // Se falhar, mantém o progresso local
        });
    }
}

// Função para mostrar uma pergunta
function showQuestion(index) {
    const q = quizQuestions[index];
    
    quizContent.innerHTML = `
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">
            <button class="quiz-option" data-index="0" style="background: var(--color-yellow); color: var(--color-dark-text); border: none; border-radius: 8px; padding: 16px 20px; font-size: 1.1rem; font-weight: 600; cursor: pointer; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0;">${q.options[0]}</button>
            <button class="quiz-option" data-index="1" style="background: var(--color-yellow); color: var(--color-dark-text); border: none; border-radius: 8px; padding: 16px 20px; font-size: 1.1rem; font-weight: 600; cursor: pointer; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0;">${q.options[1]}</button>
            <button class="quiz-option" data-index="2" style="background: var(--color-yellow); color: var(--color-dark-text); border: none; border-radius: 8px; padding: 16px 20px; font-size: 1.1rem; font-weight: 600; cursor: pointer; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0;">${q.options[2]}</button>
            <button class="quiz-option" data-index="3" style="background: var(--color-yellow); color: var(--color-dark-text); border: none; border-radius: 8px; padding: 16px 20px; font-size: 1.1rem; font-weight: 600; cursor: pointer; text-align: center; width: 100%; min-height: 60px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; margin: 0;">${q.options[3]}</button>
        </div>
    `;
    
    quizProgress.textContent = `Pergunta ${index + 1} de ${quizQuestions.length}`;
    nextQuestionBtn.style.display = 'none';
    quizResult.style.display = 'none';
    
    // Garantir que o container do quiz tenha a largura correta
    quizContainer.style.width = '100%';
    quizContainer.style.maxWidth = '500px';
    
    // Adiciona listeners nas opções
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', selectOption);
    });
    
    // Animação GSAP apenas com opacity
    if (window.gsap) {
        gsap.from('.quiz-question', {opacity: 0, duration: 0.6});
        gsap.from('.quiz-option', {opacity: 0, duration: 0.4, stagger: 0.1});
    }
}

function selectOption(e) {
    const selected = parseInt(e.target.getAttribute('data-index'));
    const correct = quizQuestions[currentQuestion].answer;
    
    // Desabilita todas as opções
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
    });
    
    if (selected === correct) {
        e.target.style.background = '#4CAF50';
        e.target.style.color = 'white';
        score++;
    } else {
        e.target.style.background = '#f44336';
        e.target.style.color = 'white';
        // Mostra a resposta correta em verde
        const correctBtn = document.querySelector(`.quiz-option[data-index="${correct}"]`);
        correctBtn.style.background = '#4CAF50';
        correctBtn.style.color = 'white';
    }
    
    nextQuestionBtn.style.display = 'inline-block';
}

nextQuestionBtn.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
        showQuestion(currentQuestion);
    } else {
        showQuizResult();
    }
});

function showQuizResult() {
    quizContent.innerHTML = '';
    quizProgress.textContent = '';
    quizResult.style.display = 'block';
    quizResult.innerHTML = `<h3>Parabéns! Você acertou ${score} de ${quizQuestions.length} perguntas.</h3>`;
    if (window.gsap) {
        gsap.from('#quizResult', {scale: 0.7, opacity: 0, duration: 0.7});
    }
    nextQuestionBtn.style.display = 'none';
    
    // Salvar progresso localmente
    saveLocalProgress(score);
    
    // Se estiver logado, salvar também no backend
    const usuario_id = localStorage.getItem('usuario_id');
    if (usuario_id) {
        fetch('backend/save_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, quiz_id: 1, pontuacao: score })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessage('Progresso salvo!', false);
            } else {
                showMessage('Não foi possível salvar o progresso.');
            }
        })
        .catch(() => showMessage('Erro ao salvar progresso.'));
    } else {
        showMessage('Progresso salvo localmente!', false);
    }
}

// Função para iniciar o quiz (após login ou diretamente)
function startQuiz() {
    homepage.classList.remove('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'flex';
    currentQuestion = 0;
    score = 0;
    showQuestion(currentQuestion);
    document.body.style.background = 'var(--color-light-beige)';
    
    // Adicionar classe para ocupar toda a altura da tela
    document.querySelector('.main-content').classList.add('quiz-active');
    document.body.classList.add('quiz-active');
}