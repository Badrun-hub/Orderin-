import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function LoginKasir() {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)
  
  const [pin, setPin] = useState('')
  const [errorStatus, setErrorStatus] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorStatus(false)
    
    // Validasi ke Supabase menggunakan kolom pin pada tabel profiles
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('pin', pin)
        .eq('role', 'kasir')
        .eq('is_active', true)
        .single() // expect exactly 1 match

      if (error || !data) {
        throw new Error('Pin salah atau akun non-aktif')
      }

      // Berhasil
      login({ id: data.id, name: data.nama, role: 'kasir' })
      navigate('/kasir/dashboard')

    } catch (err) {
      console.error(err)
      setErrorStatus(true)
      setTimeout(() => setErrorStatus(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 ring-1 ring-primary/20">
            <span className="material-symbols-outlined text-3xl text-primary">point_of_sale</span>
          </div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Kasir Portal</h1>
          <p className="text-on-surface-variant text-sm">Masuk menggunakan PIN Shift Anda</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface-container-low p-8 rounded-[2rem] ghost-border flex flex-col gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">password</span>
            <input 
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN Rahasia"
              className={`w-full bg-surface-container-highest border ${errorStatus ? 'border-error ring-1 ring-error' : 'border-none'} rounded-2xl h-14 pl-12 pr-4 text-center tracking-[0.5em] text-lg font-bold font-headline focus:ring-2 focus:ring-primary outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-on-surface-variant`}
              required
            />
          </div>

          {errorStatus && (
            <p className="text-error text-xs text-center uppercase tracking-widest font-bold animate-pulse">PIN Tidak Sesuai / Akun Dinonaktifkan</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-primary text-on-primary rounded-xl font-headline font-bold text-lg hover:bg-primary/90 active:scale-95 transition-transform shadow-[0_10px_20px_rgba(78,222,163,0.15)] flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Memvalidasi...' : 'Akses Mesin Kasir'}
            <span className="material-symbols-outlined">login</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Masuk sebagai Manager/Admin
          </button>
        </div>
      </div>
    </div>
  )
}
