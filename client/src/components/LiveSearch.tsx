import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { analyticsService } from '../services/analytics'
import SearchHistory from './SearchHistory'
import type { Article } from '../types'

interface LiveSearchProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  query: {
    q?: string
    section?: string
    author?: string
    year?: number
  }
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const LiveSearch: React.FC<LiveSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { addToHistory } = useSearchHistory()
  const [currentAnalyticsId, setCurrentAnalyticsId] = useState<string>('')

  // Debounce para evitar demasiadas llamadas a la API
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults(null)
        setShowResults(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const searchData = await apiService.search({
          q: searchQuery.trim(),
          limit: 8 // Menos resultados para live search
        })

        setResults(searchData as SearchResult)
        setShowResults(true)
        
        // Guardar en historial
        if (searchData && (searchData as SearchResult).pagination) {
          addToHistory(searchQuery, (searchData as SearchResult).pagination.total)
        }

        // Track analytics
        const analyticsData = analyticsService.createSearchData(
          searchQuery,
          'live_search',
          undefined,
          {
            total: (searchData as SearchResult).pagination.total,
            returned: (searchData as SearchResult).articles.length
          }
        )
        
        const analyticsResult = await analyticsService.trackSearch(analyticsData)
        if (analyticsResult.success) {
          setCurrentAnalyticsId(analyticsResult.analyticsId)
        }
      } catch (err) {
        console.error('Error en live search:', err)
        setError('Error en la cerca')
        setShowResults(false)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    if (query) {
      debouncedSearch(query)
    } else {
      setResults(null)
      setShowResults(false)
    }
  }, [query, debouncedSearch])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/cerca?q=${encodeURIComponent(query.trim())}`)
      onClose()
      setQuery('')
    }
  }

  const handleResultClick = async (article: Article, index: number) => {
    // Track click analytics
    if (currentAnalyticsId) {
      const timeToClick = Date.now() - (Date.now() - 1000) // Aproximado
      await analyticsService.trackClick(currentAnalyticsId, {
        clickedResultIndex: index,
        timeToClick,
        scrolledResults: false // Podríamos implementar detección de scroll
      })
    }

    navigate(`/${article.section}/${article.url}`)
    onClose()
    setQuery('')
    setShowResults(false)
  }

  const handleHistorySelect = (query: string) => {
    setQuery(query)
    // La búsqueda se activará automáticamente por el useEffect
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative flex items-start justify-center px-6 pt-16 md:pt-32">
        <div className="w-full max-w-2xl transform transition-all duration-300">
          {/* Search Card */}
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="font-display text-xl text-newyorker-dark">
                    🔍 Cerca en temps real
                  </h2>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">EN VIU</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
                  aria-label="Tancar cerca"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Escriu per cercar articles, autors, text..."
                  className="w-full px-6 py-4 text-lg md:text-xl border-2 border-gray-200 rounded-lg focus:outline-none focus:border-newyorker-dark transition-colors placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-newyorker-dark transition-colors"
                  aria-label="Buscar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Prem <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Enter</span> per anar a la pàgina de cerca o <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Esc</span> per tancar</p>
              </div>
            </form>

            {/* Live Results or History */}
            {(showResults || !query.trim()) && (
              <div className="border-t border-gray-100">
                {showResults ? (
                  // Mostrar resultados de búsqueda
                  <div className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">
                      {loading ? 'Cercant...' : `${results?.pagination.total || 0} resultats`}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowResults(false)}
                        className="text-sm text-gray-500 hover:text-newyorker-dark transition-colors"
                      >
                        Historial
                      </button>
                      {results && results.pagination.total > 8 && (
                        <button
                          onClick={handleSubmit}
                          className="text-sm text-newyorker-red hover:text-newyorker-dark transition-colors"
                        >
                          Veure tots els resultats →
                        </button>
                      )}
                    </div>
                  </div>

                    {loading && (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-newyorker-dark"></div>
                      </div>
                    )}

                    {error && (
                      <div className="text-red-600 text-sm py-2">
                        {error}
                      </div>
                    )}

                    {!loading && results && results.articles.length > 0 && (
                      <div className="space-y-3">
                        {results.articles.map((article) => (
                                                          <button
                                  key={`${article.section}-${article.url}`}
                                  onClick={() => handleResultClick(article, index)}
                                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded overflow-hidden">
                                {article.imageCard && (
                                  <img
                                    src={`/api/images/${article.imageCard}`}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.src = '/placeholder-image.svg';
                                    }}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-newyorker-dark group-hover:text-newyorker-red transition-colors truncate">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Per {article.author}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {article.section} • {article.data}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!loading && results && results.articles.length === 0 && query.trim().length >= 2 && (
                      <div className="text-center py-6 text-gray-500">
                        <p>Cap resultat trobat per "{query}"</p>
                        <p className="text-sm mt-1">Prova amb altres termes</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Mostrar historial cuando no hay query
                  <SearchHistory
                    onSearchSelect={handleHistorySelect}
                    onClose={onClose}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Función debounce para optimizar las llamadas a la API
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default LiveSearch 