import React, { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallbackText?: string
  onError?: () => void
  usePlaceholder?: boolean
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  onError,
  usePlaceholder = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadAttempts, setLoadAttempts] = useState(0)
  // Intersection Observer para lazy loading
  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    // Si usamos placeholder, cargar inmediatamente
    if (usePlaceholder) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(img)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(img)

    return () => {
      observer.unobserve(img)
    }
  }, [usePlaceholder])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  const handleError = () => {
    if (loadAttempts < 1 && !usePlaceholder) {
      // Solo 1 retry para imágenes reales
      setLoadAttempts(prev => prev + 1)
      setTimeout(() => {
        const img = imgRef.current
        if (img) {
          img.src = src + '?retry=' + Date.now()
        }
      }, 500)
    } else {
      setHasError(true)
      setIsLoaded(false)
      onError?.()
    }
  }

  // Función para obtener la imagen src correcta
  const getImageSrc = () => {
    if (usePlaceholder) {
      return '/placeholder-image.svg'
    }
    return src
  }

  // En modo placeholder, configurar como cargado inmediatamente
  useEffect(() => {
    if (usePlaceholder) {
      setIsLoaded(true)
      setHasError(false)
      setIsInView(true)
    }
  }, [usePlaceholder, src])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder mientras carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-newyorker-red rounded-full animate-spin"></div>
        </div>
      )}

      {/* Imagen principal */}
      {isInView && (
        <img
          ref={imgRef}
          src={getImageSrc()}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Fallback en caso de error */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-gray-500 block">
              {fallbackText || alt}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LazyImage