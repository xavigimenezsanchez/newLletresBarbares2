import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import ArticleGrid from '../components/ArticleGrid'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import type { Issue, Article } from '../types'

const EdicioPage: React.FC = () => {
  const { number } = useParams<{ number: string }>()
  const navigate = useNavigate()
  
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadIssueData = async () => {
      if (!number) {
        setError('Número d\'edició no vàlid')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const issueNumber = parseInt(number, 10)
        if (isNaN(issueNumber)) {
          setError('Número d\'edició no vàlid')
          setLoading(false)
          return
        }

        // Cargar datos de la edición
        console.log('🔍 Loading data for issue number:', issueNumber)
        
        // Temporalmente usar endpoints que sabemos que funcionan
        const articlesData = await apiService.getArticlesByIssueNumber(issueNumber)
        console.log('📰 Articles data received:', articlesData)
        
        // Si tenemos artículos, crear un issue básico
        const issueArticles = (articlesData as any).articles || []
        
        if (issueArticles.length === 0) {
          setError(`No s'han trobat articles per l'edició número ${issueNumber}`)
          setLoading(false)
          return
        }
        
        // Crear issue básico basado en los artículos
        const issueData = {
          _id: `issue-${issueNumber}`,
          number: issueNumber,
          year: 2025, // TODO: calcular dinámicamente 
          title: `Lletres Barbares - Número ${issueNumber}`,
          publicationDate: issueArticles[0]?.publicationDate || new Date(),
          totalArticles: issueArticles.length,
          isPublished: true
        }

        console.log('📚 Issue articles:', issueArticles.length, 'articles')
        
        setCurrentIssue(issueData as Issue)
        setArticles(issueArticles)
        
        // El primer artículo como destacado
        if (issueArticles.length > 0) {
          setFeaturedArticle(issueArticles[0])
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading issue:', error)
        setError('Error carregant l\'edició')
        setLoading(false)
      }
    }

    loadIssueData()
  }, [number])

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light mb-4" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
            Carregant edició...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="text-2xl font-light mb-4 text-red-600">
              {error}
            </h1>
            <p className="text-gray-600 mb-6">
              L'edició que busques no existeix o no està disponible.
            </p>
            <div className="space-x-4">
              <button 
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200"
                onClick={() => navigate('/arxiu')}
              >
                Veure arxiu
              </button>
              <button 
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors duration-200"
                onClick={() => navigate('/')}
              >
                Tornar a l'inici
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!currentIssue) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700">Inici</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/arxiu" className="hover:text-gray-700">Arxiu</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">
              Edició {currentIssue.number}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero 
        title={currentIssue.title || `Lletres Barbares - Número ${currentIssue.number}`}
        subtitle={`Publicat el ${formatDate(currentIssue.publicationDate)} • ${articles.length} articles`}
        featuredArticle={featuredArticle || undefined}
      />

      {/* Navigation between issues */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentIssue.number > 0 && (
                <Link
                  to={`/edicio/${currentIssue.number - 1}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Edició anterior
                </Link>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900">
                Edició {currentIssue.number}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(currentIssue.publicationDate)}
              </div>
            </div>

            <div>
              <Link
                to={`/edicio/${currentIssue.number + 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Edició següent
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <main>
        <ArticleGrid 
          title={`Contingut de l'edició ${currentIssue.number}`}
          articles={articles}
          issueNumber={currentIssue.number}
          year={currentIssue.year}
        />
      </main>
      
      <Footer />
    </div>
  )
}

export default EdicioPage