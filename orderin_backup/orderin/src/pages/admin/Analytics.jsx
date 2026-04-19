import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { formatRupiah } from '../../utils/formatRupiah'
import { supabase } from '../../lib/supabase'

export default function Analytics() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('7_days')

  const [revenueData, setRevenueData] = useState([])
  const [topMenus, setTopMenus] = useState([])
  const [totalWeekly, setTotalWeekly] = useState(0)
  const [totalOrdersQty, setTotalOrdersQty] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    
    // Simulate Fetch Orders (Real Data)
    const { data: orders } = await supabase.from('orders').select('*, order_items(*)')
    const o = orders || []

    const validOrders = o.filter(x => x.status === 'selesai' || x.status === 'paid' || x.status === 'delivered' || x.status === 'payment_confirmed')

    // 1. Calculate Revenue grouped by Day (7 Days)
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    // Initialize empty 7 days
    let rawRevenue = days.map(d => ({ day: d, revenue: 0, orders: 0 }))

    let totalR = 0
    let totalO = 0

    validOrders.forEach(ord => {
      const d = new Date(ord.created_at)
      let dayIdx = d.getDay() - 1
      if (dayIdx === -1) dayIdx = 6 // Sunday
      if (rawRevenue[dayIdx]) {
         rawRevenue[dayIdx].revenue += (ord.total || 0)
         rawRevenue[dayIdx].orders += 1
         totalR += (ord.total || 0)
         totalO += 1
      }
    })

    // 2. Calculate Top Menus 
    const menuCount = {}
    validOrders.forEach(ord => {
       if (ord.order_items) {
          ord.order_items.forEach(item => {
             if(menuCount[item.nama_menu]) menuCount[item.nama_menu] += item.qty
             else menuCount[item.nama_menu] = item.qty
          })
       }
    })

    const sortedMenus = Object.keys(menuCount)
      .map(name => ({ name, qty: menuCount[name] }))
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 5)

    const colors = ['#10B981', '#fbbf24', '#60a5fa', '#f87171', '#c084fc']
    sortedMenus.forEach((m, idx) => m.color = colors[idx % colors.length])

    setRevenueData(rawRevenue)
    setTopMenus(sortedMenus)
    setTotalWeekly(totalR)
    setTotalOrdersQty(totalO)
    
    setLoading(false)
  }

  // Custom Tooltip for Line Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant shadow-2xl">
          <p className="font-bold text-on-surface mb-2">{label}</p>
          <p className="text-primary text-sm font-medium">
            Pendapatan: {formatRupiah(payload[0].value)}
          </p>
          <p className="text-on-surface-variant text-xs mt-1">
            Transaksi: {payload[0].payload.orders} pesanan
          </p>
        </div>
      )
    }
    return null
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="text-on-surface p-10 font-bold text-center">Menghitung Data Laporan...</div>

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline">Laporan & Analisis</h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-80 uppercase tracking-widest leading-none mt-1">DATA PENJUALAN RESTORAN (REAL DATA)</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-primary/20 text-primary hover:bg-primary hover:text-on-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-primary/10 active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">print</span> EKSPOR PDF
        </button>
      </div>

      <div className="flex flex-col gap-8 print:pt-4">
        
        <div className="hidden print:block mb-8 text-center border-b border-black pb-4">
          <h1 className="text-2xl font-bold text-black uppercase tracking-widest">Orderin Analytics Report</h1>
          <p className="text-sm text-on-surface-variant">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl ghost-border print:hidden">
          <div className="flex gap-2">
            {['today', '7_days', '30_days', 'this_month'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  timeRange === range 
                   ? 'bg-primary text-on-primary' 
                   : 'text-on-surface-variant hover:bg-on-surface/10'
                }`}
              >
                {range.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-highest p-6 rounded-2xl print:bg-on-surface text-surface print:border print:border-slate-200">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1 print:text-black">Total Transaksi</p>
            <h3 className="text-3xl font-headline font-black print:text-black">{totalOrdersQty}</h3>
          </div>
          <div className="bg-surface-container-highest p-6 rounded-2xl sm:col-span-2 lg:col-span-3 print:bg-on-surface text-surface print:border print:border-slate-200">
             <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1 print:text-black">Akumulasi Pendapatan</p>
             <h3 className="text-3xl lg:text-4xl font-headline font-black text-primary">{formatRupiah(totalWeekly)}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container p-6 rounded-3xl ghost-border print:bg-on-surface text-surface print:border-none print:shadow-none">
             <div className="mb-6">
                <h2 className="text-xl font-bold font-headline print:text-black">Tren Pendapatan</h2>
                <p className="text-xs text-on-surface-variant print:text-on-surface-variant">Pergerakan transaksi harian periode aktif</p>
             </div>
             
             <div className="w-full h-72">
               {totalOrdersQty > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                     <YAxis hide domain={['auto', 'auto']} />
                     <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="4 4" />
                     <RechartsTooltip content={<CustomTooltip />} />
                     <Area 
                       type="monotone" 
                       dataKey="revenue" 
                       stroke="#10B981" 
                       strokeWidth={4}
                       fillOpacity={1} 
                       fill="url(#colorRevenue)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">Masih belum ada data pesanan (Real DB).</div>
               )}
             </div>
          </div>

          <div className="lg:col-span-1 bg-surface-container p-6 rounded-3xl ghost-border flex flex-col print:bg-on-surface text-surface print:border-none print:shadow-none">
             <div className="mb-6">
                <h2 className="text-xl font-bold font-headline print:text-black">Menu Terlaris</h2>
                <p className="text-xs text-on-surface-variant print:text-on-surface-variant">Berdasarkan kuantitas asli yang dipesan</p>
             </div>
             
             <div className="flex-1 w-full flex items-center justify-center -ml-4">
               {topMenus.length > 0 ? (
                 <ResponsiveContainer width="100%" height={240}>
                   <BarChart data={topMenus} layout="vertical" margin={{ top: 0, right: 0, left: 50, bottom: 0 }}>
                     <XAxis type="number" hide />
                     <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                     <RechartsTooltip 
                       cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                       itemStyle={{ color: '#fff', fontSize: '12px' }}
                     />
                     <Bar dataKey="qty" radius={[0, 4, 4, 0]} barSize={20}>
                       {topMenus.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="text-on-surface-variant text-sm text-center">Belum ada pesanan laku.</div>
               )}
             </div>
          </div>
        </div>
      </div>
    </>
  )
}
