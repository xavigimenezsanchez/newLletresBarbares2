import React, { useState, useEffect } from 'react'
import { connectionAnalyticsService } from '../services/analytics'
import type { ConnectionStats, LiveConnectionStats } from '../services/analytics'

const ConnectionAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats | null>(null)
  const [liveStats, setLiveStats] = useState<LiveConnectionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)
  const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'technology' | 'traffic' | 'live'>('overview')

  // Estado inicial seguro para evitar errores
  const safeStats: ConnectionStats = {
    period: `${period} días`,
    general: {
      totalConnections: 0,
      uniqueIPs: 0,
      uniqueSessions: 0,
      avgSessionDuration: 0,
      avgPagesPerSession: 0
    },
    geography: {
      countries: [],
      cities: []
    },
    technology: {
      devices: [],
      browsers: [],
      operatingSystems: []
    },
    traffic: {
      referrers: []
    }
  }

  useEffect(() => {
    loadStats()
  }, [period])

  useEffect(() => {
    loadLiveStats()
    // Actualizar stats en tiempo real cada 30 segundos
    const interval = setInterval(loadLiveStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await connectionAnalyticsService.getStats(period)
      setStats(data)
    } catch (err) {
      console.error('Error loading connection analytics:', err)
      setError('Error carregant les estadístiques de connexions')
    } finally {
      setLoading(false)
    }
  }

  const loadLiveStats = async () => {
    try {
      const data = await connectionAnalyticsService.getLiveStats()
      setLiveStats(data)
    } catch (err) {
      console.error('Error loading live stats:', err)
    }
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return new Intl.NumberFormat('ca-ES').format(num)
  }

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '0s'
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${Math.round(seconds / 3600)}h`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode === 'UN' || countryCode === 'LC') return '🌍'
    // Convertir código de país a emoji de bandera
    return String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 0x1F1E6 + char.charCodeAt(0) - 65))
  }

  const shortenUrl = (url: string, maxLength: number = 50) => {
    if (!url) return 'Direct'
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
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
            Analytics de Connexions
          </h1>
          <p className="text-gray-600">
            Estadístiques detallades de les connexions i visitants del lloc web
          </p>
          <div className="mt-4">
            <a 
              href="/admin-dashboard-2024" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-newyorker-dark bg-white border border-newyorker-dark rounded-md hover:bg-newyorker-dark hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Veure Analytics de Cerca
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
                <option value={1}>Avui</option>
                <option value={7}>7 dies</option>
                <option value={30}>30 dies</option>
                <option value={90}>90 dies</option>
                <option value={365}>1 any</option>
              </select>
            </div>

            <button
              onClick={loadStats}
              className="px-4 py-2 bg-newyorker-dark text-white rounded-lg hover:bg-newyorker-red transition-colors"
            >
              Actualitzar
            </button>

            {liveStats && (
              <div className="ml-auto text-sm text-gray-600">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  En viu: {formatNumber(liveStats.activeSessions)} sessions actives
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Resum General', icon: '📊' },
                { key: 'geography', label: 'Geografia', icon: '🌍' },
                { key: 'technology', label: 'Tecnologia', icon: '💻' },
                { key: 'traffic', label: 'Tràfic', icon: '🔗' },
                { key: 'live', label: 'En Viu', icon: '🔴' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-newyorker-dark text-newyorker-dark'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Connexions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(currentStats.general.totalConnections)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">IPs Úniques</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(currentStats.general.uniqueIPs)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(currentStats.general.uniqueSessions)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Durada Promig</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatDuration(currentStats.general.avgSessionDuration)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pàg. per Sessió</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(currentStats.general.avgPagesPerSession || 0).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen por categorías */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Países */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🌍</span>
                  Top Països
                </h2>
                {currentStats.geography.countries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hi ha dades de països</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentStats.geography.countries.slice(0, 5).map((country) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getCountryFlag(country.countryCode)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{country.country}</p>
                            <p className="text-xs text-gray-500">{formatNumber(country.uniqueUsers)} usuaris</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatNumber(country.connections)}
                          </p>
                          <p className="text-xs text-gray-500">connexions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Dispositius */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💻</span>
                  Dispositius
                </h2>
                {currentStats.technology.devices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hi ha dades de dispositius</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentStats.technology.devices.map((device) => (
                      <div key={device.deviceType} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{device.deviceType}</p>
                          <p className="text-xs text-gray-500">{formatNumber(device.uniqueUsers)} usuaris</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatNumber(device.connections)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDuration(device.avgSessionDuration)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔗</span>
                  Fonts de Tràfic
                </h2>
                {currentStats.traffic.referrers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hi ha dades de referrers</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentStats.traffic.referrers.slice(0, 5).map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {shortenUrl(referrer.referrer, 30)}
                          </p>
                          <p className="text-xs text-gray-500">{formatNumber(referrer.uniqueUsers)} usuaris</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatNumber(referrer.connections)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Geografia Tab */}
        {activeTab === 'geography' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Países */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Països</h2>
              {currentStats.geography.countries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de països</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">País</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Connexions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuaris</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentStats.geography.countries.map((country, index) => (
                        <tr key={country.country} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="mr-2">{getCountryFlag(country.countryCode)}</span>
                              <span className="font-medium text-gray-900">{country.country}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(country.connections)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(country.uniqueUsers)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatDuration(country.avgSessionDuration)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ciudades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ciutats</h2>
              {currentStats.geography.cities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de ciutats</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ciutat</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Connexions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuaris</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentStats.geography.cities.map((city, index) => (
                        <tr key={`${city.city}-${city.country}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{city.city}</p>
                              <p className="text-xs text-gray-500">{city.country}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(city.connections)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(city.uniqueUsers)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tecnologia Tab */}
        {activeTab === 'technology' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dispositivos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipus de Dispositiu</h2>
              {currentStats.technology.devices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de dispositius</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentStats.technology.devices.map((device) => (
                    <div key={device.deviceType} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{device.deviceType}</p>
                        <p className="text-xs text-gray-500">{formatNumber(device.uniqueUsers)} usuaris</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(device.connections)}
                        </p>
                        <p className="text-xs text-gray-500">{formatDuration(device.avgSessionDuration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navegadores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Navegadors</h2>
              {currentStats.technology.browsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de navegadors</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentStats.technology.browsers.map((browser) => (
                    <div key={browser.browser} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{browser.browser}</p>
                        <p className="text-xs text-gray-500">{formatNumber(browser.uniqueUsers)} usuaris</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(browser.connections)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sistemas Operativos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistemes Operatius</h2>
              {currentStats.technology.operatingSystems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de sistemes operatius</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentStats.technology.operatingSystems.map((os) => (
                    <div key={os.os} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{os.os}</p>
                        <p className="text-xs text-gray-500">{formatNumber(os.uniqueUsers)} usuaris</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(os.connections)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tráfico Tab */}
        {activeTab === 'traffic' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fonts de Tràfic</h2>
            {currentStats.traffic.referrers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hi ha dades de fonts de tràfic</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Font de Tràfic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connexions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuaris Únics
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStats.traffic.referrers.map((referrer, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shortenUrl(referrer.referrer, 80)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(referrer.connections)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(referrer.uniqueUsers)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Live Tab */}
        {activeTab === 'live' && liveStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estadísticas en Tiempo Real */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Activitat en Temps Real
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Sessions Actives</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatNumber(liveStats.activeSessions)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Connexions Última Hora</span>
                  <span className="text-xl font-semibold text-blue-600">
                    {formatNumber(liveStats.connectionsLastHour)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  Última actualització: {formatDate(liveStats.timestamp)}
                </div>
              </div>
            </div>

            {/* Países Activos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Països Més Actius</h2>
              {liveStats.activeCountries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha activitat recent</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveStats.activeCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{index + 1}</span>
                        <span className="font-medium text-gray-900">{country.country}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatNumber(country.connections)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dispositivos Activos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispositius Més Utilitzats</h2>
              {liveStats.activeDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hi ha dades de dispositius</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {liveStats.activeDevices.map((device) => (
                    <div key={device.deviceType} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium text-gray-600 capitalize mb-2">
                        {device.deviceType}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(device.connections)}
                      </p>
                      <p className="text-xs text-gray-500">connexions</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionAnalyticsPage