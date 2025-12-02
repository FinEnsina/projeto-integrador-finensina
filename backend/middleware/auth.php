<?php
/**
 * Middleware de autenticação
 * 
 * Funções auxiliares para gerenciar autenticação em todo o sistema
 * Inclua este arquivo em páginas que requerem login
 */

// Inicia sessão se ainda não foi iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Verifica se usuário está autenticado
 * 
 * @return bool True se autenticado, False caso contrário
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Requer autenticação - redireciona se não estiver logado
 * 
 * Use no início de páginas protegidas:
 * require_once 'middleware/auth.php';
 * requireAuth();
 */
function requireAuth() {
    if (!isAuthenticated()) {
        // Salva a URL atual para redirecionar após login
        $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
        
        // Mensagem de erro
        $_SESSION['error_message'] = 'Você precisa estar logado para acessar esta página.';
        
        // Redireciona para login
        header('Location: /login.php');
        exit;
    }
}

/**
 * Obtém dados do usuário logado
 * 
 * @return array|null Array com dados do usuário ou null se não logado
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'nome' => $_SESSION['user_nome'],
        'email' => $_SESSION['user_email'],
        'foto' => $_SESSION['user_foto'] ?? null,
        'tipo_login' => $_SESSION['tipo_login'] ?? 'local'
    ];
}

/**
 * Verifica se usuário está logado e redireciona
 * 
 * Útil para páginas de login/cadastro que não devem ser
 * acessadas por usuários já autenticados
 * 
 * @param string $destination Para onde redirecionar (padrão: dashboard)
 */
function redirectIfAuthenticated($destination = '/dashboard.php') {
    if (isAuthenticated()) {
        header('Location: ' . $destination);
        exit;
    }
}

/**
 * Obtém nome do usuário (apenas primeiro nome)
 * 
 * @return string|null Primeiro nome ou null se não logado
 */
function getUserFirstName() {
    $user = getCurrentUser();
    if (!$user) {
        return null;
    }
    
    $names = explode(' ', $user['nome']);
    return $names[0];
}

/**
 * Verifica se usuário logou com Google
 * 
 * @return bool True se login foi com Google
 */
function isGoogleLogin() {
    $user = getCurrentUser();
    return $user && $user['tipo_login'] === 'google';
}

/**
 * Gera iniciais do nome para avatar
 * 
 * @return string Iniciais (ex: "JS" para "João Silva")
 */
function getUserInitials() {
    $user = getCurrentUser();
    if (!$user) {
        return '??';
    }
    
    $names = explode(' ', $user['nome']);
    $initials = strtoupper(substr($names[0], 0, 1));
    
    if (count($names) > 1) {
        $initials .= strtoupper(substr($names[count($names) - 1], 0, 1));
    }
    
    return $initials;
}
