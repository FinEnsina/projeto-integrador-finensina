<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$usuario_id = $data['usuario_id'] ?? null;
$quiz_id = $data['quiz_id'] ?? 1; // Quiz único por enquanto
$pontuacao = $data['pontuacao'] ?? null;

if (!$usuario_id || $pontuacao === null) {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO progresso_quiz (usuario_id, quiz_id, pontuacao) VALUES (?, ?, ?)");
    $stmt->execute([$usuario_id, $quiz_id, $pontuacao]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar progresso.']);
} 