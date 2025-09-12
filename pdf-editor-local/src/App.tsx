import { useState, useEffect } from 'react'
import { localDataService } from './services/localDataService'
import type { Issue, Article } from './types'
// import EdicioPDFPage from './pages/EdicioPDFPage'
import EdicioPDFPage from '../../client/src/pages/EdicioPDFPage.tsx'
import './App.css'

function App() {
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null)
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [isElectronAvailable, setIsElectronAvailable] = useState(false)

  // Detectar si Electron está disponible
  useEffect(() => {
    setIsElectronAvailable(!!window.electronAPI)
  }, [])

  const handleSelectFolder = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const folderPath = await localDataService.selectFolder()
      if (folderPath) {
        setCurrentFolderPath(folderPath)
        await loadIssueData(folderPath)
        await startWatching(folderPath)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al seleccionar carpeta'
      setError(errorMessage)
        
        // Si el error indica que Electron no está disponible, mostrar instrucciones específicas
        if (errorMessage.includes('electron-dev')) {
        setError('Esta aplicación requiere Electron. Ejecuta: npm run electron-dev')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadIssueData = async (folderPath: string) => {
    try {
      const data = await localDataService.loadIssueData(folderPath)
      const articlesFormatted = data.articles.map(article=>{return {...article, _id: (article?._id as any)?.$oid}})
      const issueFormatted = {...data.issue, articlesOrder: data?.issue?.articlesOrder?.map(articleId=>(articleId as any)['$oid'])}
      setCurrentIssue(issueFormatted)
      setArticles(articlesFormatted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    }
  }

  const startWatching = async (folderPath: string) => {
    try {
      await localDataService.startWatching(folderPath)
      setIsWatching(true)
      
      // Configurar callbacks para cambios de archivos
      localDataService.onFileChanged(async (filePath) => {
        console.log('Archivo modificado:', filePath)
        await loadIssueData(folderPath)
      })
      
      localDataService.onFileAdded(async (filePath) => {
        console.log('Archivo añadido:', filePath)
        await loadIssueData(folderPath)
      })
      
      localDataService.onFileRemoved(async (filePath) => {
        console.log('Archivo eliminado:', filePath)
        await loadIssueData(folderPath)
      })
    } catch (err) {
      console.error('Error al iniciar observación:', err)
    }
  }

  const stopWatching = async () => {
    try {
      await localDataService.stopWatching()
      setIsWatching(false)
    } catch (err) {
      console.error('Error al detener observación:', err)
    }
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isWatching) {
        stopWatching()
      }
    }
  }, [isWatching])

  if (!currentFolderPath || !currentIssue) {
    return (
      <div className="app">
        <div className="folder-selector">
          <h1>Editor PDF Local - Lletres Bàrbares</h1>
          <p>Selecciona la carpeta de la edición que quieres editar</p>
          
          {!isElectronAvailable && (
            <div className="error-message" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' }}>
              <strong>⚠️ Electron no detectado</strong><br/>
              Esta aplicación requiere Electron para funcionar correctamente.<br/>
              <strong>Ejecuta:</strong> <code>npm run electron-dev</code> en lugar de <code>npm run dev</code>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            onClick={handleSelectFolder}
            disabled={loading}
            className="select-folder-btn"
          >
            {loading ? 'Cargando...' : 'Seleccionar Carpeta'}
          </button>
          
          <div className="instructions">
            <h3>Instrucciones:</h3>
            <ul>
              <li>La carpeta debe contener un archivo <code>issue.json</code></li>
              <li>Los artículos deben estar en subcarpetas como <code>articles</code>, <code>creacio</code>, <code>llibres</code>, etc.</li>
              <li>Los archivos de artículos deben tener extensión <code>.json</code></li>
              <li>La aplicación se actualizará automáticamente cuando modifiques cualquier archivo</li>
            </ul>
            
            <h3>Comandos:</h3>
            <ul>
              <li><strong>Desarrollo:</strong> <code>npm run electron-dev</code></li>
              <li><strong>Construcción:</strong> <code>npm run build-electron</code></li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-info">
          <h2>Editor PDF Local</h2>
          <p>Carpeta: <code>{currentFolderPath}</code></p>
          <p>Edición: {currentIssue.number} ({currentIssue.year})</p>
          <div className="status-indicators">
            <span className={`status ${isWatching ? 'watching' : 'not-watching'}`}>
              {isWatching ? '🔍 Observando cambios' : '⏸️ No observando'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleSelectFolder} className="btn-secondary">
            Cambiar Carpeta
          </button>
          {isWatching && (
            <button onClick={stopWatching} className="btn-secondary">
              Detener Observación
            </button>
          )}
        </div>
      </div>
      
      <div className="pdf-container">
        {currentIssue && articles && (
          <EdicioPDFPage 
            issueLocal={currentIssue}
            articlesLocal={articles}
          />
        )}
      </div>
    </div>
  )
}

export default App