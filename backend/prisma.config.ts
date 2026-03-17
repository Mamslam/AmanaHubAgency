import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/amanahub',
})
