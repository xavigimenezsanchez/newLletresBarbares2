/**
 * Utilidades para simular comportamiento de dispositivos móviles en desarrollo
 */

export const simulateTouchDevice = () => {
  // Simular eventos touch en desarrollo
  if (process.env.NODE_ENV === 'development' && !('ontouchstart' in window)) {
    let isMouseDown = false
    let startPos: { x: number; y: number } | null = null

    // Convertir eventos de mouse a eventos touch para testing
    document.addEventListener('mousedown', (e) => {
      isMouseDown = true
      startPos = { x: e.clientX, y: e.clientY }
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 0,
          target: e.target as Element,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
          radiusX: 10,
          radiusY: 10,
          rotationAngle: 0,
          force: 1
        })]
      })
      
      e.target?.dispatchEvent(touchEvent)
    })

    document.addEventListener('mousemove', (e) => {
      if (!isMouseDown || !startPos) return
      
      const touchEvent = new TouchEvent('touchmove', {
        touches: [new Touch({
          identifier: 0,
          target: e.target as Element,
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          screenX: e.screenX,
          screenY: e.screenY,
          radiusX: 10,
          radiusY: 10,
          rotationAngle: 0,
          force: 1
        })]
      })
      
      e.target?.dispatchEvent(touchEvent)
    })

    document.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return
      
      isMouseDown = false
      startPos = null
      
      const touchEvent = new TouchEvent('touchend', {
        touches: []
      })
      
      e.target?.dispatchEvent(touchEvent)
    })

    console.log('🔧 Touch simulation enabled for development')
  }
}

export const addSwipeDebugInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    // Añadir información de debug en la consola
    const style = 'background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px;'
    console.log('%c✨ Navegación por Swipe Activada', style)
    console.log('👆 Desliza hacia la izquierda o derecha para navegar entre ediciones')
    console.log('📱 En desktop, mantén presionado el mouse y arrastra para simular')
  }
}