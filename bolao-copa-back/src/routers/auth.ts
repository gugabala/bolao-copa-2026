import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../lib/trpc.js'
import { prisma } from '../lib/prisma.js'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), senha: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const usuario = await prisma.usuario.findUnique({ where: { email: input.email } })
      if (!usuario || !usuario.ativo) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' })
      }

      const senhaOk = await bcrypt.compare(input.senha, usuario.senhaHash)
      if (!senhaOk) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' })
      }

      const token = jwt.sign(
        { usuarioId: usuario.id, perfil: usuario.perfil },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      )

      return {
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: ctx.usuarioId } })
    return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
  }),

  trocarSenha: protectedProcedure
  .input(z.object({
    senhaAtual: z.string().min(6),
    novaSenha: z.string().min(6),
  }))
  .mutation(async ({ ctx, input }) => {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: ctx.usuarioId } })

    const senhaOk = await bcrypt.compare(input.senhaAtual, usuario.senhaHash)
    if (!senhaOk) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Senha atual incorreta' })
    }

    await prisma.usuario.update({
      where: { id: ctx.usuarioId },
      data: { senhaHash: await bcrypt.hash(input.novaSenha, 10) },
    })

    return { ok: true }
  }),
})