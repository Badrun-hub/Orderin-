import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useSessionStore } from '../../store/sessionStore'
import { formatRupiah } from '../../utils/formatRupiah'
import { supabase } from '../../lib/supabase'
import { useSettingsStore } from '../../store/settingsStore'

export default function UploadBukti() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  
  const { session, currentOrderId } = useSessionStore()
  const { cart, clearCart } = useCartStore()
  const { cafeName } = useSettingsStore()

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Hitung ulang untuk display total transfer
  const subtotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)
  const serviceCharge = Math.floor(subtotal * 0.05)
  const pb1 = Math.floor(subtotal * 0.1)
  const total = subtotal + serviceCharge + pb1

  const isQris = session?.paymentMethod === 'qris'

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewFile(objectUrl)
    }
  }

  const handleRemoveImage = () => {
    setPreviewFile(null)
    setSelectedFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !currentOrderId) return
    
    setIsUploading(true)
    try {
      // 1. Upload ke Storage Supabase
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${currentOrderId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, selectedFile)

      if (uploadError) {
         console.warn("Storage Error:", uploadError.message)
      }

      // 2. Ambil Public URL
      const { data: publicUrlData } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(filePath)
      
      const fileUrl = publicUrlData?.publicUrl || ''

      // 3. Update Database Order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          bukti_bayar_url: fileUrl,
          status: 'payment_uploaded'
        })
        .eq('id', currentOrderId)

      if (updateError) throw updateError

      // Berhasil
      clearCart()
      navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/status`)

    } catch (err) {
      console.error('Upload Error:', err)
      alert("Gagal mengunggah bukti. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
    }
  }

  // Fallback jika tidak ada order aktif
  if (!currentOrderId && cart.length === 0) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-surface-variant text-6xl mb-4 text-slate-700 font-black">warning</span>
        <h2 className="text-xl font-bold font-headline mb-4">Sesi Kadaluarsa</h2>
        <button onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/menu`)} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">Kembali ke Menu</button>
      </div>
    )
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
        <h1 className="text-lg font-bold font-headline tracking-tighter text-white">Konfirmasi Transfer</h1>
        <div className="w-10"></div>
      </header>

      <main className="pt-6 px-6 max-w-xl mx-auto space-y-8 relative z-10">
        
        {/* Instruction Card */}
        <section className="bg-surface-container-high p-8 rounded-[2rem] ghost-border text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <p className="text-[10px] uppercase font-black text-slate-500 mb-2 font-label tracking-widest text-center">Silakan Transfer Sebesar</p>
          <h2 className="text-4xl font-black font-headline text-primary mb-8 tracking-tighter">{formatRupiah(total)}</h2>
          
          {isQris ? (
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-[2rem] mx-auto max-w-[260px] shadow-2xl border-4 border-emerald-500/10">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ORDERIN_DUMMY_PAYMENT_667" alt="QRIS Demo" className="w-full mix-blend-multiply" />
              <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                 <p className="text-[#091421] font-black font-headline uppercase tracking-[0.2em] text-xs">SCAN QRIS</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 bg-surface-container p-6 rounded-[1.5rem] text-left mx-auto border border-outline-variant">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
                 </div>
                 <p className="text-sm text-on-surface font-black uppercase tracking-widest font-headline">Bank BCA (Transfer)</p>
              </div>
              <div className="flex gap-4 items-center bg-surface-container-highest p-4 rounded-xl mt-1 w-full justify-between cursor-pointer group hover:bg-white/5 transition-all">
                <span className="font-headline font-black text-xl tracking-[0.15em] text-primary">8803 2199 4443 11</span>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-lg font-black">content_copy</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 px-1">Atas Nama: PT {cafeName || 'Orderin'} Indonesia Makmur</p>
            </div>
          )}
        </section>

        {/* Upload Form */}
        <section className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant">
          <h3 className="font-headline text-lg font-black mb-4 px-1">Upload Bukti Transfer</h3>
          
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {!previewFile ? (
              <label className="border-2 border-dashed border-slate-800 rounded-[2rem] h-56 flex flex-col items-center justify-center p-6 text-on-surface-variant hover:bg-surface-container-high hover:border-primary/50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                   <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-primary transition-colors font-black">photo_camera</span>
                </div>
                <span className="font-bold mb-1 text-on-surface">Pilih Foto Bukti</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-600">JPG, PNG, atau Screenshot</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative rounded-[2rem] h-64 bg-surface-container-high overflow-hidden border border-outline-variant flex items-center justify-center animate-in zoom-in-95 duration-300 shadow-2xl">
                <img src={previewFile} alt="Bukti Transfer" className="h-full object-contain" />
                <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 bg-error text-on-error p-2 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-xl font-black">close</span>
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={!previewFile || isUploading}
              className="w-full h-16 bg-[#10B981] disabled:opacity-30 text-[#003824] rounded-2xl font-headline text-lg font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
            >
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl font-black">progress_activity</span> 
                  Mengecek Berkas...
                </>
              ) : (
                 <>
                  <span>Selesaikan & Pesan</span>
                  <span className="material-symbols-outlined text-xl font-black">check_circle</span>
                 </>
              )}
            </button>
          </form>
        </section>
      </main>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  )
}
