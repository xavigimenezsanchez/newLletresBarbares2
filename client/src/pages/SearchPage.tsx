import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { apiService } from '../services/api'
import type { Article } from '../types'

interface SearchFilters {
  section: string
  author: string
  year: string
  sortBy: string
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

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    section: '',
    author: '',
    year: '',
    sortBy: 'date'
  })
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const query = searchParams.get('q') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')

  const sections = [
    { value: '', label: 'Totes les seccions' },
    { value: 'articles', label: 'Articles' },
    { value: 'creacio', label: 'Creació' },
    { value: 'entrevistes', label: 'Entrevistes' },
    { value: 'llibres', label: 'Llibres' },
    { value: 'llocs', label: 'Llocs' },
    { value: 'recomanacions', label: 'Recomanacions' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Més recents' },
    { value: 'relevance', label: 'Més rellevants' },
    { value: 'title', label: 'Títol A-Z' }
  ]

  const loadFiltersData = useCallback(async () => {
    try {
      const [authorsResponse, issuesResponse] = await Promise.all([
        apiService.getAuthors(),
        apiService.getIssues({ limit: 1000 })
      ])
      
      if (authorsResponse && Array.isArray(authorsResponse)) {
        setAvailableAuthors(authorsResponse)
      }
      
      if (issuesResponse && (issuesResponse as any).issues) {
        const years = [...new Set((issuesResponse as any).issues.map((issue: any) => issue.year))]
        setAvailableYears(years.sort((a: number, b: number) => b - a))
      }
    } catch (err) {
      console.error('Error loading filter data:', err)
    }
  }, [])

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchData = await apiService.search({
        q: query,
        section: filters.section || undefined,
        author: filters.author || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        page: currentPage,
        limit: 12
      })

      setResults(searchData as SearchResult)
    } catch (err) {
      console.error('Error performing search:', err)
      setError('Error en la cerca. Intenta-ho de nou.')
    } finally {
      setLoading(false)
    }
  }, [query, filters, currentPage])

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1') // Reset to first page
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      section: '',
      author: '',
      year: '',
      sortBy: 'date'
    })
    const newParams = new URLSearchParams({ q: query })
    setSearchParams(newParams)
  }

  useEffect(() => {
    loadFiltersData()
  }, [loadFiltersData])

  useEffect(() => {
    // Load filters from URL
    setFilters({
      section: searchParams.get('section') || '',
      author: searchParams.get('author') || '',
      year: searchParams.get('year') || '',
      sortBy: searchParams.get('sortBy') || 'date'
    })
  }, [searchParams])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const renderPagination = () => {
    if (!results || results.pagination.pages <= 1) return null

    const { page, pages } = results.pagination
    const pageNumbers = []
    
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        {page > 1 && (
          <button
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Anterior
          </button>
        )}
        
        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 text-sm border rounded ${
              pageNum === page
                ? 'bg-black text-white border-black'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        {page < pages && (
          <button
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Següent
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-newyorker-gray pt-28 md:pt-60">
      
      <main className="max-w-7xl mx-auto px-4 py-8">


        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">Filtres</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Esborrar tot
                </button>
              </div>

              <div className="space-y-4">
                {/* Section Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Secció</label>
                  <select
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm"
                  >
                    {sections.map(section => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Autor</label>
                  <select
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm"
                  >
                    <option value="">Tots els autors</option>
                    {availableAuthors.map(author => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Any</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm"
                  >
                    <option value="">Tots els anys</option>
                    {availableYears.map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ordenar per</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            {query && (
              <div className="mb-6">
                <h1 className="font-display text-3xl mb-2">
                  Resultats de cerca
                </h1>
                <p className="text-gray-600">
                  {loading ? (
                    'Cercant...'
                  ) : results ? (
                    `${results.pagination.total} resultat${results.pagination.total !== 1 ? 's' : ''} trobat${results.pagination.total !== 1 ? 's' : ''} per "${query}"`
                  ) : (
                    `Cerca per "${query}"`
                  )}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            )}

            {/* No Query State */}
            {!query && !loading && (
              <div className="text-center py-12">
                <h2 className="font-display text-2xl mb-4">Cerca a Lletres Bàrbares</h2>
                <p className="text-gray-600 mb-6">
                  Introdueix un terme de cerca per trobar articles, autors o contingut
                </p>
              </div>
            )}

            {/* No Results State */}
            {query && results && results.articles.length === 0 && !loading && (
              <div className="text-center py-12">
                <h2 className="font-display text-2xl mb-4">Cap resultat trobat</h2>
                <p className="text-gray-600 mb-6">
                  No hem pogut trobar cap article que coincideixi amb la teva cerca.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Suggeriments:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Comprova l'ortografia</li>
                    <li>Prova amb termes més generals</li>
                    <li>Utilitza menys filtres</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {results && results.articles.length > 0 && !loading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.articles.map((article) => (
                    <ArticleCard
                      key={`${article.section}-${article.url}`}
                      article={article}
                    />
                  ))}
                </div>

                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}

export default SearchPage