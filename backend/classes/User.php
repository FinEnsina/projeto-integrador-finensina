<?php
/**
 * Modelo de Usuário - gerencia todas as operações relacionadas a usuários
 */
class User {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Busca usuário por email
     * 
     * @param string $email Email do usuário
     * @return array|null Dados do usuário ou null se não encontrado
     */
    public function findByEmail($email) {
        $query = "SELECT * FROM usuarios WHERE email = ? AND ativo = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
    
    /**
     * Busca usuário por Google ID
     * 
     * @param string $googleId ID único do usuário no Google
     * @return array|null Dados do usuário ou null se não encontrado
     */
    public function findByGoogleId($googleId) {
        $query = "SELECT * FROM usuarios WHERE google_id = ? AND ativo = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $googleId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
    
    /**
     * Cria novo usuário com login Google
     * 
     * @param array $googleData Dados recebidos do Google (name, email, id, picture)
     * @return int|false ID do usuário criado ou false em caso de erro
     */
    public function createFromGoogle($googleData) {
        $query = "INSERT INTO usuarios (nome, email, google_id, foto_perfil, tipo_cadastro) 
                  VALUES (?, ?, ?, ?, 'google')";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param(
            "ssss",
            $googleData['name'],
            $googleData['email'],
            $googleData['id'],
            $googleData['picture']
        );
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Cria novo usuário com cadastro local (email e senha)
     * 
     * @param string $nome Nome completo do usuário
     * @param string $email Email do usuário
     * @param string $senha Senha em texto plano (será criptografada)
     * @return array Array com 'success' e 'message' ou 'user_id'
     */
    public function createLocal($nome, $email, $senha) {
        // Verifica se email já existe
        if ($this->findByEmail($email)) {
            return ['success' => false, 'message' => 'Email já cadastrado'];
        }
        
        // Criptografa a senha de forma segura
        $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        
        $query = "INSERT INTO usuarios (nome, email, senha, tipo_cadastro) 
                  VALUES (?, ?, ?, 'local')";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sss", $nome, $email, $senhaHash);
        
        if ($stmt->execute()) {
            return [
                'success' => true, 
                'user_id' => $this->conn->insert_id
            ];
        }
        
        return ['success' => false, 'message' => 'Erro ao criar usuário'];
    }
    
    /**
     * Autentica usuário local (email e senha)
     * 
     * @param string $email Email do usuário
     * @param string $senha Senha em texto plano
     * @return array Array com 'success' e 'message' ou 'user'
     */
    public function authenticateLocal($email, $senha) {
        $user = $this->findByEmail($email);
        
        if (!$user) {
            return ['success' => false, 'message' => 'Usuário não encontrado'];
        }
        
        // Verifica se o usuário foi cadastrado com Google
        if ($user['tipo_cadastro'] === 'google') {
            return ['success' => false, 'message' => 'Use login com Google para esta conta'];
        }
        
        // Verifica se a senha está correta
        if (password_verify($senha, $user['senha'])) {
            $this->updateLastAccess($user['id']);
            return ['success' => true, 'user' => $user];
        }
        
        return ['success' => false, 'message' => 'Senha incorreta'];
    }
    
    /**
     * Processa login com Google
     * 
     * @param array $googleData Dados recebidos do Google
     * @return array Array com 'success' e 'message' ou 'user'
     */
    public function authenticateGoogle($googleData) {
        // Verifica se usuário já existe
        $user = $this->findByGoogleId($googleData['id']);
        
        if (!$user) {
            // Verifica se email já existe com cadastro local
            $existingUser = $this->findByEmail($googleData['email']);
            
            if ($existingUser) {
                return [
                    'success' => false, 
                    'message' => 'Este email já está cadastrado. Use login tradicional.'
                ];
            }
            
            // Cria novo usuário
            $userId = $this->createFromGoogle($googleData);
            
            if (!$userId) {
                return ['success' => false, 'message' => 'Erro ao criar usuário'];
            }
            
            $user = $this->findByGoogleId($googleData['id']);
        }
        
        // Atualiza último acesso
        $this->updateLastAccess($user['id']);
        
        // Atualiza foto de perfil se mudou
        if (isset($googleData['picture']) && $user['foto_perfil'] !== $googleData['picture']) {
            $this->updateProfilePicture($user['id'], $googleData['picture']);
            $user['foto_perfil'] = $googleData['picture'];
        }
        
        return ['success' => true, 'user' => $user];
    }
    
    /**
     * Atualiza último acesso do usuário
     * 
     * @param int $userId ID do usuário
     */
    private function updateLastAccess($userId) {
        $query = "UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
    }
    
    /**
     * Atualiza foto de perfil do usuário
     * 
     * @param int $userId ID do usuário
     * @param string $pictureUrl URL da nova foto
     */
    private function updateProfilePicture($userId, $pictureUrl) {
        $query = "UPDATE usuarios SET foto_perfil = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $pictureUrl, $userId);
        $stmt->execute();
    }
    
    /**
     * Registra log de login no banco de dados
     * 
     * @param int $userId ID do usuário
     * @param string $tipoLogin 'local' ou 'google'
     */
    public function logLogin($userId, $tipoLogin) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        
        $query = "INSERT INTO logs_login (usuario_id, tipo_login, ip_address, user_agent) 
                  VALUES (?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("isss", $userId, $tipoLogin, $ip, $userAgent);
        $stmt->execute();
    }
}
