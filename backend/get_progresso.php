<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

$usuario_id = $_GET['usuario_id'] ?? null;

if (!$usuario_id) {
    echo json_encode([
        'success' => false,
        'error' => 'ID do usuário é obrigatório'
    ]);
    exit;
}

try {
    // Buscar histórico de progresso
    $stmt = $pdo->prepare("
        SELECT 
            pu.*,
            t.nome as trilha_nome,
            t.cor_hex,
            t.icone
        FROM progresso_usuario pu
        JOIN trilhas t ON pu.trilha_id = t.id
        WHERE pu.usuario_id = ?
        ORDER BY pu.data_conclusao DESC
        LIMIT 20
    ");
    $stmt->execute([$usuario_id]);
    $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar estatísticas gerais
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT pu.trilha_id) as trilhas_completas,
            SUM(pu.pontuacao) as pontuacao_total,
            SUM(pu.acertos) as acertos_total,
            SUM(pu.total_perguntas) as perguntas_total,
            AVG(pu.pontuacao) as pontuacao_media,
            SUM(pu.tempo_gasto) as tempo_total
        FROM progresso_usuario pu
        WHERE pu.usuario_id = ?
    ");
    $stmt->execute([$usuario_id]);
    $estatisticas = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Buscar conquistas do usuário
    $stmt = $pdo->prepare("
        SELECT 
            c.nome,
            c.descricao,
            c.icone,
            c.pontos_bonus,
            cu.data_conquista
        FROM conquistas_usuario cu
        JOIN conquistas c ON cu.conquista_id = c.id
        WHERE cu.usuario_id = ?
        ORDER BY cu.data_conquista DESC
    ");
    $stmt->execute([$usuario_id]);
    $conquistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar ranking do usuário
    $stmt = $pdo->prepare("
        SELECT 
            r.trilha_id,
            t.nome as trilha_nome,
            r.pontuacao_total,
            r.melhor_pontuacao,
            r.tentativas,
            r.ultima_atualizacao
        FROM ranking r
        JOIN trilhas t ON r.trilha_id = t.id
        WHERE r.usuario_id = ?
        ORDER BY r.melhor_pontuacao DESC
    ");
    $stmt->execute([$usuario_id]);
    $ranking_usuario = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'historico' => $historico,
        'estatisticas' => $estatisticas,
        'conquistas' => $conquistas,
        'ranking_usuario' => $ranking_usuario
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar progresso: ' . $e->getMessage()
    ]);
}
?> 