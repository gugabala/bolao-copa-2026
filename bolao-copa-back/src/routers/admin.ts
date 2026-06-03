import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import { Perfil, SituacaoPartida } from '@prisma/client'
import { router, adminProcedure, superAdminProcedure } from '../lib/trpc.js'
import { prisma } from '../lib/prisma.js'
import { calcularPontos } from '../lib/pontuacao.js'

export const adminRouter = router({

  listarUsuarios: adminProcedure.query(() =>
    prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: 'asc' },
    })
  ),

  criarUsuario: adminProcedure
    .input(z.object({
      nome: z.string().min(2),
      email: z.string().email(),
      senha: z.string().min(6),
      perfil: z.nativeEnum(Perfil).default(Perfil.USUARIO),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.perfil === Perfil.SUPER_ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Não é possível criar outro super admin' })
      }
      if (input.perfil === Perfil.ADMIN && ctx.perfil !== Perfil.SUPER_ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas o super admin pode criar admins' })
      }
      const existe = await prisma.usuario.findUnique({ where: { email: input.email } })
      if (existe) throw new TRPCError({ code: 'CONFLICT', message: 'Email já cadastrado' })

      return prisma.usuario.create({
        data: { nome: input.nome, email: input.email, senhaHash: await bcrypt.hash(input.senha, 10), perfil: input.perfil },
        select: { id: true, nome: true, email: true, perfil: true },
      })
    }),

  alterarPerfilUsuario: superAdminProcedure
    .input(z.object({ usuarioId: z.string().uuid(), perfil: z.nativeEnum(Perfil) }))
    .mutation(async ({ input }) => {
      if (input.perfil === Perfil.SUPER_ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Não é possível promover para super admin' })
      }
      return prisma.usuario.update({
        where: { id: input.usuarioId },
        data: { perfil: input.perfil },
        select: { id: true, nome: true, email: true, perfil: true },
      })
    }),

  desativarUsuario: superAdminProcedure
    .input(z.object({ usuarioId: z.string().uuid() }))
    .mutation(({ input }) =>
      prisma.usuario.update({ where: { id: input.usuarioId }, data: { ativo: false } })
    ),

  listarPartidas: adminProcedure.query(() =>
    prisma.partida.findMany({
      include: { grupoTorneio: true },
      orderBy: [{ grupoTorneio: { ordem: 'asc' } }, { dataHora: 'asc' }],
    })
  ),

  atualizarPartida: adminProcedure
    .input(z.object({
      partidaId: z.string().uuid(),
      timeCasa: z.string().optional(),
      timeVisitante: z.string().optional(),
      aDefinir: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      const { partidaId, ...data } = input
      return prisma.partida.update({ where: { id: partidaId }, data })
    }),

  lancarResultado: adminProcedure
    .input(z.object({
      partidaId: z.string().uuid(),
      golsCasa: z.number().int().min(0),
      golsVisitante: z.number().int().min(0),
    }))
    .mutation(async ({ input }) => {
      const { partidaId, golsCasa, golsVisitante } = input

      await prisma.partida.update({
        where: { id: partidaId },
        data: { golsCasa, golsVisitante, situacao: SituacaoPartida.FINALIZADA },
      })

      await recalcularPontuacoes(partidaId, golsCasa, golsVisitante)

      return { ok: true }
    }),
})

export async function recalcularPontuacoes(
  partidaId: string,
  golsCasa: number,
  golsVisitante: number
) {
  const apostas = await prisma.aposta.findMany({ where: { partidaId } })

  for (const aposta of apostas) {
    const { pontos, tipo } = calcularPontos(
      { golsCasa: aposta.golsCasa, golsVisitante: aposta.golsVisitante },
      { golsCasa, golsVisitante }
    )

    await prisma.pontuacao.upsert({
      where: { usuarioId_partidaId: { usuarioId: aposta.usuarioId, partidaId } },
      create: { usuarioId: aposta.usuarioId, apostoId: aposta.id, partidaId, pontos, tipo },
      update: { pontos, tipo, calculadoEm: new Date() },
    })
  }
}