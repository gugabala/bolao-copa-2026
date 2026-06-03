import { create } from 'zustand'

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: 'SUPER_ADMIN' | 'ADMIN' | 'USUARIO'
}

type AuthStore = {
  token: string | null
  usuario: Usuario | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuth = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('token'),
  usuario: (() => {
    const u = localStorage.getItem('usuario')
    return u ? JSON.parse(u) : null
  })(),
  login: (token, usuario) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    set({ token, usuario })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    set({ token: null, usuario: null })
  },
  isAdmin: () => {
    const perfil = get().usuario?.perfil
    return perfil === 'ADMIN' || perfil === 'SUPER_ADMIN'
  },
}))

export function handleTokenExpirado() {
  useAuth.getState().logout()
  window.location.href = '/login'
}