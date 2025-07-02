<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $stmt = $pdo->prepare("
        SELECT id, nome, descricao, dificuldade, cor_hex, icone, ordem 
        FROM trilhas 
        WHERE ativo = 1 
        ORDER BY ordem ASC
    ");
    $stmt->execute();
    $trilhas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'trilhas' => $trilhas
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar trilhas: ' . $e->getMessage()
    ]);
}
?> 