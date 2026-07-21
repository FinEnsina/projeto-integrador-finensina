import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  const trilhaId = parseInt(req.query.trilha_id, 10);

  if (!trilhaId) {
    return res.status(200).json({ success: false, error: 'ID da trilha é obrigatório' });
  }

  try {
    const perguntas = await prisma.pergunta.findMany({
      where: { trilhaId, ativo: true },
      orderBy: { ordem: 'asc' },
    });

    const respostaParaIndice = { a: 0, b: 1, c: 2, d: 3 };

    const perguntasFormatadas = perguntas.map((p) => ({
      id: p.id,
      question: p.pergunta,
      options: [p.opcaoA, p.opcaoB, p.opcaoC, p.opcaoD],
      answer: respostaParaIndice[p.respostaCorreta] ?? 0,
      explicacao: p.explicacao,
      pontos: p.pontos,
    }));

    return res.status(200).json({ success: true, perguntas: perguntasFormatadas });
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar perguntas: ' + error.message });
  }
}
