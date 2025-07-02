<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

$trilha_id = $_GET['trilha_id'] ?? null;

if (!$trilha_id) {
    echo json_encode([
        'success' => false,
        'error' => 'ID da trilha é obrigatório'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, pergunta, opcao_a, opcao_b, opcao_c, opcao_d, 
               resposta_correta, explicacao, pontos, ordem
        FROM perguntas 
        WHERE trilha_id = ? AND ativo = 1 
        ORDER BY ordem ASC
    ");
    $stmt->execute([$trilha_id]);
    $perguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar perguntas para o formato esperado pelo frontend
    $perguntasFormatadas = [];
    foreach ($perguntas as $pergunta) {
        $perguntasFormatadas[] = [
            'id' => $pergunta['id'],
            'question' => $pergunta['pergunta'],
            'options' => [
                $pergunta['opcao_a'],
                $pergunta['opcao_b'],
                $pergunta['opcao_c'],
                $pergunta['opcao_d']
            ],
            'answer' => array_search($pergunta['resposta_correta'], ['a', 'b', 'c', 'd']),
            'explicacao' => $pergunta['explicacao'],
            'pontos' => $pergunta['pontos']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'perguntas' => $perguntasFormatadas
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar perguntas: ' . $e->getMessage()
    ]);
}
?> 