import { useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Partida = {
    id: string
    timeCasa: string
    timeVisitante: string
    dataHora: string
    golsCasa: number | null
    golsVisitante: number | null
    situacao: string
    aDefinir: boolean
    grupoTorneio: { nome: string; rotulo: string; ordem: number }
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

function LancarResultadoDialog({
    partida,
    open,
    onClose,
    onSuccess,
}: {
    partida: Partida
    open: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const golsCasaInicial = partida.golsCasa?.toString() ?? '0'
    const golsVisitanteInicial = partida.golsVisitante?.toString() ?? '0'
    const [golsCasa, setGolsCasa] = useState(golsCasaInicial)
    const [golsVisitante, setGolsVisitante] = useState(golsVisitanteInicial)

    const lancar = trpc.admin.lancarResultado.useMutation({
        onSuccess: () => {
            toast.success('Resultado lançado!')
            onSuccess()
            onClose()
        },
        onError: (err) => {
            toast.error(err.message)
        },
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        lancar.mutate({
            partidaId: partida.id,
            golsCasa: Number(golsCasa),
            golsVisitante: Number(golsVisitante),
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Lançar resultado</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-medium">{partida.timeCasa}</span>
                            <Input
                                type="number"
                                min={0}
                                max={99}
                                value={golsCasa}
                                onChange={(e) => setGolsCasa(e.target.value)}
                                className="w-16 text-center text-xl font-bold"
                            />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground mt-6">×</span>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-medium">{partida.timeVisitante}</span>
                            <Input
                                type="number"
                                min={0}
                                max={99}
                                value={golsVisitante}
                                onChange={(e) => setGolsVisitante(e.target.value)}
                                className="w-16 text-center text-xl font-bold"
                            />
                        </div>
                    </div>
                    {partida.situacao === 'FINALIZADA' && (
                        <p className="text-xs text-center text-muted-foreground">
                            Esta partida já tem resultado. Salvar irá recalcular todas as pontuações.
                        </p>
                    )}
                    <Button type="submit" className="w-full" disabled={lancar.isPending}>
                        {lancar.isPending ? 'Salvando...' : 'Salvar resultado'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
function DefinirTimesDialog({
    partida,
    open,
    onClose,
    onSuccess,
}: {
    partida: Partida
    open: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [timeCasa, setTimeCasa] = useState(partida.timeCasa === 'A definir' ? '' : partida.timeCasa)
    const [timeVisitante, setTimeVisitante] = useState(partida.timeVisitante === 'A definir' ? '' : partida.timeVisitante)

    const atualizar = trpc.admin.atualizarPartida.useMutation({
        onSuccess: () => {
            toast.success('Times definidos!')
            onSuccess()
            onClose()
        },
        onError: (err) => toast.error(err.message),
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        atualizar.mutate({
            partidaId: partida.id,
            timeCasa,
            timeVisitante,
            aDefinir: false,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Definir times</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Time da casa</Label>
                        <Input
                            value={timeCasa}
                            onChange={(e) => setTimeCasa(e.target.value)}
                            placeholder="Ex: Brasil"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Time visitante</Label>
                        <Input
                            value={timeVisitante}
                            onChange={(e) => setTimeVisitante(e.target.value)}
                            placeholder="Ex: Argentina"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={atualizar.isPending}>
                        {atualizar.isPending ? 'Salvando...' : 'Confirmar times'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
function CardPartidaAdmin({
    partida,
    onLancar,
    onDefinirTimes,
}: {
    partida: Partida
    onLancar: (p: Partida) => void
    onDefinirTimes: (p: Partida) => void
}) {
    const temResultado = partida.golsCasa !== null && partida.golsVisitante !== null

    return (
        <div className="flex items-center justify-between py-3 px-4 border rounded-lg bg-background">
            <span className="text-xs text-muted-foreground w-28">
                {formatarHorario(partida.dataHora)}
            </span>

            <div className="flex items-center gap-4 flex-1 justify-center">
                <span className="font-medium text-right w-28">{partida.timeCasa}</span>
                {temResultado ? (
                    <span className="text-lg font-bold w-16 text-center">
                        {partida.golsCasa} × {partida.golsVisitante}
                    </span>
                ) : (
                    <span className="text-muted-foreground w-16 text-center">×</span>
                )}
                <span className="font-medium text-left w-28">{partida.timeVisitante}</span>
            </div>

            <div className="flex items-center gap-3">
                {partida.situacao === 'FINALIZADA' && (
                    <Badge variant="secondary">Encerrada</Badge>
                )}
                {partida.aDefinir ? (
                    <Button size="sm" variant="outline" onClick={() => onDefinirTimes(partida)}>
                        Definir times
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => onLancar(partida)}>
                        {temResultado ? 'Corrigir' : 'Lançar'}
                    </Button>
                )}
            </div>
        </div>
    )
}

export function AdminPartidasPage() {
    const [selecionada, setSelecionada] = useState<Partida | null>(null)
    const [definindoTimes, setDefinindoTimes] = useState<Partida | null>(null)
    const { data, isLoading, refetch } = trpc.admin.listarPartidas.useQuery()

    if (isLoading) {
        return <div className="text-muted-foreground">Carregando partidas...</div>
    }

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
            <h1 className="text-2xl font-semibold">Admin — Resultados</h1>
            {gruposOrdenados.map((grupo) => (
                <Card key={grupo.ordem}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{grupo.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {grupo.partidas.map((p) => (
                            <CardPartidaAdmin key={p.id} partida={p} onLancar={setSelecionada} onDefinirTimes={setDefinindoTimes} />
                        ))}
                    </CardContent>
                </Card>
            ))}
            {selecionada && (
                <LancarResultadoDialog
                    partida={selecionada}
                    open={!!selecionada}
                    onClose={() => setSelecionada(null)}
                    onSuccess={() => refetch()}
                />
            )}
            {definindoTimes && (
                <DefinirTimesDialog
                    partida={definindoTimes}
                    open={!!definindoTimes}
                    onClose={() => setDefinindoTimes(null)}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    )
}