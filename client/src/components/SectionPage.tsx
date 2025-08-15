import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { apiService } from '../services/api'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { Article } from '../types'

interface ApiResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface SectionPageProps {
  section: string
  title: string
  description: string
  sectionDisplayName: string
}

const SectionPage: React.FC<SectionPageProps> = ({ 
  section, 
  title, 
  description, 
  sectionDisplayName 
}) => {
  const fetchArticles = useCallback(async (page: number) => {
    const limit = page === 1 ? 15 : 12 // Primera carga: 15, resto: 12
    const response = await apiService.getArticlesBySectionPaginated(section, page, limit) as ApiResponse
    
    return {
      items: response.articles,
      hasMore: page < response.pagination.pages,
      total: response.pagination.total
    }
  }, [section])

  const {
    items: articles,
    loading,
    hasMore,
    error,
    setTargetElement
  } = useInfiniteScroll<Article>(fetchArticles)

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h1 className="text-2xl font-light mb-4 text-red-600">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-newyorker-red">Inici</Link>
            <span className="mx-2">›</span>
            <span>{title}</span>
          </nav>
          
          <div className="mb-8">
            <h1 className="text-4xl font-light mb-4">{title}</h1>
            <p className="text-xl text-gray-600">{description}</p>
          </div>

          {/* Grid de artículos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {articles.map((article, index) => (
              <article key={article._id || `article-${index}`} className="newyorker-article-card">
                <div className="newyorker-article-image">
                  <img
                    src={`/api/images/${article.imageCard}`}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Error loading section image:', `/api/images/${article.imageCard}`)
                      const target = e.currentTarget;
                      target.src = '/placeholder-image.svg';
                    }}
                    onLoad={() => {
                      console.log('Section image loaded successfully:', `/api/images/${article.imageCard}`)
                    }}
                  />
                </div>
                
                <div className="newyorker-article-content">
                  <div className="newyorker-article-meta">
                    <span className="text-newyorker-red font-medium">{sectionDisplayName}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.data)}</span>
                  </div>
                  
                  <h3 className="newyorker-article-title">
                    <Link to={`/${section}/${article.url}`}>
                      {article.title}
                    </Link>
                  </h3>
                  
                  <p className="newyorker-article-summary">
                    {article.summary}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-newyorker-light-gray">
                    <div className="text-sm text-gray-600">
                      Per {article.author}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-newyorker-red"></div>
              <p className="mt-2 text-gray-600">Carregant més {title.toLowerCase()}...</p>
            </div>
          )}

          {/* Target element for intersection observer */}
          {hasMore && !loading && (
            <div ref={setTargetElement} className="h-10 flex items-center justify-center">
              <div className="text-sm text-gray-400">Scroll per veure més</div>
            </div>
          )}

          {/* End message */}
          {!hasMore && articles.length > 0 && (
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-gray-600">Has vist tots els articles de {title.toLowerCase()}</p>
              <p className="text-sm text-gray-400 mt-1">Total: {articles.length} articles</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-light mb-4">No hi ha articles disponibles</h2>
              <p className="text-gray-600">Encara no tenim articles de {title.toLowerCase()} publicats.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default SectionPage