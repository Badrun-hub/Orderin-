import { useNavigate, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'
import { useAuthStore } from '../../store/authStore'

export default function SidebarAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cafeName, cafeLogo } = useSettingsStore()
  const { user, logout } = useAuthStore()
  
  // Fallback if no user in store
  const displayUser = user || { name: 'Manager', role: 'Admin' }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'menu', label: 'Menu', icon: 'restaurant_menu', path: '/admin/menu' },
    { id: 'meja', label: 'Meja & QR', icon: 'qr_code_2', path: '/admin/meja' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring', path: '/admin/analytics' },
    { id: 'branding', label: 'Branding', icon: 'palette', path: '/admin/settings' }
  ]

  const handleLogout = () => {
    if (window.confirm('Ingin keluar dari Portal Admin?')) {
      logout()
      navigate('/admin/login')
    }
  }

  const activeId = navItems.find(item => location.pathname === item.path)?.id

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container flex-col py-8 px-4 flex-shrink-0 z-40 border-none transition-all duration-500 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.05)]">
      {/* Branding Section */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border border-outline-variant">
          {cafeLogo ? (
            <img src={cafeLogo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          )}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg font-black text-primary leading-none font-headline tracking-tighter truncate">{cafeName || 'Orderin'}</h2>
          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">RESTAURANT ADMIN</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 transition-all duration-300 rounded-xl group ${
              location.pathname === item.path 
              ? 'bg-primary/10 text-primary font-black shadow-inner border-l-4 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
            }`}
          >
            <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'fill-1' : ''}`} style={{ fontVariationSettings: location.pathname === item.path ? "'FILL' 1" : "" }}>
              {item.icon}
            </span>
            <span className="text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Profile & Footer Action */}
      <div className="mt-auto pt-6 space-y-4">
        <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant shadow-inner">
          <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={handleLogout}>
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:text-error group-hover:bg-error/20 transition-all border border-outline-variant shadow-sm overflow-hidden text-primary">
               <span className="material-symbols-outlined">person</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate group-hover:text-error transition-colors">{displayUser.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate font-black uppercase tracking-widest">{displayUser.role}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/settings')}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.02] active:scale-95 duration-200 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
             <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>magic_button</span>
             Update Studio
          </button>
        </div>
      </div>
    </aside>
  )
}
