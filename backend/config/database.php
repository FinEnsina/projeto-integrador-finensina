<?php
/**
 * Configuração de conexão com banco de dados MySQL
 * 
 * INSTRUÇÕES:
 * Altere os valores abaixo com as credenciais do seu banco de dados
 */

class Database {
    // Configurações do banco de dados - ALTERE AQUI
    private $host = 'localhost';        // Endereço do servidor MySQL
    private $db_name = 'finensina';     // Nome do banco de dados
    private $username = 'root';         // Usuário do MySQL
    private $password = 'S123t$%&*cfg';             // Senha do MySQL (deixe vazio se não tiver)
    private $conn;
    
    /**
     * Obtém conexão com banco de dados
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            // Cria conexão MySQLi
            $this->conn = new mysqli(
                $this->host,
                $this->username,
                $this->password,
                $this->db_name
            );
            
            // Define charset UTF-8 para suportar acentos e caracteres especiais
            $this->conn->set_charset('utf8mb4');
            
            // Verifica se houve erro na conexão
            if ($this->conn->connect_error) {
                throw new Exception('Erro de conexão: ' . $this->conn->connect_error);
            }
            
        } catch (Exception $e) {
            // Registra erro no log do servidor
            error_log('Erro ao conectar ao banco: ' . $e->getMessage());
            throw $e;
        }
        
        return $this->conn;
    }
    
    /**
     * Fecha conexão com banco de dados
     */
    public function closeConnection() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
