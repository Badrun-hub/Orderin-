import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { formatRupiah } from '../../utils/formatRupiah'
import { useSessionStore } from '../../store/sessionStore'
import { supabase } from '../../lib/supabase'

const PAYMENT_METHODS = [
  { 
    id: 'qris', 
    name: 'QRIS', 
    icon: 'qr_code_scanner', 
    description: 'BCA, Gopay, OVO, Dana, LinkAja',
    type: 'upload'
  },
  { 
    id: 'ewallet', 
    name: 'E-Wallet Transfer', 
    icon: 'account_balance_wallet', 
    description: 'Kirim Mandiri ke Dompet Digital',
    type: 'upload'
  },
  { 
    id: 'debit', 
    name: 'Kartu Debit/Kredit', 
    icon: 'credit_card', 
    description: 'Gesek kartu di Kasir',
    type: 'direct'
  },
  { 
    id: 'cash', 
    name: 'Tunai Kasir', 
    icon: 'payments', 
    description: 'Bayar langsung uang tunai di Kasir',
    type: 'direct'
  }
]

export default function PilihPembayaran() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  
  const { cart, clearCart } = useCartStore()
  const { session, setSession, setOrderId } = useSessionStore()
  
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect back if cart is empty
  if (cart.length === 0) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-surface-variant text-6xl mb-4">shopping_basket</span>
        <h2 className="text-xl font-bold font-headline mb-4">Keranjang Anda Kosong</h2>
        <button onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">Kembali ke Menu</button>
      </div>
    )
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)
  const serviceCharge = Math.floor(subtotal * 0.05)
  const pb1 = Math.floor(subtotal * 0.1)
  const total = subtotal + serviceCharge + pb1

  const handleProceed = async () => {
    if (!selectedMethod || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      // 1. Ambil ID Meja dari Tabel berdasarkan Lokasi & Nomor Meja
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('lokasi', lokasi)
        .eq('nomor_meja', tableNo)
        .maybeSingle()
      
      if (!tableData) {
        throw new Error(`Meja ${tableNo} di ${lokasi} tidak ditemukan.`)
      }
      
      const realTableId = tableData.id;

      // 2. Insert Order Header
      const orderPayload = {
        table_id: realTableId,
        customer_name: session?.customerName || 'Pelanggan',
        status: 'ordered',
        payment_method: selectedMethod.id,
        total: total,
      }

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single()

      if (orderError) throw orderError

      // 3. Insert Order Items
      const itemsPayload = cart.map(item => ({
        order_id: newOrder.id,
        menu_id: item.id,
        nama_menu: item.nama,
        harga: item.harga,
        qty: item.qty,
        subtotal: item.harga * item.qty
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload)

      if (itemsError) throw itemsError

      // 4. Update Table Status
      await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', realTableId)

      // 5. Update Session & Global State
      setOrderId(newOrder.id)
      setSession({
        ...session,
        paymentMethod: selectedMethod.id
      })

      // Redirect berdasarkan tipe pembayaran
      if (selectedMethod.type === 'upload') {
        navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/upload`)
      } else {
        clearCart()
        navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/status`)
      }

    } catch (err) {
      console.error('Order Submission Error:', err)
      alert("Maaf, gagal memproses pesanan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 pt-2 relative overflow-hidden font-body">
      {/* TopAppBar */}
      <header className="bg-[#091421]/80 backdrop-blur-md sticky top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-outline-variant">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors text-slate-400"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-headline tracking-tighter text-white">Pembayaran</h1>
        <div className="w-10"></div>
      </header>

      <main className="pt-6 px-6 max-w-xl mx-auto space-y-8 relative z-10">
        
        {/* Total Summary */}
        <div className="bg-surface-container-high rounded-[2rem] p-8 text-center ghost-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-2 font-label">Total Tagihan Anda</p>
          <h2 className="text-5xl font-black font-headline text-primary mb-2 tracking-tighter">{formatRupiah(total)}</h2>
          <div className="flex items-center justify-center gap-2 text-slate-600">
             <span className="text-[10px] uppercase font-bold tracking-widest border border-outline-variant px-2 py-0.5 rounded">Meja {tableNo} • {lokasi}</span>
             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
             <span className="text-[10px] uppercase font-bold tracking-widest">{cart.length} Item</span>
          </div>
        </div>

        {/* Payment Methods */}
        <section>
          <h3 className="font-headline text-xl font-extrabold mb-5 px-1">Pilih Metode Pembayaran</h3>
          <div className="flex flex-col gap-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod?.id === method.id

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`flex items-center text-left gap-4 p-5 rounded-[1.5rem] transition-all duration-500 ghost-border relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5 scale-[1.02]' 
                      : 'bg-surface-container-low border-outline-variant hover:border-slate-700'
                  }`}
                >
                  {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-full"></div>}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isSelected ? 'bg-primary text-on-primary shadow-xl shadow-primary/40' : 'bg-surface-container-highest text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: isSelected ? "'FILL' 1" : ""}}>{method.icon}</span>
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className={`font-bold font-headline text-lg tracking-tight mb-0.5 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                      {method.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{method.description}</p>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-slate-800'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

      </main>

      {/* Action Button Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface/90 to-transparent flex justify-center z-50">
        <button 
          onClick={handleProceed}
          disabled={!selectedMethod || isSubmitting}
          className="w-full max-w-xl h-16 bg-[#10B981] disabled:opacity-40 text-[#003824] rounded-[1.2rem] font-headline text-lg font-black flex items-center justify-center gap-3 transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)]"
        >
          {isSubmitting ? (
             <span className="material-symbols-outlined animate-spin font-black">progress_activity</span>
          ) : (
             <>
               {selectedMethod ? `Lanjutkan & Pesan Sekarang` : 'Pilih Metode Dulu'}
               {selectedMethod && <span className="material-symbols-outlined font-black">send</span>}
             </>
          )}
        </button>
      </div>

    </div>
  )
}
