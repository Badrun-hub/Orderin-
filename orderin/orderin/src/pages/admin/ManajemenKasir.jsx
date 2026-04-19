import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../utils/formatRupiah'
import { supabase } from '../../lib/supabase'

export default function ManajemenKasir() {
  const navigate = useNavigate()
  const [kasirList, setKasirList] = useState([])
  const [shifts, setShifts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedKasir, setSelectedKasir] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [form, setForm] = useState({ nama: '', pin: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // 1. Ambil list profiles khusus kasir
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'kasir')
    // 2. Ambil semua shift
    const { data: shiftData } = await supabase.from('shifts').select('*')
    
    setKasirList(profiles || [])
    setShifts(shiftData || [])
    setLoading(false)
  }

  const handleAddKasir = async (e) => {
    e.preventDefault()
    
    // Create UUID manual dengan format standar
    const newId = crypto.randomUUID()
    
    const baru = {
      id: newId,
      nama: form.nama,
      role: 'kasir',
      is_active: true,
      pin: form.pin // Supabase butuh kolom 'pin' di tabel profiles
    }

    const { error } = await supabase.from('profiles').insert([baru])
    
    if (error) {
      if (error.message.includes('column "pin" of relation "profiles" does not exist')) {
         alert("GAGAL: Anda belum menambahkan kolom 'pin' di tabel profiles Supabase! Silakan eksekusi kode SQL berikut di Supabase:\n\nALTER TABLE profiles ADD COLUMN pin TEXT;\nALTER TABLE profiles ADD CONSTRAINT unique_pin UNIQUE (pin);")
      } else {
         alert(`Error: ${error.message}`)
      }
      return
    }

    setKasirList([...kasirList, baru])
    setShowAddModal(false)
    setForm({ nama: '', pin: '' })
  }

  const handleDeleteKasir = async (id) => {
    if(!window.confirm('Yakin ingin menghapus kasir ini seketika?')) return

    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      alert("Gagal menghapus! " + error.message)
    } else {
      setKasirList(kasirList.filter(k => k.id !== id))
      if (selectedKasir?.id === id) setSelectedKasir(null)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus
    const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', id)
    
    if (!error) {
       setKasirList(kasirList.map(k => k.id === id ? { ...k, is_active: newStatus } : k))
       if (selectedKasir?.id === id) setSelectedKasir({ ...selectedKasir, is_active: newStatus })
    }
  }

  // Hitung total revenue riwayat per kasir
  const getLabaKasir = (kasirId) => {
    const myShifts = shifts.filter(s => s.kasir_id === kasirId)
    return myShifts.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0)
  }

  if (loading) return <div className="text-white p-10 text-center font-bold">Memuat Data Pekerja...</div>

  return (
    <>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Manajemen Kasir</h1>
        <p className="text-on-surface-variant text-sm font-medium opacity-80 uppercase tracking-widest leading-none mt-1">SHIFT & PENDAPATAN (SUPABASE DATA)</p>
      </div>

      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center flex-wrap gap-4 bg-surface-container-low p-6 rounded-3xl ghost-border">
          <div>
            <h2 className="text-2xl font-extrabold font-headline mb-1">Daftar Pekerja Kasir</h2>
            <p className="text-sm text-on-surface-variant">Kelola PIN, lacak absensi, dan pantau hasil setoran kasir secara live (Supabase Data).</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Tambah Kasir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kasir List (Kiri) */}
          <div className="lg:col-span-1 space-y-4">
             {kasirList.map((kasir) => (
               <div 
                 key={kasir.id} 
                 onClick={() => setSelectedKasir(kasir)}
                 className={`p-5 rounded-2xl cursor-pointer transition-all border relative ${
                   selectedKasir?.id === kasir.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                 }`}
               >
                 {kasir.pin && (
                   <div className="absolute top-4 right-4 bg-white/10 px-2 text-[10px] rounded text-slate-300 font-mono tracking-widest border border-outline-variant">PIN: {kasir.pin}</div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary ghost-border">
                       {kasir.nama.charAt(0)}
                     </div>
                     <div>
                       <h3 className="font-bold font-headline pr-12">{kasir.nama}</h3>
                     </div>
                   </div>
                 </div>
                 <div className="mt-4 flex items-center justify-between">
                   <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                     kasir.is_active ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-error/20 text-error'
                   }`}>
                     {kasir.is_active ? 'Aktif' : 'Nonaktif'}
                   </span>
                   <p className="text-xs font-bold text-on-surface-variant">
                     Pemasukan: <span className="text-primary">{formatRupiah(getLabaKasir(kasir.id))}</span>
                   </p>
                 </div>
               </div>
             ))}

             {kasirList.length === 0 && (
                <div className="p-6 text-center border border-dashed border-outline-variant rounded-2xl">
                   <p className="text-sm text-slate-400 mb-4">Tidak ada data Pekerja Staf.</p>
                </div>
             )}
          </div>

          {/* Kasir Detail & Shift Data (Kanan) */}
          <div className="lg:col-span-2">
            {selectedKasir ? (
              <div className="bg-surface-container rounded-3xl p-6 ghost-border opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-outline-variant">
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-extrabold font-headline">{selectedKasir.nama}</h2>
                        {selectedKasir.pin && <span className="bg-white/10 text-white font-mono px-2 py-1 rounded text-xs border border-outline-variant">PIN: {selectedKasir.pin}</span>}
                     </div>
                    <p className="text-sm text-on-surface-variant">Shift & Riwayat Pendapatan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteKasir(selectedKasir.id)}
                      className="px-4 py-2 bg-error/10 text-error rounded-lg text-xs font-bold hover:bg-error/20 transition-colors"
                    >
                      Hapus Akun
                    </button>
                    <button 
                      onClick={() => toggleStatus(selectedKasir.id, selectedKasir.is_active)}
                      className="px-4 py-2 bg-surface-container-highest rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                      Set {selectedKasir.is_active ? 'Nonaktif' : 'Aktif'}
                    </button>
                  </div>
                </div>

                {!selectedKasir.is_active ? (
                  <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-error text-sm mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    Akun ini sedang nonaktif. Kasir tidak bisa Login.
                  </div>
                ) : null}

                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Log Shift Terakhir</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant text-xs text-on-surface-variant uppercase tracking-wider">
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Clock In - Out</th>
                        <th className="pb-3 font-medium text-right">Pesanan</th>
                        <th className="pb-3 font-medium text-right">Setoran Kasir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.filter(s => s.kasir_id === selectedKasir.id).length > 0 ? (
                        shifts.filter(s => s.kasir_id === selectedKasir.id).map(shift => (
                          <tr key={shift.id} className="border-b border-outline-variant hover:bg-white/5">
                            <td className="py-4 text-sm font-medium">{new Date(shift.clock_in).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}</td>
                            <td className="py-4 text-sm">
                              <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded text-xs">
                                {new Date(shift.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span className="mx-2 text-slate-500">-</span>
                              {shift.clock_out ? (
                                <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs">
                                  {new Date(shift.clock_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              ) : <span className="text-xs text-yellow-400 animate-pulse font-bold">ON DUTY</span>}
                            </td>
                            <td className="py-4 text-sm text-right font-medium">{shift.total_order}</td>
                            <td className="py-4 text-sm text-right font-bold text-primary">{formatRupiah(shift.total_revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-sm text-slate-500">Belum ada riwayat shift. (Data Kosong dari Supabase)</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 opacity-50">badge</span>
                <p className="text-on-surface-variant font-medium">Pilih pekerja dari daftar untuk melihat detail riwayat pendapatannya.</p>
              </div>
            )}
          </div>
        </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface-container-low w-full max-w-sm rounded-[2rem] p-6 ghost-border">
             <h2 className="font-headline font-extrabold text-xl mb-6">Buat Akun Kasir</h2>
             <form onSubmit={handleAddKasir} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Nama Lengkap</label>
                 <input autoFocus type="text" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full bg-surface-container border-none rounded-xl p-3 focus:ring-2 focus:ring-primary text-sm font-bold" placeholder="Cth: Sarah Wijaya"/>
               </div>
               <div>
                 <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">PIN Mesin Kasir</label>
                 <input type="text" maxLength={6} minLength={4} inputMode="numeric" required value={form.pin} onChange={e => setForm({...form, pin: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-surface-container border-none rounded-xl p-3 focus:ring-2 focus:ring-primary text-2xl font-bold font-mono tracking-widest text-center text-primary" placeholder="••••••"/>
                 <p className="text-[10px] text-slate-500 mt-2 text-center">PIN Rahasia ini akan digunakan untuk login di Portal Kasir.</p>
               </div>
               
               <div className="flex gap-3 mt-8">
                 <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-container-highest text-sm font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">Batal</button>
                 <button type="submit" className="flex-1 py-3 bg-primary text-on-primary text-sm font-bold uppercase rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                   Simpan
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
