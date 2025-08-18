/**
 * Utilidades para formatear fechas en catalán
 */

/**
 * Formatea una fecha en formato string "DD/MM/YYYY" a un formato legible en catalán
 * @param dateString - Fecha en formato "DD/MM/YYYY"
 * @returns Fecha formateada en catalán
 */
export function formatDateToCatalan(dateString: string): string {
  try {
    const [day, month, year] = dateString.split('/')
    
    // Validar que los valores sean números válidos
    if (!day || !month || !year || 
        isNaN(parseInt(day)) || 
        isNaN(parseInt(month)) || 
        isNaN(parseInt(year))) {
      throw new Error('Formato de fecha inválido')
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      throw new Error('Fecha inválida')
    }
    
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formateando fecha:', error, 'Fecha original:', dateString)
    return dateString // Devolver la fecha original si hay error
  }
}

/**
 * Formatea una fecha en formato string "DD/MM/YYYY" a un formato corto en catalán
 * @param dateString - Fecha en formato "DD/MM/YYYY"
 * @returns Fecha formateada en formato corto
 */
export function formatDateToCatalanShort(dateString: string): string {
  try {
    const [day, month, year] = dateString.split('/')
    
    if (!day || !month || !year || 
        isNaN(parseInt(day)) || 
        isNaN(parseInt(month)) || 
        isNaN(parseInt(year))) {
      throw new Error('Formato de fecha inválido')
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    if (isNaN(date.getTime())) {
      throw new Error('Fecha inválida')
    }
    
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formateando fecha corta:', error, 'Fecha original:', dateString)
    return dateString
  }
}

/**
 * Convierte una fecha en formato "DD/MM/YYYY" a un objeto Date
 * @param dateString - Fecha en formato "DD/MM/YYYY"
 * @returns Objeto Date o null si hay error
 */
export function parseDateFromString(dateString: string): Date | null {
  try {
    const [day, month, year] = dateString.split('/')
    
    if (!day || !month || !year || 
        isNaN(parseInt(day)) || 
        isNaN(parseInt(month)) || 
        isNaN(parseInt(year))) {
      return null
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    if (isNaN(date.getTime())) {
      return null
    }
    
    return date
  } catch (error) {
    console.error('Error parseando fecha:', error, 'Fecha original:', dateString)
    return null
  }
} 