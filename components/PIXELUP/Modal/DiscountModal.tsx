'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const DiscountModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const couponCode = "LDKFJLSD"

  const setModalWithExpiry = () => {
    const item = {
      value: 'true',
      timestamp: new Date().getTime(),
      // Expira en 7 días (en milisegundos)
      expiryDays: 1
    }
    localStorage.setItem('hasSeenDiscountModal', JSON.stringify(item))
  }

  const checkModalExpiry = () => {
    const itemStr = localStorage.getItem('hasSeenDiscountModal')
    if (!itemStr) return false

    const item = JSON.parse(itemStr)
    const now = new Date().getTime()
    const expiryTime = item.expiryDays * 24 * 60 * 60 * 1000 // días a milisegundos
    
    // Si ha expirado, eliminar del localStorage
    if (now - item.timestamp > expiryTime) {
      localStorage.removeItem('hasSeenDiscountModal')
      return false
    }
    return true
  }

  useEffect(() => {
    const hasValidModal = checkModalExpiry()
    
    if (!hasValidModal) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setModalWithExpiry()
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(couponCode)
      toast.success('¡Código copiado al portapapeles!', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#1B2A3B',
          color: '#fff',
        },
      })
    } catch (err) {
      toast.error('Error al copiar el código', {
        duration: 2000,
        position: 'bottom-center',
      })
      console.error('Error al copiar:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[90%] max-w-md rounded-lg bg-[#1B2A3B] p-8">
        {/* Botón de cerrar */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-white hover:text-gray-300"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido */}
        <div className="text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">50% de Dcto.</h2>
          <p className="mb-6 text-lg text-white">Para compras sobre $100.000</p>
          
          {!showCoupon ? (
            <button
              onClick={() => setShowCoupon(true)}
              className="mb-4 w-full rounded-md bg-[#FF5A5F] px-4 py-2 font-bold text-white hover:bg-[#FF4146]"
            >
              Obtener mi cupón de descuento
            </button>
          ) : (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="rounded-md bg-white px-4 py-2 text-lg font-bold text-gray-800">
                  {couponCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="rounded-md bg-[#00BCD4] px-3 py-2 text-white hover:bg-[#00ACC1]"
                >
                  Copiar
                </button>
              </div>
              <p className="text-sm text-white">Haz clic en COPIAR para usar este código en tu compra</p>
            </div>
          )}
          
          <button
            onClick={handleClose}
            className="text-white underline hover:text-gray-300"
          >
            No, gracias
          </button>
        </div>

        {/* Decoraciones */}
        <div className="absolute -left-4 -top-4 h-16 w-16 rotate-45 bg-[#FF5A5F]"></div>
        <div className="absolute -right-4 bottom-4 h-12 w-12 rotate-12 bg-[#00BCD4]"></div>
        <div className="absolute -bottom-2 left-8 h-8 w-8 rotate-45 bg-[#FFA726]"></div>
      </div>
    </div>
  )
}

export default DiscountModal 