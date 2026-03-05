import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import Dashboard from './pages/dashboard'
import Inventory from './pages/inventory'
import NewBrew from './pages/new-brew'
import BrewHistory from './pages/brew-history'
import BrewDetail from './pages/brew-detail'
import Setups from './pages/setups'
import ExportPage from './pages/export'
import Settings from './pages/settings'
import Analytics from './pages/analytics'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/beans" element={<Navigate to="/inventory" replace />} />
        <Route path="/equipment" element={<Navigate to="/inventory" replace />} />
        <Route path="/brew/new" element={<NewBrew />} />
        <Route path="/brew/history" element={<BrewHistory />} />
        <Route path="/brew/:id" element={<BrewDetail />} />
        <Route path="/setups" element={<Setups />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
