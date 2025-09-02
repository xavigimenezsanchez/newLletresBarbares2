import React, { useState, useEffect } from 'react'

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    testApis()
  }, [])

  const testApis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Testing analytics APIs...')
      
      // Test básico de fetch
      const response = await fetch('/api/analytics/stats?days=7')
      console.log('📊 API Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 API Response data:', data)
      
      setApiTest({
        status: 'success',
        data: data,
        message: 'API funcionando correctamente'
      })
      
    } catch (err: any) {
      console.error('❌ Error en API test:', err)
      setError(err.message)
      setApiTest({
        status: 'error',
        error: err.message,
        message: 'Error al conectar con la API'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newyorker-dark"></div>
            <p className="ml-4">Cargando y probando APIs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-newyorker-dark mb-2">
            Analytics de Cerca (Modo Debug)
          </h1>
          <p className="text-gray-600">
            Página de diagnóstico para analíticas de búsquedas
          </p>
          <div className="mt-4">
            <a 
              href="/admin-connections-2024" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-newyorker-dark bg-white border border-newyorker-dark rounded-md hover:bg-newyorker-dark hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Veure Analytics de Connexions (Funciona)
            </a>
          </div>
        </div>

        {/* Estado de APIs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de APIs</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-semibold">❌ Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {apiTest && (
            <div className={`border rounded-lg p-4 ${
              apiTest.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`font-semibold ${
                apiTest.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {apiTest.status === 'success' ? '✅ Éxito' : '❌ Error'}
              </h3>
              <p className={apiTest.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                {apiTest.message}
              </p>
              
              {apiTest.data && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Ver datos de respuesta</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(apiTest.data, null, 2)}
                  </pre>
                </details>
              )}
              
              {apiTest.error && (
                <div className="mt-2">
                  <p className="text-red-600 font-mono text-sm">{apiTest.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tests Manuales</h2>
          <div className="space-y-4">
            <button
              onClick={testApis}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Volver a probar API
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/api/analytics/stats"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                🔗 Test directo: /api/analytics/stats
              </a>
              
              <a
                href="/api/connections/test-analytics-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                🔗 Test APIs backend
              </a>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-semibold mb-2">💡 Instrucciones de Debug</h3>
          <ol className="text-yellow-700 space-y-1 list-decimal list-inside text-sm">
            <li>Abre las <strong>DevTools del navegador (F12)</strong></li>
            <li>Ve a la pestaña <strong>Console</strong></li>
            <li>Busca errores en rojo que puedan indicar el problema</li>
            <li>Prueba los enlaces de arriba para verificar que las APIs funcionan</li>
            <li>Si todo funciona aquí, el problema era en la página original</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage