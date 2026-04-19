import SidebarAdmin from './SidebarAdmin'

export default function AdminLayout({ children }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden font-body transition-colors duration-500">
      {/* SideNavBar is fixed/left-aligned */}
      <SidebarAdmin />
      
      {/* Main Content Canvas with margin to push it past the sidebar */}
      <main className="flex-grow ml-64 flex flex-col relative overflow-y-auto">
         {/* Internal Content with proper padding */}
         <div className="p-10 max-w-7xl mx-auto w-full min-h-screen animate-[fadeIn_0.5s_ease-out]">
            {children}
         </div>
      </main>
    </div>
  )
}
