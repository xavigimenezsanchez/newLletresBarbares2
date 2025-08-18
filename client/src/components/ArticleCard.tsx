import { Link } from 'react-router-dom'
import AuthorDisplay from './AuthorDisplay'
import type { Article } from '../types'
import { formatDateToCatalan } from '../utils/dateUtils'

interface ArticleCardProps {
  article: Article
}

const ArticleCard = ({ article }: ArticleCardProps) => {

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
    <article className="newyorker-article-card">
      <div className="newyorker-article-image">
        <div className="blur-left">
          <img
            src={`/api/images/${article.imageCard}`}
            alt=""
            className="blur-image"
          />
        </div>
        <div className="blur-right">
          <img
            src={`/api/images/${article.imageCard}`}
            alt=""
            className="blur-image"
          />
        </div>
        <img
          src={`/api/images/${article.imageCard}`}
          alt={article.title}
          onError={(e) => {
            console.log('Error loading image:', `/api/images/${article.imageCard}`)
            const target = e.currentTarget;
            target.src = '/placeholder-image.svg';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', `/api/images/${article.imageCard}`)
          }}
        />
      </div>
      
      <div className="newyorker-article-content">
        <div className="newyorker-article-meta">
          <span className="text-newyorker-red font-medium">
            {getSectionLabel(article.section)}
          </span>
          <span className="mx-2">•</span>
          <span>{formatDateToCatalan(article.data)}</span>
        </div>
        
        <h3 className="newyorker-article-title">
          <Link to={`/${article.section}/${article.url}`}>
            {article.title}
          </Link>
        </h3>
        
        <p className="newyorker-article-summary">
          {article.summary}
        </p>
        
        <div className="mt-4 pt-4 border-t border-newyorker-light-gray">
          <AuthorDisplay article={article} />
        </div>
      </div>
    </article>
  )
}

export default ArticleCard 