import { TipoPontuacao } from '@prisma/client'

type Placar = { golsCasa: number; golsVisitante: number }
type ResultadoPontuacao = { pontos: number; tipo: TipoPontuacao }

export function calcularPontos(aposta: Placar, resultado: Placar): ResultadoPontuacao {
  const placarExato =
    aposta.golsCasa === resultado.golsCasa &&
    aposta.golsVisitante === resultado.golsVisitante

  if (placarExato) {
    return { pontos: 10, tipo: TipoPontuacao.EXATO }
  }

  const apostaFoiEmpate = aposta.golsCasa === aposta.golsVisitante
  const resultadoFoiEmpate = resultado.golsCasa === resultado.golsVisitante

  if (apostaFoiEmpate && resultadoFoiEmpate) {
    return { pontos: 3, tipo: TipoPontuacao.EMPATE }
  }

  const sinal = (p: Placar) =>
    p.golsCasa > p.golsVisitante ? 1 : p.golsCasa < p.golsVisitante ? -1 : 0

  if (sinal(aposta) === sinal(resultado)) {
    return { pontos: 5, tipo: TipoPontuacao.VENCEDOR }
  }

  return { pontos: 0, tipo: TipoPontuacao.ERRO }
}