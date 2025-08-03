import type { Article } from '../types'
import ArticleCard from './ArticleCard'

interface ArticleGridProps {
  title: string
  articles: Article[]
  issueNumber?: number
  year?: number
}

const ArticleGrid = ({ title, articles, issueNumber, year }: ArticleGridProps) => {
  if (articles.length === 0) {
    return (
      <section className="newyorker-article-grid">
        <div className="text-center py-12">
          <h2 className="newyorker-section-title">{title}</h2>
          <p className="text-newyorker-text">No hi ha articles disponibles.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="newyorker-article-grid">
      <div className="mb-8">
        <h2 className="newyorker-section-title">{title}</h2>
        {issueNumber && year && (
          <p className="text-newyorker-text">
            Número {issueNumber} • {year}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>

    </section>
  )
}

export default ArticleGrid 