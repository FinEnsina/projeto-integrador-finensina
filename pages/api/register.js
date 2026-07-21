import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { nome, email, senha } = req.body || {};

  if (!nome || !email || !senha) {
    return res.status(200).json({ success: false, error: 'Preencha todos os campos!', message: 'Preencha todos os campos!' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    await prisma.usuario.create({
      data: { nome, email, senha: hash },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(200).json({
        success: false,
        error: 'E-mail já cadastrado!',
        message: 'E-mail já cadastrado!',
      });
    }
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ success: false, error: 'Erro no servidor. Tente novamente.' });
  }
}
