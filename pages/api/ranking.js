import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  const trilhaId = req.query.trilha_id ? parseInt(req.query.trilha_id, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

  try {
    let ranking;

    if (trilhaId) {
      const rows = await prisma.ranking.findMany({
        where: { trilhaId },
        orderBy: [{ melhorPontuacao: 'desc' }, { pontuacaoTotal: 'desc' }],
        take: limit,
        include: { usuario: { select: { nome: true } } },
      });

      ranking = rows.map((r) => ({
        usuario_id: r.usuarioId,
        nome: r.usuario.nome,
        pontuacao_total: r.pontuacaoTotal,
        melhor_pontuacao: r.melhorPontuacao,
        tentativas: r.tentativas,
        ultima_atualizacao: r.ultimaAtualizacao,
      }));
    } else {
      const grouped = await prisma.ranking.groupBy({
        by: ['usuarioId'],
        _sum: { pontuacaoTotal: true, tentativas: true },
        _max: { melhorPontuacao: true, ultimaAtualizacao: true },
        orderBy: { _sum: { pontuacaoTotal: 'desc' } },
        take: limit,
      });

      const usuarioIds = grouped.map((g) => g.usuarioId);
      const usuarios = await prisma.usuario.findMany({
        where: { id: { in: usuarioIds } },
        select: { id: true, nome: true },
      });
      const nomeMap = Object.fromEntries(usuarios.map((u) => [u.id, u.nome]));

      ranking = grouped.map((g) => ({
        usuario_id: g.usuarioId,
        nome: nomeMap[g.usuarioId] || 'Usuário',
        pontuacao_total: g._sum.pontuacaoTotal || 0,
        melhor_pontuacao: g._max.melhorPontuacao || 0,
        tentativas: g._sum.tentativas || 0,
        ultima_atualizacao: g._max.ultimaAtualizacao,
      }));
    }

    ranking = ranking.map((item, index) => ({ ...item, posicao: index + 1 }));

    return res.status(200).json({ success: true, ranking });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar ranking: ' + error.message });
  }
}
