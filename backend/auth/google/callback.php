<?php
/**
 * Callback do Google OAuth - processa retorno da autenticação
 */
session_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/GoogleOAuth.php';
require_once __DIR__ . '/../../classes/User.php';

// Verifica se houve erro no retorno do Google
if (isset($_GET['error'])) {
    $_SESSION['error_message'] = 'Autenticação cancelada ou negada.';
    header('Location: /login.php');
    exit;
}

// Verifica se recebeu o código de autorização
if (!isset($_GET['code'])) {
    $_SESSION['error_message'] = 'Código de autorização não recebido.';
    header('Location: /login.php');
    exit;
}

try {
    $googleOAuth = new GoogleOAuth();
    
    // Valida o state para prevenir CSRF
    if (!isset($_GET['state']) || !$googleOAuth->validateState($_GET['state'])) {
        throw new Exception('State inválido. Possível ataque CSRF.');
    }
    
    // Limpa o state da sessão
    unset($_SESSION['oauth_state']);
    
    // Troca o código pelo token de acesso
    $tokenData = $googleOAuth->getAccessToken($_GET['code']);
    
    if (!isset($tokenData['access_token'])) {
        throw new Exception('Token de acesso não recebido.');
    }
    
    // Obtém informações do usuário
    $userInfo = $googleOAuth->getUserInfo($tokenData['access_token']);
    
    if (!isset($userInfo['email'])) {
        throw new Exception('Email do usuário não foi compartilhado.');
    }
    
    // Conecta ao banco de dados
    $database = new Database();
    $db = $database->getConnection();
    
    // Processa login/cadastro
    $userModel = new User($db);
    $result = $userModel->authenticateGoogle($userInfo);
    
    if (!$result['success']) {
        $_SESSION['error_message'] = $result['message'];
        header('Location: /login.php');
        exit;
    }
    
    // Login bem-sucedido - cria sessão
    $user = $result['user'];
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nome'] = $user['nome'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_foto'] = $user['foto_perfil'];
    $_SESSION['tipo_login'] = 'google';
    
    // Registra log de login
    $userModel->logLogin($user['id'], 'google');
    
    // Mensagem de sucesso
    $_SESSION['success_message'] = 'Login realizado com sucesso!';
    
    // Redireciona para dashboard
    header('Location: /dashboard.php');
    exit;
    
} catch (Exception $e) {
    error_log('Erro no Google OAuth: ' . $e->getMessage());
    $_SESSION['error_message'] = 'Erro ao processar login: ' . $e->getMessage();
    header('Location: /login.php');
    exit;
}
