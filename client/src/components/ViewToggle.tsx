import React from 'react'

interface ViewToggleProps {
  viewMode: 'timeline' | 'grid'
  onViewModeChange: (mode: 'timeline' | 'grid') => void
  resultsCount: number
}

const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewModeChange, 
  resultsCount 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-light text-gray-900" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
          Edicions trobades
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {resultsCount} {resultsCount === 1 ? 'edició' : 'edicions'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-3">Vista:</span>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('timeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              viewMode === 'timeline'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Timeline
          </button>
          
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Grid
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewToggle