import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore, themePresets } from '../../store/settingsStore'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import { formatRupiah } from '../../utils/formatRupiah'

export default function Settings() {
  const navigate = useNavigate()
  const { cafeName, cafeLogo, themeId, themeMode, updateSettings } = useSettingsStore()
  const { user, logout } = useAuthStore()
  const fileInputRef = useRef(null)
  
  const [formName, setFormName] = useState(cafeName || 'Orderin')
  const [formLogo, setFormLogo] = useState(cafeLogo || null)
  const [selectedTheme, setSelectedTheme] = useState(themeId || 'emerald')
  const [selectedMode, setSelectedMode] = useState(themeMode || 'dark')
  const [isUploading, setIsUploading] = useState(false)
  
  const [previewMenus, setPreviewMenus] = useState([])

  // Fetch real menu items for preview
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data } = await api.get('/menus', { params: { available: 'true' } })
        if (data && data.length > 0) {
          setPreviewMenus(data.slice(0, 2))
        } else {
          setPreviewMenus([
            { id: 'f1', nama: 'Latte Macchiato', harga: 35000, categories: { nama: 'Coffee Base' } },
            { id: 'f2', nama: 'Butter Croissant', harga: 28000, categories: { nama: 'Pastry & Bakery' } }
          ])
        }
      } catch (e) {
        console.error(e)
        setPreviewMenus([
          { id: 'f1', nama: 'Latte Macchiato', harga: 35000 },
          { id: 'f2', nama: 'Butter Croissant', harga: 28000 }
        ])
      }
    }
    fetchMenus()
  }, [])

  // Handle Foto Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post('/upload/brand', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setFormLogo(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      alert("Gagal Upload: " + (err.response?.data?.error || err.message))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    updateSettings({ cafeName: formName, cafeLogo: formLogo, themeId: selectedTheme, themeMode: selectedMode })
    alert("Perubahan Berhasil Disimpan! Identitas kafe dan tema telah diperbarui di semua perangkat.")
  }

  const themeOptions = [
    { id: 'emerald', color: '#10B981' },
    { id: 'amber', color: '#F59E0B' },
    { id: 'sapphire', color: '#3B82F6' },
    { id: 'ruby', color: '#EF4444' }
  ]

  const activeTheme = themePresets[selectedTheme] || themePresets.emerald

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">Orderin Studio</h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-80 uppercase tracking-[0.2em]">PENGATURAN BRANDING & IDENTITAS</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isUploading}
          className="w-full sm:w-fit px-10 py-4 bg-primary text-on-primary font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group" 
        >
          <span className="material-symbols-outlined text-[24px] transition-transform group-hover:rotate-12">auto_awesome</span>
          SIMPAN PERUBAHAN
        </button>
      </div>

      <div className="flex flex-col gap-10">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Pengaturan Branding</h2>
            <p className="text-on-surface-variant max-w-2xl text-sm font-medium">Personalisasi identitas visual restoran Anda untuk meningkatkan pengalaman pelanggan di aplikasi mobile.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-7 space-y-8">
              <section className="bg-surface-container rounded-3xl p-8 space-y-8 border-none shadow-[0_10px_40px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
                
                {/* Nama Cafe */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant font-label px-1">Nama Cafe</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-2xl px-5 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 transition-all outline-none font-black text-xl placeholder:text-on-surface-variant/30 hover:bg-surface-variant transition-all duration-300 shadow-inner" 
                    placeholder="Masukkan Nama Resto"
                  />
                </div>

                <div className="h-px w-full bg-on-surface/10"></div>

                {/* Logo Cafe */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant font-label px-1">Logo Cafe</label>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div 
                      className="w-32 h-32 bg-surface-container-highest rounded-3xl flex items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden relative shadow-inner"
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      {formLogo ? (
                        <img src={formLogo} alt="Logo Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">image</span>
                          <span className="text-[8px] font-bold text-on-surface-variant group-hover:text-primary">UPLOAD</span>
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-surface/60 flex items-center justify-center backdrop-blur-sm z-10">
                          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        </div>
                      )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                    <div className="flex-grow space-y-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isUploading}
                        className="w-full sm:w-fit px-6 py-3.5 bg-primary text-on-primary text-xs font-black uppercase tracking-[0.1em] rounded-xl hover:translate-y-[-2px] transition-all active:scale-95 shadow-xl shadow-primary/10 disabled:opacity-50"
                      >
                        {isUploading ? 'Sedang Mengunggah...' : 'Unggah Logo Baru'}
                      </button>
                      <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">Rasio 1:1 direkomendasikan untuk penampilan terbaik.<br/>Format: PNG, JPG, atau WEBP. Maks 5MB.</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-px w-full bg-on-surface/10"></div>

                {/* Warna Utama */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant font-label px-1">Warna Aksentuasi (Brand Color)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-surface-container-low/50 p-6 rounded-[2rem] border border-outline-variant">
                    <div className="w-16 h-16 rounded-3xl p-1 bg-surface-container shadow-2xl flex items-center justify-center transition-all duration-300">
                      <div className="w-full h-full rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: activeTheme.primaryContainer }}>
                        <span className="material-symbols-outlined text-on-primary text-2xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow flex items-center gap-5 w-full">
                      <div className="flex-grow flex gap-4 overflow-x-auto pb-1 no-scrollbar">
                        {themeOptions.map((opt) => (
                          <button 
                            key={opt.id}
                            onClick={() => setSelectedTheme(opt.id)}
                            className={`w-12 h-12 rounded-2xl flex-shrink-0 transition-all duration-500 flex items-center justify-center ${selectedTheme === opt.id ? 'scale-110 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)]' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                            style={{ backgroundColor: opt.color }}
                          >
                            {selectedTheme === opt.id && (
                              <span className="material-symbols-outlined text-on-surface text-xl drop-shadow-md">check_circle</span>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="bg-surface-container rounded-xl px-4 py-3 border border-outline-variant shadow-inner">
                         <span className="text-[11px] font-black font-mono text-on-surface transition-all uppercase">{activeTheme.primary}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-on-surface/10"></div>

                {/* Tema Default */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant font-label px-1">Tema Tampilan (Interface)</label>
                  <div className="flex p-2 bg-surface-container-low rounded-[1.5rem] w-full sm:w-fit shadow-inner">
                    <button onClick={() => setSelectedMode('light')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 text-xs font-black transition-all duration-300 rounded-xl ${selectedMode === 'light' ? 'bg-surface-container-highest text-on-surface shadow-xl' : 'text-on-surface-variant hover:text-on-surface'}`}>
                       <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: selectedMode === 'light' ? "'FILL' 1" : "" }}>light_mode</span>
                       TERANG
                    </button>
                    <button onClick={() => setSelectedMode('dark')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 text-xs font-black transition-all duration-300 rounded-xl ${selectedMode === 'dark' ? 'bg-surface-container-highest text-on-surface shadow-xl' : 'text-on-surface-variant hover:text-on-surface'}`}>
                       <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: selectedMode === 'dark' ? "'FILL' 1" : "" }}>dark_mode</span>
                       GELAP
                    </button>
                  </div>
                </div>
              </section>

              {/* Save Action */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={isUploading}
                  className="w-full sm:w-fit px-12 py-5 bg-primary text-on-primary font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group" 
                >
                  <span className="material-symbols-outlined text-[24px] transition-transform group-hover:rotate-12">auto_awesome</span>
                  Terapkan Identitas
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32">
                <div className="bg-surface-container-high rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden border-none transition-all duration-500">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">smartphone</span>
                      LIVE PREVIEW
                    </h3>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  
                  {/* Mockup Phone */}
                  <div className="relative mx-auto w-full max-w-[300px] aspect-[9/19] bg-surface-container-lowest rounded-[3.5rem] shadow-2xl overflow-hidden transition-all duration-500">
                    {/* Speaker Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 bg-surface-container-highest rounded-b-3xl w-32 mx-auto z-50"></div>
                    
                    {/* Mobile Screen Content */}
                    <div className="h-full flex flex-col bg-surface-container-low text-left relative">
                      
                      {/* Mobile Header (Real Equivalent) */}
                      <div className="px-5 pb-4 pt-10 flex justify-between items-center bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant z-40 shrink-0">
                        <div className="flex items-center gap-3">
                          {formLogo ? (
                             <img src={formLogo} alt="Logo" className="w-8 h-8 rounded-full border border-outline-variant object-cover shadow-sm" />
                          ) : (
                             <span className="material-symbols-outlined text-2xl font-black transition-colors" style={{ color: activeTheme.primaryContainer }}>restaurant_menu</span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-on-surface transition-all font-headline tracking-tight leading-tight">{formName || 'Orderin'}</span>
                            <span className="text-[9px] text-on-surface-variant font-label uppercase tracking-widest mt-0.5">Meja 1 (Lantai 1)</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant transition-colors" style={{ color: activeTheme.primary }}>person_outline</span>
                        </div>
                      </div>

                      <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-8 z-10">
                        {/* Promo Banner or Welcome */}
                        <div className="mb-4">
                           <h1 className="text-2xl font-extrabold text-on-surface tracking-tighter mb-1 font-headline leading-none capitalize"> Halo, Selamat Datang! </h1>
                           <p className="text-on-surface-variant text-[10px] font-medium leading-tight">Pilih hidangan favorit dari katalog kami hari ini.</p>
                        </div>
  
                        {/* Search Bar Mock */}
                        <div className="relative flex items-center mb-4">
                          <span className="material-symbols-outlined absolute left-4 text-sm text-on-surface-variant">search</span>
                          <input 
                            disabled
                            className="w-full bg-surface-container-high rounded-2xl py-3 pl-10 pr-4 text-xs text-on-surface shadow-inner outline-none" 
                            placeholder="Cari menu spesial..." 
                            type="text"
                          />
                        </div>
  
                        {/* Categories Mock */}
                        <div className="flex gap-2 mb-4 overflow-hidden">
                           <span className="px-3 py-1.5 rounded-lg text-[9px] font-bold bg-primary text-on-primary border shadow-sm shrink-0 transition-colors" style={{ borderColor: activeTheme.primary, backgroundColor: activeTheme.primary }}>Semua Menu</span>
                           <span className="px-3 py-1.5 rounded-lg text-[9px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant shrink-0">Coffee</span>
                           <span className="px-3 py-1.5 rounded-lg text-[9px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant shrink-0">Pastry</span>
                        </div>
  
                        {/* Menu Preview Real */}
                        <div className="space-y-3">
                          {previewMenus.slice(0, 2).map((item, idx) => (
                            <div key={item.id || idx} className="flex flex-col bg-surface-container rounded-2xl overflow-hidden border border-outline-variant hover:translate-y-[-2px] transition-all">
                              <div className="relative h-24 overflow-hidden bg-surface-container-highest">
                                {item.foto_url ? (
                                  <img className="w-full h-full object-cover" src={item.foto_url} alt={item.nama}/>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                     <span className="material-symbols-outlined text-on-surface-variant text-3xl">image</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 flex flex-col">
                                <h3 className="text-xs font-bold text-on-surface mb-1 font-headline truncate">{item.nama}</h3>
                                <div className="mt-auto flex justify-between items-center">
                                  <span className="font-headline text-sm font-black transition-colors" style={{ color: activeTheme.primary }}>{formatRupiah(item.harga || 0)}</span>
                                  <button className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center shadow-lg transition-colors" style={{ backgroundColor: activeTheme.primary, color: '#00422b' }}>
                                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <p className="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-[0.2em] font-black">Pratinjau Order Menu</p>
                </div>
              </div>
            </div>
      </div>
    </div>
  </>
  )
}
