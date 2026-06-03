import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Layout() {
    const { usuario, logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="bg-background border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <span className="font-semibold text-lg">⚽ Bolão Copa 2026</span>
                    <nav className="flex gap-4">
                        <Link to="/partidas" className="text-sm text-muted-foreground hover:text-foreground">
                            Partidas
                        </Link>
                        <Link to="/ranking" className="text-sm text-muted-foreground hover:text-foreground">
                            Ranking
                        </Link>
                        {isAdmin() && (
                            <>
                                <Link to="/admin/partidas" className="text-sm text-muted-foreground hover:text-foreground">
                                    Resultados
                                </Link>
                                <Link to="/admin/usuarios" className="text-sm text-muted-foreground hover:text-foreground">
                                    Usuários
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{usuario?.nome}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}