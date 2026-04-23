import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../utils/formatRupiah'
import api from '../../lib/api'
import ActionModal, { CustomAlert, CustomConfirm } from '../../components/ui/ActionModal'

export default function KelolaMenu() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [activeTab, setActiveTab] = useState('Semua')
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Custom Action Modals State
  const [categoryModal, setCategoryModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Form State
  const [form, setForm] = useState({ 
    id: '', 
    nama: '', 
    category_id: '', 
    harga: '', 
    deskripsi: '', 
    foto_url: '', 
    is_available: true 
  })

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const { data: cats } = await api.get('/categories')
      const { data: mnus } = await api.get('/menus')
      
      setCategories(cats || [])
      setMenus(mnus || [])
      
      if (activeTab !== 'Semua' && cats && !cats.find(c => c.nama === activeTab)) {
        setActiveTab('Semua')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMenus = activeTab === 'Semua' 
    ? menus 
    : menus.filter(m => m.categories?.nama === activeTab)

  const handleOpenAdd = () => {
    if (categories.length === 0) {
      CustomAlert("Daftar Kategori Kosong", "Tambahkan setidaknya 1 Kategori terlebih dahulu!", "warning", "info")
      return
    }
    setEditMode(false)
    setForm({ id: '', nama: '', category_id: categories[0].id, harga: '', deskripsi: '', foto_url: '', is_available: true })
    setShowModal(true)
  }

  const handleOpenEdit = (menu) => {
    setEditMode(true)
    setForm({
      id: menu.id,
      nama: menu.nama,
      category_id: menu.categoryId || menu.category_id,
      harga: menu.harga,
      deskripsi: menu.deskripsi,
      foto_url: menu.foto_url || '',
      is_available: menu.is_available
    })
    setShowModal(true)
  }

  // Handle Photo Upload to Local Backend
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post('/upload/menus', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setForm({ ...form, foto_url: data.url })
    } catch (err) {
      console.error('Upload error:', err)
      CustomAlert("Gagal Upload", err.message, "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    const payload = {
      nama: form.nama,
      category_id: form.category_id,
      harga: Number(form.harga),
      deskripsi: form.deskripsi,
      foto_url: form.foto_url,
      is_available: form.is_available
    }

    try {
      if (editMode) {
        await api.put(`/menus/${form.id}`, payload)
      } else {
        await api.post('/menus', payload)
      }
    } catch (err) {
      CustomAlert("Gagal Simpan", err.response?.data?.error || err.message, "error")
    }

    setShowModal(false)
    fetchMenus()
  }

  const handleDelete = async (id) => {
    const ok = await CustomConfirm("Hapus Menu Ini?", "Data akan terhapus secara permanen dari daftar menu resto.", "error", "delete_forever", "Ya, Hapus")
    if(ok) {
       await api.delete(`/menus/${id}`)
       fetchMenus()
    }
  }

  const toggleAvailability = async (id, currentStatus) => {
    await api.patch(`/menus/${id}/toggle`)
    fetchMenus()
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (newCatName.trim()) {
      await api.post('/categories', { nama: newCatName.trim() })
      setNewCatName('')
      setCategoryModal(false)
      fetchMenus()
    }
  }

  if (loading && menus.length === 0) return <div className="text-on-surface p-20 text-center font-bold">Memuat Menu...</div>

  return (
    <>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Kelola Katalog</h1>
        <p className="text-on-surface-variant text-sm font-medium opacity-80 uppercase tracking-widest">MENU & KATEGORI (REAL LIVE)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Kategori */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-surface-container/50 p-5 rounded-[2.5rem] sticky top-28 shadow-sm">
            <h3 className="font-headline font-black text-[10px] uppercase tracking-[0.2em] mb-5 px-2 text-on-surface-variant">KATEGORI MENU</h3>
            <ul className="flex flex-col gap-2">
              <li 
                onClick={() => setActiveTab('Semua')}
                className={`px-5 py-3.5 rounded-2xl text-sm font-black tracking-tight cursor-pointer transition-all ${activeTab === 'Semua' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'hover:bg-surface-variant/50 text-on-surface-variant'}`}
              >
                Semua Produk
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.id} onClick={() => setActiveTab(cat.nama)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${activeTab === cat.nama ? 'bg-primary text-on-primary' : 'hover:bg-on-surface/10 text-on-surface-variant'}`}
                >
                  {cat.nama}
                </li>
              ))}
            </ul>
            <button onClick={() => setCategoryModal(true)} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-primary border border-outline-variant hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-[16px]">add</span> Tambah Kategori
            </button>
          </div>
        </aside>

        {/* Konten Menu */}
        <section className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-headline font-black tracking-tight text-on-surface">{activeTab}</h2>
            <button onClick={handleOpenAdd} className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-xs font-black font-label uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add_circle</span> TAMBAH MENU
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenus.map(menu => (
              <div key={menu.id} className={`bg-surface-container rounded-[2rem] p-4 flex gap-5 transition-all ${!menu.is_available ? 'opacity-60' : ''} hover:shadow-xl hover:shadow-primary/5 group`}>
                {/* Thumbnail Preview di List */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container-highest flex-shrink-0 relative">
                   {menu.foto_url ? (
                     <img src={menu.foto_url} alt={menu.nama} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-highest">
                       <span className="material-symbols-outlined text-xl">image</span>
                       <span className="text-[8px] font-black uppercase mt-1">No Photo</span>
                     </div>
                   )}
                </div>

                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-bold text-lg text-on-surface leading-snug">{menu.nama}</h3>
                    <div className="flex gap-2 relative z-10">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(menu); }} className="w-8 h-8 rounded-lg bg-on-surface/10 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(menu.id); }} className="w-8 h-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest bg-primary/5 border border-primary/20 px-2 py-0.5 rounded flex-shrink-0 leading-tight">{menu.categories?.nama || '-'}</span>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-1 mb-5 flex-grow font-medium leading-relaxed">{menu.deskripsi || 'Tidak ada deskripsi.'}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                    <span className="font-headline font-black text-xl text-primary">{formatRupiah(menu.harga)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant font-headline tracking-widest">{menu.is_available ? 'Aktif' : 'Habis'}</span>
                      <button 
                        onClick={() => toggleAvailability(menu.id, menu.is_available)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${menu.is_available ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      >
                        <div className={`w-4 h-4 bg-on-surface text-surface rounded-full transition-transform ${menu.is_available ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredMenus.length === 0 && (
             <div className="text-center py-24 text-on-surface-variant border-2 border-dashed border-outline-variant/30 rounded-[3rem] bg-surface-container-low/30">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-20">category</span>
                <p className="font-bold uppercase tracking-[0.2em] text-xs">Katalog Belum Ada Menu</p>
             </div>
          )}
        </section>


      {/* Modal Form Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4 lg:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface-container-low w-full max-w-lg rounded-[2.5rem] ghost-border flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative">
             
             {/* Gradient Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary"></div>

             <div className="p-7 border-b border-outline-variant flex justify-between items-center">
               <div>
                  <h2 className="font-headline font-extrabold text-2xl">{editMode ? 'Edit Hidangan' : 'Menu Baru'}</h2>
                  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Detail Produk di Katalog Online</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-on-surface/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all hover:bg-on-surface/10 group">
                 <span className="material-symbols-outlined text-[24px] transition-transform group-hover:rotate-90">close</span>
               </button>
             </div>

             <div className="p-7 overflow-y-auto custom-scrollbar flex flex-col gap-8">
               
               {/* Image Upload Area */}
               <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="relative group">
                     <div className="w-40 h-40 bg-surface-container rounded-[2rem] overflow-hidden border-2 border-dashed border-outline-variant flex items-center justify-center group-hover:border-primary/50 transition-all shadow-inner">
                        {form.foto_url ? (
                          <img src={form.foto_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-on-surface-variant">
                             <span className="material-symbols-outlined text-4xl mb-2">image</span>
                             <span className="text-[9px] font-black uppercase tracking-widest">Pilih Frame</span>
                          </div>
                        )}
                        
                        {isUploading && (
                           <div className="absolute inset-0 bg-on-surface/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                              <span className="text-[9px] text-on-surface font-black uppercase tracking-widest">Grouting...</span>
                           </div>
                        )}
                     </div>
                     <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-surface-container-low hover:scale-110 active:scale-95 transition-all"
                     >
                        <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>photo_camera</span>
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest text-center">Rekomendasi Size: 800 x 800 Pixel</p>
               </div>

               <form id="menuForm" onSubmit={handleSave} className="flex flex-col gap-6">
                 <div>
                   <label className="block text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-[0.15em] font-label px-1">Nama Hidangan</label>
                   <input type="text" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 text-base font-bold shadow-sm" placeholder="Contoh: Ramen Kari Spesial"/>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-[0.15em] font-label px-1">Kategori</label>
                     <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 text-sm font-bold appearance-none cursor-pointer">
                       {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-container-low">{c.nama}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-[0.15em] font-label px-1">Harga (Rp)</label>
                     <input type="number" required value={form.harga} onChange={e => setForm({...form, harga: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 text-base font-headline font-black text-primary" placeholder="35000"/>
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-[0.15em] font-label px-1">Foto Menu (Upload atau URL)</label>
                   <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={form.foto_url} 
                          onChange={e => setForm({...form, foto_url: e.target.value})} 
                          className="flex-grow bg-surface-container-highest border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary/50 text-xs font-medium" 
                          placeholder="https://link-foto-anda.com/gambar.jpg"
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 bg-surface-container-highest border border-outline-variant rounded-xl hover:bg-on-surface/10 text-primary transition-all flex items-center gap-2"
                          title="Upload File"
                        >
                          <span className="material-symbols-outlined text-lg">cloud_upload</span>
                          <span className="text-[10px] font-bold uppercase">Upload</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-on-surface-variant px-1 italic">* Tempel URL gambar atau klik tombol Upload untuk memilih file.</p>
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-[0.15em] font-label px-1">Deskripsi & Bahan</label>
                   <textarea rows="3" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="w-full bg-surface-container-highest border border-outline-variant rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 text-sm font-medium leading-relaxed" placeholder="Resep atau informasi alergi penting..."></textarea>
                 </div>

               </form>
             </div>

             <div className="p-7 border-t border-outline-variant flex gap-4 bg-surface-container-low/50">
               <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-surface-container-highest text-on-surface-variant text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-on-surface/10 transition-all text-center">Batal</button>
               <button type="submit" form="menuForm" disabled={isUploading} className="flex-[1.5] py-4 bg-primary text-on-primary text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                 <span className="material-symbols-outlined text-[18px] font-black group-hover:scale-110 transition-transform">save</span> 
                 Simpan Menu
               </button>
             </div>

          </div>
        </div>
      )}

      {/* Reusable ActionModal untuk Kategori */}
      <ActionModal 
        isOpen={categoryModal}
        title="Kategori Baru"
        type="custom"
        onCancel={() => setCategoryModal(false)}
      >
        <form id="catForm" onSubmit={handleSaveCategory} className="pt-2">
          <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest mb-4">Urutan Menu Akan Dikelompokkan Per Kategori</p>
          <input 
            autoFocus type="text" required value={newCatName} onChange={e => setNewCatName(e.target.value)} 
            className="w-full bg-surface-container-high border border-outline-variant rounded-2xl p-4 focus:ring-2 focus:ring-primary text-lg font-headline font-black text-center mb-6 uppercase tracking-wider placeholder:normal-case shadow-inner" 
            placeholder="Misal: Coffee Bar"
          />
          <div className="flex gap-3">
             <button type="button" onClick={() => setCategoryModal(false)} className="flex-1 py-4 bg-surface-container-highest text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-on-surface/10 transition-colors">Batal</button>
             <button type="submit" className="flex-[1.5] py-4 bg-primary text-on-primary text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-transform">Simpan Kategori</button>
          </div>
        </form>
      </ActionModal>

      </div>
    </>
  )
}
