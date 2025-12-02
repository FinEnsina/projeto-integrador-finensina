// =================================================================
// ARQUIVO: src/pages/dashboard.tsx
// Dashboard principal após login
// =================================================================

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user as any;
  const firstName = user.name?.split(' ')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">💰 FinEnsina</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold">
                  {firstName[0]}
                </div>
              )}
              
              <span className="hidden sm:inline">{user.name}</span>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 border border-white/30"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo(a), {firstName}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Continue sua jornada de aprendizado em educação financeira. Explore os módulos abaixo e desenvolva suas habilidades!
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
              🔐 Login com Google
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">
              {user.nivel || 1}
            </h3>
            <p className="text-gray-600">Nível Atual</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">
              {user.pontos || 0}
            </h3>
            <p className="text-gray-600">Pontos Totais</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <h3 className="text-4xl font-bold text-purple-600 mb-2">0%</h3>
            <p className="text-gray-600">Progresso Geral</p>
          </div>
        </div>

        {/* Modules Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            📚 Trilha de Aprendizado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {module.title}
                </h4>
                <p className="text-gray-600 text-sm">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const modules = [
  {
    icon: '💵',
    title: 'Introdução às Finanças',
    description: 'Aprenda os conceitos básicos de educação financeira e como gerenciar seu dinheiro.',
  },
  {
    icon: '💰',
    title: 'Orçamento Pessoal',
    description: 'Descubra como criar e manter um orçamento eficiente para seus objetivos.',
  },
  {
    icon: '📈',
    title: 'Investimentos',
    description: 'Entenda os diferentes tipos de investimentos e como fazer seu dinheiro crescer.',
  },
  {
    icon: '🎯',
    title: 'Planejamento Financeiro',
    description: 'Aprenda a definir metas financeiras e criar estratégias para realizá-las.',
  },
  {
    icon: '🛡️',
    title: 'Proteção Financeira',
    description: 'Saiba como se proteger de riscos financeiros e tomar decisões conscientes.',
  },
  {
    icon: '🎓',
    title: 'Educação Contínua',
    description: 'Mantenha-se atualizado com as melhores práticas do mundo financeiro.',
  },
];
