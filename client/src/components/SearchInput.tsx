import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchInputProps {
  isMobile?: boolean
  onSearch?: (query: string) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ isMobile = false, onSearch }) => {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/cerca?q=${encodeURIComponent(query.trim())}`)
      if (onSearch) {
        onSearch(query.trim())
      }
      if (isMobile) {
        setIsExpanded(false)
      }
    }
  }

  const handleSearchClick = () => {
    if (isMobile && !isExpanded) {
      setIsExpanded(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else if (query.trim()) {
      navigate(`/cerca?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleBlur = () => {
    if (isMobile && !query.trim()) {
      setTimeout(() => setIsExpanded(false), 200)
    }
  }

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  if (isMobile) {
    return (
      <div className="flex items-center">
        {!isExpanded ? (
          <button
            onClick={handleSearchClick}
            className="p-2 text-gray-600 hover:text-black transition-colors"
            aria-label="Buscar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center flex-1 mr-2">
            <div className="relative flex items-center flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={handleBlur}
                placeholder="Buscar articles, autors..."
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 text-gray-400 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="ml-2 p-1 text-gray-500 hover:text-black"
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
          </form>
        )}
      </div>
    )
  }

  // Desktop version
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar articles, autors, text..."
          className="w-64 px-4 py-2 pr-10 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-500"
        />
        <button
          type="submit"
          className="absolute right-3 text-gray-400 hover:text-black transition-colors"
          aria-label="Buscar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}

export default SearchInput