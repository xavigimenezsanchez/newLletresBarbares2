import { useEffect, useRef, useState } from 'react'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  minSwipeDistance?: number
  maxVerticalDistance?: number
  element?: HTMLElement | null
}

interface SwipeState {
  issSwiping: boolean
  swipeProgress: number // -1 to 1, negative for left swipe, positive for right swipe
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  maxVerticalDistance = 100,
  element
}: SwipeConfig) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null)
  const [swipeState, setSwipeState] = useState<SwipeState>({
    issSwiping: false,
    swipeProgress: 0
  })

  useEffect(() => {
    const targetElement = element || document.body

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      }
      touchCurrentRef.current = {
        x: touch.clientX,
        y: touch.clientY
      }
      setSwipeState({
        issSwiping: false,
        swipeProgress: 0
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      touchCurrentRef.current = {
        x: touch.clientX,
        y: touch.clientY
      }

      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Verificar si es un swipe horizontal válido
      if (absDeltaX > 10 && absDeltaX > absDeltaY) {
        // Prevenir scroll durante el swipe horizontal
        e.preventDefault()
        
        const issSwiping = absDeltaX > 20
        const progress = Math.max(-1, Math.min(1, deltaX / (minSwipeDistance * 2)))
        
        setSwipeState({
          issSwiping,
          swipeProgress: progress
        })
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !touchCurrentRef.current) return

      const deltaX = touchCurrentRef.current.x - touchStartRef.current.x
      const deltaY = touchCurrentRef.current.y - touchStartRef.current.y
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Reset del estado
      setSwipeState({
        issSwiping: false,
        swipeProgress: 0
      })

      // Verificar si es un swipe válido
      if (
        absDeltaX >= minSwipeDistance && 
        absDeltaY <= maxVerticalDistance &&
        absDeltaX > absDeltaY
      ) {
        if (deltaX > 0) {
          // Swipe hacia la derecha
          onSwipeRight?.()
        } else {
          // Swipe hacia la izquierda
          onSwipeLeft?.()
        }
      }

      touchStartRef.current = null
      touchCurrentRef.current = null
    }

    const handleTouchCancel = () => {
      setSwipeState({
        issSwiping: false,
        swipeProgress: 0
      })
      touchStartRef.current = null
      touchCurrentRef.current = null
    }

    // Añadir event listeners
    targetElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    targetElement.addEventListener('touchend', handleTouchEnd, { passive: true })
    targetElement.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart)
      targetElement.removeEventListener('touchmove', handleTouchMove)
      targetElement.removeEventListener('touchend', handleTouchEnd)
      targetElement.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance, maxVerticalDistance, element])

  return swipeState
}