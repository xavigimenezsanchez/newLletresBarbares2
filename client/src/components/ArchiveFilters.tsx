import React from 'react'

interface ArchiveFiltersProps {
  availableYears: number[]
  selectedYear?: number
  searchQuery?: string
  onYearChange: (year?: number) => void
  onSearchChange: (query: string) => void
  onClearFilters: () => void
  resultsCount: number
  totalCount: number
}

const ArchiveFilters: React.FC<ArchiveFiltersProps> = ({
  availableYears,
  selectedYear,
  searchQuery,
  onYearChange,
  onSearchChange,
  onClearFilters,
  resultsCount,
  totalCount
}) => {
  const sections = [
    { key: 'articles', label: 'Articles' },
    { key: 'creacio', label: 'Creació' },
    { key: 'entrevistes', label: 'Entrevistes' },
    { key: 'llibres', label: 'Llibres' },
    { key: 'llocs', label: 'Llocs' },
    { key: 'recomanacions', label: 'Recomanacions' }
  ]

  const hasActiveFilters = selectedYear || (searchQuery && searchQuery.trim())

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Resultados */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Arxiu de la revista
        </h3>
        <p className="text-sm text-gray-600">
          {resultsCount === totalCount 
            ? `${totalCount} edicions disponibles`
            : `${resultsCount} de ${totalCount} edicions`
          }
        </p>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Cercar
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Títol, descripció..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filtro por año */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Any de publicació
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onYearChange(undefined)}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
              !selectedYear 
                ? 'bg-black text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tots els anys
          </button>
          
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                selectedYear === year 
                  ? 'bg-black text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Explorar por secciones */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Explorar per secció
        </label>
        <div className="space-y-2">
          {sections.map((section) => (
            <a
              key={section.key}
              href={`/${section.key}`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Netejar filtres
          </button>
        </div>
      )}
    </div>
  )
}

export default ArchiveFilters