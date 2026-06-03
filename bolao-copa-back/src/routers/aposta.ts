import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../lib/trpc.js'
import { prisma } from '../lib/prisma.js'

export const apostaRouter = router({

  listarPartidas: protectedProcedure
    .input(z.object({ apenasAbertos: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const partidas = await prisma.partida.findMany({
        include: {
          grupoTorneio: true,
          apostas: {
            where: { usuarioId: ctx.usuarioId },
            select: {
              golsCasa: true,
              golsVisitante: true,
              criadoEm: true,
              pontuacao: {
                select: { pontos: true, tipo: true }
              }
            },
          },
        },
        orderBy: [{ grupoTorneio: { ordem: 'asc' } }, { dataHora: 'asc' }],
      })

      const agora = new Date()
      return partidas.map((p) => ({
        ...p,
        aberto: agora < p.prazoAposta,
        minhaAposta: p.apostas[0] ?? null,
      }))
    }),


  apostar: protectedProcedure
    .input(z.object({
      partidaId: z.string().uuid(),
      golsCasa: z.number().int().min(0).max(99),
      golsVisitante: z.number().int().min(0).max(99),
    }))
    .mutation(async ({ ctx, input }) => {
      const partida = await prisma.partida.findUnique({ where: { id: input.partidaId } })
      if (!partida) throw new TRPCError({ code: 'NOT_FOUND', message: 'Partida não encontrada' })
      if (partida.aDefinir) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Partida ainda não definida' })
      if (partida.situacao === 'FINALIZADA') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta partida já foi encerrada' })

      const agora = new Date()
      if (agora >= partida.prazoAposta) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Prazo para apostas encerrado' })
      }

      const existe = await prisma.aposta.findUnique({
        where: { usuarioId_partidaId: { usuarioId: ctx.usuarioId, partidaId: input.partidaId } },
      })
      if (existe) throw new TRPCError({ code: 'CONFLICT', message: 'Você já apostou nesta partida' })

      return prisma.aposta.create({
        data: {
          usuarioId: ctx.usuarioId,
          partidaId: input.partidaId,
          golsCasa: input.golsCasa,
          golsVisitante: input.golsVisitante,
        },
      })
    }),

  ranking: protectedProcedure.query(() =>
    prisma.usuario.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        pontuacoes: { select: { pontos: true } },
      },
    }).then((usuarios) =>
      usuarios
        .map((u) => ({
          id: u.id,
          nome: u.nome,
          totalPontos: u.pontuacoes.reduce((acc, p) => acc + p.pontos, 0),
        }))
        .sort((a, b) => b.totalPontos - a.totalPontos)
    )
  ),
})