import React, { useState, useEffect } from 'react'
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

interface EdicioPDFPageProps {
  issue: Issue
  articles: Article[]
}

// Función para organizar elementos por página usando la información del campo pdf
const organizeElementsByPage = (article: Article): PageContent[] => {
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

const EdicioPDFPage: React.FC<EdicioPDFPageProps> = ({ issue, articles }) => {
  const [articlesPdfManual, setArticlesPdfManual] = useState<ArticlesPdfManual[]>([])

  useEffect(() => {
    if (issue?.pdfManual === true && articles.length > 0) {
      const articlesPdfManual: ArticlesPdfManual[] = []
      if (issue?.articlesOrder) {
        let pageNumber = 1
        issue?.articlesOrder.forEach(articleId => {
          const article = articles.find(article => article._id['$oid'] === articleId['$oid'])
          if (article) {
            const pages = organizeElementsByPage(article)
            articlesPdfManual.push({ article, pagesNumber: pageNumber, pages: pages })
            pageNumber += pages.length
          }
        })
        setArticlesPdfManual(articlesPdfManual)
      }
    }
  }, [articles, issue])

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

  if (!issue) {
    return (
      <div className="pdf-error">
        <div className="text-center py-16">
          <div className="text-xl text-red-600">Edició no trobada</div>
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
            alt={`Portada número ${issue.number}`}
            className="pdf-cover-image"
            onError={(e) => {
              // Fallback a imagen local si no está en S3
              const target = e.currentTarget;
              target.src = `/src/assets/porrtada${issue.number}.png`;
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
          <h2 className="pdf-issue-number">Número {issue.number}</h2>
          <div className="pdf-publication-date">
            {new Date(issue.publicationDate).toLocaleDateString('ca-ES', {
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

            {issue?.pdfManual && articlesPdfManual.map((articlePdfManual) => (
                <ul className="pdf-article-list">
                    <li key={articlePdfManual.article.url} className="pdf-article-item-manual">
                      <div className="pdf-article-index-item">
                        <div className="pdf-article-title" dangerouslySetInnerHTML={{ __html: articlePdfManual.article.title }} />
                      </div>
                      <div className="pdf-article-page-number">{articlePdfManual.pagesNumber}</div>
                    </li>
                </ul>
            ))}
            
            {!issue?.pdfManual && Object.entries(sectionedArticles).map(([sectionKey, sectionArticles]) => (
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
      {issue?.pdfManual === true ? (
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