import React from 'react'
import IssueCard from '../components/IssueCard'
import ArchiveFilters from '../components/ArchiveFilters'
import ViewToggle from '../components/ViewToggle'
import MobileFilterDrawer from '../components/MobileFilterDrawer'
import FilterButton from '../components/FilterButton'
import { useArchive } from '../hooks/useArchive'
import { useFilterDrawer } from '../hooks/useFilterDrawer'

const ArxiuPage: React.FC = () => {
  const {
    issues,
    availableYears,
    loading,
    error,
    filters,
    viewMode,
    setFilters,
    clearFilters,
    setViewMode
  } = useArchive()

  const { isOpen, openDrawer, closeDrawer } = useFilterDrawer()

  // Verificar si hay filtros activos
  const hasActiveFilters = filters.year || (filters.searchQuery && filters.searchQuery.trim())

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-2xl font-light mb-4" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
                  Carregant arxiu...
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h1 className="text-2xl font-light mb-4 text-red-600">Error</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200"
                onClick={() => window.location.reload()}
              >
                Tornar a provar
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow flex justify-around bg-[#f4e8e84f] pb-16 pr-4 pl-4 md:pr-0 md:pl-0">
        <div className="arxiu-container">
          {/* Breadcrumb */}
          {/* <nav className="text-sm text-gray-600 mb-6 pt-32 md:pt-60">
            <Link to="/" className="hover:text-black">Inici</Link>
            <span className="mx-2">›</span>
            <span>Arxiu</span>
          </nav> */}
          
          {/* Header */}
          <div className="mb-8 pt-32 md:pt-60">
            <h1 className="arxiu-title text-4xl md:text-5xl font-light text-gray-900 mb-4" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              Arxiu
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
              Descobreix tots els números de Lletres Bàrbares publicats des del 2020.
            </p>
          </div>

          {/* Botón de filtros móvil */}
          <div className="lg:hidden mb-6 flex content-start justify-around w-full">
            <FilterButton
              onClick={openDrawer}
              hasActiveFilters={!!hasActiveFilters}
              resultsCount={issues.length}
            />
          </div>

          {/* Layout principal */}
          <div className="lg:flex lg:gap-8">
            {/* Sidebar con filtros - solo desktop */}
            <div className="hidden lg:block  w-80 flex-shrink-0">
              <ArchiveFilters
                availableYears={availableYears}
                selectedYear={filters.year}
                searchQuery={filters.searchQuery}
                onYearChange={(year) => setFilters({ year })}
                onSearchChange={(searchQuery) => setFilters({ searchQuery })}
                onClearFilters={clearFilters}
                resultsCount={issues.length}
                totalCount={49} // TODO: obtener del API
              />
            </div>

            {/* Contenido principal */}
            <div className="flex-grow ">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultsCount={issues.length}
              />

              {/* Lista de issues */}
              {issues.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'arxiu-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-max'
                    : 'space-y-6'
                }>
                  {issues.map((issue) => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-light text-gray-900 mb-2">
                    No s'han trobat edicions
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Prova a ajustar els filtres o la cerca per trobar el que busques.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200"
                  >
                    Netejar filtres
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      

      {/* Drawer móvil para filtros */}
      <MobileFilterDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        availableYears={availableYears}
        selectedYear={filters.year}
        searchQuery={filters.searchQuery}
        onYearChange={(year) => setFilters({ year })}
        onSearchChange={(searchQuery) => setFilters({ searchQuery })}
        onClearFilters={clearFilters}
        resultsCount={issues.length}
        totalCount={49} // TODO: obtener del API
      />
    </div>
  )
}

export default ArxiuPage