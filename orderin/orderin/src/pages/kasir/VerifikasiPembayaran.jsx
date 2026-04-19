import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { formatRupiah } from '../../utils/formatRupiah'

// Mock Data spesifik
const getMockVerification = (orderId) => {
  return {
    id: orderId,
    tableId: '12',
    customerName: 'Marcus Reed',
    paymentMethod: 'E-Wallet Transfer',
    amount: 201250,
    timeUploaded: '14:28',
    // Dummy Receipt Image
    proofUrl: 'https://images.unsplash.com/photo-1559828456-11f8e13788be?q=80&w=400&auto=format&fit=crop'
  }
}

export default function VerifikasiPembayaran() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [data] = useState(getMockVerification(orderId))
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (!user || user.role !== 'kasir') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
          <h2 className="text-xl font-bold font-headline mb-2">Akses Ditolak</h2>
          <button onClick={() => navigate('/kasir/login')} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold mt-4">
            Login Kasir
          </button>
        </div>
      </div>
    )
  }

  const handleApprove = () => {
    // Di real app, update tabel order status menjadi "paid" / "dimasak"
    alert('Pembayaran Disetujui! Lanjutkan pesanan ke dapur.')
    navigate(`/kasir/order/${orderId}`)
  }

  const handleReject = () => {
    if (!rejectReason) return alert('Mohon isi alasan penolakan bukti bayar.')
    // Di real app, update tabel order menjadi "menunggu_pembayaran" lagi, beri alasan
    alert('Bukti ditolak. Customer akan diminta unggah ulang.')
    setShowRejectModal(false)
    navigate(`/kasir/order/${orderId}`)
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-[#091421]/80 backdrop-blur-md flex justify-between items-center px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors text-slate-400"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-headline">Verifikasi Bayar</h1>
            <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Meja {data.tableId} • {data.customerName}</p>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-xl mx-auto space-y-6">
        
        <div className="bg-surface-container-low rounded-[2rem] p-6 ghost-border text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">Total Tagihan</p>
          <h2 className="text-3xl font-extrabold font-headline text-primary mb-4">{formatRupiah(data.amount)}</h2>
          <div className="inline-flex bg-surface-container-highest px-3 py-1.5 rounded-lg text-xs font-bold font-headline uppercase tracking-wider text-slate-300">
            {data.paymentMethod}
          </div>
        </div>

        {/* Gambar Bukti */}
        <div>
          <h3 className="font-bold mb-3 font-headline text-sm uppercase tracking-widest text-on-surface-variant">Bukti Lampiran (Diunggah {data.timeUploaded})</h3>
          <div className="w-full h-[400px] bg-surface-container rounded-[2rem] overflow-hidden ghost-border relative">
            <img src={data.proofUrl} alt="Bukti Transfer" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white pointer-events-none">
              <span className="material-symbols-outlined">zoom_in</span>
            </div>
          </div>
        </div>

      </main>

      {/* Contextual ActionBar Bottom */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-surface/90 backdrop-blur-xl z-30 border-t border-outline-variant">
        <div className="max-w-xl mx-auto flex gap-3">
          <button onClick={() => setShowRejectModal(true)} className="flex-1 bg-surface-container-highest text-error font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-error/20">
            Tolak Bukti
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <button onClick={handleApprove} className="flex-1 h-14 bg-gradient-to-r from-[#4edea3] to-[#10b981] text-[#003824] font-headline font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            Bukti Valid (Approve)
            <span className="material-symbols-outlined">verified</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface-container-low w-full max-w-sm rounded-[2rem] p-6 ghost-border border-error/50">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline font-extrabold text-lg">Tolak Bukti Trf/QRIS</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Pelanggan akan diminta mengunggah ulang bukti pembayaran. Berikan pesannya di bawah ini.
            </p>
            <textarea
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl p-3 text-sm focus:ring-2 focus:ring-error focus:border-transparent text-on-surface placeholder-slate-500 min-h-[100px] outline-none"
              placeholder="Contoh: Bukti buram atau Nominal tidak sesuai format."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowRejectModal(false)} 
                className="flex-[0.5] py-3 text-xs font-bold uppercase rounded-lg hover:bg-surface-container-highest transition-colors"
              >Batal</button>
              <button 
                onClick={handleReject}
                className="flex-1 py-3 bg-error text-on-error shadow-lg shadow-error/20 text-xs font-bold uppercase rounded-lg active:scale-95 transition-transform"
              >Konfirmasi Tolak</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
