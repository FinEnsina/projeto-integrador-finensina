<?php
/**
 * Processa cadastro local com email e senha
 * 
 * Este arquivo é chamado quando o usuário preenche o formulário
 * de cadastro e clica em "Criar Conta"
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
$nome = trim($_POST['nome'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$senha = $_POST['senha'] ?? '';
$senhaConfirmacao = $_POST['senha_confirmacao'] ?? '';

// Array para armazenar erros
$errors = [];

// Validações
if (empty($nome) || strlen($nome) < 3) {
    $errors[] = 'Nome deve ter no mínimo 3 caracteres.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email inválido.';
}

if (empty($senha) || strlen($senha) < 6) {
    $errors[] = 'Senha deve ter no mínimo 6 caracteres.';
}

if ($senha !== $senhaConfirmacao) {
    $errors[] = 'As senhas não coincidem.';
}

// Valida força da senha (deve ter letras e números)
if (!empty($senha)) {
    if (!preg_match('/[A-Za-z]/', $senha) || !preg_match('/[0-9]/', $senha)) {
        $errors[] = 'A senha deve conter letras e números.';
    }
}

// Se houver erros, volta para o login
if (!empty($errors)) {
    $_SESSION['error_message'] = implode(' ', $errors);
    header('Location: /login.php');
    exit;
}

try {
    // Conecta ao banco de dados
    $database = new Database();
    $db = $database->getConnection();
    
    // Cria o usuário
    $userModel = new User($db);
    $result = $userModel->createLocal($nome, $email, $senha);
    
    if (!$result['success']) {
        $_SESSION['error_message'] = $result['message'];
        header('Location: /login.php');
        exit;
    }
    
    // Cadastro bem-sucedido - já faz login automático
    $user = $userModel->findByEmail($email);
    
    // Cria sessão do usuário
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nome'] = $user['nome'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_foto'] = $user['foto_perfil'];
    $_SESSION['tipo_login'] = 'local';
    
    // Registra log de login
    $userModel->logLogin($user['id'], 'local');
    
    // Mensagem de sucesso
    $_SESSION['success_message'] = 'Cadastro realizado com sucesso! Bem-vindo(a) ao FinEnsina!';
    
    // Redireciona para dashboard
    header('Location: /dashboard.php');
    exit;
    
} catch (Exception $e) {
    // Registra erro no log do servidor
    error_log('Erro no cadastro: ' . $e->getMessage());
    
    // Mostra mensagem de erro genérica
    $_SESSION['error_message'] = 'Erro ao processar cadastro. Tente novamente.';
    header('Location: /login.php');
    exit;
}
