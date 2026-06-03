import { useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: 'SUPER_ADMIN' | 'ADMIN' | 'USUARIO'
  ativo: boolean
  criadoEm: string
}

function BadgePerfil({ perfil }: { perfil: Usuario['perfil'] }) {
  if (perfil === 'SUPER_ADMIN') return <Badge>Super Admin</Badge>
  if (perfil === 'ADMIN') return <Badge variant="secondary">Admin</Badge>
  return <Badge variant="outline">Usuário</Badge>
}

function CriarUsuarioDialog({
  open,
  onClose,
  onSuccess,
  isSuperAdmin,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  isSuperAdmin: boolean
}) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState<'ADMIN' | 'USUARIO'>('USUARIO')

  const criar = trpc.admin.criarUsuario.useMutation({
    onSuccess: () => {
      toast.success('Usuário criado!')
      onSuccess()
      onClose()
      setNome('')
      setEmail('')
      setSenha('')
      setPerfil('USUARIO')
    },
    onError: (err) => toast.error(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criar.mutate({ nome, email, senha, perfil })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
          </div>
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>Perfil</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as 'ADMIN' | 'USUARIO')}
              >
                <option value="USUARIO">Usuário</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={criar.isPending}>
            {criar.isPending ? 'Criando...' : 'Criar usuário'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUsuariosPage() {
  const { usuario } = useAuth()
  const isSuperAdmin = usuario?.perfil === 'SUPER_ADMIN'
  const [dialogAberto, setDialogAberto] = useState(false)

  const { data, isLoading, refetch } = trpc.admin.listarUsuarios.useQuery()

  const alterarPerfil = trpc.admin.alterarPerfilUsuario.useMutation({
    onSuccess: () => { toast.success('Perfil alterado!'); refetch() },
    onError: (err) => toast.error(err.message),
  })

  const desativar = trpc.admin.desativarUsuario.useMutation({
    onSuccess: () => { toast.success('Usuário desativado!'); refetch() },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin — Usuários</h1>
        <Button onClick={() => setDialogAberto(true)}>Novo usuário</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{data.length} usuários cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-3 px-4 border rounded-lg bg-background"
            >
              <div className="flex items-center gap-3">
                <BadgePerfil perfil={u.perfil as Usuario['perfil']} />
                <div>
                  <p className="text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                {!u.ativo && (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>

              {isSuperAdmin && u.perfil !== 'SUPER_ADMIN' && u.ativo && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      alterarPerfil.mutate({
                        usuarioId: u.id,
                        perfil: u.perfil === 'ADMIN' ? 'USUARIO' : 'ADMIN',
                      })
                    }
                  >
                    {u.perfil === 'ADMIN' ? 'Remover admin' : 'Tornar admin'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Desativar ${u.nome}?`)) {
                        desativar.mutate({ usuarioId: u.id })
                      }
                    }}
                  >
                    Desativar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <CriarUsuarioDialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        onSuccess={() => refetch()}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  )
}