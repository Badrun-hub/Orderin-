import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import DashboardAdmin from './DashboardAdmin'
import KelolaMenu from './KelolaMenu'
import KelolaMeja from './KelolaMeja'
import Analytics from './Analytics'
import ManajemenKasir from './ManajemenKasir'
import Settings from './Settings'
import PlaceholderPage from '../../components/ui/PlaceholderPage'

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="menu" element={<KelolaMenu />} />
        <Route path="kategori" element={<PlaceholderPage title="Kelola Kategori" />} />
        <Route path="meja" element={<KelolaMeja />} />
        <Route path="laporan" element={<PlaceholderPage title="Laporan & Sales" />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="kasir" element={<ManajemenKasir />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </AdminLayout>
  )
}
