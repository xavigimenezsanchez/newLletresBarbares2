import { useEffect, useState } from 'react'

type ScrollDirection = 'up' | 'down' | null

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction)
      }
      
      setLastScrollY(scrollY > 0 ? scrollY : 0)
    }

    const onScroll = () => {
      requestAnimationFrame(updateScrollDirection)
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [scrollDirection, lastScrollY])

  useEffect(() => {
    // Obtener el div que está dentro de root
    const rootElement = document.getElementById('root')
    let targetDiv = rootElement?.firstElementChild as HTMLElement
    
    // Si no existe, crearlo
    if (!targetDiv) {
      targetDiv = document.createElement('div')
      targetDiv.id = 'scroll-indicator'
      rootElement?.parentNode?.insertBefore(targetDiv, rootElement.nextSibling)
    }

    // Aplicar las clases según la dirección del scroll
    if (scrollDirection === 'down') {
      targetDiv.classList.remove('scroll-up')
      targetDiv.classList.add('scroll-down')
    } else if (scrollDirection === 'up') {
      targetDiv.classList.remove('scroll-down')
      targetDiv.classList.add('scroll-up')
    }
  }, [scrollDirection])

  return scrollDirection
}