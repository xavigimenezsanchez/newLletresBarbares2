import { Link } from 'react-router-dom'
import type { Article } from '../types'
import { formatDateToCatalan } from '../utils/dateUtils'

interface MagazineLayoutProps {
  articles: Article[]
  issueNumber?: number
  year?: number
  publicationDate?: string
}

const MagazineLayout = ({ articles, issueNumber, year, publicationDate }: MagazineLayoutProps) => {
  if (articles.length === 0) {
    return (
      <section className="magazine-layout">
        <div className="text-center py-12">
          <p className="text-gray-600">No hi ha articles disponibles.</p>
        </div>
      </section>
    )
  }

  // Función para obtener el tamaño del artículo basado en su posición
  const getArticleSize = (index: number, total: number) => {
    // Patrón más balanced que garantiza variedad visual
    const patterns = [
      'large',   // 0: first always large (8 cols)
      'medium',  // 1: medium (4 cols) - completa la primera fila
      'small',   // 2: small (4 cols)
      'small',   // 3: small (4 cols) 
      'medium',  // 4: medium (4 cols) - completa la segunda fila
      'medium',  // 5: medium (4 cols)
      'large',   // 6: large (8 cols) - completa la tercera fila
      'small',   // 7: small (4 cols)
      'medium',  // 8: medium (4 cols)
      'medium'   // 9: medium (4 cols) - completa la cuarta fila
    ]
    
    // Si tenemos más artículos que el patrón, repetir el patrón
    return patterns[index % patterns.length]
  }



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

  return (
    <section className="magazine-layout">
      {/* Header de la edición */}
      <div className="edition-header">
        <h1 className="edition-title">
          { `Número ${issueNumber}`}
        </h1>
        <div className="edition-meta">
          {publicationDate && (
            <span className="edition-date">{new Date(publicationDate).toLocaleDateString('ca-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          )}
          <span className="edition-count">{articles.length} articles</span>
          {/* <Link 
            to={`/edicio/${issueNumber}/pdf`}
            className="pdf-link"
            title="Veure en format PDF"
          >
            📄 Veure PDF
          </Link> */}
        </div>
      </div>

      {/* Grid dinámico de artículos */}
      <div className="magazine-grid">
        {articles.map((article, index) => {
          const size = getArticleSize(index, articles.length)
          // const summaryText = article.summary || getLoremIpsum(
          //   size === 'large' ? 'long' : size === 'medium' ? 'medium' : 'short'
          // )

          const summaryText = article.summary || article.text.find(text => text.type === 'paragraph')?.content || '';
          


          return (
            <Link to={`/${article.section}/${article.url}`} 
              key={article.url} 
              className={`magazine-card magazine-card--${size}`}
            >
              <div className="magazine-card__image">
                <img
                  src={`/api/images/${article.imageCard}`}
                  alt={article.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/placeholder-image.svg';
                  }}
                />
              </div>
              
              <div className="magazine-card__content">
                <div className="magazine-card__section">
                  {getSectionLabel(article.section)}
                </div>
                
                <h3 className="magazine-card__title">
                  <Link to={`/${article.section}/${article.url}`} dangerouslySetInnerHTML={{ __html: article.title }} />
                </h3>
                
                <p className="magazine-card__summary" dangerouslySetInnerHTML={{ __html: summaryText }} />
                  
                
                <div className="magazine-card__author">
                  {Array.isArray(article.authors) ? article.authors.join(', ') : article.author}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default MagazineLayout