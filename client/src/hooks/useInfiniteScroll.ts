import { useState, useEffect, useCallback, useRef } from 'react'

interface InfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
}

interface InfiniteScrollState<T> {
  items: T[]
  loading: boolean
  hasMore: boolean
  error: string | null
  page: number
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ items: T[]; hasMore: boolean; total?: number }>,
  options: InfiniteScrollOptions = {}
) {
  const { threshold = 0.8, rootMargin = '100px' } = options

  const [state, setState] = useState<InfiniteScrollState<T>>({
    items: [],
    loading: false,
    hasMore: true,
    error: null,
    page: 1
  })

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await fetchFunction(state.page)
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...result.items],
        loading: false,
        hasMore: result.hasMore,
        page: prev.page + 1
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error loading data'
      }))
    }
  }, [fetchFunction, state.loading, state.hasMore, state.page])

  const reset = useCallback(() => {
    initialLoadRef.current = false
    setState({
      items: [],
      loading: false,
      hasMore: true,
      error: null,
      page: 1
    })
  }, [])

  // Intersection Observer para detectar cuando se llega al final
  useEffect(() => {
    if (!targetElement || !state.hasMore || state.loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting) {
          loadMore()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(targetElement)

    return () => {
      observer.unobserve(targetElement)
    }
  }, [targetElement, loadMore, state.hasMore, state.loading, threshold, rootMargin])

  // Cargar datos iniciales - usar ref para evitar loops
  const initialLoadRef = useRef(false)
  
  useEffect(() => {
    if (!initialLoadRef.current && state.items.length === 0 && !state.loading && state.hasMore) {
      initialLoadRef.current = true
      loadMore()
    }
  }, [state.items.length, state.loading, state.hasMore, loadMore])

  return {
    ...state,
    loadMore,
    reset,
    setTargetElement
  }
}