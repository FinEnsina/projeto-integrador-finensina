import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const trilhas = await prisma.trilha.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        dificuldade: true,
        corHex: true,
        icone: true,
        ordem: true,
      },
    });

    const trilhasFormatadas = trilhas.map((t) => ({
      id: t.id,
      nome: t.nome,
      descricao: t.descricao,
      dificuldade: t.dificuldade,
      cor_hex: t.corHex,
      icone: t.icone,
      ordem: t.ordem,
    }));

    return res.status(200).json({ success: true, trilhas: trilhasFormatadas });
  } catch (error) {
    console.error('Erro ao buscar trilhas:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar trilhas: ' + error.message });
  }
}
