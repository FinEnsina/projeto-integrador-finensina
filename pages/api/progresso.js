import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  const usuarioId = parseInt(req.query.usuario_id, 10);

  if (!usuarioId) {
    return res.status(200).json({ success: false, error: 'ID do usuário é obrigatório' });
  }

  try {
    const historicoRaw = await prisma.progressoUsuario.findMany({
      where: { usuarioId },
      orderBy: { dataConclusao: 'desc' },
      take: 20,
      include: { trilha: { select: { nome: true, corHex: true, icone: true } } },
    });

    const historico = historicoRaw.map((h) => ({
      id: h.id,
      usuario_id: h.usuarioId,
      trilha_id: h.trilhaId,
      pontuacao: h.pontuacao,
      total_perguntas: h.totalPerguntas,
      acertos: h.acertos,
      tempo_gasto: h.tempoGasto,
      data_conclusao: h.dataConclusao,
      trilha_nome: h.trilha.nome,
      cor_hex: h.trilha.corHex,
      icone: h.trilha.icone,
    }));

    const agg = await prisma.progressoUsuario.aggregate({
      where: { usuarioId },
      _sum: { pontuacao: true, acertos: true, totalPerguntas: true, tempoGasto: true },
      _avg: { pontuacao: true },
    });
    const trilhasCompletas = await prisma.progressoUsuario.findMany({
      where: { usuarioId },
      distinct: ['trilhaId'],
      select: { trilhaId: true },
    });

    const estatisticas = {
      trilhas_completas: trilhasCompletas.length,
      pontuacao_total: agg._sum.pontuacao || 0,
      acertos_total: agg._sum.acertos || 0,
      perguntas_total: agg._sum.totalPerguntas || 0,
      pontuacao_media: agg._avg.pontuacao || 0,
      tempo_total: agg._sum.tempoGasto || 0,
    };

    const conquistasRaw = await prisma.conquistaUsuario.findMany({
      where: { usuarioId },
      orderBy: { dataConquista: 'desc' },
      include: { conquista: true },
    });
    const conquistas = conquistasRaw.map((c) => ({
      nome: c.conquista.nome,
      descricao: c.conquista.descricao,
      icone: c.conquista.icone,
      pontos_bonus: c.conquista.pontosBonus,
      data_conquista: c.dataConquista,
    }));

    const rankingRaw = await prisma.ranking.findMany({
      where: { usuarioId },
      orderBy: { melhorPontuacao: 'desc' },
      include: { trilha: { select: { nome: true } } },
    });
    const ranking_usuario = rankingRaw.map((r) => ({
      trilha_id: r.trilhaId,
      trilha_nome: r.trilha.nome,
      pontuacao_total: r.pontuacaoTotal,
      melhor_pontuacao: r.melhorPontuacao,
      tentativas: r.tentativas,
      ultima_atualizacao: r.ultimaAtualizacao,
    }));

    return res.status(200).json({ success: true, historico, estatisticas, conquistas, ranking_usuario });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar progresso: ' + error.message });
  }
}
