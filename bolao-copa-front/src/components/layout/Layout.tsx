import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Layout() {
  const { usuario, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function linkClass(path: string) {
    const ativo = location.pathname.startsWith(path)
    return `text-sm transition-colors ${ativo
      ? 'text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground'
    }`
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-lg">⚽ Bolão Copa 2026</span>
            <nav className="hidden sm:flex gap-4">
              <Link to="/partidas" className={linkClass('/partidas')}>Partidas</Link>
              <Link to="/ranking" className={linkClass('/ranking')}>Ranking</Link>
              <Link to="/perfil" className={linkClass('/perfil')}>Perfil</Link>
              {isAdmin() && (
                <>
                  <Link to="/admin/partidas" className={linkClass('/admin/partidas')}>Resultados</Link>
                  <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')}>Usuários</Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">{usuario?.nome}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
            <button
              className="sm:hidden text-muted-foreground"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              ☰
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="sm:hidden border-t mt-3 pt-3 flex flex-col gap-3 max-w-5xl mx-auto">
            <Link to="/partidas" className={linkClass('/partidas')} onClick={() => setMenuAberto(false)}>Partidas</Link>
            <Link to="/ranking" className={linkClass('/ranking')} onClick={() => setMenuAberto(false)}>Ranking</Link>
            <Link to="/perfil" className={linkClass('/perfil')} onClick={() => setMenuAberto(false)}>Perfil</Link>
            {isAdmin() && (
              <>
                <Link to="/admin/partidas" className={linkClass('/admin/partidas')} onClick={() => setMenuAberto(false)}>Resultados</Link>
                <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')} onClick={() => setMenuAberto(false)}>Usuários</Link>
              </>
            )}
            <span className="text-sm text-muted-foreground">{usuario?.nome}</span>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}