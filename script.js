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
    trilhasContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
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
const trilhasLink = document.getElementById('trilhasLink');
const rankingLink = document.getElementById('rankingLink');
const progressLink = document.getElementById('progressLink');
const homepage = document.getElementById('homepage');
const authContainer = document.getElementById('authContainer');
const trilhasContainer = document.getElementById('trilhasContainer');
const rankingContainer = document.getElementById('rankingContainer');
const progressoContainer = document.getElementById('progressoContainer');

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

trilhasLink.addEventListener('click', function (e) {
    e.preventDefault();
    showTrilhas();
    hamburgerMenu.classList.remove('active');
});

rankingLink.addEventListener('click', function (e) {
    e.preventDefault();
    showRanking();
    hamburgerMenu.classList.remove('active');
});

progressLink.addEventListener('click', function (e) {
    e.preventDefault();
    showProgresso();
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
    trilhasContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
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
    trilhasContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
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
            showTrilhas();
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
        localStorage.setItem('usuario_id', data.id);
        localStorage.setItem('user_name', data.nome);
        updateUserInterface();
        showMessage('Login realizado com sucesso!', false);
        
        // Sincronizar progresso local
        syncLocalProgress(data.id);
        
        // Ir para trilhas
        showTrilhas();
    } else {
        showMessage(data.message || 'Erro no login');
    }
});

// Signup
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nome = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const senha = signupForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmarSenha = signupForm.querySelectorAll('input[type="password"]')[1].value;
    
    if (senha !== confirmarSenha) {
        showMessage('As senhas não coincidem');
        return;
    }
    
    const res = await fetch('backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();
    
    if (data.success) {
        showMessage('Conta criada com sucesso! Faça login.', false);
        toggleForms();
    } else {
        showMessage(data.error || 'Erro no cadastro');
    }
});

// ========================================
// TRILHAS
// ========================================

// Função para mostrar trilhas
async function showTrilhas() {
    homepage.classList.remove('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
    trilhasContainer.style.display = 'block';
    document.body.style.background = 'var(--color-light-beige)';
    
    try {
        const response = await fetch('backend/get_trilhas.php');
        const data = await response.json();
        
        if (data.success) {
            renderTrilhas(data.trilhas);
        } else {
            showMessage('Erro ao carregar trilhas');
        }
    } catch (error) {
        showMessage('Erro ao carregar trilhas');
    }
}

// Função para renderizar trilhas
function renderTrilhas(trilhas) {
    const trilhasGrid = document.getElementById('trilhasGrid');
    trilhasGrid.innerHTML = '';
    
    trilhas.forEach(trilha => {
        const trilhaCard = document.createElement('div');
        trilhaCard.className = 'trilha-card';
        trilhaCard.style.setProperty('--trilha-color', trilha.cor_hex);
        
        trilhaCard.innerHTML = `
            <div class="trilha-header">
                <div class="trilha-icon">
                    <i class="${trilha.icone}"></i>
                </div>
                <div class="trilha-info">
                    <h3>${trilha.nome}</h3>
                    <span class="trilha-dificuldade dificuldade-${trilha.dificuldade}">
                        ${trilha.dificuldade}
                    </span>
                </div>
            </div>
            <p class="trilha-descricao">${trilha.descricao}</p>
            <div class="trilha-footer">
                <div class="trilha-stats">
                    <span><i class="fas fa-question-circle"></i> 5 perguntas</span>
                    <span><i class="fas fa-clock"></i> ~5 min</span>
                </div>
                <button class="play-trilha-btn" onclick="startTrilha(${trilha.id}, '${trilha.nome}')">
                    Jogar Trilha
                </button>
            </div>
        `;
        
        trilhasGrid.appendChild(trilhaCard);
    });
}

// ========================================
// RANKING
// ========================================

// Função para mostrar ranking
async function showRanking() {
    homepage.classList.remove('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'none';
    trilhasContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
    rankingContainer.style.display = 'block';
    document.body.style.background = 'var(--color-light-beige)';
    
    loadRanking();
}

// Função para carregar ranking
async function loadRanking() {
    try {
        const response = await fetch('backend/get_ranking.php');
        const data = await response.json();
        
        if (data.success) {
            renderRanking(data.ranking);
        } else {
            showMessage('Erro ao carregar ranking');
        }
    } catch (error) {
        showMessage('Erro ao carregar ranking');
    }
}

// Função para renderizar ranking
function renderRanking(ranking) {
    const rankingContent = document.getElementById('rankingContent');
    
    if (ranking.length === 0) {
        rankingContent.innerHTML = '<p style="text-align: center; color: var(--color-gray-text);">Nenhum resultado encontrado</p>';
        return;
    }
    
    rankingContent.innerHTML = ranking.map((item, index) => {
        const posicaoClass = index < 3 ? ['ouro', 'prata', 'bronze'][index] : 'outros';
        const posicaoIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : item.posicao;
        
        return `
            <div class="ranking-item">
                <div class="ranking-posicao ${posicaoClass}">
                    ${posicaoIcon}
                </div>
                <div class="ranking-info">
                    <div class="ranking-nome">${item.nome}</div>
                    <div class="ranking-stats">
                        <span>Melhor: ${item.melhor_pontuacao} pts</span>
                        <span>Tentativas: ${item.tentativas}</span>
                    </div>
                </div>
                <div class="ranking-pontos">
                    ${item.pontuacao_total} pts
                </div>
            </div>
        `;
    }).join('');
}



// ========================================
// PROGRESSO
// ========================================

// Função para mostrar progresso
async function showProgresso() {
    const usuario_id = localStorage.getItem('usuario_id');
    if (!usuario_id) {
        showMessage('Faça login para ver seu progresso');
        return;
    }
    
    homepage.classList.remove('active');
    authContainer.classList.remove('active');
    quizContainer.style.display = 'none';
    trilhasContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'block';
    document.body.style.background = 'var(--color-light-beige)';
    
    try {
        const response = await fetch(`backend/get_progresso.php?usuario_id=${usuario_id}`);
        const data = await response.json();
        
        if (data.success) {
            renderProgresso(data);
        } else {
            showMessage('Erro ao carregar progresso');
        }
    } catch (error) {
        showMessage('Erro ao carregar progresso');
    }
}

// Função para renderizar progresso
function renderProgresso(data) {
    // Estatísticas
    document.getElementById('totalPontos').textContent = data.estatisticas.pontuacao_total || 0;
    document.getElementById('trilhasCompletas').textContent = data.estatisticas.trilhas_completas || 0;
    document.getElementById('conquistasGanhas').textContent = data.conquistas.length;
    document.getElementById('tempoTotal').textContent = Math.round((data.estatisticas.tempo_total || 0) / 60);
    
    // Conquistas
    const conquistasList = document.getElementById('conquistasList');
    if (data.conquistas.length === 0) {
        conquistasList.innerHTML = '<p style="color: var(--color-gray-text);">Nenhuma conquista ainda. Continue jogando!</p>';
    } else {
        conquistasList.innerHTML = data.conquistas.map(conquista => `
            <div class="conquista-item">
                <div class="conquista-icon">
                    <i class="${conquista.icone}"></i>
                </div>
                <div class="conquista-info">
                    <h4>${conquista.nome}</h4>
                    <p>${conquista.descricao}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Histórico
    const historicoList = document.getElementById('historicoList');
    if (data.historico.length === 0) {
        historicoList.innerHTML = '<p style="color: var(--color-gray-text);">Nenhum histórico ainda. Comece uma trilha!</p>';
    } else {
        historicoList.innerHTML = data.historico.slice(0, 5).map(item => `
            <div class="historico-item">
                <div class="historico-icon" style="background: ${item.cor_hex}">
                    <i class="${item.icone}"></i>
                </div>
                <div class="historico-info">
                    <h4>${item.trilha_nome}</h4>
                    <p>${item.acertos}/${item.total_perguntas} acertos • ${Math.round(item.tempo_gasto / 60)}min</p>
                </div>
                <div class="historico-pontos">
                    ${item.pontuacao} pts
                </div>
            </div>
        `).join('');
    }
}

// ========================================
// QUIZ AVANÇADO
// ========================================

let currentTrilha = null;
let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let startTime = null;

const quizContainer = document.getElementById('quizContainer');
const quizContent = document.getElementById('quizContent');
const quizProgress = document.getElementById('quizProgress');
const quizTitle = document.getElementById('quizTitle');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const quizResult = document.getElementById('quizResult');

// Função para iniciar uma trilha específica
async function startTrilha(trilhaId, trilhaNome) {
    currentTrilha = { id: trilhaId, nome: trilhaNome };
    
    try {
        const response = await fetch(`backend/get_perguntas.php?trilha_id=${trilhaId}`);
        const data = await response.json();
        
        if (data.success && data.perguntas.length > 0) {
            quizQuestions = data.perguntas;
            startQuiz();
        } else {
            showMessage('Erro ao carregar perguntas da trilha');
        }
    } catch (error) {
        showMessage('Erro ao carregar perguntas da trilha');
    }
}

// Função para salvar progresso localmente
function saveLocalProgress(pontuacao) {
    const progressData = {
        trilha_id: currentTrilha.id,
        pontuacao: pontuacao,
        data: new Date().toISOString()
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
                trilha_id: progress.trilha_id, 
                pontuacao: progress.pontuacao,
                total_perguntas: quizQuestions.length,
                acertos: score,
                tempo_gasto: Math.floor((Date.now() - startTime) / 1000)
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('quiz_progress');
                if (data.conquistas_ganhas && data.conquistas_ganhas.length > 0) {
                    showMessage(`Parabéns! Você ganhou ${data.conquistas_ganhas.length} conquista(s)!`, false);
                }
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
            <button class="quiz-option" data-index="0">${q.options[0]}</button>
            <button class="quiz-option" data-index="1">${q.options[1]}</button>
            <button class="quiz-option" data-index="2">${q.options[2]}</button>
            <button class="quiz-option" data-index="3">${q.options[3]}</button>
        </div>
    `;
    
    quizProgress.textContent = `Pergunta ${index + 1} de ${quizQuestions.length}`;
    nextQuestionBtn.style.display = 'none';
    quizResult.style.display = 'none';
    
    // Adiciona listeners nas opções
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', selectOption);
    });
    
    // Animação GSAP
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
    const tempoGasto = Math.floor((Date.now() - startTime) / 1000);
    const porcentagem = Math.round((score / quizQuestions.length) * 100);
    
    quizContent.innerHTML = '';
    quizProgress.textContent = '';
    quizResult.style.display = 'block';
    quizResult.innerHTML = `
        <h3>Parabéns! Você completou "${currentTrilha.nome}"</h3>
        <div class="result-stats">
            <p><strong>Pontuação:</strong> ${score}/${quizQuestions.length} (${porcentagem}%)</p>
            <p><strong>Tempo:</strong> ${Math.round(tempoGasto / 60)} minutos</p>
            <p><strong>Pontos ganhos:</strong> ${score * 10}</p>
        </div>
        <button id="voltarTrilhasBtn" class="voltar-trilhas-btn">Voltar às Trilhas</button>
    `;
    
    // Adicionar listener para o botão voltar
    document.getElementById('voltarTrilhasBtn').addEventListener('click', function() {
        showTrilhas();
    });
    
    if (window.gsap) {
        gsap.from('#quizResult', {scale: 0.7, opacity: 0, duration: 0.7});
    }
    nextQuestionBtn.style.display = 'none';
    
    // Salvar progresso
    const usuario_id = localStorage.getItem('usuario_id');
    if (usuario_id) {
        fetch('backend/save_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuario_id, 
                trilha_id: currentTrilha.id, 
                pontuacao: score * 10,
                total_perguntas: quizQuestions.length,
                acertos: score,
                tempo_gasto: tempoGasto
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.conquistas_ganhas && data.conquistas_ganhas.length > 0) {
                    showMessage(`Parabéns! Você ganhou ${data.conquistas_ganhas.length} conquista(s)!`, false);
                }
            }
        })
        .catch(() => showMessage('Erro ao salvar progresso.'));
    } else {
        saveLocalProgress(score * 10);
        showMessage('Progresso salvo localmente!', false);
    }
}

// Função para iniciar o quiz (após login ou diretamente)
function startQuiz() {
    homepage.classList.remove('active');
    authContainer.classList.remove('active');
    trilhasContainer.style.display = 'none';
    rankingContainer.style.display = 'none';
    progressoContainer.style.display = 'none';
    quizContainer.style.display = 'flex';
    
    currentQuestion = 0;
    score = 0;
    startTime = Date.now();
    
    quizTitle.textContent = `Trilha: ${currentTrilha.nome}`;
    showQuestion(currentQuestion);
    document.body.style.background = 'var(--color-light-beige)';
    
    // Adicionar classe para ocupar toda a altura da tela
    document.querySelector('.main-content').classList.add('quiz-active');
    document.body.classList.add('quiz-active');
}