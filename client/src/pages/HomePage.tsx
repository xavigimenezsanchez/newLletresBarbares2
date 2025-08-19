import { useState, useEffect } from 'react'
import Header from '../components/Header'
import MagazineLayout from '../components/MagazineLayout'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import type { Issue, Article } from '../types'

const HomePage = () => {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [recentArticles, setRecentArticles] = useState<Article[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar datos en paralelo
        const [latestIssueData, recentArticlesData] = await Promise.all([
          apiService.getLatestIssue(),
          apiService.getRecentArticles()
        ])

        setCurrentIssue((latestIssueData as any).issue)
        setRecentArticles(recentArticlesData as Article[])
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
          <div className="text-2xl font-newyorker mb-4">            <img src="/logo3.svg" alt="Lletres Bàrbares" className="h-10 w-auto" />
          </div>
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
      <main>
        <MagazineLayout 
          articles={recentArticles}
          issueNumber={currentIssue?.number}
          year={currentIssue?.year}
          publicationDate={currentIssue?.publicationDate}
        />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage 