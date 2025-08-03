import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ArticleGrid from './components/ArticleGrid'
import Footer from './components/Footer'
import { Article, Issue } from './types'

function App() {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos - en producción esto vendría de una API
    const loadLatestIssue = async () => {
      try {
        // Por ahora usamos datos de ejemplo
        const mockIssue: Issue = {
          year: 2024,
          number: 42,
          articles: [
            {
              issue: 42,
              data: "29/11/2024",
              imageCard: "salesas41-01",
              title: "Le Giornate del cinema muto de Pordenone o la gran cura d'humilitat (1a part)",
              url: "le_giornate_del_cinema_muto_de_pordenone_o_la_gran_cura_d_humilitat_1",
              section: "articles",
              author: "Florenci Salesas",
              summary: "Un viatge al festival de cinema mut més important del món, on l'especialista i el neòfit es troben al mateix nivell de desconeixement.",
              text: []
            }
          ],
          creacio: [],
          entrevistes: [],
          llibres: [],
          llocs: [],
          recomanacions: []
        }
        
        setCurrentIssue(mockIssue)
      } catch (error) {
        console.error('Error carregant la revista:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLatestIssue()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display text-newyorker-dark mb-4">Lletres Barbares</div>
          <div className="text-newyorker-text">Carregant...</div>
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
        featuredArticle={currentIssue?.articles[0]}
      />
      <main>
        <ArticleGrid 
          title="Última edició"
          articles={currentIssue?.articles || []}
          issueNumber={currentIssue?.number}
          year={currentIssue?.year}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
