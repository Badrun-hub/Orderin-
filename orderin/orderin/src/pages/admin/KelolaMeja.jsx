import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CustomAlert, CustomConfirm } from '../../components/ui/ActionModal'
import { useSettingsStore } from '../../store/settingsStore'

export default function KelolaMeja() {
  const navigate = useNavigate()
  const { cafeName, cafeLogo } = useSettingsStore()
  
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nomor_meja: '', lokasi: 'Lantai 1' })
  const [qrModal, setQrModal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    const { data: tableData } = await supabase.from('tables').select('*').order('nomor_meja', { ascending: true })
    setTables(tableData || [])
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Kirim Ke Supabase (Real)
    const newTable = {
      nomor_meja: form.nomor_meja,
      lokasi: form.lokasi,
      status: 'available'
    }

    const { error } = await supabase.from('tables').insert([newTable])

    if (error) {
       CustomAlert("Gagal Tambah Meja", error.message, "error", "error")
       return
    }

    await fetchTables()
    setShowModal(false)
    setForm({ nomor_meja: '', lokasi: 'Lantai 1' })
  }

  const handleDelete = async (id) => {
    const ok = await CustomConfirm("Hapus Meja?", "Meja ini dan stiker QR yang terhubung akan tidak berlaku lagi setelah dihapus.", "error", "warning", "Hapus Permanen")
    if (ok) {
       await supabase.from('tables').delete().eq('id', id)
       fetchTables()
    }
  }

  const generateQrUrl = (table) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    // Format Baru: domain/lokasi/nomor_meja
    // Encode space dan karakter khusus agar URL valid
    const orderUrl = `${baseUrl}/${encodeURIComponent(table.lokasi || 'Umum')}/${encodeURIComponent(table.nomor_meja)}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(orderUrl)}&margin=10`
  }

  return (
    <>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Manajemen Meja & QR</h1>
        <p className="text-on-surface-variant text-sm font-medium opacity-80 uppercase tracking-widest">TOKO UTAMA (SUPABASE)</p>
      </div>

      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container p-8 rounded-[3rem] shadow-xl shadow-black/5 flex-wrap gap-6 transition-all duration-300">
          <div>
            <h2 className="text-3xl font-headline font-black tracking-tight mb-2">Daftar Meja Terdaftar</h2>
            <p className="text-sm text-on-surface-variant font-medium max-w-xl">Kelola nomer meja dan cetak stiker QR statis untuk ditaruh di masing-masing meja pelanggan.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Tambah Meja Baru
          </button>
        </div>

        {/* Tables Grid */}
        {loading ? (
             <div className="py-20 text-center font-bold">Memuat Data Meja...</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table.id} className="bg-surface-container rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                 </div>
                 
                 <div className="w-24 h-24 rounded-[2rem] bg-surface-container-highest flex flex-col items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                   <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>table_restaurant</span>
                 </div>
                 
                 <h3 className="font-headline font-black text-3xl tracking-tighter mb-2">{table.nomor_meja}</h3>
                 <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] bg-surface-container-highest px-4 py-1.5 rounded-xl mb-8 shadow-sm">
                   {table.lokasi || 'Umum'}
                 </span>

                 <div className="w-full flex flex-col gap-2 mt-auto">
                   <button 
                     onClick={() => setQrModal(table)}
                     className="w-full py-3.5 bg-primary text-on-primary rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all shadow-lg shadow-primary/20"
                   >
                     <span className="material-symbols-outlined text-[18px]">qr_code_2</span> LIHAT QR
                   </button>
                   <button 
                     onClick={() => handleDelete(table.id)}
                     className="w-full py-3 bg-surface-container-highest text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-error hover:bg-error/10 transition-all"
                   >
                     <span className="material-symbols-outlined text-[14px]">delete</span> HAPUS MEJA
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal Add Table */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low w-full max-w-sm rounded-[2rem] p-6 ghost-border">
             <h2 className="font-headline font-extrabold text-xl mb-6">Penambahan Meja Baru</h2>
             <form onSubmit={handleSave} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Identitas Meja (Nomor/Kode)</label>
                 <input autoFocus type="text" required value={form.nomor_meja} onChange={e => setForm({...form, nomor_meja: e.target.value})} className="w-full bg-surface-container border-none rounded-xl p-3 focus:ring-2 focus:ring-primary text-sm font-headline font-bold" placeholder="Misal: 08 atau Out-12"/>
               </div>
               <div>
                 <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Area / Lokasi</label>
                 <select value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} className="w-full bg-surface-container border-none rounded-xl p-3 focus:ring-2 focus:ring-primary text-sm">
                   <option>Lantai 1</option>
                   <option>Lantai 2</option>
                   <option>Outdoor</option>
                   <option>VIP Room</option>
                 </select>
               </div>
               <div className="flex gap-3 mt-8">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container-highest text-sm font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">Batal</button>
                 <button type="submit" className="flex-1 py-3 bg-primary text-on-primary text-sm font-bold uppercase rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                   Simpan
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal QR Preview */}
      {qrModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
             
             <div className="w-full flex flex-col items-center">
               <div className="flex items-center gap-2 mb-4 text-[#003824]">
                 {cafeLogo ? (
                    <img src={cafeLogo} alt="Logo" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                 ) : (
                    <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
                 )}
                 <span className="text-xl font-bold font-headline tracking-tighter">{cafeName || 'Orderin'}</span>
               </div>
               
               <div className="w-56 h-56 bg-slate-100 rounded-2xl p-2 mb-2 border-4 border-black/5">
                 <img src={generateQrUrl(qrModal)} alt="QR Code Meja" className="w-full h-full mix-blend-multiply" />
               </div>

               <div className="mb-6 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 w-full">
                 <p className="text-[10px] text-slate-400 font-mono break-all leading-tight">
                   {typeof window !== 'undefined' ? window.location.origin : ''}/{encodeURIComponent(qrModal.lokasi || 'Umum')}/{encodeURIComponent(qrModal.nomor_meja)}
                 </p>
               </div>

               <h2 className="text-4xl font-headline font-black mb-1">Meja {qrModal.nomor_meja}</h2>
               <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-8 border-b-2 border-slate-200 pb-4 w-full">Scan untuk memesan</p>
             </div>
             
             <div className="w-full flex flex-col sm:flex-row gap-3">
               <button onClick={() => setQrModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-colors">Tutup</button>
               <button onClick={() => window.print()} className="flex-[2] py-3 bg-[#10B981] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                 <span className="material-symbols-outlined text-[16px]">print</span> Print / Simpan PDF
               </button>
             </div>
          </div>
        </div>
      )}

      </div>
    </>
  )
}
