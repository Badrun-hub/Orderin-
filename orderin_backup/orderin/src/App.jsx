import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PlaceholderPage from './components/ui/PlaceholderPage'
import QRLanding from './pages/customer/QRLanding'
import MenuBrowse from './pages/customer/MenuBrowse'
import Cart from './pages/customer/Cart'
import PilihPembayaran from './pages/customer/PilihPembayaran'
import OrderStatus from './pages/customer/OrderStatus'
import UploadBukti from './pages/customer/UploadBukti'
import LoginKasir from './pages/kasir/LoginKasir'
import DashboardKasir from './pages/kasir/DashboardKasir'
import DetailOrderKasir from './pages/kasir/DetailOrderKasir'
import VerifikasiPembayaran from './pages/kasir/VerifikasiPembayaran'
import LoginAdmin from './pages/admin/LoginAdmin'
import AdminRoutes from './pages/admin/AdminRoutes'
import { useSettingsStore, themePresets } from './store/settingsStore'

function App() {
  const { themeId, themeMode } = useSettingsStore()

  useEffect(() => {
    // Inject Theme Variables ke DOM Root
    const theme = themePresets[themeId] || themePresets.emerald
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-primary-container', theme.primaryContainer)
    root.style.setProperty('--theme-secondary', theme.secondary)
    root.style.setProperty('--theme-on-primary', themeMode === 'light' ? '#ffffff' : '#003824')
    root.style.setProperty('--theme-on-primary-container', themeMode === 'light' ? '#ffffff' : '#00422b')
    
    if (themeMode === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.setProperty('--theme-surface-container-lowest', '#ffffff')
      root.style.setProperty('--theme-surface-container-low', '#fafafa')
      root.style.setProperty('--theme-surface-container', '#f5f5f5')
      root.style.setProperty('--theme-surface-container-high', '#eeeeee')
      root.style.setProperty('--theme-surface-container-highest', '#e0e0e0')
      root.style.setProperty('--theme-surface', '#ffffff')
      root.style.setProperty('--theme-surface-variant', '#f5f5f5')
      root.style.setProperty('--theme-on-surface', '#1a1a1a')
      root.style.setProperty('--theme-on-surface-variant', '#4a4a4a')
      root.style.setProperty('--theme-outline', '#9e9e9e')
      root.style.setProperty('--theme-outline-variant', '#0000000d')
      root.style.setProperty('--theme-background', '#f8f9fa')
      root.style.setProperty('--theme-on-background', '#1a1a1a')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
      root.style.setProperty('--theme-surface-container-lowest', '#050f1c')
      root.style.setProperty('--theme-surface-container-low', '#091421')
      root.style.setProperty('--theme-surface-container', '#0d1929')
      root.style.setProperty('--theme-surface-container-high', '#132033')
      root.style.setProperty('--theme-surface-container-highest', '#1a2b41')
      root.style.setProperty('--theme-surface', '#091421')
      root.style.setProperty('--theme-surface-variant', '#132033')
      root.style.setProperty('--theme-on-surface', '#d9e3f6')
      root.style.setProperty('--theme-on-surface-variant', '#86948a')
      root.style.setProperty('--theme-outline', 'transparent')
      root.style.setProperty('--theme-outline-variant', 'transparent')
      root.style.setProperty('--theme-background', '#091421')
      root.style.setProperty('--theme-on-background', '#d9e3f6')
    }
  }, [themeId, themeMode])

  return (
    <Router>
      <Routes>
        {/* Redirect root to admin login for now */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Kasir Routes (First to avoid conflict) */}
        <Route path="/kasir/login" element={<LoginKasir />} />
        <Route path="/kasir/dashboard" element={<DashboardKasir />} />
        <Route path="/kasir/order/:orderId" element={<DetailOrderKasir />} />
        <Route path="/kasir/order/:orderId/verify" element={<VerifikasiPembayaran />} />
        <Route path="/kasir/shift" element={<PlaceholderPage title="Manajemen Shift Kasir" />} />

        {/* Admin Routes (Consolidated into AdminRoutes with Layout) */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Customer Routes (Dynamic Path - Must be last) */}
        <Route path="/:lokasi/:tableNo" element={<QRLanding />} />
        <Route path="/:lokasi/:tableNo/menu" element={<MenuBrowse />} />
        <Route path="/:lokasi/:tableNo/cart" element={<Cart />} />
        <Route path="/:lokasi/:tableNo/payment" element={<PilihPembayaran />} />
        <Route path="/:lokasi/:tableNo/upload" element={<UploadBukti />} />
        <Route path="/:lokasi/:tableNo/status" element={<OrderStatus />} />
        
        {/* 404 Not Found  */}
        <Route path="*" element={<PlaceholderPage title="404 - Halaman Tidak Ditemukan" />} />
      </Routes>
    </Router>
  )
}

export default App
