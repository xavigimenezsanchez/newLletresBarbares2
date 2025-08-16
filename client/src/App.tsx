import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import ArticlesPage from './pages/ArticlesPage'
import CreacioPage from './pages/CreacioPage'
import EntrevistesPage from './pages/EntrevistesPage'
import LlibresPage from './pages/LlibresPage'
import LlocsPage from './pages/LlocsPage'
import RecomanacionsPage from './pages/RecomanacionsPage'
import ArxiuPage from './pages/ArxiuPage'
import EdicioPage from './pages/EdicioPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/creacio" element={<CreacioPage />} />
        <Route path="/entrevistes" element={<EntrevistesPage />} />
        <Route path="/llibres" element={<LlibresPage />} />
        <Route path="/llocs" element={<LlocsPage />} />
        <Route path="/recomanacions" element={<RecomanacionsPage />} />
        <Route path="/arxiu" element={<ArxiuPage />} />
        <Route path="/cerca" element={<SearchPage />} />
        <Route path="/edicio/:number" element={<EdicioPage />} />
        <Route path="/:section/:url" element={<ArticlePage />} />
      </Routes>
    </Router>
  )
}

export default App
