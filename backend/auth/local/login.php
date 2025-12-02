<?php
/**
 * Processa login com email e senha (cadastro local)
 * 
 * Este arquivo é chamado quando o usuário preenche o formulário
 * de login e clica em "Entrar"
 */

session_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/User.php';

// Verifica se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /login.php');
    exit;
}

// Validação e sanitização dos dados
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$senha = $_POST['senha'] ?? '';

// Validações básicas
if (empty($email) || empty($senha)) {
    $_SESSION['error_message'] = 'Preencha todos os campos.';
    header('Location: /login.php');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION['error_message'] = 'Email inválido.';
    header('Location: /login.php');
    exit;
}

try {
    // Conecta ao banco de dados
    $database = new Database();
    $db = $database->getConnection();
    
    // Tenta autenticar o usuário
    $userModel = new User($db);
    $result = $userModel->authenticateLocal($email, $senha);
    
    if (!$result['success']) {
        $_SESSION['error_message'] = $result['message'];
        header('Location: /login.php');
        exit;
    }
    
    // Login bem-sucedido - cria sessão do usuário
    $user = $result['user'];
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nome'] = $user['nome'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_foto'] = $user['foto_perfil'];
    $_SESSION['tipo_login'] = 'local';
    
    // Registra log de login
    $userModel->logLogin($user['id'], 'local');
    
    // Mensagem de sucesso
    $_SESSION['success_message'] = 'Login realizado com sucesso!';
    
    // Redireciona para dashboard
    header('Location: /dashboard.php');
    exit;
    
} catch (Exception $e) {
    // Registra erro no log do servidor
    error_log('Erro no login: ' . $e->getMessage());
    
    // Mostra mensagem de erro genérica (por segurança)
    $_SESSION['error_message'] = 'Erro ao processar login. Tente novamente.';
    header('Location: /login.php');
    exit;
}
