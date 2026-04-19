import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { formatRupiah } from '../../utils/formatRupiah'

// Mock Data spesifik
const getMockOrder = (orderId) => {
  return {
    id: orderId,
    tableId: '12',
    customerName: 'Marcus Reed',
    // status options: 'pesanan_baru', 'dimasak', 'siap_saji', 'menunggu_pembayaran', 'selesai', 'dibatalkan'
    status: 'pesanan_baru', 
    items: [
      { id: '1', name: 'Miso Glazed Bowl', qty: 1, price: 85000, notes: 'Tolong jangan pakaikan daun bawang. Alergi.' },
      { id: '2', name: 'Signature Mocktail', qty: 2, price: 45000, notes: 'Es dipisah' }
    ],
    subtotal: 175000,
    service: 8750,
    pb1: 17500,
    total: 201250,
    paymentMethod: 'E-Wallet',
    time: '14:23'
  }
}

export default function DetailOrderKasir() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [order, setOrder] = useState(getMockOrder(orderId))
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  if (!user || user.role !== 'kasir') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
        <h2 className="text-xl font-bold font-headline mb-2">Akses Ditolak</h2>
        <button onClick={() => navigate('/kasir/login')} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold mt-4">
          Login Kasir
        </button>
      </div>
    )
  }

  const handleUpdateStatus = (newStatus) => {
    if (newStatus === 'dibatalkan') {
      if (!rejectReason) return alert('Mohon isi alasan penolakan/pembatalan.')
      // log reason...
      setShowRejectModal(false)
    }
    setOrder({ ...order, status: newStatus })
  }

  // Visual mapper untuk rentang status ke warna/badge tertentu
  const statusColorMap = {
    pesanan_baru: { bg: 'bg-tertiary-container/20 text-tertiary', label: 'Pesanan Baru', ring: 'ring-tertiary/30' },
    dimasak: { bg: 'bg-primary-container/20 text-primary', label: 'Sedang Dimasak', ring: 'ring-primary/30' },
    siap_saji: { bg: 'bg-secondary-container/20 text-secondary', label: 'Siap Disajikan', ring: 'ring-secondary/30' },
    menunggu_pembayaran: { bg: 'bg-error-container/20 text-error', label: 'Menunggu Bayar', ring: 'ring-error/30' },
    selesai: { bg: 'bg-slate-700/50 text-slate-300', label: 'Selesai', ring: 'ring-slate-500/30' },
    dibatalkan: { bg: 'bg-red-900/40 text-red-400', label: 'Dibatalkan', ring: 'ring-red-500/30' },
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-[#091421]/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/kasir/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors text-slate-400"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-headline">Meja {order.tableId}</h1>
            <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">{order.customerName}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ring-1 ${statusColorMap[order.status].bg} ${statusColorMap[order.status].ring}`}>
          {statusColorMap[order.status].label}
        </div>
      </header>

      <main className="pt-24 px-6 max-w-3xl mx-auto space-y-6">
        
        {/* Info Card */}
        <div className="bg-surface-container-low rounded-[2rem] p-6 ghost-border shadow-lg">
          <div className="flex justify-between text-sm mb-4 border-b border-surface-container pb-4">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Waktu Pemesanan</span>
            <span className="font-headline font-bold">{order.time} WIB</span>
          </div>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-xs shrink-0">
                  {item.qty}x
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold font-headline">{item.name}</h4>
                  {item.notes && (
                    <div className="mt-1 bg-tertiary/10 text-tertiary text-xs px-2 py-1.5 rounded-md border border-tertiary/20 flex gap-2 items-start">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <p>{item.notes}</p>
                    </div>
                  )}
                </div>
                <div className="font-headline font-bold shrink-0">{formatRupiah(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Canceled Warning Message if Canceled */}
        {order.status === 'dibatalkan' && (
          <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex gap-3 text-error">
            <span className="material-symbols-outlined shrink-0">cancel</span>
            <div>
              <p className="font-bold text-sm">Pesanan Dibatalkan Kasir</p>
              <p className="text-xs opacity-80 mt-1">Status ini telah diupdate secara realtime ke Customer.</p>
            </div>
          </div>
        )}

        {/* Bill Summary */}
        <div className="bg-surface-container-low rounded-[2rem] p-6 ghost-border">
          <div className="space-y-3 font-body text-xs mb-4">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-bold text-on-surface">{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Service Charge (5%)</span>
              <span className="font-bold text-on-surface">{formatRupiah(order.service)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>PB1 (10%)</span>
              <span className="font-bold text-on-surface">{formatRupiah(order.pb1)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-surface-container">
            <span className="font-bold uppercase tracking-widest text-[10px]">Total Dibayar ({order.paymentMethod})</span>
            <span className="font-headline text-xl font-black text-primary">{formatRupiah(order.total)}</span>
          </div>
        </div>
      </main>

      {/* Contextual ActionBar Bottom */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-surface/90 backdrop-blur-xl z-30 border-t border-outline-variant">
        <div className="max-w-3xl mx-auto flex gap-3">
          
          {/* Aksi Berdasarkan Status Pesanan */}
          {order.status === 'pesanan_baru' && (
            <>
              <button onClick={() => setShowRejectModal(true)} className="flex-1 max-w-[120px] bg-error/10 text-error font-bold rounded-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-1">
                <span className="material-symbols-outlined text-lg">close</span>
                <span className="text-[10px] uppercase">Tolak</span>
              </button>
              <button onClick={() => handleUpdateStatus('dimasak')} className="flex-1 h-14 bg-gradient-to-r from-tertiary-fixed-dim to-tertiary-container text-on-tertiary-container font-headline font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-tertiary/20">
                Teruskan ke Dapur
                <span className="material-symbols-outlined">send</span>
              </button>
            </>
          )}

          {order.status === 'dimasak' && (
            <button onClick={() => handleUpdateStatus('siap_saji')} className="w-full h-14 bg-primary text-on-primary font-headline font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              Pesanan Siap Disajikan
              <span className="material-symbols-outlined">room_service</span>
            </button>
          )}

          {order.status === 'siap_saji' && (
            <button onClick={() => handleUpdateStatus('selesai')} className="w-full h-14 bg-surface-container-highest text-primary font-headline font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 border border-primary/20">
              Antar ke Meja {order.tableId}
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          )}
          
          {(order.status === 'selesai' || order.status === 'dibatalkan') && (
            <button 
              onClick={() => {
                alert(`Meja ${order.tableId} telah di-reset dan kembali tersedia (Kosong).`)
                navigate('/kasir/dashboard')
              }}
              className="w-full h-14 bg-surface-container-highest text-on-surface hover:text-primary hover:border-primary font-headline font-bold rounded-xl flex items-center justify-center gap-2 border border-outline-variant transition-colors group"
            >
              Bersihkan & Reset Meja
              <span className="material-symbols-outlined group-hover:text-primary transition-colors">cleaning_services</span>
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface-container-low w-full max-w-sm rounded-3xl p-6 ghost-border border-error/50">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-extrabold text-lg">Tolak Pesanan</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Pesanan pelanggan akan dibatalkan. Uang akan direfund apabila via E-Wallet otomatis. Sertakan alasan untuk Pelanggan.
            </p>
            <textarea
              className="w-full bg-surface-container-highest border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-error text-on-surface placeholder-slate-500 min-h-[100px]"
              placeholder="Contoh: Maaf, Salmon sedang habis."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-xs font-bold uppercase rounded-lg hover:bg-surface-container-highest transition-colors">Batal</button>
              <button 
                onClick={() => handleUpdateStatus('dibatalkan')}
                className="flex-1 py-3 bg-error text-on-error shadow-lg shadow-error/20 text-xs font-bold uppercase rounded-lg active:scale-95 transition-transform"
              >Konfirmasi Tolak</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
