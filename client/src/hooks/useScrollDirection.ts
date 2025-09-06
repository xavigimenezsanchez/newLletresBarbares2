import { useState, useEffect, useRef, useCallback } from 'react'

type ScrollDirection = 'up' | 'down' | null

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY
    const direction = scrollY > lastScrollY.current ? 'down' : 'up'
    
    if (Math.abs(scrollY - lastScrollY.current) > 10) {
      setScrollDirection(direction)
    }
    
    lastScrollY.current = scrollY > 0 ? scrollY : 0
    ticking.current = false
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [updateScrollDirection])

  // Aplicar clases CSS usando CSS variables en lugar de manipulación directa del DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-scroll-direction', scrollDirection || '')
  }, [scrollDirection])

  return scrollDirection
}