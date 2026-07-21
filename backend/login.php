<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$senha = $data['senha'] ?? '';

if (!$email || !$senha) {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos!']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($senha, $user['senha'])) {
    echo json_encode(['success' => true, 'nome' => $user['nome'], 'id' => $user['id']]);
} else {
    echo json_encode(['success' => false, 'message' => 'E-mail ou senha incorretos!']);
}
?>