import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiService } from '../services/api'
import type { Article } from '../types'
import ArticleText from '../components/ArticleText'
import AuthorDisplay from '../components/AuthorDisplay'
import { formatDateToCatalan } from '../utils/dateUtils'

const ArticlePage = () => {
  const { section, url } = useParams<{ section: string; url: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!section || !url) {
          throw new Error('Secció i URL són requerides')
        }

        const articleData = await apiService.getArticleBySectionAndUrl(section, url)
        setArticle(articleData as Article)
      } catch (err) {
        console.error('Error carregant l\'article:', err)
        setError('Error carregant l\'article. Si us plau, torna-ho a provar.')
      } finally {
        setLoading(false)
      }
    }

    if (section && url) {
      fetchArticle()
    }
  }, [section, url])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="text-xl font-newyorker">Carregant article...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-newyorker mb-4">Article no trobat</h1>
            <p className="text-gray-600 mb-8">L'article que busques no existeix o ha estat mogut.</p>
            <Link to="/" className="newyorker-button">
              Tornar a l'inici
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <main className="max-w-4xl mx-auto pt-28 md:pt-60 pb-6 pl-6 pr-6"> 


        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="text-sm text-gray-500 uppercase tracking-wider">
              {article.section}
            </span>
          </div>
          
          <h1 className="text-4xl font-newyorker mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-8">
            <div>
              <AuthorDisplay article={article} showPrefix={false} className="font-medium" />
            </div>
            <div>
              <time dateTime={article.data}>
                {formatDateToCatalan(article.data)}
              </time>
            </div>
          </div>

        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <ArticleText elements={article.text} />
        </article>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Article publicat al número {article.issueNumber}
            </div>
            <Link to="/" className="newyorker-button-outline">
              Tornar a l'inici
            </Link>
          </div>
        </footer>
      </main>
      
    </div>
  )
}

export default ArticlePage 