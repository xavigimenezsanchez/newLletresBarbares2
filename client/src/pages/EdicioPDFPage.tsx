import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Issue, Article, ArticleTextElement, PageContent } from '../types'
import PDFArticlePaginated from '../components/PDFArticlePaginated'
import PDFArticlePaginatedManual from '../components/PDFArticlePaginatedManual'
import logoPetit from '../assets/Jara logo petit.svg'
import logoEnd from '../assets/logo5.svg'


interface ArticlesPdfManual {
  article: Article
  pagesNumber: number
  pages: PageContent[]
}


  // Función para organizar elementos por página usando la información del campo pdf
  const organizeElementsByPage = (article:Article): PageContent[] => {
    const pagesMap = new Map<number, ArticleTextElement[]>()
    let maxPageNumber = 0
    // Agrupar elementos por número de página
    article.text?.forEach((element, index) => {
      if (element.pdf && element.pdf.page) {
        const pageNumber = element.pdf.page
        let createdNextPage = false
        
        if (!pagesMap.has(pageNumber)) {
          pagesMap.set(pageNumber, [])
        }
        
        if (element.pdf.division) { 
          pagesMap.get(pageNumber)!.push({ ...element, divided: true && element.pdf.division.alignLast, content: element.pdf.division.contentPage }) 
          if (!createdNextPage) {
            pagesMap.set(pageNumber + 1, [])
            pagesMap.get(pageNumber + 1)!.push({ ...element, content: element.pdf.division.contentNextPage })
            createdNextPage = true
          }
        } else if (element.pdf.type === 'qr') {
          // Create QR in https://rosskhanas.github.io/react-qr-code/
          pagesMap.get(pageNumber)!.push({ ...element, type: 'image-foot', path: element.pdf.path })
        } else {
          pagesMap.get(pageNumber)!.push(element)
        }
        
        if (pageNumber > maxPageNumber || createdNextPage) {
          maxPageNumber = createdNextPage ? pageNumber + 1 : pageNumber
        }
      }
    })

    // Convertir Map a array de páginas ordenadas
    const pages: PageContent[] = []
    
    for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
      const elements = pagesMap.get(pageNumber) || []
      
      if (elements.length > 0) {
        pages.push({
          elements,
          hasHeader: pageNumber === 1,
          pageNumber,
          totalPages: maxPageNumber,
        })
      }
    }

    // Si no hay elementos con información de pdf, crear una página vacía
    if (pages.length === 0) {
      pages.push({
        elements: [],
        hasHeader: true,
        pageNumber: 1,
        totalPages: 1
      })
    }

    return pages
  }



const EdicioPDFPage: React.FC = () => {
  const { number } = useParams<{ number: string }>()
  
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [articlesPdfManual, setArticlesPdfManual] = useState<ArticlesPdfManual[]>([])

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


  useEffect(() => {
    if (currentIssue?.pdfManual === true && articles.length > 0) {
      const articlesPdfManual: ArticlesPdfManual[] = []
      if (currentIssue?.articlesOrder) {
        let pageNumber = 1
      currentIssue?.articlesOrder.forEach(articleId => {
        const article = articles.find(article => article._id === articleId)
        if (article) {
          const pages = organizeElementsByPage(article)
          articlesPdfManual.push({ article, pagesNumber: pageNumber, pages: pages })
          pageNumber += pages.length
        }
      })
      setArticlesPdfManual(articlesPdfManual)
    }
  }
  }, [articles, currentIssue])

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
            src={"/src/assets/background.png"}
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
        <div className="pdf-cover-title">
          
          <h1 className="pdf-title">Lletres</h1>
          <h1 className="pdf-title-2"><span><img src={logoPetit} alt="Lletres Bàrbares" className="pdf-logo" /></span>àrbares</h1>
          <h2 className="pdf-issue-number">Número {currentIssue.number}</h2>
          <div className="pdf-publication-date">
            {new Date(currentIssue.publicationDate).toLocaleDateString('ca-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Página 2: Índice */}
      <div className="pdf-page pdf-index">
        <div className="pdf-page-content">
          <div className="pdf-index-content">
            <h3 className="pdf-index-title">Índex</h3>

            {currentIssue?.pdfManual && articlesPdfManual.map((articlePdfManual) => (
                <ul className="pdf-article-list">
                    <li key={articlePdfManual.article.url} className="pdf-article-item-manual">
                      <div className="pdf-article-index-item">
                        <div className="pdf-article-title" dangerouslySetInnerHTML={{ __html: articlePdfManual.article.title }} />
                      </div>
                      <div className="pdf-article-page-number">{articlePdfManual.pagesNumber}</div>
                    </li>
                </ul>
            ))}
            
            {!currentIssue?.pdfManual && Object.entries(sectionedArticles).map(([sectionKey, sectionArticles]) => (
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


        {currentIssue?.pdfManual === true ? (
          articlesPdfManual.map((articlePdfManual, index) => {
            return (
              <PDFArticlePaginatedManual 
                key={articlePdfManual.article.url} 
                article={articlePdfManual.article} 
                pageNumberStart={articlePdfManual.pagesNumber}
                pages={articlePdfManual.pages}
              />
            )
          })
        ) : (
          articles.map((article) => {
            return (
              <PDFArticlePaginated 
                key={article.url} 
                article={article} 
              />
            )
          })
        )}


        {/* last page: footer */}
        <div className="pdf-page pdf-cover">
          <div className="pdf-cover-content">
            <img src={logoEnd} alt="Lletres Bàrbares" className="pdf-cover-image-end" />
          </div>
          
        </div>
    </div>
  )
}

export default EdicioPDFPage