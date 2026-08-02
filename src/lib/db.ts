import { PrismaClient } from '@/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getClient = () => {
  if (typeof window !== 'undefined') {
    return new PrismaClient({} as any);
  }
  
  // Node.js environment
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
  
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma || getClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
