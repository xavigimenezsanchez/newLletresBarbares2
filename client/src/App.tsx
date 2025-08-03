import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ArticleGrid from './components/ArticleGrid'
import Footer from './components/Footer'
import { apiService } from './services/api'
import type { Article, Issue } from './types'

function App() {
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
          apiService.getRecentArticles(6),
          apiService.getFeaturedArticle()
        ])

        setCurrentIssue(latestIssueData.issue)
        setRecentArticles(recentArticlesData)
        setFeaturedArticle(featuredArticleData)
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('Error cargant les dades. Si us plau, torna-ho a provar.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="has-text-centered">
          <div className="loading-title">Lletres Barbares</div>
          <div className="loading-text">Carregant...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="has-text-centered">
          <div className="loading-title">Error</div>
          <div className="loading-text">{error}</div>
          <button 
            className="button is-newyorker mt-3"
            onClick={() => window.location.reload()}
          >
            Tornar a provar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <Hero 
        title="Lletres Barbares"
        subtitle="Revista mensual de cultura, literatura i pensament"
        featuredArticle={featuredArticle}
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

export default App
