import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { authorsService } from '../services/authors'
import type { Author, AuthorStats, Article } from '../types'

type TabType = 'sobre' | 'articles' | 'estadistiques'

const AuthorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('sobre')
  const [articlesPage, setArticlesPage] = useState(1)
  const [articlesTotalPages, setArticlesTotalPages] = useState(1)
  const [articlesLoading, setArticlesLoading] = useState(false)

  useEffect(() => {
    if (slug) {
      loadAuthor()
      loadAuthorStats()
    }
  }, [slug])

  useEffect(() => {
    if (author && activeTab === 'articles') {
      loadAuthorArticles()
    }
  }, [author, activeTab, articlesPage])

  const loadAuthor = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await authorsService.getAuthor(slug!)
      setAuthor(data.author)
    } catch (err) {
      console.error('Error loading author:', err)
      setError('Error carregant l\'autor')
    } finally {
      setLoading(false)
    }
  }

  const loadAuthorStats = async () => {
    try {
      const data = await authorsService.getAuthorStats(slug!)
      setStats(data.stats)
    } catch (err) {
      console.error('Error loading author stats:', err)
    }
  }

  const loadAuthorArticles = async () => {
    if (!author) return
    
    try {
      setArticlesLoading(true)
      
      const data = await authorsService.getAuthorArticles(slug!, {
        page: articlesPage,
        limit: 12
      })
      
      if (articlesPage === 1) {
        setArticles(data.articles || [])
      } else {
        setArticles(prev => [...prev, ...(data.articles || [])])
      }
      
      setArticlesTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error loading author articles:', err)
    } finally {
      setArticlesLoading(false)
    }
  }

  const loadMoreArticles = () => {
    if (articlesPage < articlesTotalPages) {
      setArticlesPage(prev => prev + 1)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatYear = (dateString?: string) => {
    if (!dateString) return new Date().getFullYear().toString()
    return new Date(dateString).getFullYear().toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 md:pt-64 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newyorker-dark"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 md:pt-64 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error || 'Autor no trobat'}</p>
              <Link
                to="/autors"
                className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tornar a autors
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className=" pt-32 md:pt-64 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-newyorker-dark transition-colors">
                  Inici
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link to="/autors" className="hover:text-newyorker-dark transition-colors">
                  Autors
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-newyorker-dark font-medium">
                {author.name}
              </li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Foto del autor */}
              <div className="flex-shrink-0">
                {author.photo ? (
                  <img
                    src={`/api/images/${author.photo}`}
                    alt={author.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src = '/placeholder-image.svg'
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-newyorker-dark text-white flex items-center justify-center text-4xl font-semibold border-4 border-gray-100">
                    {authorsService.getAuthorInitials(author.name)}
                  </div>
                )}
              </div>

              {/* Información del autor */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-display text-newyorker-dark mb-2">
                  {author.name}
                </h1>
                
                {author.profession && (
                  <p className="text-lg text-gray-600 mb-3">
                    {author.profession}
                  </p>
                )}
                
                {author.location && (
                  <p className="text-gray-500 mb-4">
                    📍 {author.location}
                  </p>
                )}
                
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {author.bio.short}
                </p>
                
                {/* Estadísticas rápidas */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                    <span className="font-medium">{author.stats.totalArticles}</span> articles
                  </div>
                  {author.stats.firstPublication && (
                    <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                      Des de {formatYear(author.stats.firstPublication)}
                    </div>
                  )}
                  {author.specialties && author.specialties.length > 0 && (
                    <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                      {author.specialties[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navegación por Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'sobre', label: 'Sobre' },
                  { id: 'articles', label: 'Articles' },
                  { id: 'estadistiques', label: 'Estadístiques' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-newyorker-dark text-newyorker-dark'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido de los Tabs */}
            <div className="p-6">
              {/* Tab: Sobre */}
              {activeTab === 'sobre' && (
                <div className="space-y-6">
                  {/* Biografía completa */}
                  <div>
                    <h3 className="text-xl font-semibold text-newyorker-dark mb-3">
                      Biografia
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {author.bio.full}
                      </p>
                    </div>
                  </div>

                  {/* Formación */}
                  {author.education && author.education.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-newyorker-dark mb-3">
                        Formació
                      </h3>
                      <div className="space-y-2">
                        {author.education.map((edu, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-newyorker-dark rounded-full"></div>
                            <span className="text-gray-700">
                              {edu.degree} - {edu.institution} ({edu.year})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Premios */}
                  {author.awards && author.awards.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-newyorker-dark mb-3">
                        Premis i reconeixement
                      </h3>
                      <div className="space-y-2">
                        {author.awards.map((award, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-newyorker-dark rounded-full"></div>
                            <span className="text-gray-700">
                              {award.name} ({award.year})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Especialidades */}
                  {author.specialties && author.specialties.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-newyorker-dark mb-3">
                        Especialitats
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {author.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enlaces de contacto */}
                  {author.contact && Object.values(author.contact).some(Boolean) && (
                    <div>
                      <h3 className="text-xl font-semibold text-newyorker-dark mb-3">
                        Enllaços
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {author.contact.website && (
                          <a
                            href={author.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-newyorker-dark text-white rounded-lg hover:bg-newyorker-red transition-colors"
                          >
                            🌐 Web
                          </a>
                        )}
                        {author.contact.twitter && (
                          <a
                            href={`https://twitter.com/${author.contact.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            🐦 Twitter
                          </a>
                        )}
                        {author.contact.linkedin && (
                          <a
                            href={author.contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                          >
                            💼 LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Articles */}
              {activeTab === 'articles' && (
                <div>
                  <h3 className="text-xl font-semibold text-newyorker-dark mb-4">
                    Articles de {author.name}
                  </h3>
                  
                  {articles.length === 0 && !articlesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Encara no hi ha articles publicats.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <Link
                          key={article._id}
                          to={`/${article.section}/${article.url}`}
                          className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-start space-x-4">
                            {article.imageCard && (
                              <img
                                src={`/api/images/${article.imageCard}`}
                                alt={article.title}
                                className="w-20 h-20 rounded object-cover flex-shrink-0"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  target.src = '/placeholder-image.svg'
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-newyorker-dark group-hover:text-newyorker-red transition-colors mb-1">
                                {article.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {article.summary}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="capitalize">{article.section}</span>
                                {article.year && <span>{article.year}</span>}
                                {article.issueNumber && <span>Edició {article.issueNumber}</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {/* Botón de cargar más */}
                      {articlesPage < articlesTotalPages && (
                        <div className="text-center pt-4">
                          <button
                            onClick={loadMoreArticles}
                            disabled={articlesLoading}
                            className="px-6 py-2 bg-newyorker-dark text-white rounded-lg hover:bg-newyorker-red transition-colors disabled:opacity-50"
                          >
                            {articlesLoading ? 'Carregant...' : 'Carregar més articles'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Estadísticas */}
              {activeTab === 'estadistiques' && stats && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-newyorker-dark mb-4">
                    Estadístiques de {author.name}
                  </h3>
                  
                  {/* Resumen general */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-newyorker-dark">
                        {stats.totalArticles}
                      </div>
                      <div className="text-sm text-gray-600">Total articles</div>
                    </div>
                    {stats.firstPublication && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-newyorker-dark">
                          {formatYear(stats.firstPublication)}
                        </div>
                        <div className="text-sm text-gray-600">Primera publicació</div>
                      </div>
                    )}
                    {stats.lastPublication && (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-newyorker-dark">
                          {formatYear(stats.lastPublication)}
                        </div>
                        <div className="text-sm text-gray-600">Última publicació</div>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas por sección */}
                  {stats.sectionStats && stats.sectionStats.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-newyorker-dark mb-3">
                        Articles per secció
                      </h4>
                      <div className="space-y-2">
                        {stats.sectionStats.map((section) => (
                          <div key={section._id} className="flex items-center justify-between">
                            <span className="capitalize text-gray-700">{section._id}</span>
                            <span className="font-medium text-newyorker-dark">{section.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estadísticas por año */}
                  {stats.yearStats && stats.yearStats.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-newyorker-dark mb-3">
                        Articles per any
                      </h4>
                      <div className="space-y-2">
                        {stats.yearStats.map((year) => (
                          <div key={year._id} className="flex items-center justify-between">
                            <span className="text-gray-700">{year._id}</span>
                            <span className="font-medium text-newyorker-dark">{year.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

export default AuthorPage 