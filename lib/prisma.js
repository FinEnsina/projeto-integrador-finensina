// Evita criar múltiplas instâncias do PrismaClient durante hot-reload
// em desenvolvimento e em ambiente serverless (Vercel).
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
