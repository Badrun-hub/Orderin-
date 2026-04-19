import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { formatRupiah } from '../../utils/formatRupiah'
import { supabase } from '../../lib/supabase'
import { useSettingsStore } from '../../store/settingsStore'

export default function OrderStatus() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  
  const { currentOrderId, session } = useSessionStore()
  const { cafeName, cafeLogo } = useSettingsStore()

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch Order details
  const fetchOrderDetails = async () => {
    if (!currentOrderId) return;
    
    try {
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .select('*, tables(nomor_meja, lokasi)')
        .eq('id', currentOrderId)
        .single()
      
      if (oError) throw oError
      setOrder(oData)

      const { data: iData, error: iError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', currentOrderId)
      
      if (iError) throw iError
      setItems(iData || [])

    } catch (err) {
      console.error('Error fetching status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()

    if (currentOrderId) {
      const channel = supabase
        .channel(`order-status-${currentOrderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${currentOrderId}` },
          (payload) => {
            setOrder(prev => ({ ...prev, ...payload.new }))
            if (payload.new.status === 'delivered') {
               new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => {})
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [currentOrderId])

  const getStatusConfig = (status) => {
    switch (status) {
      case 'ordered': return { label: 'Menunggu Konfirmasi', color: 'bg-surface-container-highest/10 text-on-surface-variant', icon: 'pending_actions', title: 'Pesanan Terkirim' }
      case 'confirmed': return { label: 'Diterima Kasir', color: 'bg-emerald-500/10 text-emerald-400', icon: 'check_circle', title: 'Segera Diproses' }
      case 'cooking': return { label: 'Sedang Dimasak', color: 'bg-amber-500/10 text-amber-400', icon: 'soup_kitchen', title: 'Dapur Sedang Menyiapkan' }
      case 'delivered': return { label: 'Siap Dinikmati', color: 'bg-primary/10 text-primary', icon: 'restaurant', title: 'Pesanan Selesai Diantar' }
      case 'bill_requested': return { label: 'Menunggu Pembayaran', color: 'bg-error/10 text-error', icon: 'payments', title: 'Sedang Dicek Kasir' }
      case 'payment_uploaded': return { label: 'Bukti Terkirim', color: 'bg-blue-500/10 text-blue-400', icon: 'cloud_done', title: 'Verifikasi Pembayaran' }
      case 'selesai': return { label: 'Transaksi Selesai', color: 'bg-primary text-on-primary', icon: 'verified', title: 'Terima Kasih!' }
      default: return { label: 'Status Unkown', color: 'bg-surface-container-highest', icon: 'help', title: 'Memproses...' }
    }
  }

  if (loading && currentOrderId) {
    return <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface-variant font-bold">Menghubungkan ke Dapur...</div>
  }

  if (!currentOrderId) {
    return (
       <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-surface-variant text-6xl mb-4">receipt_long</span>
        <h2 className="text-xl font-bold font-headline mb-4">Tidak Ada Pesanan Aktif</h2>
        <p className="text-sm text-on-surface-variant mb-8 max-w-xs">Scan QR di meja Anda kembali untuk mulai memesan hidangan lezat.</p>
        <button onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)} className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold font-headline text-sm uppercase tracking-widest shadow-xl shadow-primary/20">Mulai Pesan</button>
      </div>
    )
  }

  const s = getStatusConfig(order?.status)

  return (
    <div className="bg-surface text-on-surface font-headline min-h-screen pb-32 pt-2 relative overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          {cafeLogo ? (
             <img src={cafeLogo} alt="Logo" className="w-8 h-8 rounded-full border border-outline-variant object-cover shadow-sm" />
          ) : (
             <span className="material-symbols-outlined text-primary font-black">restaurant_menu</span>
          )}
          <span className="text-xl font-bold text-primary tracking-tighter">{cafeName || 'Orderin'}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant border border-outline-variant px-2 py-1 rounded">Live Track</span>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8 relative z-10">
        
        {/* Real-time Order Tracker Hero */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high p-8 ghost-border shadow-2xl">
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className={`p-6 rounded-[2rem] shadow-xl ${order?.status === 'delivered' ? 'bg-primary animate-bounce' : 'bg-surface-container-highest animate-pulse'}`}>
              <span className={`material-symbols-outlined text-5xl ${order?.status === 'delivered' ? 'text-on-primary' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {s.icon}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-on-surface tracking-tighter leading-tight mb-2 uppercase">{s.title}</h1>
              <p className="text-on-surface-variant font-medium text-sm font-body">Meja {tableNo} ({lokasi}) • {order?.customer_name}</p>
            </div>
            
            <span className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-[0.15em] border border-outline-variant ${s.color}`}>
              Status: {s.label}
            </span>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        </section>

        {/* Order Items Summary */}
        <div className="bg-surface-container rounded-[2rem] p-6 ghost-border">
          <h2 className="text-lg font-black tracking-tight mb-6 px-1">Daftar Hidangan</h2>
          <div className="space-y-4 font-body">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-black border border-outline-variant text-xs">
                    {item.qty}x
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-sm">{item.nama_menu}</h3>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest leading-none mt-1">{formatRupiah(item.harga)}</p>
                  </div>
                </div>
                <span className="font-black text-on-surface text-sm">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
             <span className="text-xs uppercase font-black tracking-widest text-on-surface-variant">Total Tagihan</span>
             <span className="text-2xl font-black text-primary tracking-tighter">{formatRupiah(order?.total)}</span>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-surface-container-low rounded-[1.5rem] p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-outline-variant">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">credit_card</span>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest leading-none mb-1">Metode Bayar</p>
                <p className="font-bold text-on-surface uppercase text-sm">{order?.payment_method?.toUpperCase() || 'TUNAI'}</p>
             </div>
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium font-body uppercase tracking-wider">Order ID: {order?.id?.substring(0,8)}</p>
        </div>

      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface/95 to-transparent z-50">
        <div className="max-w-xl mx-auto flex gap-3">
          <button 
            onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)}
            className="flex-1 bg-surface-container-highest text-on-surface font-black uppercase tracking-widest py-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-outline-variant"
          >
            <span className="material-symbols-outlined text-lg">add_box</span> 
            Menu Lagi
          </button>
          
          <button 
            className="flex-1 bg-primary text-on-primary font-black uppercase tracking-widest py-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/20"
            onClick={() => alert("Panggilan pelayan segera tiba ke meja Anda.")}
          >
            <span className="material-symbols-outlined text-lg">notifications_active</span> 
            Panggil Pelayan
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 -z-10 w-full h-full bg-surface"></div>
    </div>
  )
}
