<?php
/**
 * Redireciona usuário para página de autorização do Google
 */
session_start();

require_once __DIR__ . '/../../classes/GoogleOAuth.php';

try {
    $googleOAuth = new GoogleOAuth();
    $authUrl = $googleOAuth->getAuthUrl();
    
    // Redireciona para o Google
    header('Location: ' . $authUrl);
    exit;
    
} catch (Exception $e) {
    $_SESSION['error_message'] = 'Erro ao iniciar login com Google: ' . $e->getMessage();
    header('Location: /login.php');
    exit;
}
