<?php
/**
 * Classe para gerenciar autenticação com Google OAuth 2.0
 */
class GoogleOAuth {
    private $config;
    
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/google_oauth_config.php';
    }
    
    /**
     * Gera a URL de autorização do Google
     */
    public function getAuthUrl($state = null) {
        if ($state === null) {
            $state = bin2hex(random_bytes(16));
        }
        
        // Armazena o state na sessão para validação posterior
        $_SESSION['oauth_state'] = $state;
        
        $params = [
            'client_id' => $this->config['client_id'],
            'redirect_uri' => $this->config['redirect_uri'],
            'response_type' => 'code',
            'scope' => implode(' ', $this->config['scopes']),
            'state' => $state,
            'access_type' => 'online',
            'prompt' => 'select_account'
        ];
        
        return $this->config['auth_url'] . '?' . http_build_query($params);
    }
    
    /**
     * Troca o código de autorização por um token de acesso
     */
    public function getAccessToken($code) {
        $params = [
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'redirect_uri' => $this->config['redirect_uri'],
            'grant_type' => 'authorization_code',
            'code' => $code
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->config['token_url']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao obter token de acesso');
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Obtém informações do usuário usando o token de acesso
     */
    public function getUserInfo($accessToken) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->config['userinfo_url']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao obter informações do usuário');
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Valida o state para prevenir CSRF
     */
    public function validateState($state) {
        return isset($_SESSION['oauth_state']) && 
               $_SESSION['oauth_state'] === $state;
    }
}
