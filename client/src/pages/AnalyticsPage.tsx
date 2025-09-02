import React, { useState, useEffect } from 'react'
import { analyticsService } from '../services/analytics'
import type { AnalyticsStats } from '../services/analytics'

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')

  // Estado inicial seguro para evitar errores
  const safeStats: AnalyticsStats = {
    period: `${period} días`,
    general: {
      totalSearches: 0,
      uniqueQueries: 0,
      avgResponseTime: 0,
      totalClicks: 0,
      avgResults: 0,
      clickThroughRate: 0
    },
    topQueries: [],
    sectionStats: [],
    deviceStats: [],
    hourlyStats: []
  }

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getStats(period)
      setStats(data)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Error carregant les estadístiques')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return new Intl.NumberFormat('ca-ES').format(num)
  }

  const formatPercentage = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0.0%'
    }
    return `${num.toFixed(1)}%`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-newyorker-dark"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tornar a provar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Usar stats o safeStats como fallback
  const currentStats = stats || safeStats

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-newyorker-dark mb-2">
            Analytics de Cerca
          </h1>
          <p className="text-gray-600">
            Estadístiques detallades de les cerques dels usuaris
          </p>
          <div className="mt-4">
            <a 
              href="/admin-connections-2024" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-newyorker-dark bg-white border border-newyorker-dark rounded-md hover:bg-newyorker-dark hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Veure Analytics de Connexions
            </a>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Període
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-newyorker-dark"
              >
                <option value={7}>7 dies</option>
                <option value={30}>30 dies</option>
                <option value={90}>90 dies</option>
                <option value={365}>1 any</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agrupar per
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-newyorker-dark"
              >
                <option value="day">Dia</option>
                <option value="week">Setmana</option>
                <option value="month">Mes</option>
              </select>
            </div>

            <button
              onClick={loadStats}
              className="px-4 py-2 bg-newyorker-dark text-white rounded-lg hover:bg-newyorker-red transition-colors"
            >
              Actualitzar
            </button>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cerques</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(currentStats.general.totalSearches)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Queries Úniques</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(currentStats.general.uniqueQueries)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps de Resposta</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentStats.general.avgResponseTime}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Click Through Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPercentage(currentStats.general.clickThroughRate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Queries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Queries</h2>
          {currentStats.topQueries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Encara no hi ha dades de cerca disponibles</p>
              <p className="text-sm mt-1">Les estadístiques apareixeran aquí després de fer cerques</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cerques
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultats Promig
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Cerca
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStats.topQueries.map((query, index) => (
                    <tr key={query.query} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {query.query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(query.count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(query.avgResults || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPercentage(query.clickThroughRate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.lastSearched ? formatDate(query.lastSearched) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas por Sección */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Per Secció</h2>
            {currentStats.sectionStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hi ha dades per secció</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentStats.sectionStats.map((section) => (
                  <div key={section.section} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {section.section}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(section.searches)} cerques
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPercentage(section.clickThroughRate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(section.avgResults || 0).toFixed(1)} resultats
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Per Dispositiu</h2>
            {currentStats.deviceStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hi ha dades per dispositiu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentStats.deviceStats.map((device) => (
                  <div key={device.deviceType} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {device.deviceType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(device.searches)} cerques
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPercentage(device.clickThroughRate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(device.avgResponseTime || 0).toFixed(0)}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas por Hora */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cerques per Hora</h2>
          {currentStats.hourlyStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hi ha dades per hora</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              {currentStats.hourlyStats.map((hour) => (
                <div key={hour.hour} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {hour.hour}:00
                  </div>
                  <div className="bg-gray-200 rounded h-20 flex items-end justify-center p-1">
                    <div
                      className="bg-newyorker-dark rounded w-full"
                      style={{
                        height: `${(hour.searches / Math.max(...currentStats.hourlyStats.map(h => h.searches || 0))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {hour.searches}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage 