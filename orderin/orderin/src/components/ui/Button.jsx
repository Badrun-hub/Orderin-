export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-label font-semibold transition-all duration-200 outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20",
    secondary: "bg-surface-container-highest text-on-surface",
    tertiary: "bg-transparent text-primary hover:bg-primary/10"
  }

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}
