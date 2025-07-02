<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$nome = $data['nome'] ?? '';
$email = $data['email'] ?? '';
$senha = $data['senha'] ?? '';

if (!$nome || !$email || !$senha) {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos!']);
    exit;
}

$hash = password_hash($senha, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
    $stmt->execute([$nome, $email, $hash]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'E-mail já cadastrado!']);
}
?>