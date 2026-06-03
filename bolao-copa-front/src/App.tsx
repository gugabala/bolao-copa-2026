import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { Layout } from '@/components/layout/Layout'
import { RotaProtegida } from '@/components/layout/RotaProtegida'
import { PartidasPage } from '@/pages/partidas/PartidasPage'
import { AdminPartidasPage } from '@/pages/admin/AdminPartidasPage'
import { AdminUsuariosPage } from '@/pages/admin/AdminUsuariosPage'
import { RankingPage } from '@/pages/ranking/RankingPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route index element={<Navigate to="/partidas" replace />} />
        <Route path="partidas" element={<PartidasPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="admin" element={<Navigate to="/admin/partidas" replace />} />
        <Route path="admin/partidas" element={<AdminPartidasPage />} />
        <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
      </Route>
    </Routes>
  )
}

export default App