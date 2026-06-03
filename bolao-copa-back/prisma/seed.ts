import { PrismaClient, Perfil, FaseGrupo, SituacaoPartida } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function prazoAposta(dataHora: Date): Date {
  return new Date(dataHora.getTime() - 30 * 60 * 1000)
}

function brt(dataStr: string, hora: string): Date {
  const [dia, mes] = dataStr.split('/').map(Number)
  const [h, m] = hora.split(':').map(Number)
  return new Date(`2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`)
}

async function main() {
  console.log('Limpando banco...')
  await prisma.pontuacao.deleteMany()
  await prisma.aposta.deleteMany()
  await prisma.partida.deleteMany()
  await prisma.grupoTorneio.deleteMany()
  await prisma.usuario.deleteMany()

  console.log('Criando super admin...')
  await prisma.usuario.create({
    data: {
      email: 'gugabala@gmail.com',
      nome: 'Gustavo',
      senhaHash: await bcrypt.hash('admin123', 10),
      perfil: Perfil.SUPER_ADMIN,
    },
  })

  console.log('Criando grupos...')
  const grupos = await Promise.all([
    prisma.grupoTorneio.create({ data: { nome: 'Grupo A', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo A', ordem: 1 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo B', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo B', ordem: 2 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo C', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo C', ordem: 3 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo D', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo D', ordem: 4 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo E', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo E', ordem: 5 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo F', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo F', ordem: 6 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo G', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo G', ordem: 7 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo H', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo H', ordem: 8 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo I', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo I', ordem: 9 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo J', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo J', ordem: 10 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo K', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo K', ordem: 11 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Grupo L', fase: FaseGrupo.GRUPOS, rotulo: 'Grupo L', ordem: 12 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Segunda Rodada', fase: FaseGrupo.OITAVAS, rotulo: 'Oitavas de Final', ordem: 13 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Oitavas de Final', fase: FaseGrupo.OITAVAS, rotulo: 'Oitavas de Final', ordem: 14 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Quartas de Final', fase: FaseGrupo.QUARTAS, rotulo: 'Quartas de Final', ordem: 15 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Semifinais', fase: FaseGrupo.SEMIFINAL, rotulo: 'Semifinais', ordem: 16 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Terceiro Lugar', fase: FaseGrupo.TERCEIRO_LUGAR, rotulo: 'Disputa 3º Lugar', ordem: 17 } }),
    prisma.grupoTorneio.create({ data: { nome: 'Final', fase: FaseGrupo.FINAL, rotulo: 'Final', ordem: 18 } }),
  ])

  const g: Record<string, string> = {}
  for (const grupo of grupos) g[grupo.nome] = grupo.id

  console.log('Criando partidas...')

  type PartidaInput = {
    grupoNome: string
    timeCasa: string
    timeVisitante: string
    data: string
    hora: string
    aDefinir?: boolean
  }

  const partidas: PartidaInput[] = [
    { grupoNome: 'Grupo A',  timeCasa: 'México',           timeVisitante: 'África do Sul',      data: '11/06', hora: '16:00' },
    { grupoNome: 'Grupo A',  timeCasa: 'Coreia do Sul',    timeVisitante: 'Tchéquia',            data: '11/06', hora: '23:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Canadá',           timeVisitante: 'Bósnia e Herzegovina',data: '12/06', hora: '16:00' },
    { grupoNome: 'Grupo D',  timeCasa: 'Estados Unidos',   timeVisitante: 'Paraguai',            data: '12/06', hora: '22:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Catar',            timeVisitante: 'Suíça',               data: '13/06', hora: '16:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Brasil',           timeVisitante: 'Marrocos',            data: '13/06', hora: '19:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Haiti',            timeVisitante: 'Escócia',             data: '13/06', hora: '22:00' },
    { grupoNome: 'Grupo D',  timeCasa: 'Austrália',        timeVisitante: 'Turquia',             data: '14/06', hora: '01:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Alemanha',         timeVisitante: 'Curaçao',             data: '14/06', hora: '14:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Holanda',          timeVisitante: 'Japão',               data: '14/06', hora: '17:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Costa do Marfim',  timeVisitante: 'Equador',             data: '14/06', hora: '20:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Suécia',           timeVisitante: 'Tunísia',             data: '14/06', hora: '23:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Espanha',          timeVisitante: 'Cabo Verde',          data: '15/06', hora: '13:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Bélgica',          timeVisitante: 'Egito',               data: '15/06', hora: '16:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Arábia Saudita',   timeVisitante: 'Uruguai',             data: '15/06', hora: '19:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Irã',              timeVisitante: 'Nova Zelândia',       data: '15/06', hora: '22:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'França',           timeVisitante: 'Senegal',             data: '16/06', hora: '16:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'Iraque',           timeVisitante: 'Noruega',             data: '16/06', hora: '19:00' },
    { grupoNome: 'Grupo J',  timeCasa: 'Argentina',        timeVisitante: 'Argélia',             data: '16/06', hora: '22:00' },
    { grupoNome: 'Grupo J',  timeCasa: 'Áustria',          timeVisitante: 'Jordânia',            data: '17/06', hora: '01:00' },
    { grupoNome: 'Grupo K',  timeCasa: 'Portugal',         timeVisitante: 'RD Congo',            data: '17/06', hora: '14:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Inglaterra',       timeVisitante: 'Croácia',             data: '17/06', hora: '17:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Gana',             timeVisitante: 'Panamá',              data: '17/06', hora: '20:00' },
    { grupoNome: 'Grupo K',  timeCasa: 'Uzbequistão',      timeVisitante: 'Colômbia',            data: '17/06', hora: '23:00' },
    { grupoNome: 'Grupo A',  timeCasa: 'Tchéquia',         timeVisitante: 'África do Sul',       data: '18/06', hora: '13:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Suíça',            timeVisitante: 'Bósnia e Herzegovina',data: '18/06', hora: '16:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Canadá',           timeVisitante: 'Catar',               data: '18/06', hora: '19:00' },
    { grupoNome: 'Grupo A',  timeCasa: 'México',           timeVisitante: 'Coreia do Sul',       data: '18/06', hora: '22:00' },
    { grupoNome: 'Grupo D',  timeCasa: 'Estados Unidos',   timeVisitante: 'Austrália',           data: '19/06', hora: '16:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Escócia',          timeVisitante: 'Marrocos',            data: '19/06', hora: '19:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Brasil',           timeVisitante: 'Haiti',               data: '19/06', hora: '21:30' },
    { grupoNome: 'Grupo D',  timeCasa: 'Turquia',          timeVisitante: 'Paraguai',            data: '20/06', hora: '00:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Holanda',          timeVisitante: 'Suécia',              data: '20/06', hora: '14:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Alemanha',         timeVisitante: 'Costa do Marfim',     data: '20/06', hora: '17:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Equador',          timeVisitante: 'Curaçao',             data: '20/06', hora: '21:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Tunísia',          timeVisitante: 'Japão',               data: '21/06', hora: '01:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Espanha',          timeVisitante: 'Arábia Saudita',      data: '21/06', hora: '13:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Bélgica',          timeVisitante: 'Irã',                 data: '21/06', hora: '16:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Uruguai',          timeVisitante: 'Cabo Verde',          data: '21/06', hora: '19:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Nova Zelândia',    timeVisitante: 'Egito',               data: '21/06', hora: '22:00' },
    { grupoNome: 'Grupo J',  timeCasa: 'Argentina',        timeVisitante: 'Áustria',             data: '22/06', hora: '14:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'França',           timeVisitante: 'Iraque',              data: '22/06', hora: '18:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'Noruega',          timeVisitante: 'Senegal',             data: '22/06', hora: '21:00' },
    { grupoNome: 'Grupo J',  timeCasa: 'Jordânia',         timeVisitante: 'Argélia',             data: '23/06', hora: '00:00' },
    { grupoNome: 'Grupo K',  timeCasa: 'Portugal',         timeVisitante: 'Uzbequistão',         data: '23/06', hora: '14:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Inglaterra',       timeVisitante: 'Gana',                data: '23/06', hora: '17:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Panamá',           timeVisitante: 'Croácia',             data: '23/06', hora: '20:00' },
    { grupoNome: 'Grupo K',  timeCasa: 'Colômbia',         timeVisitante: 'RD Congo',            data: '23/06', hora: '23:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Suíça',            timeVisitante: 'Canadá',              data: '24/06', hora: '16:00' },
    { grupoNome: 'Grupo B',  timeCasa: 'Bósnia e Herzegovina', timeVisitante: 'Catar',           data: '24/06', hora: '16:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Marrocos',         timeVisitante: 'Haiti',               data: '24/06', hora: '19:00' },
    { grupoNome: 'Grupo C',  timeCasa: 'Escócia',          timeVisitante: 'Brasil',              data: '24/06', hora: '19:00' },
    { grupoNome: 'Grupo A',  timeCasa: 'África do Sul',    timeVisitante: 'Coreia do Sul',       data: '24/06', hora: '22:00' },
    { grupoNome: 'Grupo A',  timeCasa: 'Tchéquia',         timeVisitante: 'México',              data: '24/06', hora: '22:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Curaçao',          timeVisitante: 'Costa do Marfim',     data: '25/06', hora: '17:00' },
    { grupoNome: 'Grupo E',  timeCasa: 'Equador',          timeVisitante: 'Alemanha',            data: '25/06', hora: '17:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Tunísia',          timeVisitante: 'Holanda',             data: '25/06', hora: '20:00' },
    { grupoNome: 'Grupo F',  timeCasa: 'Japão',            timeVisitante: 'Suécia',              data: '25/06', hora: '20:00' },
    { grupoNome: 'Grupo D',  timeCasa: 'Turquia',          timeVisitante: 'Estados Unidos',      data: '25/06', hora: '23:00' },
    { grupoNome: 'Grupo D',  timeCasa: 'Paraguai',         timeVisitante: 'Austrália',           data: '25/06', hora: '23:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'Noruega',          timeVisitante: 'França',              data: '26/06', hora: '16:00' },
    { grupoNome: 'Grupo I',  timeCasa: 'Senegal',          timeVisitante: 'Iraque',              data: '26/06', hora: '16:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Cabo Verde',       timeVisitante: 'Arábia Saudita',      data: '26/06', hora: '21:00' },
    { grupoNome: 'Grupo H',  timeCasa: 'Uruguai',          timeVisitante: 'Espanha',             data: '26/06', hora: '21:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Nova Zelândia',    timeVisitante: 'Bélgica',             data: '27/06', hora: '00:00' },
    { grupoNome: 'Grupo G',  timeCasa: 'Egito',            timeVisitante: 'Irã',                 data: '27/06', hora: '00:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Panamá',           timeVisitante: 'Inglaterra',          data: '27/06', hora: '18:00' },
    { grupoNome: 'Grupo L',  timeCasa: 'Croácia',          timeVisitante: 'Gana',                data: '27/06', hora: '18:00' },
    { grupoNome: 'Grupo K',  timeCasa: 'Colômbia',         timeVisitante: 'Portugal',            data: '27/06', hora: '20:30' },
    { grupoNome: 'Grupo K',  timeCasa: 'RD Congo',         timeVisitante: 'Uzbequistão',         data: '27/06', hora: '20:30' },
    { grupoNome: 'Grupo J',  timeCasa: 'Argélia',          timeVisitante: 'Áustria',             data: '27/06', hora: '23:00' },
    { grupoNome: 'Grupo J',  timeCasa: 'Jordânia',         timeVisitante: 'Argentina',           data: '27/06', hora: '23:00' },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '28/06', hora: '16:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '29/06', hora: '14:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '29/06', hora: '17:30', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '29/06', hora: '22:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '30/06', hora: '14:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '30/06', hora: '18:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '30/06', hora: '22:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '01/07', hora: '13:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '01/07', hora: '17:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '01/07', hora: '21:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '02/07', hora: '16:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '02/07', hora: '20:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '03/07', hora: '00:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '03/07', hora: '15:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '03/07', hora: '19:00', aDefinir: true },
    { grupoNome: 'Segunda Rodada',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '03/07', hora: '22:30', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '04/07', hora: '14:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '04/07', hora: '18:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '05/07', hora: '17:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '05/07', hora: '21:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '06/07', hora: '16:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '06/07', hora: '21:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '07/07', hora: '13:00', aDefinir: true },
    { grupoNome: 'Oitavas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '07/07', hora: '17:00', aDefinir: true },
    { grupoNome: 'Quartas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '09/07', hora: '17:00', aDefinir: true },
    { grupoNome: 'Quartas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '10/07', hora: '16:00', aDefinir: true },
    { grupoNome: 'Quartas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '11/07', hora: '18:00', aDefinir: true },
    { grupoNome: 'Quartas de Final',timeCasa: 'A definir', timeVisitante: 'A definir',           data: '11/07', hora: '22:00', aDefinir: true },
    { grupoNome: 'Semifinais',      timeCasa: 'A definir', timeVisitante: 'A definir',           data: '14/07', hora: '16:00', aDefinir: true },
    { grupoNome: 'Semifinais',      timeCasa: 'A definir', timeVisitante: 'A definir',           data: '15/07', hora: '16:00', aDefinir: true },
    { grupoNome: 'Terceiro Lugar',  timeCasa: 'A definir', timeVisitante: 'A definir',           data: '18/07', hora: '18:00', aDefinir: true },
    { grupoNome: 'Final',           timeCasa: 'A definir', timeVisitante: 'A definir',           data: '19/07', hora: '16:00', aDefinir: true },
  ]

  for (const p of partidas) {
    const dataHora = brt(p.data, p.hora)
    await prisma.partida.create({
      data: {
        grupoTorneioId: g[p.grupoNome],
        timeCasa: p.timeCasa,
        timeVisitante: p.timeVisitante,
        dataHora,
        prazoAposta: prazoAposta(dataHora),
        situacao: SituacaoPartida.AGENDADA,
        aDefinir: p.aDefinir ?? false,
      },
    })
  }

  console.log(`Seed concluído: 1 super admin + ${grupos.length} grupos + ${partidas.length} partidas`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())