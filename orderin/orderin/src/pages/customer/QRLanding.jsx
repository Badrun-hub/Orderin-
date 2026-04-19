import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { supabase } from '../../lib/supabase'
import { useSettingsStore } from '../../store/settingsStore'

export default function QRLanding() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  const setSession = useSessionStore(state => state.setSession)
  const { cafeName, cafeLogo } = useSettingsStore()
  
  const [nama, setNama] = useState('')
  const [telepon, setTelepon] = useState('')
  const [resolvedTable, setResolvedTable] = useState(null)

  // Resolve Table Name & ID using its Location and Number
  useEffect(() => {
    const resolveTable = async () => {
      try {
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .eq('lokasi', lokasi)
          .eq('nomor_meja', tableNo)
          .maybeSingle()
        
        if (data) setResolvedTable(data)
      } catch (err) {
        console.error("Table resolution error:", err)
      }
    }
    resolveTable()
  }, [lokasi, tableNo])

  const handleStartOrder = (e) => {
    e.preventDefault()
    if (!nama.trim()) return alert("Mohon isi nama Anda")
    
    // Save session
    setSession({
      tableId: resolvedTable?.id || null, // UUID asli database
      tableNumber: tableNo,
      lokasi: lokasi,
      customerName: nama,
      phone: telepon
    })
    
    // Redirect to menu using new structure
    navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center relative px-6 pt-20 pb-12 overflow-hidden min-h-screen border-none bg-surface text-on-surface">
      {/* TopAppBar Fragment: Minimal Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#091421]/80 backdrop-blur-md flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          {cafeLogo ? (
             <img src={cafeLogo} alt="Logo" className="w-8 h-8 rounded-full border border-outline-variant object-cover shadow-sm" />
          ) : (
             <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>restaurant_menu</span>
          )}
          <h1 className="text-xl font-bold text-primary tracking-tight font-headline">{cafeName || 'Orderin'}</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-slate-400">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </header>

      {/* Background Visual */}
      <div className="absolute inset-0 z-0">
        <img alt="Restaurant Atmosphere" className="w-full h-full object-cover opacity-20 scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIhuBtUGEEr4WcrhOdK-SSSodjaxbP_N2sjoVZZd-mKiPXGbcpX_-d3VFYbqnWiIUkUkYcpdWc3aLtSR202OFY6RkZYM4U1ne7u_m2HJh8E4_ADNy1y_NSuFHAfq92lV31iuyZjWNi5h4Xv172XUyT8UrHF_cFS9NiAwEMlpSYWfEJQ1LV5kHvDb_ALIFnchb05CdTAx-IVs0O9w07LWDGzKd5FpJxezxWf54KwwFj-9A_pyrAic_6SG6bvkoeInTbcClMV6FDX34"/>
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Branding Section */}
        <div className="text-center mb-10 mt-4">
          <div className="mb-6 inline-flex p-4 rounded-3xl bg-primary/10 ring-1 ring-primary/20 overflow-hidden">
            {cafeLogo ? (
                <img src={cafeLogo} alt="Logo Kafe" className="w-16 h-16 object-cover rounded-2xl" />
            ) : (
                <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            )}
          </div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-3">
            Selamat Datang di {cafeName || 'Orderin'}
          </h2>
          <p className="text-on-surface-variant text-lg">
            Cita rasa istimewa, dipesan seketika
          </p>
        </div>
        
        {/* Input Card */}
        <form onSubmit={handleStartOrder} className="bg-[#2b3544]/60 backdrop-blur-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(187,202,191,0.05)] w-full p-8 rounded-[2rem] flex flex-col gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Nama Pelanggan
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">person</span>
                <input 
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full h-14 bg-surface-container-highest rounded-xl pl-12 pr-4 text-on-surface border-none focus:ring-2 focus:ring-surface-tint transition-all placeholder:text-slate-500" 
                  placeholder="Nama Anda" 
                  type="text"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Nomor Telepon (Opsional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">phone_iphone</span>
                <input 
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full h-14 bg-surface-container-highest rounded-xl pl-12 pr-4 text-on-surface border-none focus:ring-2 focus:ring-surface-tint transition-all placeholder:text-slate-500" 
                  placeholder="0812..." 
                  type="tel"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Nomor Meja
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl">table_restaurant</span>
                <input 
                  className="w-full h-14 bg-surface-container/50 rounded-xl pl-12 pr-4 text-primary font-bold border-none cursor-default focus:ring-0" 
                  readOnly 
                  type="text" 
                  value={`Meja ${tableNo} (${lokasi})`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-bold tracking-tighter">
                  Terdaftar
                </span>
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full h-16 bg-gradient-to-r from-[#4edea3] to-[#10b981] text-[#003824] rounded-xl font-headline text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
            Mulai Memesan
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </div>
      
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
    </div>
  )
}
