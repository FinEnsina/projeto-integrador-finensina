<?php
/**
 * Configuração do Google OAuth 2.0
 * 
 * Para obter as credenciais:
 * 1. Acesse https://console.cloud.google.com/
 * 2. Crie um novo projeto ou selecione um existente
 * 3. Ative a Google+ API
 * 4. Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth"
 * 5. Configure as URLs de redirecionamento autorizadas
 */

return [
    'client_id' => '242729659352-rch5h57dssh2jc0655qpe2fok2e7mf5a.apps.googleusercontent.com',
    'client_secret' => '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',
    'redirect_uri' => 'https://educafin.ok.etc.br/auth/google/callback.php',
    
    // Escopos de permissão solicitados
    'scopes' => [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ],
    
    // Endpoints do Google OAuth
    'auth_url' => 'https://accounts.google.com/o/oauth2/v2/auth',
    'token_url' => 'https://oauth2.googleapis.com/token',
    'userinfo_url' => 'https://www.googleapis.com/oauth2/v2/userinfo'
];
