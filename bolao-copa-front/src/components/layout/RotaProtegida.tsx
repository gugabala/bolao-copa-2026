import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  children: React.ReactNode
  apenasAdmin?: boolean
}

export function RotaProtegida({ children, apenasAdmin = false }: Props) {
  const { token, isAdmin } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (apenasAdmin && !isAdmin()) return <Navigate to="/partidas" replace />

  return <>{children}</>
}