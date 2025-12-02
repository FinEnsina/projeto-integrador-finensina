// =================================================================
// ARQUIVO: src/lib/auth.ts
// Configuração completa do NextAuth
// =================================================================

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // Adapter Prisma para salvar usuários no banco
  adapter: PrismaAdapter(prisma),

  // Providers de autenticação
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  // Páginas personalizadas
  pages: {
    signIn: '/auth/login',      // Página de login personalizada
    error: '/auth/error',        // Página de erro
    verifyRequest: '/auth/verify', // Verificação de email
  },

  // Callbacks para personalizar comportamento
  callbacks: {
    // Callback executado quando usuário faz login
    async signIn({ user, account, profile }) {
      // Você pode adicionar validações aqui
      // Por exemplo: verificar domínio do email
      return true;
    },

    // Callback para personalizar JWT
    async jwt({ token, user, account }) {
      // Adiciona informações extras ao token
      if (user) {
        token.id = user.id;
        token.nivel = (user as any).nivel || 1;
        token.pontos = (user as any).pontos || 0;
      }
      return token;
    },

    // Callback para personalizar sessão
    async session({ session, token }) {
      // Adiciona informações do token à sessão
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nivel = token.nivel;
        (session.user as any).pontos = token.pontos;
      }

      // Atualiza último acesso
      if (token.id) {
        await prisma.user.update({
          where: { id: token.id as string },
          data: { ultimoAcesso: new Date() }
        }).catch(() => {});
      }

      return session;
    },

    // Callback para redirecionar após login
    async redirect({ url, baseUrl }) {
      // Se URL começa com baseUrl, permite
      if (url.startsWith(baseUrl)) return url;
      // Se URL começa com "/", redireciona relativo ao baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Redireciona para dashboard por padrão
      return `${baseUrl}/dashboard`;
    }
  },

  // Eventos para logging
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ Login: ${user.email} (Novo: ${isNewUser})`);
      
      // Se é novo usuário, inicializa dados
      if (isNewUser && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            nivel: 1,
            pontos: 0,
            ultimoAcesso: new Date()
          }
        }).catch(console.error);
      }
    },
    async signOut({ session }) {
      console.log(`👋 Logout: ${session?.user?.email}`);
    }
  },

  // Configurações de sessão
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Secret para criptografia
  secret: process.env.NEXTAUTH_SECRET,

  // Debug apenas em desenvolvimento
  debug: process.env.NODE_ENV === "development",
};
