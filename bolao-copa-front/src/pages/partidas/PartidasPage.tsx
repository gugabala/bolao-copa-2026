import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApostarDialog } from '@/components/ApostarDialog'
import { Skeleton } from '@/components/ui/skeleton'

type Partida = {
    id: string
    timeCasa: string
    timeVisitante: string
    dataHora: string
    prazoAposta: string
    golsCasa: number | null
    golsVisitante: number | null
    situacao: string
    aDefinir: boolean
    aberto: boolean
    minhaAposta: {
        golsCasa: number
        golsVisitante: number
        pontuacao: { pontos: number; tipo: string } | null
    } | null
    grupoTorneio: { nome: string; rotulo: string; fase: string; ordem: number }
}

type PartidaSelecionada = {
    id: string
    timeCasa: string
    timeVisitante: string
}

function formatarHorario(dataHora: string) {
    return new Date(dataHora).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    })
}


function BadgeSituacao({ partida }: { partida: Partida }) {
    if (partida.situacao === 'FINALIZADA') {
        return <Badge variant="secondary">Encerrada</Badge>
    }
    if (!partida.aberto) {
        return <Badge variant="destructive">Apostas encerradas</Badge>
    }
    return <Badge variant="default">Aberta</Badge>
}

function BadgePontuacao({ tipo, pontos }: { tipo: string; pontos: number }) {
    if (tipo === 'EXATO') return <Badge className="bg-green-600 text-white text-xs">🎯 {pontos}pts</Badge>
    if (tipo === 'VENCEDOR') return <Badge className="bg-blue-600 text-white text-xs">✅ {pontos}pts</Badge>
    if (tipo === 'EMPATE') return <Badge className="bg-yellow-600 text-white text-xs">🤝 {pontos}pts</Badge>
    return <Badge variant="destructive" className="text-xs">❌ {pontos}pts</Badge>
}


function CardPartida({
    partida,
    onApostar,
}: {
    partida: Partida
    onApostar: (p: PartidaSelecionada) => void
}) {
    const temResultado = partida.golsCasa !== null && partida.golsVisitante !== null

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 px-4 border rounded-lg bg-background">
            <div className="flex items-center gap-2 sm:w-48">
                <BadgeSituacao partida={partida} />
                <span className="text-xs text-muted-foreground">
                    {formatarHorario(partida.dataHora)}
                </span>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-center">
                <span className="font-medium text-right flex-1">{partida.timeCasa}</span>
                {temResultado ? (
                    <span className="text-lg font-bold w-14 text-center shrink-0">
                        {partida.golsCasa} × {partida.golsVisitante}
                    </span>
                ) : (
                    <span className="text-muted-foreground w-14 text-center shrink-0">×</span>
                )}
                <span className="font-medium text-left flex-1">{partida.timeVisitante}</span>
            </div>

            <div className="flex justify-end sm:w-44">
                {partida.minhaAposta ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {partida.minhaAposta.golsCasa} × {partida.minhaAposta.golsVisitante}
                        </span>
                        {partida.minhaAposta.pontuacao ? (
                            <BadgePontuacao
                                tipo={partida.minhaAposta.pontuacao.tipo}
                                pontos={partida.minhaAposta.pontuacao.pontos}
                            />
                        ) : null}
                    </div>
                ) : partida.aberto && !partida.aDefinir ? (
                    <button
                        className="text-sm text-blue-500 hover:underline"
                        onClick={() => onApostar({
                            id: partida.id,
                            timeCasa: partida.timeCasa,
                            timeVisitante: partida.timeVisitante,
                        })}
                    >
                        Apostar
                    </button>
                ) : null}
            </div>
        </div>
    )
}

function GrupoPartidas({
    nome,
    partidas,
    onApostar,
}: {
    nome: string
    partidas: Partida[]
    onApostar: (p: PartidaSelecionada) => void
}) {
    const [aberto, setAberto] = useState(true)

    const totalApostas = partidas.filter((p) => p.minhaAposta).length
    const totalAbertas = partidas.filter((p) => p.aberto && !p.aDefinir && !p.minhaAposta).length

    return (
        <Card>
            <CardHeader
                className="pb-3 cursor-pointer select-none"
                onClick={() => setAberto(!aberto)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{nome}</CardTitle>
                    <div className="flex items-center gap-2">
                        {totalAbertas > 0 && (
                            <Badge variant="default" className="text-xs">
                                {totalAbertas} aberta{totalAbertas > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {totalApostas > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {totalApostas} palpite{totalApostas > 1 ? 's' : ''}
                            </Badge>
                        )}
                        <span className="text-muted-foreground text-sm">{aberto ? '▲' : '▼'}</span>
                    </div>
                </div>
            </CardHeader>
            {aberto && (
                <CardContent className="space-y-2">
                    {partidas.map((p) => (
                        <CardPartida key={p.id} partida={p} onApostar={onApostar} />
                    ))}
                </CardContent>
            )}
        </Card>
    )
}
function PartidasSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                                <Skeleton className="h-4 w-20" />
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
export function PartidasPage() {
    const [selecionada, setSelecionada] = useState<PartidaSelecionada | null>(null)
    const { data, isLoading, refetch } = trpc.aposta.listarPartidas.useQuery()

    if (isLoading) return <PartidasSkeleton />

    if (!data) return null

    const grupos = data.reduce<Record<string, { nome: string; ordem: number; partidas: Partida[] }>>(
        (acc, partida) => {
            const key = partida.grupoTorneio.nome
            if (!acc[key]) {
                acc[key] = {
                    nome: partida.grupoTorneio.rotulo,
                    ordem: partida.grupoTorneio.ordem,
                    partidas: [],
                }
            }
            acc[key].partidas.push(partida as Partida)
            return acc
        },
        {}
    )

    const gruposOrdenados = Object.values(grupos).sort((a, b) => a.ordem - b.ordem)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Partidas</h1>
            {gruposOrdenados.map((grupo) => (
                <GrupoPartidas
                    key={grupo.ordem}
                    nome={grupo.nome}
                    partidas={grupo.partidas}
                    onApostar={setSelecionada}
                />
            ))}
            {selecionada && (
                <ApostarDialog
                    partidaId={selecionada.id}
                    timeCasa={selecionada.timeCasa}
                    timeVisitante={selecionada.timeVisitante}
                    open={!!selecionada}
                    onClose={() => setSelecionada(null)}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    )
}