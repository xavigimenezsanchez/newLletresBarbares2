import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authorsService } from '../services/authors'
import type { Author } from '../types'

const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'articles' | 'recent'>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Ref para el debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Cargar especialidades solo una vez
  useEffect(() => {
    loadSpecialties()
  }, [])

  // Cargar autores cuando cambien los filtros (excepto searchQuery)
  useEffect(() => {
    loadAuthors()
  }, [selectedSpecialty, sortBy, currentPage])

  // Debounce para la búsqueda
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Solo hacer búsqueda si hay query
    if (searchQuery.trim()) {
      setSearchLoading(true)
      searchTimeoutRef.current = setTimeout(() => {
        performSearch()
      }, 300) // 300ms de delay
    } else if (searchQuery === '') {
      // Si se limpia la búsqueda, cargar todos los autores
      setSearchLoading(true)
      searchTimeoutRef.current = setTimeout(() => {
        loadAuthors()
      }, 100)
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const loadSpecialties = async () => {
    try {
      const data = await authorsService.getSpecialties()
      setSpecialties(data.specialties || [])
    } catch (error) {
      console.error('Error loading specialties:', error)
    }
  }

  const loadAuthors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        page: currentPage,
        limit: 18,
        sort: sortBy
      }
      
      if (selectedSpecialty) {
        params.specialty = selectedSpecialty
      }
      
      const data = await authorsService.getAuthors(params)
      
      setAuthors(data.authors || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error loading authors:', err)
      setError('Error carregant els autors')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const performSearch = async () => {
    try {
      setError(null)
      
      const params: any = {
        page: 1, // Reset a página 1 en búsquedas
        limit: 18,
        sort: sortBy,
        search: searchQuery.trim()
      }
      
      if (selectedSpecialty) {
        params.specialty = selectedSpecialty
      }
      
      const data = await authorsService.getAuthors(params)
      
      setAuthors(data.authors || [])
      setTotalPages(data.pagination?.pages || 1)
      setCurrentPage(1) // Reset a página 1
    } catch (err) {
      console.error('Error searching authors:', err)
      setError('Error cercant els autors')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La búsqueda ya se ejecuta automáticamente con debounce
  }

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty === selectedSpecialty ? '' : specialty)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: 'name' | 'articles' | 'recent') => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSelectedSpecialty('')
    setSearchQuery('')
    setSortBy('name')
    setCurrentPage(1)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short'
    })
  }

  // Mostrar loading solo en la carga inicial
  if (loading && authors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newyorker-dark"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadAuthors}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tornar a provar
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display text-newyorker-dark mb-2">
              Autors
            </h1>
            <p className="text-gray-600">
              Descobreix els autors que han contribuït a Lletres Bàrbares
            </p>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Búsqueda */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca autors per nom, especialitat..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newyorker-dark"
                  />
                  {/* Indicador de búsqueda */}
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-newyorker-dark"></div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-newyorker-dark text-white rounded-lg hover:bg-newyorker-red transition-colors"
                >
                  Cerca
                </button>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Especialidades */}
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyChange(specialty)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedSpecialty === specialty
                          ? 'bg-newyorker-dark text-white border-newyorker-dark'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-newyorker-dark'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>

                {/* Ordenamiento */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ordenar per:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'name' | 'articles' | 'recent')}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newyorker-dark"
                  >
                    <option value="name">Nom</option>
                    <option value="articles">Més articles</option>
                    <option value="recent">Més recents</option>
                  </select>
                </div>

                {/* Reset */}
                {(selectedSpecialty || searchQuery || sortBy !== 'name') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-newyorker-dark transition-colors"
                  >
                    Netejar filtres
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Autores */}
          {authors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cap autor trobat
              </h3>
              <p className="text-gray-500">
                {searchQuery || selectedSpecialty 
                  ? 'Prova amb altres criteris de cerca'
                  : 'Encara no hi ha autors registrats'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.map((author) => (
                <Link
                  key={author._id}
                  to={`/autor/${author.slug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start space-x-4">
                    {/* Foto del autor */}
                    <div className="flex-shrink-0">
                      {author.photo ? (
                        <img
                          src={`/api/images/${author.photo}`}
                          alt={author.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.src = '/placeholder-image.svg'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-newyorker-dark text-white flex items-center justify-center text-xl font-semibold">
                          {authorsService.getAuthorInitials(author.name)}
                        </div>
                      )}
                    </div>

                    {/* Información del autor */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-newyorker-dark group-hover:text-newyorker-red transition-colors mb-1">
                        {author.name}
                      </h3>
                      
                      {author.profession && (
                        <p className="text-sm text-gray-600 mb-2">
                          {author.profession}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {author.bio.short}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{author.stats.totalArticles} articles</span>
                        {author.stats.lastPublication && (
                          <span>Últim: {formatDate(author.stats.lastPublication)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-newyorker-dark transition-colors"
                >
                  Anterior
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-600">
                  Pàgina {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-newyorker-dark transition-colors"
                >
                  Següent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AuthorsPage 