import Fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { router } from './lib/trpc.js'
import { createContext } from './lib/trpc.js'
import { authRouter } from './routers/auth.js'
import { adminRouter } from './routers/admin.js'
import { apostaRouter } from './routers/aposta.js'

process.env.TZ = 'America/Sao_Paulo'

export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  aposta: apostaRouter,
})

export type AppRouter = typeof appRouter

const fastify = Fastify({ logger: true })

await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true,
})

await fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext: ({ req }) => createContext(req),
  },
})

fastify.get('/health', () => ({ ok: true, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }))

const port = Number(process.env.PORT ?? 3333)
await fastify.listen({ port, host: '0.0.0.0' })
console.log(`Backend rodando em http://localhost:${port}`)