import { Article } from '../types'

interface ArticleCardProps {
  article: Article
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
    <article className="newyorker-article-card">
      <div className="newyorker-article-image">
        <div className="w-full h-full bg-newyorker-light-gray flex items-center justify-center">
          <span className="text-sm text-newyorker-text">
            {article.imageCard}
          </span>
        </div>
      </div>
      
      <div className="newyorker-article-content">
        <div className="newyorker-article-meta">
          <span className="text-newyorker-red font-medium">
            {getSectionLabel(article.section)}
          </span>
          <span className="mx-2">•</span>
          <span>{formatDate(article.data)}</span>
        </div>
        
        <h3 className="newyorker-article-title">
          <a href={`/article/${article.url}`}>
            {article.title}
          </a>
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
  )
}

export default ArticleCard 