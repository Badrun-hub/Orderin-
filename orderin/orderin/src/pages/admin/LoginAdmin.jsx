import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function LoginAdmin() {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorStatus, setErrorStatus] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Mockup Validasi MVP: Email admin@orderin.com, Pass admin123
    if (email === 'admin@orderin.com' && password === 'admin123') {
      login({ id: 'a1', name: 'Althea Manager', role: 'admin' })
      navigate('/admin/dashboard')
    } else {
      setErrorStatus(true)
      setTimeout(() => setErrorStatus(false), 2500)
    }
  }

  return (
    <div className="bg-[#050f1c] min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-body text-on-surface">
      {/* Decorative Lights */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-highest mb-6 border border-outline-variant">
            <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-white mb-2">Manager Portal</h1>
          <p className="text-on-surface-variant text-sm">Masuk untuk mengelola operasional Orderin</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant flex flex-col gap-5 relative overflow-hidden shadow-2xl">
          {/* subtle top highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

          <div className="space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-surface-container-highest border-none rounded-xl h-14 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-500"
                required
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-surface-container-highest border-none rounded-xl h-14 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {errorStatus && (
            <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex items-center justify-center gap-2 text-error text-xs animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-sm">error</span>
              Kredensial tidak valid
            </div>
          )}

          <button 
            type="submit"
            className="w-full h-14 mt-2 bg-on-surface text-surface bg-white rounded-xl font-headline font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Masuk Dashboard
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Demo credentials:<br/>
            <span className="text-slate-400">admin@orderin.com / admin123</span>
          </p>
          <button 
            onClick={() => navigate('/kasir/login')}
            className="text-xs text-primary/80 hover:text-primary transition-colors font-bold tracking-widest uppercase"
          >
            ← Kembali ke Portal Kasir
          </button>
        </div>
      </div>
    </div>
  )
}
