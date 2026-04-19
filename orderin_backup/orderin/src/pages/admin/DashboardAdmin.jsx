import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { formatRupiah } from '../../utils/formatRupiah'
import { useSettingsStore } from '../../store/settingsStore'

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { cafeName, cafeLogo } = useSettingsStore()

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeTables: 0,
    totalTables: 0
  })

  const [weeklyData, setWeeklyData] = useState([])
  const [topMenus, setTopMenus] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: tableData } = await supabase.from('tables').select('*')
        const t = tableData || []
        const activeT = t.filter(x => x.status !== 'available' && x.status !== 'kosong').length

        const { data: orderData } = await supabase.from('orders').select('*, order_items(*)')
        const ords = orderData || []

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const todaysOrders = ords.filter(o => new Date(o.created_at) >= startOfDay)
        const revenue = todaysOrders.filter(o => o.status === 'selesai' || o.status === 'paid' || o.status === 'delivered')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        setStats({
          totalRevenue: revenue,
          totalOrders: todaysOrders.length,
          activeTables: activeT,
          totalTables: t.length
        })

        const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN']
        let weekly = days.map(d => ({ day: d, orders: 0 }))
        let menuCount = {}

        ords.filter(o => o.status === 'selesai' || o.status === 'paid' || o.status === 'delivered')
          .forEach(ord => {
            const d = new Date(ord.created_at)
            let dayIdx = d.getDay() - 1
            if (dayIdx === -1) dayIdx = 6
            weekly[dayIdx].orders += 1

            if (ord.order_items) {
              ord.order_items.forEach(item => {
                menuCount[item.nama_menu] = (menuCount[item.nama_menu] || 0) + item.qty
              })
            }
          })

        const sortedMenus = Object.keys(menuCount)
          .map(name => ({ name, val: menuCount[name] }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 4)

        const totalItemsSold = sortedMenus.reduce((sum, m) => sum + m.val, 0)
        const topCalculated = sortedMenus.map(m => ({
          name: m.name.substring(0, 15) + (m.name.length > 15 ? '...' : ''),
          val: totalItemsSold > 0 ? Math.round((m.val / totalItemsSold) * 100) + '%' : '0%'
        }))

        const maxOrder = Math.max(...weekly.map(w => w.orders), 1)
        const weeklyNormalized = weekly.map((w, idx) => ({
          day: w.day,
          height: Math.max((w.orders / maxOrder) * 100, 5) + '%',
          isToday: idx === (new Date().getDay() - 1 === -1 ? 6 : new Date().getDay() - 1),
          orders: w.orders
        }))

        setWeeklyData(weeklyNormalized)
        setTopMenus(topCalculated)

      } catch (err) {
        console.error("Gagal memuat stats admin:", err)
      }
    }

    fetchStats()

    const channel = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
          <h2 className="text-xl font-bold font-headline mb-2">Akses Terlarang</h2>
          <p className="text-sm text-on-surface-variant mb-6">Halaman ini khusus untuk manajemen tinggi.</p>
          <button onClick={() => navigate('/admin/login')} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">
            Portal Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline">Admin Dashboard</h1>
          <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider border border-primary/25">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> Realtime
          </span>
        </div>
        <p className="text-on-surface-variant text-xs font-semibold opacity-70 uppercase tracking-[0.18em]">
          Pemantauan otomatis & sentralisasi data (LIVE)
        </p>
      </div>

      {/* ── Quick Nav ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Kelola Menu', icon: 'menu_book', color: 'primary', path: '/admin/menu' },
          { label: 'Meja & QR', icon: 'table_restaurant', color: 'secondary', path: '/admin/meja' },
          { label: 'Staf Kasir', icon: 'badge', color: 'tertiary', path: '/admin/kasir' },
          { label: 'Analytics', icon: 'monitoring', color: 'blue-500', path: '/admin/analytics' },
        ].map(({ label, icon, color, path }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className={`bg-surface-container rounded-[2rem] p-7 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:bg-surface-container-high hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-md group`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-${color}/10 flex items-center justify-center group-hover:bg-${color}/20 transition-colors`}>
              <span className={`material-symbols-outlined text-${color} text-3xl`}>{icon}</span>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant group-hover:text-${color} transition-colors`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Revenue */}
        <div className="bg-surface-container rounded-3xl p-8 relative overflow-hidden hover:bg-surface-container-high transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-3xl"></div>
          <div className="mb-6">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-2xl text-2xl">payments</span>
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
            Total Pendapatan (Hari Ini)
          </p>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight leading-none">
            {formatRupiah(stats.totalRevenue)}
          </h2>
        </div>

        {/* Orders */}
        <div className="bg-surface-container rounded-3xl p-8 relative overflow-hidden hover:bg-surface-container-high transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-3xl"></div>
          <div className="mb-6">
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-3 rounded-2xl text-2xl">shopping_bag</span>
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
            Pesanan (Hari Ini)
          </p>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight leading-none">
            {stats.totalOrders} <span className="text-on-surface-variant font-semibold text-xl">Transaksi</span>
          </h2>
        </div>

        {/* Tables */}
        <div className="bg-surface-container rounded-3xl p-8 relative overflow-hidden hover:bg-surface-container-high transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary rounded-l-3xl"></div>
          <div className="mb-6">
            <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-3 rounded-2xl text-2xl">sensor_occupied</span>
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
            Kapasitas Meja
          </p>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight leading-none">
            {stats.activeTables}
            <span className="text-on-surface-variant font-semibold text-xl"> / {stats.totalTables} Meja</span>
          </h2>
        </div>

      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Weekly Orders Bar Chart */}
        <div className="bg-surface-container rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
          <div className="mb-8">
            <h3 className="text-xl font-bold font-headline mb-1">Pesanan Seminggu</h3>
            <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-[0.18em] opacity-60">
              Volume transaksi 7 hari terakhir
            </p>
          </div>
          <div className="flex items-end justify-between h-52 gap-3">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-3 w-full group relative">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-9 text-[10px] font-black text-on-primary bg-primary px-2.5 py-1 rounded-lg transition-all shadow-lg whitespace-nowrap">
                  {d.orders} order
                </span>
                <div
                  className={`w-full rounded-t-2xl transition-all duration-500 ${d.isToday
                    ? 'bg-primary shadow-[0_8px_24px_rgba(var(--theme-primary-rgb),0.35)]'
                    : 'bg-surface-container-highest group-hover:bg-primary/40'
                    }`}
                  style={{ height: d.height, minHeight: '8px' }}
                />
                <span className={`text-[10px] font-black tracking-tight ${d.isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Menus */}
        <div className="bg-surface-container rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.07)]">
          <div className="mb-8">
            <h3 className="text-xl font-bold font-headline mb-1">Menu Terlaris</h3>
            <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-[0.18em] opacity-60">
              Data asli berdasarkan order masuk
            </p>
          </div>
          <div className="flex flex-col gap-7">
            {topMenus.length > 0 ? topMenus.map((cat, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface-variant tracking-wide">{cat.name}</span>
                  <span className="text-xs font-black text-primary">{cat.val}</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: cat.val }}
                  />
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl opacity-30">bar_chart</span>
                <p className="text-sm font-medium opacity-60">Belum ada item terjual.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}