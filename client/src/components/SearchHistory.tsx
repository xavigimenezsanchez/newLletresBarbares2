import React from 'react'
import { useSearchHistory } from '../hooks/useSearchHistory'

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void
  onClose: () => void
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSearchSelect, onClose }) => {
  const {
    getRecentSearches,
    getPopularSearches,
    removeFromHistory,
    clearHistory,
    formatTimestamp
  } = useSearchHistory()

  const recentSearches = getRecentSearches()
  const popularSearches = getPopularSearches()

  const handleSearchClick = (query: string) => {
    onSearchSelect(query)
  }

  const handleRemoveSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation()
    removeFromHistory(query)
  }

  const handleClearAll = () => {
    if (window.confirm('Estàs segur que vols esborrar tot l\'historial de cerca?')) {
      clearHistory()
    }
  }

  return (
    <div className="border-t border-gray-100">
      <div className="p-4">
        {/* Búsquedas Recientes */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">CERQUES RECENTS</h3>
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Esborrar tot
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((item) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => handleSearchClick(item.query)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">🕒</span>
                      <span className="font-medium text-newyorker-dark truncate">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>{formatTimestamp(item.timestamp)}</span>
                      <span>•</span>
                      <span>{item.resultCount} resultats</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveSearch(e, item.query)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all duration-200"
                    aria-label="Eliminar cerca"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Búsquedas Populares */}
        {popularSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">CERQUES POPULARS</h3>
            <div className="space-y-2">
              {popularSearches.map((item) => (
                <div
                  key={item.query}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSearchSelect(item.query)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">🔥</span>
                      <span className="font-medium text-newyorker-dark truncate">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>{item.count} vegades</span>
                      <span>•</span>
                      <span>Última: {formatTimestamp(item.lastUsed)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-newyorker-red text-white px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {recentSearches.length === 0 && popularSearches.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-4xl mb-2">📚</div>
            <p className="font-medium">Encara no tens historial de cerca</p>
            <p className="text-sm mt-1">Les teves cerques apareixeran aquí</p>
          </div>
        )}

        {/* Sugerencias de búsqueda */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-700 mb-3">SUGERIMENTS</h3>
          <div className="flex flex-wrap gap-2">
            {['cinema', 'entrevistes', 'creació', 'Barcelona', 'filosofia'].map((term) => (
              <button
                key={term}
                onClick={() => handleSearchSelect(term)}
                className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-full hover:border-newyorker-dark hover:text-newyorker-dark transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchHistory 