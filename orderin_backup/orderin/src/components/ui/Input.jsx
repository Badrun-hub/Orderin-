export function Input({ className = '', ...props }) {
  return (
    <input 
      className={`w-full bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/50 px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-surface-tint focus:outline-none transition-all ${className}`}
      {...props}
    />
  )
}
