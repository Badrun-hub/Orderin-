import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { formatRupiah } from '../../utils/formatRupiah'
import { supabase } from '../../lib/supabase'
import ActionModal, { CustomAlert, CustomConfirm } from '../../components/ui/ActionModal'
import { useSettingsStore } from '../../store/settingsStore'

export default function DashboardKasir() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { cafeName, cafeLogo } = useSettingsStore()
  
  // Realtime clock & notification state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [newOrderCount, setNewOrderCount] = useState(0)

  // Data State
  const [tables, setTables] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Custom Action Modal State
  const [statusPrompt, setStatusPrompt] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Data Awal
  const fetchData = async () => {
    try {
      const { data: tData } = await supabase.from('tables').select('*').order('nomor_meja', { ascending: true })
      setTables(tData || [])

      // Cari order yang belum selesai
      const { data: oData } = await supabase.from('orders')
        .select('*, order_items(*)')
        .not('status', 'in', '("selesai", "cancelled")')
      setActiveOrders(oData || [])
      
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Efek Realtime Listener Supabase
  useEffect(() => {
    if (!user || user.role !== 'kasir') return;

    fetchData()

    // Instance suara bell
    const ringTone = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    
    // Subscribe ke Public Schema tabel Orders
    const orderSubscription = supabase
      .channel('public:orders_kasir')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Pesanan Baru Terdeteksi!', payload)
          ringTone.play().catch(e => console.warn('Pengaturan Auto-play memblokir suara', e))
          setNewOrderCount(prev => prev + 1)
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderSubscription)
    }
  }, [user])

  // Proteksi Akses Kasir
  if (!user || user.role !== 'kasir') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
        <h2 className="text-xl font-bold font-headline mb-2">Akses Ditolak</h2>
        <p className="text-sm text-on-surface-variant mb-6">Silakan login kembali melalui portal kasir.</p>
        <button onClick={() => navigate('/kasir/login')} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">
          Ke Halaman Login
        </button>
      </div>
    )
  }

  // Aksi-Aksi Meja
  const actionTerimaPesanan = async (orderId) => {
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
    fetchData()
  }

  const handleUbahStatusSubmit = async (newStatus) => {
    if (statusPrompt) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', statusPrompt.orderId)
      fetchData()
      setStatusPrompt(null)
    }
  }

  const actionSelesaikanBayar = async (orderId, tableId) => {
    const ok = await CustomConfirm("Selesaikan Pesanan?", "Ubah status pesanan menjadi Lunas, dan kosongkan meja ini untuk tamu berikutnya.", "success", "payments", "Selesaikan")
    if (ok) {
      await supabase.from('orders').update({ status: 'selesai' }).eq('id', orderId)
      await supabase.from('tables').update({ status: 'available' }).eq('id', tableId)
      fetchData()
    }
  }

  const actionDudukkanTamu = async (tableId) => {
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId)
    fetchData()
  }

  const renderTableCard = (table) => {
    // Cari order aktif untuk meja ini
    const o = activeOrders.find(ord => ord.table_id === table.id)

    // Tentukan Visual Status berdasarkan Tabel & Order
    let visualStatus = 'kosong'
    if (table.status === 'occupied' && !o) visualStatus = 'terisi'
    if (o) {
       if (o.status === 'ordered') visualStatus = 'baru'
       else if (['confirmed', 'cooking', 'delivered'].includes(o.status)) visualStatus = 'diproses'
       else if (['bill_requested', 'payment_uploaded', 'payment_confirmed'].includes(o.status)) visualStatus = 'pembayaran'
    }

    // Ekstrak data standar UI
    const no = table.nomor_meja || '--'
    const name = o ? (o.customer_name || 'Tamu') : (visualStatus === 'kosong' ? 'Tersedia' : 'Walk-in')
    const guests = o && o.order_items ? o.order_items.reduce((s,i) => s + i.qty, 0) : 0
    const amount = o ? o.total : 0
    
    // Time elapsed string based on created_at
    const elapsedCalc = () => {
      if (!o) return '-'
      const diffMins = Math.floor((new Date() - new Date(o.created_at)) / 60000)
      if (diffMins === 0) return 'Baru Saja'
      return `${diffMins}m`
    }
    const time = elapsedCalc()

    switch (visualStatus) {
      case 'pembayaran':
        return (
          <div key={table.id} className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all ghost-border shadow-[0_20px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(187,202,191,0.05)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error transition-all group-hover:w-2"></div>
            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => navigate(`/kasir/order/${table.id}`)}>
              <div>
                <span className="text-4xl font-headline font-black text-on-surface/40 leading-none">{no}</span>
                <h4 className="text-sm font-bold text-on-surface mt-1">{name}</h4>
              </div>
              <span className="bg-error-container/20 text-error px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Pembayaran</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-bold text-error uppercase">{o.payment_method || 'Request Bill'} • {guests} Item</span>
                <span className="font-headline font-bold text-on-surface text-lg tracking-tight">{formatRupiah(amount)}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); actionSelesaikanBayar(o.id, table.id) }} className="w-full py-3 bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold uppercase tracking-widest group-hover:bg-error group-hover:text-on-error transition-all">Selesaikan Bayar</button>
            </div>
          </div>
        )

      case 'diproses':
        return (
          <div key={table.id} className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all ghost-border shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transition-all group-hover:w-2"></div>
            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => navigate(`/kasir/order/${table.id}`)}>
              <div>
                <span className="text-4xl font-headline font-black text-on-surface/40 leading-none">{no}</span>
                <h4 className="text-sm font-bold text-on-surface mt-1 mx-w-xs truncate">{name}</h4>
              </div>
              <span className="bg-primary-container/20 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider truncate max-w-[80px]">{o.status}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">{guests} Item • {time}</span>
                <span className="font-headline font-bold text-on-surface text-lg tracking-tight">{formatRupiah(amount)}</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={(e) => { e.stopPropagation(); setStatusPrompt({orderId: o.id, currentStatus: o.status}) }} className="flex-1 py-3 bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container-low transition-colors">Ubah Status</button>
                 <button onClick={(e) => { e.stopPropagation(); navigate(`/kasir/order/${table.id}`) }} className="w-12 h-12 flex items-center justify-center bg-surface-container-highest text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-colors">
                   <span className="material-symbols-outlined font-extrabold">edit</span>
                 </button>
              </div>
            </div>
          </div>
        )

      case 'baru':
        return (
          <div key={table.id} className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all ghost-border shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary transition-all group-hover:w-2"></div>
            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => navigate(`/kasir/order/${table.id}`)}>
              <div>
                <span className="text-4xl font-headline font-black text-on-surface/40 leading-none">{no}</span>
                <h4 className="text-sm font-bold text-on-surface mt-1 truncate">{name}</h4>
              </div>
              <span className="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">Pesanan Baru</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">{guests} Item • {time}</span>
                <span className="font-headline font-bold text-on-surface text-lg tracking-tight">{formatRupiah(amount)}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); actionTerimaPesanan(o.id) }} className="w-full py-3 bg-tertiary text-on-tertiary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-tertiary-container transition-all shadow-[0_10px_20px_rgba(226,145,0,0.15)]">Terima Pesanan</button>
            </div>
          </div>
        )

      case 'terisi':
        return (
          <div key={table.id} className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all ghost-border shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary transition-all group-hover:w-2"></div>
            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => navigate(`/kasir/order/${table.id}`)}>
              <div>
                <span className="text-4xl font-headline font-black text-on-surface/40 leading-none">{no}</span>
                <h4 className="text-sm font-bold text-on-surface mt-1">{name}</h4>
              </div>
              <span className="bg-tertiary-container/20 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Terisi</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Menunggu menu dipilih</span>
                <span className="font-headline font-bold text-on-surface text-lg tracking-tight">Rp 0</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={(e) => { e.stopPropagation(); navigate(`/kasir/order/${table.id}`) }} className="flex-[2] py-3 bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Pesan Manual</button>
                 <button onClick={(e) => { e.stopPropagation(); supabase.from('tables').update({ status: 'available' }).eq('id', table.id).then(fetchData) }} className="flex-1 py-3 bg-error/10 text-error rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-error/20" title="Batalkan Walk In">X</button>
              </div>
            </div>
          </div>
        )

      case 'kosong':
        return (
          <div key={table.id} className="bg-surface-container/50 rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container transition-colors border border-dashed border-outline-variant cursor-pointer">
            <div className="flex justify-between items-start mb-4" onClick={() => navigate(`/kasir/order/${table.id}`)}>
              <div>
                <span className="text-4xl font-headline font-black text-on-surface/20 leading-none">{no}</span>
                <h4 className="text-sm font-bold text-slate-500 mt-1">{table.lokasi || name}</h4>
              </div>
              <span className="bg-slate-700/50 text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Kosong</span>
            </div>
            <div className="mt-8">
              <button onClick={(e) => { e.stopPropagation(); actionDudukkanTamu(table.id) }} className="w-full py-3 bg-transparent text-slate-400 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all">Dudukkan Tamu</button>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="text-on-surface min-h-screen pb-24 bg-surface font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#091421]/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          {cafeLogo ? (
             <img src={cafeLogo} alt="Logo" className="w-8 h-8 rounded-full border border-outline-variant object-cover shadow-sm" />
          ) : (
             <span className="material-symbols-outlined text-primary">restaurant_menu</span>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary tracking-tight font-headline leading-none">{cafeName || 'Orderin'}</h1>
            <p className="text-slate-400 text-[10px] font-label uppercase tracking-widest mt-1">Toko Utama (LIVE)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-on-surface">{user.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Clocked In • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const ok = await CustomConfirm("Akhiri Shift?", "Apakah Anda yakin ingin keluar dari sesi Shift Kasir saat ini?", "error", "logout", "Ya, Keluar")
              if (ok) {
                 logout()
                 navigate('/kasir/login')
              }
            }}
            title="Keluar"
            className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center ghost-border hover:bg-error/20 hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Notification Banner */}
        {newOrderCount > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-primary-container/10 border border-primary/20 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.12)] cursor-pointer hover:bg-primary-container/20 transition-colors animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#091421]"></span>
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>notifications_active</span>
              </div>
              <div>
                <h2 className="font-headline font-bold text-primary">Pesanan Baru Diterima ({newOrderCount})</h2>
                <p className="text-xs text-on-surface-variant hidden sm:block">Meja telah memesan dari HP, ketuk tombol kuning Terima Pesanan di daftar.</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setNewOrderCount(0)
              }}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold font-label uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Cek & Bersihkan
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-2xl font-headline font-extrabold tracking-tight">Manajemen Meja Kasir</h3>
            <span className="text-xs text-slate-400 uppercase tracking-[0.1em] mt-1 font-label">Semua Lantai & Area</span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full ghost-border">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">{tables.length} Total</span>
            </div>
          </div>
        </div>

        {/* Table Management Grid */}
        {loading ? (
             <div className="py-20 text-center text-slate-400 font-bold">Sinkronisasi Database Live...</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map(renderTableCard)}
            {tables.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 border border-dashed border-outline-variant rounded-[2rem]">
                   Belum ada meja! Minta Admin untuk Tambah Meja.
                </div>
            )}
          </div>
        )}
      </main>

      {/* Kasir Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#091421]/90 backdrop-blur-xl flex justify-around items-center p-3 pb-safe border-t border-outline-variant">
        <button onClick={() => alert("Daftar pesanan aktif dapat dilihat langsung di masing-masing kartu meja di atas.")} className="flex flex-col items-center justify-center text-slate-500 hover:text-[#4edea3] transition-colors w-16">
          <span className="material-symbols-outlined">reorder</span>
          <span className="text-[10px] font-label font-medium uppercase tracking-[0.05em] mt-1">Pesanan</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-[#10B981]/10 text-[#10B981] rounded-xl px-4 py-1 w-20">
          <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
          <span className="text-[10px] font-label font-bold uppercase tracking-[0.05em] mt-1">Meja</span>
        </button>
        <button onClick={() => alert("Rekap setoran Shift Anda (Coming Soon)")} className="flex flex-col items-center justify-center text-slate-500 hover:text-[#4edea3] transition-colors w-16">
          <span className="material-symbols-outlined">timer</span>
          <span className="text-[10px] font-label font-medium uppercase tracking-[0.05em] mt-1">Shift</span>
        </button>
      </nav>

      {/* Modal Prompt Ubah Status via ActionModal Reusable Component */}
      <ActionModal
        isOpen={!!statusPrompt}
        title="Ubah Status Dapur"
        type="custom"
        onCancel={() => setStatusPrompt(null)}
      >
         <p className="text-xs text-center text-on-surface-variant mb-6 uppercase tracking-widest">
           Status Saat Ini: <span className="font-bold text-primary">{statusPrompt?.currentStatus}</span>
         </p>
         <div className="flex flex-col gap-2">
            <button onClick={() => handleUbahStatusSubmit('cooking')} className="py-3 px-4 bg-surface-container rounded-xl text-left border border-outline-variant hover:bg-surface-container-highest transition-colors flex justify-between items-center group">
              <span className="font-bold text-sm">Sedang Dimasak (Cooking)</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">soup_kitchen</span>
            </button>
            <button onClick={() => handleUbahStatusSubmit('delivered')} className="py-3 px-4 bg-surface-container rounded-xl text-left border border-outline-variant hover:bg-surface-container-highest transition-colors flex justify-between items-center group">
              <span className="font-bold text-sm">Telah Diantar (Delivered)</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">room_service</span>
            </button>
            <button onClick={() => handleUbahStatusSubmit('bill_requested')} className="py-3 px-4 bg-surface-container rounded-xl text-left border border-outline-variant hover:bg-surface-container-highest transition-colors flex justify-between items-center group">
              <span className="font-bold text-sm">Minta Bon (Bill Requested)</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">receipt_long</span>
            </button>
         </div>
      </ActionModal>
    </div>
  )
}
