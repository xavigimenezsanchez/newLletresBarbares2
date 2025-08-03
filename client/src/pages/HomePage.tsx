import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import ArticleGrid from '../components/ArticleGrid'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import type { Issue, Article } from '../types'

const HomePage = () => {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar datos en paralelo
        const [latestIssueData, recentArticlesData, featuredArticleData] = await Promise.all([
          apiService.getLatestIssue(),
          apiService.getRecentArticles(),
          apiService.getFeaturedArticle()
        ])

        setCurrentIssue((latestIssueData as any).issue)
        setRecentArticles(recentArticlesData as Article[])
        setFeaturedArticle(featuredArticleData as Article | null)
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('Error carregant les dades. Si us plau, torna-ho a provar.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-newyorker mb-4">Lletres Barbares</div>
          <div className="text-gray-600">Carregant...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-newyorker mb-4">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            className="newyorker-button"
            onClick={() => window.location.reload()}
          >
            Tornar a provar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero 
        title="Lletres Barbares"
        subtitle="Revista mensual de cultura, literatura i pensament"
        featuredArticle={featuredArticle || undefined}
      />
      <main>
        <ArticleGrid 
          title="Última edició"
          articles={recentArticles}
          issueNumber={currentIssue?.number}
          year={currentIssue?.year}
        />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage 