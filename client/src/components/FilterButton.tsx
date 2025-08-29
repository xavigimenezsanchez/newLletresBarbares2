import React from 'react'

interface FilterButtonProps {
  onClick: () => void
  hasActiveFilters?: boolean
  resultsCount?: number
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  onClick, 
  hasActiveFilters = false,
  resultsCount
}) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
    >
      {/* Icono de filtro */}
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" 
        />
      </svg>
      
      Filtres
      
      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      
      {/* Contador de resultados */}
      {resultsCount !== undefined && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {resultsCount}
        </span>
      )}
    </button>
  )
}

export default FilterButton