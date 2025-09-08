import React from 'react'
import type { Article, ArticleTextElement } from '../types'

interface PDFArticlePaginatedManualProps {
  article: Article
}

interface PageContent {
  elements: ArticleTextElement[]
  hasHeader: boolean
  pageNumber: number
  totalPages: number
}

const PDFArticlePaginatedManual: React.FC<PDFArticlePaginatedManualProps> = ({ article }) => {
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

  // Función para organizar elementos por página usando la información del campo pdf
  const organizeElementsByPage = (): PageContent[] => {
    const pagesMap = new Map<number, ArticleTextElement[]>()
    let maxPageNumber = 0
    debugger
    // Agrupar elementos por número de página
    article.text?.forEach((element, index) => {
      if (element.pdf && element.pdf.page) {
        const pageNumber = element.pdf.page
        let createdNextPage = false
        
        if (!pagesMap.has(pageNumber)) {
          pagesMap.set(pageNumber, [])
        }
        
        if (element.pdf.division) { 
          pagesMap.get(pageNumber)!.push({ ...element, content: element.pdf.division.contentPage }) 
          if (!createdNextPage) {
            pagesMap.set(pageNumber + 1, [])
            pagesMap.get(pageNumber + 1)!.push({ ...element, content: element.pdf.division.contentNextPage })
            createdNextPage = true
          }
        } else {
          pagesMap.get(pageNumber)!.push(element)
        }
        
        if (pageNumber > maxPageNumber) {
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
          totalPages: maxPageNumber
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

  const pages = organizeElementsByPage()

  const renderElement = (element: ArticleTextElement, index: number, pageIndex: number) => {
    const elementKey = `pdf-manual-article-${article.url}-page-${pageIndex}-${index}`

    switch (element.type) {
      case 'paragraph':
      case 'paragraph2':
        return (
          <div key={elementKey} className="pdf-paragraph-wrapper">
            <p
               style={element.styles ? JSON.parse(element.styles) : undefined}
               className={`pdf-paragraph ${element.className || ''}`}
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          </div>
        )

        // if (element.image) {
        //   return (
        //     <div key={elementKey} className="pdf-paragraph-with-image">
        //       <p
        //         className={`pdf-paragraph ${element.className || ''}`}
        //         dangerouslySetInnerHTML={{ __html: element.content }}
        //       />
        //       <div className="pdf-image-container">
        //         <img
        //           src={`/api/images/${element.image.name}`}
        //           alt=""
        //           className="pdf-image"
        //           onError={(e) => {
        //             const target = e.currentTarget;
        //             target.style.display = 'none';
        //           }}
        //         />
        //       </div>
        //     </div>
        //   )
        // } else {
        //   // Si el elemento tiene división de contenido, renderizar ambas partes
        //   if (element.pdf?.division) {
        //     return (
        //       <div key={elementKey} className="pdf-paragraph-wrapper">
        //         <p
        //           className={`pdf-paragraph ${element.className || ''}`}
        //           dangerouslySetInnerHTML={{ __html: element.content }}
        //         />
                
        //         {/* Mostrar información de división si está disponible */}
        //         {element.pdf.division.contentPage && (
        //           <div className="pdf-division-info">
        //             <div className="pdf-division-current">
        //               <strong>Contingut pàgina actual:</strong>
        //               <div dangerouslySetInnerHTML={{ __html: element.pdf.division.contentPage }} />
        //             </div>
        //             {element.pdf.division.contentNextPage && (
        //               <div className="pdf-division-next">
        //                 <strong>Contingut pàgina següent:</strong>
        //                 <div dangerouslySetInnerHTML={{ __html: element.pdf.division.contentNextPage }} />
        //               </div>
        //             )}
        //           </div>
        //         )}
        //       </div>
        //     )
        //   } else {
        //     return (
        //       <div key={elementKey} className="pdf-paragraph-wrapper">
        //         <p
        //           className={`pdf-paragraph ${element.className || ''}`}
        //           dangerouslySetInnerHTML={{ __html: element.content }}
        //         />
        //       </div>
        //     )
        //   }
        // }

      case 'title':
      case 'title2':
        return (
          <div key={elementKey} className="pdf-title-wrapper">
            <h3
              className={`pdf-subtitle ${element.type === 'title2' ? 'pdf-subtitle-2' : ''}`}
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          </div>
        )

      case 'question':
        return (
          <div key={elementKey} className="pdf-question">
            <p dangerouslySetInnerHTML={{ __html: element.content }} />
          </div>
        )

      case 'image':
        return (
          <div key={elementKey} className="pdf-image-container">
            <img
              src={`/api/images/${element.name}`}
              alt=""
              className="pdf-image"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
            {element.content && (
              <p className="pdf-image-caption">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </p>
            )}
          </div>
        )

      case 'video':
        return (
          <div key={elementKey} className="pdf-video-placeholder">
            <div className="pdf-video-icon">🎥</div>
            <p className="pdf-video-text">
              Vídeo disponible en línia: 
              <br />
              <span className="pdf-video-link">
                https://lletresbarbaras.com/{article.section}/{article.url}
              </span>
            </p>
            {element.content && (
              <p className="pdf-video-caption">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </p>
            )}
          </div>
        )

      case 'youtube':
        const getYouTubeId = (url: string) => {
          const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&"'>]+)/)
          return match ? match[1] : null
        }
        
        const youtubeId = getYouTubeId(element.content)
        const youtubeUrl = youtubeId ? `https://youtube.com/watch?v=${youtubeId}` : element.content

        return (
          <div key={elementKey} className="pdf-youtube-placeholder">
            <div className="pdf-video-icon">📺</div>
            <p className="pdf-video-text">
              Vídeo de YouTube: 
              <br />
              <span className="pdf-video-link">{youtubeUrl}</span>
            </p>
            {element.foot && (
              <p className="pdf-video-caption">
                <span dangerouslySetInnerHTML={{ __html: element.foot }} />
              </p>
            )}
          </div>
        )

      case 'biography':
        return (
          <div key={elementKey} className="pdf-biography">
            <h4 className="pdf-bibliography-title">Bibliografia</h4>
            <ul className="pdf-bibliography-list">
              {element.biography?.map((item, index) => (
                <li key={index} className="pdf-bibliography-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )

      case 'footnotes':
        return (
          <div key={elementKey} className="pdf-footnotes">
            <h4 className="pdf-footnotes-title">Notes</h4>
            <ol className="pdf-footnotes-list">
              {element.notes?.map((note, index) => (
                <li key={index} className="pdf-footnote-item">
                  <span dangerouslySetInnerHTML={{ __html: note.content }} />
                </li>
              ))}
            </ol>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {pages.map((page, pageIndex) => (
        <div key={`page-${pageIndex}`} className="pdf-page pdf-article">
          <div className="pdf-page-content">
            <article className="pdf-article-content">
              {/* Header del artículo solo en la primera página */}
              {page.hasHeader && (
                <header className="pdf-article-header">
                  <div className="pdf-article-section">{getSectionLabel(article.section)}</div>
                  <h1 className="pdf-article-title" dangerouslySetInnerHTML={{ __html: article.title }} />
                  <div className="pdf-article-meta">
                    <div className="pdf-article-authors">
                      {Array.isArray(article.authors) ? article.authors.join(', ') : article.author}
                    </div>
                  </div>
                </header>
              )}

              {/* Header reducido para páginas siguientes */}
              {!page.hasHeader && page.totalPages > 1 && (
                <header className="pdf-article-header-continued">
                  <h2 className="pdf-article-title-continued" dangerouslySetInnerHTML={{ __html: article.title }} />
                  <div className="pdf-page-indicator">
                    Pàgina {page.pageNumber} de {page.totalPages}
                  </div>
                </header>
              )}

              {/* Contenido de la página */}
              <div className="pdf-article-text">
                {page.elements.map((element, index) => 
                  renderElement(element, index, pageIndex)
                )}
              </div>
            </article>
          </div>
        </div>
      ))}
    </>
  )
}

export default PDFArticlePaginatedManual