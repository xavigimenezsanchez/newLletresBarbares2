import React from 'react'

interface PlaceholderImageProps {
  alt: string
  className?: string
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  alt,
  className = ''
}) => {
  return (
    <div 
      className={`w-full h-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 ${className}`}
      style={{ minHeight: '200px' }}
    >
      <div className="text-center p-4">
        <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">Lletres Barbares</div>
        <div className="text-xs text-gray-500">Imatge d'article</div>
      </div>
    </div>
  )
}

export default PlaceholderImage