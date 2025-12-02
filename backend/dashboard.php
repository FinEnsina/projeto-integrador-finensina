<?php
/**
 * Dashboard - Página principal após login
 */

require_once __DIR__ . '/middleware/auth.php';

// Requer autenticação - redireciona para login se não estiver logado
requireAuth();

// Obtém dados do usuário logado
$user = getCurrentUser();
$firstName = getUserFirstName();
$initials = getUserInitials();

// Recupera mensagem de sucesso se houver
$successMessage = $_SESSION['success_message'] ?? '';
unset($_SESSION['success_message']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - FinEnsina</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid white;
            object-fit: cover;
        }

        .user-avatar-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            color: #667eea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
        }

        .btn-logout {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 20px;
            border: 1px solid white;
            border-radius: 20px;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.3s;
        }

        .btn-logout:hover {
            background: white;
            color: #667eea;
        }

        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .alert {
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .welcome-card {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-bottom: 30px;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .welcome-card h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 32px;
        }

        .welcome-card p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }

        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
        }

        .badge-google {
            background: #ea4335;
            color: white;
        }

        .badge-local {
            background: #667eea;
            color: white;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            text-align: center;
            transition: all 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-card h3 {
            color: #667eea;
            font-size: 36px;
            margin-bottom: 10px;
        }

        .stat-card p {
            color: #666;
            font-size: 14px;
        }

        .modules-section {
            margin-top: 40px;
        }

        .modules-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
        }

        .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .module-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            transition: all 0.3s;
        }

        .module-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .module-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }

        .module-card h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 18px;
        }

        .module-card p {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }

            .user-menu {
                flex-direction: column;
            }

            .welcome-card h1 {
                font-size: 24px;
            }

            .stats-grid,
            .modules-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <span>💰</span>
            <span>FinEnsina</span>
        </div>
        <div class="user-menu">
            <?php if ($user['foto']): ?>
                <img src="<?= htmlspecialchars($user['foto']) ?>" 
                     alt="<?= htmlspecialchars($user['nome']) ?>" 
                     class="user-avatar">
            <?php else: ?>
                <div class="user-avatar-placeholder">
                    <?= $initials ?>
                </div>
            <?php endif; ?>
            <span><?= htmlspecialchars($user['nome']) ?></span>
            <a href="/auth/logout.php" class="btn-logout">Sair</a>
        </div>
    </div>

    <div class="container">
        <?php if ($successMessage): ?>
            <div class="alert"><?= htmlspecialchars($successMessage) ?></div>
        <?php endif; ?>

        <div class="welcome-card">
            <h1>Bem-vindo(a), <?= htmlspecialchars($firstName) ?>! 👋</h1>
            <p>Continue sua jornada de aprendizado em educação financeira. Explore os módulos abaixo e desenvolva suas habilidades para tomar decisões financeiras inteligentes!</p>
            <span class="badge badge-<?= $user['tipo_login'] ?>">
                <?= $user['tipo_login'] === 'google' ? '🔐 Login com Google' : '📧 Login com Email' ?>
            </span>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>1</h3>
                <p>Nível Atual</p>
            </div>
            <div class="stat-card">
                <h3>0</h3>
                <p>Pontos Totais</p>
            </div>
            <div class="stat-card">
                <h3>0%</h3>
                <p>Progresso Geral</p>
            </div>
        </div>

        <div class="modules-section">
            <h2>📚 Trilha de Aprendizado</h2>
            <div class="modules-grid">
                <div class="module-card">
                    <div class="module-icon">💵</div>
                    <h3>Introdução às Finanças</h3>
                    <p>Aprenda os conceitos básicos de educação financeira e como gerenciar seu dinheiro de forma inteligente.</p>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">💰</div>
                    <h3>Orçamento Pessoal</h3>
                    <p>Descubra como criar e manter um orçamento eficiente para alcançar seus objetivos financeiros.</p>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">📈</div>
                    <h3>Investimentos</h3>
                    <p>Entenda os diferentes tipos de investimentos e como fazer seu dinheiro crescer com segurança.</p>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">🎯</div>
                    <h3>Planejamento Financeiro</h3>
                    <p>Aprenda a definir metas financeiras e criar estratégias para realizá-las ao longo do tempo.</p>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">🛡️</div>
                    <h3>Proteção Financeira</h3>
                    <p>Saiba como se proteger de riscos financeiros e tomar decisões conscientes sobre seguros.</p>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">🎓</div>
                    <h3>Educação Contínua</h3>
                    <p>Mantenha-se atualizado com as melhores práticas e tendências do mundo financeiro.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
