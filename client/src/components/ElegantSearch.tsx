import React, { useState } from 'react'
import LiveSearch from './LiveSearch'
import Search from '../assets/search.svg'

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
          className="flex items-center gap-2 pl-2 text-newyorker-dark hover:text-newyorker-red transition-colors duration-200"
          aria-label="Obrir cerca"
        >
            <img src={Search} alt="Search" className="h-6 w-6 p-1" />
          <div className="text-md pt-[2px]">Cercar</div>
        </button>
      </div>

      {/* Mobile: Icono que abre overlay */}
      <div className={`md:hidden ${className}`}>
        <button
          onClick={handleClick}
          className="pl-2 text-newyorker-dark hover:text-newyorker-red transition-colors duration-200"
          aria-label="Obrir cerca"
        >
          <img src={Search} alt="Search" className="h-6 w-6 p-1" />
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