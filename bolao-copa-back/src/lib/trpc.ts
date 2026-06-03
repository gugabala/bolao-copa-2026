import { initTRPC, TRPCError } from '@trpc/server'
import { type FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { Perfil } from '@prisma/client'

export type Context = {
  req: FastifyRequest
  usuarioId?: string
  perfil?: Perfil
}

export const createContext = async (req: FastifyRequest): Promise<Context> => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return { req }

  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      usuarioId: string
      perfil: Perfil
    }
    return { req, usuarioId: payload.usuarioId, perfil: payload.perfil }
  } catch {
    return { req }
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.usuarioId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, usuarioId: ctx.usuarioId, perfil: ctx.perfil! } })
})

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.usuarioId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (ctx.perfil !== Perfil.ADMIN && ctx.perfil !== Perfil.SUPER_ADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem executar esta ação' })
  }
  return next({ ctx: { ...ctx, usuarioId: ctx.usuarioId, perfil: ctx.perfil } })
})

export const superAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.usuarioId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (ctx.perfil !== Perfil.SUPER_ADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o super admin pode executar esta ação' })
  }
  return next({ ctx: { ...ctx, usuarioId: ctx.usuarioId, perfil: ctx.perfil } })
})