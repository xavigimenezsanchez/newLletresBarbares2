import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import IssueCard from '../components/IssueCard'
import ArchiveFilters from '../components/ArchiveFilters'
import ViewToggle from '../components/ViewToggle'
import { useArchive } from '../hooks/useArchive'

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
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
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
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
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-black">Inici</Link>
            <span className="mx-2">›</span>
            <span>Arxiu</span>
          </nav>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              Arxiu
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Descobreix tots els números de Lletres Barbares. Des del 2020, hem publicat {availableYears.length} anys de cultura, literatura i pensament.
            </p>
          </div>

          {/* Layout principal */}
          <div className="flex gap-8">
            {/* Sidebar con filtros */}
            <div className="w-80 flex-shrink-0">
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
            <div className="flex-grow">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultsCount={issues.length}
              />

              {/* Lista de issues */}
              {issues.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
      
      <Footer />
    </div>
  )
}

export default ArxiuPage