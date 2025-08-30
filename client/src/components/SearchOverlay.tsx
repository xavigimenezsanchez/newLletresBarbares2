import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/cerca?q=${encodeURIComponent(query.trim())}`)
      onClose()
      setQuery('')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 150)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative flex items-start justify-center px-6 pt-16 md:pt-32">
        <div className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}>
          {/* Search Card */}
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-newyorker-dark">
                  Cerca a Lletres Bàrbares
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
                  aria-label="Tancar cerca"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar articles, autors, text..."
                  className="w-full px-6 py-4 text-lg md:text-xl border-2 border-gray-200 rounded-lg focus:outline-none focus:border-newyorker-dark transition-colors placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-newyorker-dark transition-colors"
                  aria-label="Buscar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Prem <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Enter</span> per cercar o <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Esc</span> per tancar</p>
              </div>
            </form>

            {/* Quick links */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-3">CERQUES POPULARS</p>
              <div className="flex flex-wrap gap-2">
                {['entrevistes', 'creació', 'llibres', 'Barcelona'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      navigate(`/cerca?q=${encodeURIComponent(term)}`)
                      onClose()
                    }}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:border-newyorker-dark hover:text-newyorker-dark transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay