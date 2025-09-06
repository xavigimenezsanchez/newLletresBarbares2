import React from 'react'
import type { Article, ArticleTextElement } from '../types'

interface PDFArticleContentProps {
  article: Article
}

const PDFArticleContent: React.FC<PDFArticleContentProps> = ({ article }) => {
  
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

  const renderElement = (element: ArticleTextElement, index: number) => {
    const elementKey = `pdf-article-${article.url}-${index}`

    switch (element.type) {
      case 'paragraph':
      case 'paragraph2':
        if (element.image) {
          return (
            <div key={elementKey} className="pdf-paragraph-with-image">
              <p
                className={`pdf-paragraph ${element.className || ''}`}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
              <div className="pdf-image-container">
                <img
                  src={`/api/images/${element.image.name}`}
                  alt=""
                  className="pdf-image"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )
        } else {
          return (
            <p
              key={elementKey}
              className={`pdf-paragraph ${element.className || ''}`}
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          )
        }

      case 'title':
      case 'title2':
        return (
          <h3
            key={elementKey}
            className={`pdf-subtitle ${element.type === 'title2' ? 'pdf-subtitle-2' : ''}`}
            dangerouslySetInnerHTML={{ __html: element.content }}
          />
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
        // Extraer ID de YouTube de la URL
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
    <article className="pdf-article-content">
      {/* Header del artículo */}
      <header className="pdf-article-header">
        <div className="pdf-article-section">{getSectionLabel(article.section)}</div>
        <h1 className="pdf-article-title" dangerouslySetInnerHTML={{ __html: article.title }} />
        <div className="pdf-article-meta">
          <div className="pdf-article-authors">
            {Array.isArray(article.authors) ? article.authors.join(', ') : article.author}
          </div>
          {/* <div className="pdf-article-date">
            {article.publicationDate && new Date(article.publicationDate).toLocaleDateString('ca-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div> */}
        </div>
      </header>

      {/* Imagen principal del artículo si existe */}
      {/* article.imageCard && (
        <div className="pdf-article-main-image">
          <img
            src={`/api/images/${article.imageCard}`}
            alt={article.title}
            className="pdf-main-image"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        </div>
      )*/}

      {/* Resumen del artículo */}
      {article.summary && (
        <div className="pdf-article-summary">
          <p dangerouslySetInnerHTML={{ __html: article.summary }} />
        </div>
      )}

      {/* Contenido del artículo */}
      <div className="pdf-article-text">
        {article.text?.map((element, index) => renderElement(element, index))}
      </div>
    </article>
  )
}

export default PDFArticleContent