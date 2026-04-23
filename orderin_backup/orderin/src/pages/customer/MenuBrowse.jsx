import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { useCartStore } from '../../store/cartStore'
import { formatRupiah } from '../../utils/formatRupiah'
import api from '../../lib/api'
import { useSettingsStore } from '../../store/settingsStore'

export default function MenuBrowse() {
  const { lokasi, tableNo } = useParams()
  const navigate = useNavigate()
  const { session } = useSessionStore()
  const { cart, addToCart } = useCartStore()
  const { cafeName, cafeLogo } = useSettingsStore()
  
  const [categories, setCategories] = useState([])
  const [menus, setMenus] = useState([])
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [resolvedTable, setResolvedTable] = useState(null)

  // Fetch Real Data from Local API
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 0. Resolve Table by Lokasi & Nomor Meja
      try {
        const { data: tData } = await api.get('/tables/find', {
          params: { lokasi, nomor_meja: tableNo }
        })
        if (tData) setResolvedTable(tData)
      } catch (e) { /* table not found is non-fatal */ }

      // 1. Fetch Categories
      const { data: cats } = await api.get('/categories')
      setCategories(cats || [])

      // 2. Fetch Menus (available only)
      const { data: mnus } = await api.get('/menus', { params: { available: 'true' } })
      setMenus(mnus || [])
      
    } catch (err) {
      console.error('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [lokasi, tableNo])

  // Derived state
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)
  const totalPrice = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)

  // Filtering Logic
  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'Semua' || menu.categories?.nama === activeCategory
    return searchQuery ? matchesSearch : matchesCategory
  })

  const customerName = session?.customerName || "Guest"

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 pt-2 relative overflow-hidden">
      {/* TopAppBar Navigation Shell */}
      <header className="bg-surface-container-low/80 backdrop-blur-md fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          {cafeLogo ? (
             <img src={cafeLogo} alt="Logo" className="w-8 h-8 rounded-full border border-outline-variant object-cover shadow-sm" />
          ) : (
             <span className="material-symbols-outlined text-primary text-2xl font-black">restaurant_menu</span>
          )}
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary tracking-tight font-headline leading-tight">{cafeName || 'Orderin'}</span>
            <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-[0.15em] mt-0.5">Meja {tableNo} ({lokasi}) • {customerName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant group hover:border-[#10B981]/50 transition-all cursor-pointer shadow-lg">
             <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">person_outline</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto relative z-10">
        <section className="mb-8">
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tighter mb-2 font-headline leading-none capitalize">
             Halo, Selamat Datang!
          </h1>
          <p className="text-on-surface-variant text-sm font-body font-medium">Pilih hidangan favorit dari katalog kami hari ini.</p>
        </section>

        <section className="mb-8">
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-5 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-[1.5rem] py-5 pl-14 pr-6 text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-xl shadow-surface-container-lowest/20 font-medium" 
              placeholder="Cari sesuatu yang spesial..." 
              type="text"
            />
          </div>
        </section>

        {!searchQuery && (
          <section className="mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar flex gap-3 pb-4">
            <button 
              onClick={() => setActiveCategory('Semua')}
              className={`px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest whitespace-nowrap border transition-all duration-300 ${
                activeCategory === 'Semua' 
                  ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 font-bold' 
                  : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-slate-700'
              }`}
            >
              Semua Menu
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.nama)}
                className={`px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest whitespace-nowrap border transition-all duration-300 ${
                  activeCategory === cat.nama 
                    ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 font-bold' 
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-slate-700'
                }`}
              >
                {cat.nama}
              </button>
            ))}
          </section>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             [1,2,3,4].map(i => (
               <div key={i} className="h-64 bg-surface-container animate-pulse rounded-3xl"></div>
             ))
          ) : (
            filteredMenus.map(item => (
              <div key={item.id} className="group relative flex flex-col bg-surface-container rounded-[2rem] overflow-hidden transition-all duration-500 border border-outline-variant hover:translate-y-[-8px] hover:shadow-2xl hover:shadow-primary/10">
                <div className="relative h-48 overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.foto_url || 'https://via.placeholder.com/400x300?text=Orderin'} alt={item.nama}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container/80 to-transparent"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-on-surface leading-tight font-headline">{item.nama}</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-6 font-medium line-clamp-2">{item.deskripsi}</p>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">{item.categories?.nama}</span>
                      <span className="font-headline text-2xl font-black text-primary tracking-tight">{formatRupiah(item.harga)}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-primary-container text-on-primary-container p-4 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-lg shadow-primary-container/20 group-hover:bg-primary group-hover:text-on-primary"
                    >
                      <span className="material-symbols-outlined font-black">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-10 left-0 w-full flex justify-center px-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
          <button 
            onClick={() => navigate(`/${encodeURIComponent(lokasi)}/${encodeURIComponent(tableNo)}/cart`)}
            className="w-full max-w-lg bg-[#10B981] p-1.5 pl-5 rounded-[2.5rem] flex items-center justify-between font-bold shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-outline-variant active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4 py-2">
               <div className="bg-[#003824] w-12 h-12 rounded-full flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-on-surface">shopping_bag</span>
               </div>
               <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] text-emerald-100 uppercase tracking-widest font-black">{totalItems} Item</span>
                  <span className="text-xl font-headline font-black text-on-surface">{formatRupiah(totalPrice)}</span>
               </div>
            </div>
            <div className="bg-on-surface text-surface px-8 py-4 rounded-[2.2rem] flex items-center gap-2 text-[#003824] group-hover:bg-emerald-50 transition-colors">
               <span className="text-sm font-black uppercase tracking-tight">Checkout</span>
               <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
