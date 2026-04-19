import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useSessionStore } from '../../store/sessionStore'
import { formatRupiah } from '../../utils/formatRupiah'

export default function Cart() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  const { session } = useSessionStore()
  const { cart, updateQty, removeFromCart } = useCartStore()
  
  const [catatanPesanan, setCatatanPesanan] = useState('')

  const subtotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)
  const serviceCharge = Math.floor(subtotal * 0.05) // 5% service charge
  const pb1 = Math.floor(subtotal * 0.1) // 10% PB1
  const total = subtotal + serviceCharge + pb1

  const handleCheckout = () => {
    navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/payment`)
  }

  if (cart.length === 0) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center px-6">
        <span className="material-symbols-outlined text-surface-variant text-6xl mb-4">shopping_basket</span>
        <h2 className="text-xl font-bold font-headline mb-2">Keranjang Kosong</h2>
        <p className="text-on-surface-variant text-center text-sm mb-8">Anda belum menambahkan hidangan apapun.</p>
        <button 
          onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)}
          className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary-container/20"
        >
          Kembali ke Menu
        </button>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="bg-surface-container-low/80 backdrop-blur-md sticky top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">Pesanan Anda</h1>
        <div className="w-10"></div>
      </header>

      <main className="pt-6 px-6 max-w-xl mx-auto space-y-8">
        
        {/* Table Info */}
        <div className="flex justify-between items-center bg-primary/10 rounded-2xl p-4 ring-1 ring-primary/20">
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Status Meja</p>
            <p className="font-bold text-on-surface uppercase font-headline">Meja {tableNo} • {lokasi}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">table_restaurant</span>
        </div>

        {/* Order Items List */}
        <section className="flex flex-col gap-6 pt-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 items-center bg-surface-container-low p-4 rounded-[2rem] group transition-all duration-300 hover:translate-y-[-2px] ghost-border shadow-sm">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-outline-variant">
                <img src={item.foto_url || 'https://via.placeholder.com/200?text=Food'} alt={item.nama} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow flex flex-col justify-center">
                <h3 className="font-bold text-on-surface leading-tight mb-1">{item.nama}</h3>
                <p className="font-headline font-extrabold text-primary text-sm mb-3">{formatRupiah(item.harga)}</p>
                
                <div className="flex items-center gap-4 bg-surface-container-highest rounded-xl w-fit py-1 px-2">
                  <button 
                    onClick={() => {
                      if (item.qty <= 1) removeFromCart(item.id)
                      else updateQty(item.id, item.qty - 1)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest rounded-lg transition-colors font-black"
                  >
                    <span className="material-symbols-outlined text-sm">{item.qty <= 1 ? 'delete' : 'remove'}</span>
                  </button>
                  <span className="font-bold text-sm min-w-[1rem] text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors font-black"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Notes */}
        <section>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant">edit_note</span>
            <textarea 
              value={catatanPesanan}
              onChange={(e) => setCatatanPesanan(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant rounded-[1.5rem] p-4 pl-12 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/50 outline-none min-h-[100px] resize-none transition-all duration-300 focus:bg-surface-container-low"
              placeholder="Catatan khusus dapur..."
            ></textarea>
          </div>
        </section>

        {/* Billing Summary */}
        <section className="bg-surface-container-low rounded-[2rem] p-8 mb-8 ghost-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <h3 className="font-bold mb-6 font-headline text-lg">Rincian Pembayaran</h3>
          <div className="space-y-4 font-body text-sm mb-6">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Subtotal ({cart.reduce((a,c) => a + c.qty, 0)} item)</span>
              <span className="font-bold text-on-surface">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Service Charge (5%)</span>
              <span className="font-bold text-on-surface">{formatRupiah(serviceCharge)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant pb-4">
              <span>Pajak PB1 (10%)</span>
              <span className="font-bold text-on-surface">{formatRupiah(pb1)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="font-bold text-on-surface uppercase tracking-widest text-xs">Total Tagihan</span>
            <span className="font-extrabold font-headline text-3xl text-primary tracking-tighter">{formatRupiah(total)}</span>
          </div>
        </section>

      </main>

      {/* Checkout Button Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface/90 to-transparent flex justify-center z-50">
        <button 
          onClick={handleCheckout}
          className="w-full max-w-xl h-16 bg-gradient-to-r from-primary via-emerald-400 to-primary text-[#003824] rounded-[1.2rem] font-headline text-lg font-black flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
        >
          Konfirmasi & Pilih Bayar
          <span className="material-symbols-outlined font-black">payments</span>
        </button>
      </div>

    </div>
  )
}
