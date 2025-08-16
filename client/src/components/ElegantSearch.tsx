import React, { useState } from 'react'
import LiveSearch from './LiveSearch'

interface ElegantSearchProps {
  className?: string
}

const ElegantSearch: React.FC<ElegantSearchProps> = ({ className = '' }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const handleClick = () => {
    setIsOverlayOpen(true)
  }

  return (
    <>
      {/* Desktop: Icono de búsqueda elegante */}
      <div className={`hidden md:block ${className}`}>
        <button
          onClick={handleClick}
          className="p-2 text-newyorker-dark hover:text-newyorker-red transition-colors duration-200"
          aria-label="Obrir cerca"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Mobile: Icono que abre overlay */}
      <div className={`md:hidden ${className}`}>
        <button
          onClick={handleClick}
          className="p-2 text-newyorker-dark hover:text-newyorker-red transition-colors duration-200"
          aria-label="Obrir cerca"
        >
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Live Search para ambos (desktop y mobile) */}
      <LiveSearch
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
      />
    </>
  )
}

export default ElegantSearch