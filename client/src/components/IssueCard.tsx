import React from 'react'
import { Link } from 'react-router-dom'
import type { Issue } from '../types'

interface IssueCardProps {
  issue: Issue
  viewMode: 'timeline' | 'grid'
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, viewMode }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatMonth = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short'
    })
  }

  // Función para obtener colores dinámicos basados en el año
  const getYearColorScheme = (date: string | Date) => {
    const year = new Date(date).getFullYear()
    const currentYear = new Date().getFullYear()
    
    const colorSchemes = {
      2020: {
        gradient: 'from-blue-100 via-blue-50 to-indigo-100',
        accent: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:from-blue-200 hover:to-indigo-200'
      },
      2021: {
        gradient: 'from-emerald-100 via-green-50 to-teal-100',
        accent: 'text-emerald-600',
        border: 'border-emerald-200',
        hover: 'hover:from-emerald-200 hover:to-teal-200'
      },
      2022: {
        gradient: 'from-purple-100 via-violet-50 to-fuchsia-100',
        accent: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:from-purple-200 hover:to-fuchsia-200'
      },
      2023: {
        gradient: 'from-orange-100 via-amber-50 to-yellow-100',
        accent: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:from-orange-200 hover:to-yellow-200'
      },
      2024: {
        gradient: 'from-rose-100 via-pink-50 to-red-100',
        accent: 'text-rose-600',
        border: 'border-rose-200',
        hover: 'hover:from-rose-200 hover:to-red-200'
      }
    }

    // Año actual - color especial (más vibrante)
    if (year === currentYear) {
      return {
        gradient: 'from-cyan-100 via-sky-50 to-blue-100',
        accent: 'text-cyan-600',
        border: 'border-cyan-200',
        hover: 'hover:from-cyan-200 hover:to-blue-200'
      }
    }

    return colorSchemes[year as keyof typeof colorSchemes] || {
      gradient: 'from-slate-100 via-gray-50 to-stone-100',
      accent: 'text-slate-600',
      border: 'border-slate-200',
      hover: 'hover:from-slate-200 hover:to-stone-200'
    }
  }

  // Función para obtener iconos temáticos
  const getSectionIcon = (section: string) => {
    const icons = {
      'articles': '📄',
      'creacio': '✍️',
      'entrevistes': '🎤',
      'llibres': '📚',
      'llocs': '📍',
      'recomanacions': '⭐'
    }
    return icons[section as keyof typeof icons] || '📖'
  }



  // Calcular estadísticas basadas en los artículos
  const totalArticles = issue.articles?.length || 0
  const sections = issue.articles ? Array.from(new Set(issue.articles.map(article => article.section))) : []

  const colorScheme = getYearColorScheme(issue.publicationDate)

  if (viewMode === 'grid') {
    return (
      <Link 
        to={`/edicio/${issue.number}`}
        className={`block bg-white rounded-lg shadow-sm border ${colorScheme.border} overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
      >
        {/* Portada con colores dinámicos */}
        <div className={`aspect-[3/4] bg-gradient-to-br ${colorScheme.gradient} ${colorScheme.hover} flex items-center justify-center transition-all duration-300 relative overflow-hidden`}>
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-current rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-current rounded"></div>
          </div>
          
          <div className="text-center p-4 relative z-10">
            <div className="text-lg font-light mb-2" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              Lletres Bàrbares
            </div>
            <div className={`text-3xl font-bold ${colorScheme.accent} group-hover:scale-110 transition-transform duration-300`}>
              {issue.number}
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium">
              {formatMonth(issue.publicationDate)}
            </div>
          </div>
        </div>
        
        {/* Info enriquecida */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
            {issue.title}
          </h3>
          
          {/* Tags de secciones principales */}
          {sections && sections.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {sections.slice(0, 3).map((section) => (
                <span
                  key={section}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 ${colorScheme.accent.replace('text-', 'bg-')} ${colorScheme.accent}`}
                >
                  <span className="mr-1">{getSectionIcon(section)}</span>
                  {section}
                </span>
              ))}
              {sections.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{sections.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Estadísticas visuales */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="text-base">📄</span>
                <span className="font-medium">{totalArticles}</span>
              </span>
              {sections.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-base">🏷️</span>
                  <span className="font-medium">{sections.length}</span>
                </span>
              )}
            </div>
            <span className={`font-bold ${colorScheme.accent}`}>#{issue.number}</span>
          </div>
          
          {issue.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          )}
        </div>
      </Link>
    )
  }

  // Vista Timeline
  return (
    <div className={`flex gap-6 bg-white rounded-lg shadow-sm border ${colorScheme.border} overflow-hidden hover:shadow-lg transition-all duration-300 p-6 group relative`}>
      {/* Portada mini con colores dinámicos */}
      <div className="flex-shrink-0">
        <div className={`w-24 h-32 bg-gradient-to-br ${colorScheme.gradient} ${colorScheme.hover} rounded flex items-center justify-center transition-all duration-300 relative overflow-hidden group-hover:scale-105`}>
          {/* Patrón decorativo mini */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-3 h-3 border border-current rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 border border-current rounded"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="text-xs font-light mb-1" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              LB
            </div>
            <div className={`text-lg font-bold ${colorScheme.accent}`}>
              {issue.number}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido enriquecido */}
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-light text-gray-900 group-hover:text-gray-700 transition-colors duration-200" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
                {issue.title}
              </h3>
              {/* Indicador visual del año */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${colorScheme.accent} bg-opacity-10 ${colorScheme.accent.replace('text-', 'bg-')}`}>
                {new Date(issue.publicationDate).getFullYear()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-base">📅</span>
                <span className="font-medium">{formatDate(issue.publicationDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base">📄</span>
                <span className="font-medium">{totalArticles} articles</span>
              </span>
              {sections.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-base">🏷️</span>
                  <span className="font-medium">{sections.length} seccions</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className={`text-2xl font-light ${colorScheme.accent} group-hover:scale-110 transition-transform duration-300`}>
              #{issue.number}
            </div>
          </div>
        </div>

        {issue.description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {issue.description}
          </p>
        )}

        {/* Secciones mejoradas con iconos */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sections.map((section) => (
              <Link
                key={section}
                to={`/${section}`}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 bg-opacity-20 ${colorScheme.accent.replace('text-', 'bg-')} ${colorScheme.accent} hover:bg-opacity-30`}
              >
                <span className="mr-1">{getSectionIcon(section)}</span>
                <span className="capitalize">{section}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Actions mejoradas */}
        <div className="flex items-center justify-between">
          <Link
            to={`/edicio/${issue.number}`}
            className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${colorScheme.accent.replace('text-', 'bg-')} text-white hover:opacity-90`}
          >
            <span className="mr-2">📖</span>
            Veure edició
          </Link>
          
          {/* Información adicional */}
          <div className="text-xs text-gray-400 text-right">
            <div>Publicat el</div>
            <div className="font-medium">{formatMonth(issue.publicationDate)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueCard