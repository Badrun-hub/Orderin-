export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-container rounded-2xl p-6 relative overflow-hidden ghost-border ${className}`}>
      {children}
    </div>
  )
}
