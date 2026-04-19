export function BottomNav({ items }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl flex justify-around items-center p-3 pb-safe rounded-t-2xl shadow-2xl">
      {items.map((item, index) => (
        <a 
          key={index}
          className={`flex flex-col items-center justify-center tap-highlight-none active:scale-95 transition-all ${item.isActive ? 'text-primary bg-primary/10 rounded-xl px-4 py-1' : 'text-slate-500 hover:text-primary'}`} 
          href={item.href}
          onClick={item.onClick}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: item.isActive ? "'FILL' 1" : "'FILL' 0" }}>
            {item.icon}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[0.05em] mt-1">{item.label}</span>
        </a>
      ))}
    </nav>
  )
}
