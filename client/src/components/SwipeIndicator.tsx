import React from 'react'

interface SwipeIndicatorProps {
  issSwiping: boolean
  swipeProgress: number // -1 to 1
  canSwipeLeft: boolean
  canSwipeRight: boolean
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  issSwiping,
  swipeProgress,
  canSwipeLeft,
  canSwipeRight
}) => {
  if (!issSwiping) return null

  const isSwipingLeft = swipeProgress < 0
  const isSwipingRight = swipeProgress > 0
  const progress = Math.abs(swipeProgress)

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Overlay con opacidad basada en el progreso */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-100"
        style={{ 
          opacity: progress * 0.1 
        }}
      />
      
      {/* Indicador izquierdo */}
      {isSwipingRight && canSwipeRight && (
        <div 
          className="absolute left-0 top-0 h-full flex items-center justify-center transition-all duration-100"
          style={{ 
            width: `${Math.min(progress * 200, 100)}px`,
            background: 'linear-gradient(to right, rgba(220, 38, 38, 0.8), transparent)'
          }}
        >
          <div 
            className="flex items-center space-x-2 text-white font-medium text-lg"
            style={{ 
              opacity: Math.min(progress * 2, 1),
              transform: `translateX(${-50 + progress * 50}px)`
            }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span>Anterior</span>
          </div>
        </div>
      )}

      {/* Indicador derecho */}
      {isSwipingLeft && canSwipeLeft && (
        <div 
          className="absolute right-0 top-0 h-full flex items-center justify-center transition-all duration-100"
          style={{ 
            width: `${Math.min(progress * 200, 100)}px`,
            background: 'linear-gradient(to left, rgba(220, 38, 38, 0.8), transparent)'
          }}
        >
          <div 
            className="flex items-center space-x-2 text-white font-medium text-lg"
            style={{ 
              opacity: Math.min(progress * 2, 1),
              transform: `translateX(${50 - progress * 50}px)`
            }}
          >
            <span>Següent</span>
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>
      )}

      {/* Indicador de acción no disponible */}
      {((isSwipingRight && !canSwipeRight) || (isSwipingLeft && !canSwipeLeft)) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            style={{ 
              opacity: Math.min(progress * 2, 0.8),
              transform: `scale(${0.8 + progress * 0.2})`
            }}
          >
            <div className="flex items-center space-x-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              <span className="font-medium">
                {isSwipingRight ? 'Primera edició' : 'Última edició'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwipeIndicator