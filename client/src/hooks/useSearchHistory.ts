import { useState, useEffect, useCallback } from 'react'

interface SearchHistoryItem {
  query: string
  timestamp: number
  resultCount: number
}

const MAX_HISTORY_ITEMS = 10
const STORAGE_KEY = 'lletres-barbares-search-history'

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])

  // Cargar historial desde localStorage al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSearchHistory(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Error loading search history:', error)
      setSearchHistory([])
    }
  }, [])

  // Guardar historial en localStorage
  const saveToStorage = useCallback((history: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving search history:', error)
    }
  }, [])

  // Añadir nueva búsqueda al historial
  const addToHistory = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      resultCount
    }

    setSearchHistory(prev => {
      // Filtrar búsquedas duplicadas y mantener solo la más reciente
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.trim().toLowerCase())
      
      // Añadir nueva búsqueda al principio
      const updated = [newItem, ...filtered]
      
      // Mantener solo los últimos MAX_HISTORY_ITEMS
      const limited = updated.slice(0, MAX_HISTORY_ITEMS)
      
      // Guardar en localStorage
      saveToStorage(limited)
      
      return limited
    })
  }, [saveToStorage])

  // Eliminar búsqueda del historial
  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.query !== query)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  // Limpiar todo el historial
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Obtener búsquedas recientes (últimas 5)
  const getRecentSearches = useCallback(() => {
    return searchHistory.slice(0, 5)
  }, [searchHistory])

  // Obtener búsquedas populares (por frecuencia)
  const getPopularSearches = useCallback(() => {
    const frequency: Record<string, number> = {}
    
    searchHistory.forEach(item => {
      const query = item.query.toLowerCase()
      frequency[query] = (frequency[query] || 0) + 1
    })

    return Object.entries(frequency)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        query: item.query,
        count: item.count,
        lastUsed: searchHistory.find(h => h.query.toLowerCase() === item.query)?.timestamp || 0
      }))
  }, [searchHistory])

  // Formatear timestamp para mostrar
  const formatTimestamp = useCallback((timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Ara mateix'
    if (minutes < 60) return `Fa ${minutes} min`
    if (hours < 24) return `Fa ${hours} h`
    if (days < 7) return `Fa ${days} dies`
    
    return new Date(timestamp).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short'
    })
  }, [])

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentSearches,
    getPopularSearches,
    formatTimestamp
  }
} 