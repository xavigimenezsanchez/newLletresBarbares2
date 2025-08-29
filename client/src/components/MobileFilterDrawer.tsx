import React, { useEffect } from 'react'
import ArchiveFilters from './ArchiveFilters'

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  availableYears: number[]
  selectedYear?: number
  searchQuery?: string
  onYearChange: (year?: number) => void
  onSearchChange: (query: string) => void
  onClearFilters: () => void
  resultsCount: number
  totalCount: number
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  availableYears,
  selectedYear,
  searchQuery,
  onYearChange,
  onSearchChange,
  onClearFilters,
  resultsCount,
  totalCount
}) => {
  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Modal fullscreen */}
      <div className={`fixed inset-0 bg-white flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Header del modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-medium text-gray-900" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
            Filtres
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable del modal */}
        <div className="flex-1 overflow-y-auto mobile-filter-modal-content">
          <div className="p-4 pb-20">
            <ArchiveFilters
              availableYears={availableYears}
              selectedYear={selectedYear}
              searchQuery={searchQuery}
              onYearChange={(year) => {
                onYearChange(year)
                // Opcional: cerrar el drawer automáticamente al seleccionar un año
                // onClose()
              }}
              onSearchChange={onSearchChange}
              onClearFilters={() => {
                onClearFilters()
                onClose() // Cerrar drawer al limpiar filtros
              }}
              resultsCount={resultsCount}
              totalCount={totalCount}
            />
          </div>
        </div>

        {/* Footer fijo del modal */}
        <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
          >
            Aplicar filtres
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileFilterDrawer