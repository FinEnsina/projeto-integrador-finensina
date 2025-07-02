<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

$trilha_id = $_GET['trilha_id'] ?? null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

try {
    if ($trilha_id) {
        // Ranking específico de uma trilha
        $sql = "
            SELECT 
                r.usuario_id,
                u.nome,
                r.pontuacao_total,
                r.melhor_pontuacao,
                r.tentativas,
                r.ultima_atualizacao
            FROM ranking r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.trilha_id = ?
            ORDER BY r.melhor_pontuacao DESC, r.pontuacao_total DESC
            LIMIT $limit
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$trilha_id]);
    } else {
        // Ranking geral (soma de todas as trilhas)
        $sql = "
            SELECT 
                r.usuario_id,
                u.nome,
                SUM(r.pontuacao_total) as pontuacao_total,
                MAX(r.melhor_pontuacao) as melhor_pontuacao,
                SUM(r.tentativas) as tentativas,
                MAX(r.ultima_atualizacao) as ultima_atualizacao
            FROM ranking r
            JOIN usuarios u ON r.usuario_id = u.id
            GROUP BY r.usuario_id, u.nome
            ORDER BY pontuacao_total DESC, melhor_pontuacao DESC
            LIMIT $limit
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Adicionar posição no ranking
    foreach ($ranking as $index => $item) {
        $ranking[$index]['posicao'] = $index + 1;
    }
    
    echo json_encode([
        'success' => true,
        'ranking' => $ranking
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar ranking: ' . $e->getMessage()
    ]);
}
?> 