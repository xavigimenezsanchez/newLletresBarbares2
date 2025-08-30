import React, { useState, useEffect } from 'react'

interface SwipeHintProps {
  canSwipeLeft: boolean
  canSwipeRight: boolean
}

const SwipeHint: React.FC<SwipeHintProps> = ({ canSwipeLeft, canSwipeRight }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  useEffect(() => {
    // Verificar si ya se mostró el hint antes
    const hasSeenHint = localStorage.getItem('swipe-hint-seen')
    
    // Solo mostrar en dispositivos táctiles
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (!hasSeenHint && isTouchDevice && !hasUserInteracted) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000) // Mostrar después de 2 segundos

      return () => clearTimeout(timer)
    }
  }, [hasUserInteracted])

  useEffect(() => {
    // Escuchar eventos de touch para ocultar el hint
    const handleTouch = () => {
      setHasUserInteracted(true)
      setIsVisible(false)
      localStorage.setItem('swipe-hint-seen', 'true')
    }

    const handleScroll = () => {
      setHasUserInteracted(true)
      setIsVisible(false)
    }

    document.addEventListener('touchstart', handleTouch)
    document.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('touchstart', handleTouch)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const hideHint = () => {
    setIsVisible(false)
    localStorage.setItem('swipe-hint-seen', 'true')
  }

  if (!isVisible || (!canSwipeLeft && !canSwipeRight)) {
    return null
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in">
      <div className="bg-black bg-opacity-80 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {canSwipeRight && (
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">Deslitza</span>
                </div>
              )}
              
              {canSwipeLeft && canSwipeRight && (
                <span className="text-gray-300 mx-2">o</span>
              )}
              
              {canSwipeLeft && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Deslitza</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-sm">per navegar</span>
          </div>
          
          <button 
            onClick={hideHint}
            className="ml-4 text-gray-300 hover:text-white"
            aria-label="Tancar pista"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SwipeHint