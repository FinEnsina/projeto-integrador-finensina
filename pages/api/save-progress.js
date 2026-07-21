import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  const {
    usuario_id: usuarioIdRaw,
    trilha_id: trilhaIdRaw,
    pontuacao = 0,
    total_perguntas: totalPerguntas = 0,
    acertos = 0,
    tempo_gasto: tempoGasto = 0,
  } = req.body || {};

  const usuarioId = parseInt(usuarioIdRaw, 10);
  const trilhaId = parseInt(trilhaIdRaw, 10);

  if (!usuarioId || !trilhaId) {
    return res.status(200).json({ success: false, error: 'Dados obrigatórios não fornecidos' });
  }

  try {
    const conquistasGanhas = await prisma.$transaction(async (tx) => {
      await tx.progressoUsuario.create({
        data: { usuarioId, trilhaId, pontuacao, totalPerguntas, acertos, tempoGasto },
      });

      await tx.ranking.upsert({
        where: { usuarioId_trilhaId: { usuarioId, trilhaId } },
        create: {
          usuarioId,
          trilhaId,
          pontuacaoTotal: pontuacao,
          melhorPontuacao: pontuacao,
          tentativas: 1,
        },
        update: {
          pontuacaoTotal: { increment: pontuacao },
          tentativas: { increment: 1 },
        },
      });

      const rankingAtual = await tx.ranking.findUnique({
        where: { usuarioId_trilhaId: { usuarioId, trilhaId } },
      });
      if (rankingAtual && pontuacao > rankingAtual.melhorPontuacao) {
        await tx.ranking.update({
          where: { usuarioId_trilhaId: { usuarioId, trilhaId } },
          data: { melhorPontuacao: pontuacao },
        });
      }

      const ganhas = [];

      const trilhasCompletasRows = await tx.progressoUsuario.findMany({
        where: { usuarioId },
        distinct: ['trilhaId'],
        select: { trilhaId: true },
      });
      const trilhasCompletas = trilhasCompletasRows.length;

      const jaConquistadas = await tx.conquistaUsuario.findMany({
        where: { usuarioId },
        select: { conquistaId: true },
      });
      const idsJaConquistados = new Set(jaConquistadas.map((c) => c.conquistaId));

      const candidatasTrilhas = await tx.conquista.findMany({
        where: {
          tipo: 'trilhas_completas',
          valorRequerido: { lte: trilhasCompletas },
          ativo: true,
        },
      });
      for (const c of candidatasTrilhas) {
        if (!idsJaConquistados.has(c.id)) {
          await tx.conquistaUsuario.create({ data: { usuarioId, conquistaId: c.id } });
          ganhas.push(c);
          idsJaConquistados.add(c.id);
        }
      }

      if (totalPerguntas > 0 && acertos === totalPerguntas) {
        const perfeita = await tx.conquista.findFirst({
          where: { tipo: 'acertos', valorRequerido: 100, ativo: true },
        });
        if (perfeita && !idsJaConquistados.has(perfeita.id)) {
          await tx.conquistaUsuario.create({ data: { usuarioId, conquistaId: perfeita.id } });
          ganhas.push(perfeita);
          idsJaConquistados.add(perfeita.id);
        }
      }

      if (tempoGasto <= 120) {
        const velocista = await tx.conquista.findFirst({
          where: { tipo: 'tempo', valorRequerido: 120, ativo: true },
        });
        if (velocista && !idsJaConquistados.has(velocista.id)) {
          await tx.conquistaUsuario.create({ data: { usuarioId, conquistaId: velocista.id } });
          ganhas.push(velocista);
          idsJaConquistados.add(velocista.id);
        }
      }

      return ganhas;
    });

    return res.status(200).json({
      success: true,
      message: 'Progresso salvo com sucesso!',
      conquistas_ganhas: conquistasGanhas,
    });
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    return res.status(500).json({ success: false, error: 'Erro ao salvar progresso: ' + error.message });
  }
}
