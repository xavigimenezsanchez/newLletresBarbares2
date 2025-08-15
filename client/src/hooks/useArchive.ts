import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'
import type { Issue } from '../types'

interface ArchiveFilters {
  year?: number
  section?: string
  author?: string
  searchQuery?: string
}

interface ArchiveState {
  issues: Issue[]
  filteredIssues: Issue[]
  availableYears: number[]
  loading: boolean
  error: string | null
  filters: ArchiveFilters
  viewMode: 'timeline' | 'grid'
}

export function useArchive() {
  const [state, setState] = useState<ArchiveState>({
    issues: [],
    filteredIssues: [],
    availableYears: [],
    loading: false,
    error: null,
    filters: {},
    viewMode: 'timeline'
  })

  // Cargar todos los issues y años disponibles
  const loadArchiveData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const [issuesResponse, yearsResponse] = await Promise.all([
        apiService.getIssues({ limit: 100 }), // Cargar todos los issues
        apiService.getYears()
      ])

      const issues = (issuesResponse as any).issues || []
      
      setState(prev => ({
        ...prev,
        issues,
        filteredIssues: issues,
        availableYears: yearsResponse as number[],
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error carregant l\'arxiu'
      }))
    }
  }, [])

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    const { issues, filters } = state
    
    let filtered = [...issues]

    // Filtrar por año
    if (filters.year) {
      filtered = filtered.filter(issue => issue.year === filters.year)
    }

    // Filtrar por búsqueda en título o descripción
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(issue => 
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query)
      )
    }

    // Ordenar por fecha de publicación (más reciente primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.publicationDate).getTime()
      const dateB = new Date(b.publicationDate).getTime()
      return dateB - dateA
    })

    setState(prev => ({ ...prev, filteredIssues: filtered }))
  }, [state.issues, state.filters])

  // Actualizar filtros
  const setFilters = useCallback((newFilters: Partial<ArchiveFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }))
  }, [])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      filteredIssues: prev.issues
    }))
  }, [])

  // Cambiar modo de vista
  const setViewMode = useCallback((mode: 'timeline' | 'grid') => {
    setState(prev => ({ ...prev, viewMode: mode }))
  }, [])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (state.issues.length > 0) {
      applyFilters()
    }
  }, [state.filters, applyFilters])

  // Cargar datos al montar
  useEffect(() => {
    loadArchiveData()
  }, [loadArchiveData])

  return {
    issues: state.filteredIssues,
    availableYears: state.availableYears,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    viewMode: state.viewMode,
    setFilters,
    clearFilters,
    setViewMode,
    reload: loadArchiveData
  }
}