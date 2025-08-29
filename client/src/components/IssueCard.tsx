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

  if (viewMode === 'grid') {
    return (
      <Link 
        to={`/edicio/${issue.number}`}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        {/* Portada placeholder - TODO: cuando tengamos coverImage */}
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-lg font-light mb-2" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              Lletres Barbares
            </div>
            <div className="text-3xl font-bold text-gray-600">
              {issue.number}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {formatMonth(issue.publicationDate)}
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {issue.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Núm. {issue.number}</span>
            <span>{issue.totalArticles || 0} articles</span>
          </div>
          
          {issue.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {issue.description}
            </p>
          )}
        </div>
      </Link>
    )
  }

  // Vista Timeline
  return (
    <div className="flex gap-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 p-6">
      {/* Portada mini */}
      <div className="flex-shrink-0">
        <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-light mb-1" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              LB
            </div>
            <div className="text-lg font-bold text-gray-600">
              {issue.number}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-light text-gray-900 mb-1" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              {issue.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📅 {formatDate(issue.publicationDate)}</span>
              <span>📄 {issue.totalArticles || 0} articles</span>
              {issue.sections && issue.sections.length > 0 && (
                <span>🏷️ {issue.sections.length} seccions</span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-light text-gray-400">
              #{issue.number}
            </div>
          </div>
        </div>

        {issue.description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {issue.description}
          </p>
        )}

        {/* Secciones */}
        {issue.sections && issue.sections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.sections.map((section) => (
              <Link
                key={section}
                to={`/${section}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors duration-200 capitalize"
              >
                {section}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center">
          <Link
            to={`/edicio/${issue.number}`}
            className="see-edition-button"
          >
            Veure edició
          </Link>
          
          {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors duration-200">
            Descarregar PDF
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default IssueCard