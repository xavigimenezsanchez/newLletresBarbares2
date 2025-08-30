import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiService } from '../services/api'
import type { Issue, Article } from '../types'
import MagazineLayout from '../components/MagazineLayout'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'
import SwipeIndicator from '../components/SwipeIndicator'
import SwipeHint from '../components/SwipeHint'
import { simulateTouchDevice, addSwipeDebugInfo } from '../utils/mobileDevTools'

const EdicioPage: React.FC = () => {
  const { number } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  
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
          title: `Lletres Bàrbares - Número ${issueNumber}`,
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

  // Lógica de navegación por swipe
  const currentIssueNumber = currentIssue?.number || 0
  const canNavigatePrevious = currentIssueNumber > 1
  const canNavigateNext = true // Asumimos que siempre se puede ir a la siguiente

  const handleSwipeLeft = () => {
    if (canNavigateNext) {
      navigate(`/edicio/${currentIssueNumber + 1}`)
    }
  }

  const handleSwipeRight = () => {
    if (canNavigatePrevious) {
      navigate(`/edicio/${currentIssueNumber - 1}`)
    }
  }

  // Hook de navegación por swipe
  const swipeState = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 50,
    maxVerticalDistance: 100,
    element: pageRef.current
  })

  // Inicializar utilidades de desarrollo en modo dev
  useEffect(() => {
    simulateTouchDevice()
    addSwipeDebugInfo()
  }, [])

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
    <div ref={pageRef} className="min-h-screen bg-white relative">
      <Header />
      
      {/* Indicador visual de swipe */}
      <SwipeIndicator
        issSwiping={swipeState.issSwiping}
        swipeProgress={swipeState.swipeProgress}
        canSwipeLeft={canNavigateNext}
        canSwipeRight={canNavigatePrevious}
      />
      
      {/* Pista de navegación por swipe */}
      <SwipeHint
        canSwipeLeft={canNavigateNext}
        canSwipeRight={canNavigatePrevious}
      />
      
      {/* Breadcrumb */}
      {/* <nav className="bg-gray-50 py-4">
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
      </nav> */}

      {/* Hero Section */}
      {/* <Hero 
        title={currentIssue.title || `Lletres Bàrbares - Número ${currentIssue.number}`}
        subtitle={`Publicat el ${formatDate(currentIssue.publicationDate)} • ${articles.length} articles`}
        featuredArticle={featuredArticle || undefined}
      /> */}

      {/* Navigation between issues */}
       
            <div className="fixed left-0 top-1/2 z-10">
              {canNavigatePrevious && (
                <Link
                  to={`/edicio/${currentIssue.number - 1}`}
                  className="inline-flex items-center px-4 py-2 border-none hover:border-none hidden lg:block  "
                >
                  <svg className="lg:h-12 lg:w-12 hover:scale-110 transition-transform duration-300" height="100%" viewBox="0 0 512 512" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <g width="100%" height="100%" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,512.0005416870117,511.9991149902344)">
                          <g id="_x31_1_Right_Arrow">
                              <g>
                                  <path d="m271.231 451.133-17.902-17.908c-11.854-11.858-11.851-31.081.007-42.935l134.325-134.285-134.327-134.287c-11.858-11.855-11.861-31.078-.006-42.936l17.905-17.91c11.855-11.858 31.077-11.86 42.935-.006l173.718 173.667c11.861 11.857 11.86 31.085 0 42.942l-173.719 173.665c-11.859 11.854-31.082 11.851-42.936-.007z" fill="#dc2626" fill-opacity="1" data-original-color="#fdce06ff" stroke="none" stroke-opacity="1"/>
                                  <path className='hidden md:block' d="m42.018 451.133-17.902-17.908c-11.854-11.858-11.851-31.081.007-42.935l134.325-134.285-134.327-134.287c-11.858-11.855-11.861-31.078-.006-42.936l17.905-17.91c11.855-11.858 31.077-11.86 42.935-.006l173.718 173.667c11.861 11.857 11.86 31.085 0 42.942l-173.72 173.665c-11.858 11.854-31.081 11.851-42.935-.007z" fill="#ffffff" fill-opacity="0" data-original-color="#ffffffff" stroke="none" stroke-opacity="1"/>
                                  <g fill="#3e3e3e">
                                      <path d="m319.661 55.376c-14.895-14.895-39.018-14.904-53.918.004l-17.908 17.912c-14.863 14.867-14.859 39.055.008 53.918l128.831 128.793-128.832 128.793c-14.867 14.867-14.87 39.055-.004 53.918l17.901 17.908c14.88 14.887 39.014 14.911 53.918.008l173.719-173.662c7.206-7.202 11.173-16.778 11.173-26.965s-3.967-19.763-11.173-26.961zm162.732 216.609-173.719 173.662c-9.061 9.061-23.324 8.62-31.952-.008l-17.901-17.908c-8.806-8.81-8.806-23.142.004-31.952l134.326-134.285c1.456-1.456 2.276-3.432 2.276-5.492s-.819-4.035-2.276-5.492l-134.325-134.283c-8.81-8.81-8.814-23.142-.008-31.952l17.908-17.912c8.533-8.533 23.419-8.537 31.952-.004l173.715 173.67c4.27 4.267 6.622 9.94 6.622 15.974 0 6.038-2.351 11.711-6.622 15.982z" fill="#3e3e3e" fill-opacity="1" data-original-color="#3e3e3eff" stroke="none" stroke-opacity="1"/>
                                      <path className='hidden md:block' d="m275.334 256.003c0-10.187-3.967-19.763-11.169-26.961l-173.719-173.666c-14.866-14.855-39.051-14.859-53.918.004l-17.904 17.912c-14.867 14.863-14.863 39.051.004 53.918l128.831 128.793-128.827 128.793c-14.901 14.893-14.911 39.014-.008 53.918l17.901 17.908c14.879 14.887 39.018 14.911 53.922.008l173.719-173.662c7.201-7.202 11.168-16.778 11.168-26.965zm-22.152 15.982-173.719 173.662c-8.799 8.799-23.101 8.847-31.956-.008l-17.901-17.908c-8.807-8.807-8.847-23.097.008-31.952l134.323-134.285c1.456-1.456 2.275-3.432 2.275-5.492s-.819-4.035-2.275-5.492l-134.326-134.283c-8.81-8.81-8.81-23.142-.004-31.952l17.904-17.912c8.814-8.799 23.146-8.81 31.952-.004l173.719 173.666c4.267 4.267 6.618 9.944 6.618 15.978 0 6.038-2.351 11.711-6.618 15.982z" fill="#3e3e3e" fill-opacity="1" data-original-color="#3e3e3eff" stroke="none" stroke-opacity="1"/>
                                  </g>
                              </g>
                          </g>
                      </g>
                  </svg>
                </Link>
              )}
            </div>
            

            <div className="fixed right-0 top-1/2">
              <Link
                to={`/edicio/${currentIssue.number + 1}`}
                className="inline-flex items-center px-4 py-2 border-none hover:border-none hidden lg:block"
              >
                <svg className="lg:h-12 lg:w-12 hidden md:block md:h-20 md:w-20 hover:scale-110 transition-transform duration-300" height="100%" width="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g width="100%" height="100%" transform="matrix(1,0,0,1,0,0)"><g id="_x31_1_Right_Arrow"><g><path  d="m271.231 451.133-17.902-17.908c-11.854-11.858-11.851-31.081.007-42.935l134.325-134.285-134.327-134.287c-11.858-11.855-11.861-31.078-.006-42.936l17.905-17.91c11.855-11.858 31.077-11.86 42.935-.006l173.718 173.667c11.861 11.857 11.86 31.085 0 42.942l-173.719 173.665c-11.859 11.854-31.082 11.851-42.936-.007z" fill="#dc2626" fill-opacity="1" data-original-color="#fdce06ff" stroke="none" stroke-opacity="1"/><path className='hidden md:block' d="m42.018 451.133-17.902-17.908c-11.854-11.858-11.851-31.081.007-42.935l134.325-134.285-134.327-134.287c-11.858-11.855-11.861-31.078-.006-42.936l17.905-17.91c11.855-11.858 31.077-11.86 42.935-.006l173.718 173.667c11.861 11.857 11.86 31.085 0 42.942l-173.72 173.665c-11.858 11.854-31.081 11.851-42.935-.007z" fill="#ffffff" fill-opacity="0" data-original-color="#ffffffff" stroke="none" stroke-opacity="1"/><g fill="#3e3e3e"><path d="m319.661 55.376c-14.895-14.895-39.018-14.904-53.918.004l-17.908 17.912c-14.863 14.867-14.859 39.055.008 53.918l128.831 128.793-128.832 128.793c-14.867 14.867-14.87 39.055-.004 53.918l17.901 17.908c14.88 14.887 39.014 14.911 53.918.008l173.719-173.662c7.206-7.202 11.173-16.778 11.173-26.965s-3.967-19.763-11.173-26.961zm162.732 216.609-173.719 173.662c-9.061 9.061-23.324 8.62-31.952-.008l-17.901-17.908c-8.806-8.81-8.806-23.142.004-31.952l134.326-134.285c1.456-1.456 2.276-3.432 2.276-5.492s-.819-4.035-2.276-5.492l-134.325-134.283c-8.81-8.81-8.814-23.142-.008-31.952l17.908-17.912c8.533-8.533 23.419-8.537 31.952-.004l173.715 173.67c4.27 4.267 6.622 9.94 6.622 15.974 0 6.038-2.351 11.711-6.622 15.982z" fill="#3e3e3e" fill-opacity="1" data-original-color="#3e3e3eff" stroke="none" stroke-opacity="1"/><path d="m275.334 256.003c0-10.187-3.967-19.763-11.169-26.961l-173.719-173.666c-14.866-14.855-39.051-14.859-53.918.004l-17.904 17.912c-14.867 14.863-14.863 39.051.004 53.918l128.831 128.793-128.827 128.793c-14.901 14.893-14.911 39.014-.008 53.918l17.901 17.908c14.879 14.887 39.018 14.911 53.922.008l173.719-173.662c7.201-7.202 11.168-16.778 11.168-26.965zm-22.152 15.982-173.719 173.662c-8.799 8.799-23.101 8.847-31.956-.008l-17.901-17.908c-8.807-8.807-8.847-23.097.008-31.952l134.323-134.285c1.456-1.456 2.275-3.432 2.275-5.492s-.819-4.035-2.275-5.492l-134.326-134.283c-8.81-8.81-8.81-23.142-.004-31.952l17.904-17.912c8.814-8.799 23.146-8.81 31.952-.004l173.719 173.666c4.267 4.267 6.618 9.944 6.618 15.978 0 6.038-2.351 11.711-6.618 15.982z" className='hidden md:block' fill="#3e3e3e" fill-opacity="1" data-original-color="#3e3e3eff" stroke="none" stroke-opacity="1"/></g></g></g></g></svg>
              </Link>
            </div>


      <main className="home-background">
              
      {/* Breadcrumb */}
      {/* <nav className="bg-gray-50 py-4">
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
      </nav> */}


        <MagazineLayout 
          articles={articles}
          issueNumber={currentIssue?.number}
          year={currentIssue?.year}
          publicationDate={currentIssue?.publicationDate}
        />
      </main>













      {/* Articles */}
      {/* <main>
        <ArticleGrid 
          title={`Contingut de l'edició ${currentIssue.number}`}
          articles={articles}
          issueNumber={currentIssue.number}
          year={currentIssue.year}
        />
      </main>
       */}
      <Footer />
    </div>
  )
}

export default EdicioPage