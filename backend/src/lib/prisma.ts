import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const DATABASE_URL = process.env.DATABASE_URL || ''

function createPrisma(): PrismaClient {
  if (!DATABASE_URL) {
    console.warn('[Prisma] No DATABASE_URL — DB operations will fail gracefully')
  }
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter } as any)
}

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined
}

export const prisma: PrismaClient =
  global.prismaInstance ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma
}
