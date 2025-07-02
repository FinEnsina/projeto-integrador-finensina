<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$usuario_id = $input['usuario_id'] ?? null;
$trilha_id = $input['trilha_id'] ?? null;
$pontuacao = $input['pontuacao'] ?? 0;
$total_perguntas = $input['total_perguntas'] ?? 0;
$acertos = $input['acertos'] ?? 0;
$tempo_gasto = $input['tempo_gasto'] ?? 0;

if (!$usuario_id || !$trilha_id) {
    echo json_encode([
        'success' => false,
        'error' => 'Dados obrigatórios não fornecidos'
    ]);
    exit;
}

try {
    $pdo->beginTransaction();
    
    // 1. Salvar no histórico de progresso
    $stmt = $pdo->prepare("
        INSERT INTO progresso_usuario 
        (usuario_id, trilha_id, pontuacao, total_perguntas, acertos, tempo_gasto) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$usuario_id, $trilha_id, $pontuacao, $total_perguntas, $acertos, $tempo_gasto]);
    
    // 2. Atualizar ou inserir no ranking
    $stmt = $pdo->prepare("
        INSERT INTO ranking (usuario_id, trilha_id, pontuacao_total, melhor_pontuacao, tentativas) 
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
        pontuacao_total = pontuacao_total + ?,
        melhor_pontuacao = GREATEST(melhor_pontuacao, ?),
        tentativas = tentativas + 1
    ");
    $stmt->execute([$usuario_id, $trilha_id, $pontuacao, $pontuacao, $pontuacao, $pontuacao]);
    
    // 3. Verificar conquistas
    $conquistas_ganhas = [];
    
    // Conquista: Primeiro Passo (primeira trilha completa)
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT trilha_id) as trilhas_completas 
        FROM progresso_usuario 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$usuario_id]);
    $trilhas_completas = $stmt->fetch(PDO::FETCH_ASSOC)['trilhas_completas'];
    
    // Verificar conquistas de trilhas completas
    $stmt = $pdo->prepare("
        SELECT c.* FROM conquistas c
        WHERE c.tipo = 'trilhas_completas' 
        AND c.valor_requerido <= ?
        AND c.ativo = 1
        AND NOT EXISTS (
            SELECT 1 FROM conquistas_usuario cu 
            WHERE cu.usuario_id = ? AND cu.conquista_id = c.id
        )
    ");
    $stmt->execute([$trilhas_completas, $usuario_id]);
    $conquistas_disponiveis = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($conquistas_disponiveis as $conquista) {
        $stmt = $pdo->prepare("
            INSERT INTO conquistas_usuario (usuario_id, conquista_id) 
            VALUES (?, ?)
        ");
        $stmt->execute([$usuario_id, $conquista['id']]);
        $conquistas_ganhas[] = $conquista;
    }
    
    // Conquista: Pontuação Perfeita
    if ($acertos == $total_perguntas && $total_perguntas > 0) {
        $stmt = $pdo->prepare("
            SELECT c.* FROM conquistas c
            WHERE c.tipo = 'acertos' 
            AND c.valor_requerido = 100
            AND c.ativo = 1
            AND NOT EXISTS (
                SELECT 1 FROM conquistas_usuario cu 
                WHERE cu.usuario_id = ? AND cu.conquista_id = c.id
            )
        ");
        $stmt->execute([$usuario_id]);
        $conquista_perfeita = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($conquista_perfeita) {
            $stmt = $pdo->prepare("
                INSERT INTO conquistas_usuario (usuario_id, conquista_id) 
                VALUES (?, ?)
            ");
            $stmt->execute([$usuario_id, $conquista_perfeita['id']]);
            $conquistas_ganhas[] = $conquista_perfeita;
        }
    }
    
    // Conquista: Velocista (menos de 2 minutos)
    if ($tempo_gasto <= 120) {
        $stmt = $pdo->prepare("
            SELECT c.* FROM conquistas c
            WHERE c.tipo = 'tempo' 
            AND c.valor_requerido = 120
            AND c.ativo = 1
            AND NOT EXISTS (
                SELECT 1 FROM conquistas_usuario cu 
                WHERE cu.usuario_id = ? AND cu.conquista_id = c.id
            )
        ");
        $stmt->execute([$usuario_id]);
        $conquista_velocista = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($conquista_velocista) {
            $stmt = $pdo->prepare("
                INSERT INTO conquistas_usuario (usuario_id, conquista_id) 
                VALUES (?, ?)
            ");
            $stmt->execute([$usuario_id, $conquista_velocista['id']]);
            $conquistas_ganhas[] = $conquista_velocista;
        }
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Progresso salvo com sucesso!',
        'conquistas_ganhas' => $conquistas_ganhas
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao salvar progresso: ' . $e->getMessage()
    ]);
}
?> 