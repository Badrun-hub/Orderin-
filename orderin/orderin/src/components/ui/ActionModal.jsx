import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

// Komponen Modal Reusable
export default function ActionModal({
  isOpen,
  title,
  message,
  icon,
  theme = 'error', // 'error', 'primary', 'success', 'warning'
  type = 'confirm', // 'confirm', 'alert', 'custom'
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  children
}) {
  if (!isOpen) return null

  // Styling maps based on theme
  const themeStyles = {
    error: {
      iconBg: 'bg-error/10 border-error/20',
      iconText: 'text-error',
      btnOk: 'bg-error text-on-error shadow-error/20'
    },
    primary: {
      iconBg: 'bg-primary/10 border-primary/20',
      iconText: 'text-primary',
      btnOk: 'bg-primary text-on-primary shadow-primary/20'
    },
    success: {
      iconBg: 'bg-[#10B981]/10 border-[#10B981]/20',
      iconText: 'text-[#10B981]',
      btnOk: 'bg-[#10B981] text-white shadow-[#10B981]/20'
    },
    warning: {
      iconBg: 'bg-tertiary-container/20 border-tertiary/20',
      iconText: 'text-tertiary',
      btnOk: 'bg-tertiary text-on-tertiary shadow-tertiary/20'
    }
  }

  const tClass = themeStyles[theme] || themeStyles.primary

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface-container-high w-full max-w-sm rounded-[2rem] p-6 ghost-border shadow-2xl text-center">
        
        {icon && (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${tClass.iconBg}`}>
             <span className={`material-symbols-outlined text-3xl ${tClass.iconText}`}>{icon}</span>
          </div>
        )}
        
        {title && <h2 className="font-headline font-extrabold text-xl mb-2">{title}</h2>}
        {message && <p className="text-sm text-on-surface-variant mb-8">{message}</p>}
        
        {/* Render Form Custom jika Type Custom */}
        {type === 'custom' && children && (
          <div className="mb-6 text-left">
            {children}
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          {type !== 'alert' && (
             <button onClick={onCancel} className="flex-1 py-3 bg-surface-container-highest text-sm font-bold uppercase rounded-xl hover:bg-white/10 transition-colors">{cancelText}</button>
          )}
          {(type === 'confirm' || type === 'alert' || (type === 'custom' && onConfirm)) && (
            <button 
              onClick={onConfirm} 
              className={`flex-[1.5] py-3 text-sm font-bold uppercase rounded-xl shadow-lg active:scale-95 transition-transform ${tClass.btnOk}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * UTILITY FUNGSI GLOBAL IMPERATIVE (Pengganti alert() dan confirm())
 * Supaya bisa dipanggil kapan saja tanpa state React (contoh: Alert.show())
 */
class GlobalModalManager {
  constructor() {
    this.container = null
    this.root = null
  }

  mount() {
    if (!this.container) {
      this.container = document.createElement('div')
      document.body.appendChild(this.container)
      this.root = createRoot(this.container)
    }
  }

  unmount() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    if (this.container) {
      document.body.removeChild(this.container)
      this.container = null
    }
  }

  show(props) {
    this.mount()
    this.root.render(<ActionModal isOpen={true} {...props} onCancel={() => { if(props.onCancel) props.onCancel(); this.unmount(); }} />)
  }
}

const modalManager = new GlobalModalManager()

// Panggilan cepat untuk Alert dan Confirm yang asinkron (Bisa di-await)
export const CustomAlert = (title, message, theme = 'primary', icon = 'info') => {
  return new Promise((resolve) => {
    modalManager.show({
      title, message, theme, icon, type: 'alert', confirmText: 'Mengerti',
      onConfirm: () => { modalManager.unmount(); resolve(true); }
    })
  })
}

export const CustomConfirm = (title, message, theme = 'error', icon = 'warning', confirmText = 'Lanjutkan') => {
  return new Promise((resolve) => {
    modalManager.show({
      title, message, theme, icon, type: 'confirm', confirmText,
      onConfirm: () => { modalManager.unmount(); resolve(true); },
      onCancel: () => { modalManager.unmount(); resolve(false); }
    })
  })
}
