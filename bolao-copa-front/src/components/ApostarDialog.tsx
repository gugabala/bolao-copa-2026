import { useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Props = {
    partidaId: string
    timeCasa: string
    timeVisitante: string
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ApostarDialog({ partidaId, timeCasa, timeVisitante, open, onClose, onSuccess }: Props) {
    const [golsCasa, setGolsCasa] = useState('0')
    const [golsVisitante, setGolsVisitante] = useState('0')

    const apostar = trpc.aposta.apostar.useMutation({
        onSuccess: () => {
            toast.success('Aposta registrada!')
            onSuccess()
            onClose()
        },
        onError: (err) => {
            toast.error(err.message)
        },
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        console.log('golsCasa:', golsCasa, 'golsVisitante:', golsVisitante)
        const casa = Number(golsCasa)
        const visitante = Number(golsVisitante)
        if (golsCasa === '' || golsVisitante === '') {
            toast.error('Informe um placar válido')
            return
        }
        apostar.mutate({ partidaId, golsCasa: casa, golsVisitante: visitante })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Fazer aposta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-medium">{timeCasa}</span>
                            <Input
                                type="number"
                                min={0}
                                max={99}
                                value={golsCasa}
                                onChange={(e) => setGolsCasa(e.target.value)}
                                className="w-16 text-center text-xl font-bold"
                                placeholder="0"
                            />
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground mt-6">×</span>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-medium">{timeVisitante}</span>
                            <Input
                                type="number"
                                min={0}
                                max={99}
                                value={golsVisitante}
                                onChange={(e) => setGolsVisitante(e.target.value)}
                                className="w-16 text-center text-xl font-bold"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={apostar.isPending}
                    >
                        {apostar.isPending ? 'Salvando...' : 'Confirmar aposta'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}