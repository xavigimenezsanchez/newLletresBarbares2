import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Issue, Article } from '../types'
import PDFArticlePaginated from '../components/PDFArticlePaginated'
import PDFArticlePaginatedManual from '../components/PDFArticlePaginatedManual'

const EdicioPDFPage: React.FC = () => {
  const { number } = useParams<{ number: string }>()
  
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadIssueData = async () => {
      if (!number) {
        setError('Número d\'edició no vàlid')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const issueNumber = parseInt(number, 10)
        if (isNaN(issueNumber)) {
          setError('Número d\'edició no vàlid')
          setLoading(false)
          return
        }

        // Intentar obtener el issue completo primero
        try {
          const issueData = await apiService.getIssueByNumber(issueNumber)
          if (issueData) {
            setCurrentIssue(issueData as Issue)
          }
        } catch (issueError) {
          console.log('No se encontró issue completo, creando uno básico')
        }

        // Cargar datos de la edición
        const articlesData = await apiService.getArticlesByIssueNumber(issueNumber)
        const issueArticles = (articlesData as any).articles || []
        
        // Si no tenemos issue completo, crear uno básico
        // if (!currentIssue && issueArticles.length > 0) {
        //   const firstArticle = issueArticles[0]
        //   const basicIssue: Issue = {
        //     number: issueNumber,
        //     year: firstArticle.year || 2024,
        //     publicationDate: firstArticle.publicationDate || new Date().toISOString(),
        //     title: `Lletres Barbares - Número ${issueNumber}`,
        //     isPublished: true,
        //     coverImage: `portada${issueNumber}.jpg`, // Asumimos este patrón
        //     pdfManual: false // Por defecto no es manual
        //   }
        //   setCurrentIssue(basicIssue)
        // }
        
        setArticles(issueArticles)
        
      } catch (error) {
        console.error('Error carregant l\'edició:', error)
        setError('Error carregant l\'edició')
      } finally {
        setLoading(false)
      }
    }

    loadIssueData()
  }, [number])

  const getSectionLabel = (section: string) => {
    const sectionLabels: Record<string, string> = {
      articles: 'Articles',
      creacio: 'Creació',
      entrevistes: 'Entrevistes',
      llibres: 'Llibres',
      llocs: 'Llocs',
      recomanacions: 'Recomanacions'
    }
    return sectionLabels[section] || section
  }

  const groupArticlesBySection = (articles: Article[]) => {
    const sections: { [key: string]: Article[] } = {}
    
    articles.forEach(article => {
      if (!sections[article.section]) {
        sections[article.section] = []
      }
      sections[article.section].push(article)
    })
    
    return sections
  }

  if (loading) {
    return (
      <div className="pdf-loading">
        <div className="text-center py-16">
          <div className="text-xl">Carregant edició...</div>
        </div>
      </div>
    )
  }

  if (error || !currentIssue) {
    return (
      <div className="pdf-error">
        <div className="text-center py-16">
          <div className="text-xl text-red-600">{error || 'Edició no trobada'}</div>
        </div>
      </div>
    )
  }

  const sectionedArticles = groupArticlesBySection(articles)

  return (
    <div className="pdf-view">
      {/* Página 1: Portada */}
      <div className="pdf-page pdf-cover">
        <div className="pdf-cover-content">
          <img 
            src={`/api/images/portada${currentIssue.number}.jpg`}
            alt={`Portada número ${currentIssue.number}`}
            className="pdf-cover-image"
            onError={(e) => {
              // Fallback a imagen local si no está en S3
              const target = e.currentTarget;
              target.src = `/src/assets/porrtada${currentIssue.number}.png`;
              target.onerror = () => {
                // Si tampoco está local, usar una genérica
                target.src = '/src/assets/portada0.png';
              }
            }}
          />
        </div>
      </div>

      {/* Página 2: Índice */}
      <div className="pdf-page pdf-index">
        <div className="pdf-page-content">
          <h1 className="pdf-title">Lletres Barbares</h1>
          <h2 className="pdf-issue-number">Número {currentIssue.number}</h2>
          <div className="pdf-publication-date">
            {new Date(currentIssue.publicationDate).toLocaleDateString('ca-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          <div className="pdf-index-content">
            <h3 className="pdf-index-title">Índex</h3>
            
            {Object.entries(sectionedArticles).map(([sectionKey, sectionArticles]) => (
              <div key={sectionKey} className="pdf-index-section">
                <h4 className="pdf-section-title">{getSectionLabel(sectionKey)}</h4>
                <ul className="pdf-article-list">
                  {sectionArticles.map((article) => (
                    <li key={article.url} className="pdf-article-item">
                      <span className="pdf-article-title" dangerouslySetInnerHTML={{ __html: article.title }} />
                      <span className="pdf-article-author">
                        {Array.isArray(article.authors) ? article.authors.join(', ') : article.author}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Páginas de artículos */}
      {articles.map((article) => {
        // Usar el componente apropiado según pdfManual
        if (currentIssue?.pdfManual === true) {
          return (
            <PDFArticlePaginatedManual 
              key={article.url} 
              article={article} 
            />
          )
        } else {
          return (
            <PDFArticlePaginated 

              key={article.url} 
              article={article} 
            />
          )
        }
      })}
    </div>
  )
}

export default EdicioPDFPage