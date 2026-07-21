import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(200).json({ success: false, message: 'Preencha todos os campos!' });
  }

  try {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(senha, user.senha))) {
      return res.status(200).json({ success: true, nome: user.nome, id: user.id });
    }

    return res.status(200).json({ success: false, message: 'E-mail ou senha incorretos!' });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor. Tente novamente.' });
  }
}
