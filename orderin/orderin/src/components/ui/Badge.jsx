export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-surface-container-highest text-on-surface-variant",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    error: "bg-error/10 text-error"
  }
  
  return (
    <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
