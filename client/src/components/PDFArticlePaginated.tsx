import React, { useRef, useEffect, useState } from 'react'
import type { Article, ArticleTextElement } from '../types'

interface PDFArticlePaginatedProps {
  article: Article
}

interface PageContent {
  elements: ArticleTextElement[]
  hasHeader: boolean
  pageNumber: number
  totalPages: number
}

const PDFArticlePaginated: React.FC<PDFArticlePaginatedProps> = ({ article }) => {
  const [pages, setPages] = useState<PageContent[]>([])
  const [isInitialMeasurement, setIsInitialMeasurement] = useState(true)
  const measureRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const getSectionLabel = (section: string) => {
    const sectionLabels: Record<string, string> = {
      articles: 'Articles',
      creacio: 'Creació',
      entrevistes: 'Entrevistes',
      llibres: 'Llibres',
      llocs: 'Llocs',
      recomanacions: 'Recomanacions'
    }
    return sectionLabels[section] || section
  }

  // Función para estimar la altura de un elemento
  const estimateElementHeight = (element: ArticleTextElement): number => {
    switch (element.type) {
      case 'paragraph':
      case 'paragraph2':
        if (element.content.includes('<iframe')) {
          return 400
        }
        // Estimar basado en el largo del texto
        const textLength = element.content.replace(/<[^>]*>/g, '').length
        const linesApprox = Math.ceil(textLength / 90) // ~75 caracteres por línea (más conservador)
        let height = linesApprox * 20 // ~20px por línea en 11pt con interlineado
        
        if (element.image) {
          height += 152// Altura adicional para imagen embebida
        }
        
        // Añadir margen inferior
        height += 8 // ~3mm en pixels
        
        return Math.max(height, 28) // Altura mínima de párrafo
        
      case 'title':
        return 45 // ~24pt título
        
      case 'title2':
        return 35 // ~16pt subtítulo
        
      case 'question':
        const questionLength = element.content.replace(/<[^>]*>/g, '').length
        return Math.max(Math.ceil(questionLength / 70) * 20, 30)
        
      case 'image':
        return 150 // Altura fija para imágenes
        
      case 'video':
      case 'youtube':
        return 400 // Altura del placeholder de video
        
      case 'biography':
        const bibItems = element.biography?.length || 0
        return 40 + (bibItems * 20) // Título + items
        
        case 'footnotes':
         const estimateNoteElementHeight = (note: { content: string }) => {
           const textLength = note.content.replace(/<[^>]*>/g, '').length
           const linesApprox = Math.ceil(textLength / 100)
           return 10 + (linesApprox * 10)
         }
        const marginTop = 35
        const titleHeight = 22
        const noteItems = element.notes?.length || 0
        const padding = 8
        const textHeight = element.notes?.reduce((acc, note) => acc + estimateNoteElementHeight(note), 0) || 0
        return 40 + (noteItems * 10) + textHeight + padding + titleHeight+ marginTop// Título + notas
        
      default:
        return 20
    }
  }

  // Función para verificar si un elemento no debe ser separado de la página
  const isUnseparableElement = (element: ArticleTextElement): boolean => {
    return ['title', 'title2', 'image', 'video', 'youtube', 'biography', 'footnotes'].includes(element.type)
  }

  // Función para dividir un párrafo por frases
  const splitParagraphIntoSentences = (element: ArticleTextElement): string[] => {
    if (!['paragraph', 'paragraph2'].includes(element.type) || element.image) {
      return [element.content]
    }

    const text = element.content.trim()
    
    // Dividir por frases usando múltiples patrones
    let sentences = text.split(/(?<=\.)\s+(?=[A-ZÁÀÈÍÓÚÇ])|(?<=\!)\s+(?=[A-ZÁÀÈÍÓÚÇ])|(?<=\?)\s+(?=[A-ZÁÀÈÍÓÚÇ])/)
    
    // Si solo hay una frase larga, dividir por comas, puntos y coma, o dos puntos
    if (sentences.length <= 1) {
      sentences = text.split(/(?<=,)\s+|(?<=;)\s+|(?<=:)\s+/)
      
      // Si aún es muy largo, dividir por conectores
      if (sentences.length <= 1 && text.length > 200) {
        sentences = text.split(/\s+(?=però|però\s|i\s|o\s|que\s|ja que|perquè|malgrat|tot i|encara que)/i)
      }
    }
    
    // Filtrar frases vacías y limpiar
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  // Función para dividir párrafo por líneas visuales (manteniendo integridad semántica)
  const createLineBasedFragments = (
    element: ArticleTextElement,
    availableSpace: number,
    originalIndex: number
  ): ArticleTextElement[] => {
    // Solo procesar párrafos de texto normal
    if (!['paragraph', 'paragraph2'].includes(element.type) || ('image' in element && element.image)) {
      return [element]
    }

    const content = element.content.trim()
    if (!content) return [element]

    // Crear contenedor temporal para medir líneas
    const tempContainer = document.createElement('div')
    tempContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      top: -9999px;
      width: 170mm;
      font-size: 11pt;
      line-height: 1.5;
      text-align: justify;
      font-family: inherit;
      text-indent: 5mm;
      margin-bottom: 3mm;
    `
    tempContainer.innerHTML = `<p class="pdf-paragraph">${content}</p>`
    document.body.appendChild(tempContainer)

    try {
      const paragraph = tempContainer.querySelector('p')!
      const totalHeight = paragraph.getBoundingClientRect().height
      const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight)
      const totalLines = Math.round(totalHeight / lineHeight)
      
      console.log(`📏 Párrafo ${originalIndex}: ${totalHeight}px total, ${lineHeight}px por línea, ${totalLines} líneas`)
      
      // Calcular cuántas líneas caben en el espacio disponible
      const availableLines = Math.floor(availableSpace / lineHeight)
      
      console.log(`📐 Espacio disponible: ${availableSpace}px = ${availableLines} líneas de ${totalLines} total`)
      
      if (availableLines >= totalLines || availableLines <= 0) {
        // Todo el párrafo cabe o no hay espacio suficiente
        return [element]
      }

      // Método más preciso: buscar el punto de corte exacto por altura
      const words = content.split(' ')
      let bestSplit = Math.floor(words.length / 2) // Empezar por la mitad
      let left = 0
      let right = words.length
      
      // Búsqueda binaria para encontrar el punto de corte óptimo
      while (left < right - 1) {
        const testWords = words.slice(0, bestSplit)
        const testFragment = testWords.join(' ')
        
        // Medir la altura del fragmento de prueba
        paragraph.innerHTML = testFragment
        const testHeight = paragraph.getBoundingClientRect().height
        const testLines = Math.round(testHeight / lineHeight)
        
        console.log(`🔍 Probando split en palabra ${bestSplit}: ${testLines} líneas vs ${availableLines} disponibles`)
        
        if (testLines <= availableLines) {
          left = bestSplit
          bestSplit = Math.floor((bestSplit + right) / 2)
        } else {
          right = bestSplit
          bestSplit = Math.floor((left + bestSplit) / 2)
        }
        
        // Evitar bucle infinito
        if (right - left <= 1) break
      }
      
      // Usar el mejor punto de corte encontrado
      const firstPartWords = words.slice(0, left)
      const secondPartWords = words.slice(left)
      
      const firstFragment = firstPartWords.join(' ')
      const secondFragment = secondPartWords.join(' ')
      
      console.log(`📝 División óptima en palabra ${left} de ${words.length}:`)
      
      console.log(`✂️ División por líneas:`)
      console.log(`   Primera parte: "${firstFragment.substring(0, 60)}..."`)
      console.log(`   Segunda parte: "${secondFragment.substring(0, 60)}..."`)
      
      return [
        {
          ...element,
          content: firstFragment.trim(),
          isSplitFirst: true // Marcar como primera parte de un párrafo dividido
        },
        {
          ...element,
          content: secondFragment.trim(),
          isSplitSecond: true // Marcar como segunda parte de un párrafo dividido
        }
      ].filter(f => f.content.length > 0)
      
    } catch (error) {
      console.error('Error midiendo párrafo:', error)
      return [element]
    } finally {
      document.body.removeChild(tempContainer)
    }
  }

  // Función para dividir el contenido en páginas
  const paginateContent = () => {
    const maxPageHeight = 820 // Altura máxima en pixels para el contenido (más conservador)
    const headerHeight = 100 // Altura del header del artículo
    const minPageHeight = 200 // Altura mínima antes de forzar una nueva página
    
    const originalElements = article.text || []
    
    console.log(`Procesando artículo "${article.title}" con ${originalElements.length} elementos originales`)
    // La división de párrafos se hace dinámicamente durante la paginación
    
    const newPages: PageContent[] = []
    
    let currentPageElements: ArticleTextElement[] = []
    let currentPageHeight = headerHeight // Empezar con la altura del header
    let pageNumber = 1
    
    originalElements.forEach((element, elementIndex) => {
      const elementHeight = estimateElementHeight(element)
      const wouldExceedHeight = currentPageHeight + elementHeight > maxPageHeight
      const hasContent = currentPageElements.length > 0
      const isUnseparable = isUnseparableElement(element)
      const hasMinimumContent = currentPageHeight > minPageHeight
      
      // Verificar si el elemento actual es un título
      const isTitle = ['title', 'title2'].includes(element.type)
      
      // Si es un título, verificar si tiene contenido después
      let titleNeedsFollowingContent = false
      if (isTitle) {
        const nextElement = originalElements[elementIndex + 1]
        
        if (nextElement) {
          // Verificar si el siguiente elemento es contenido relacionado
          const isNextContentRelated = ['paragraph', 'paragraph2', 'question', 'image'].includes(nextElement.type)
          
          if (isNextContentRelated) {
            const nextElementHeight = estimateElementHeight(nextElement)
            const wouldBothFit = currentPageHeight + elementHeight + nextElementHeight <= maxPageHeight
            
            // Si el título cabe pero el título + siguiente contenido no, mover todo a nueva página
            if (!wouldExceedHeight && !wouldBothFit) {
              titleNeedsFollowingContent = true
              console.log(`Título "${element.content.substring(0, 30)}..." necesita ir con el siguiente ${nextElement.type} a nueva página`)
            }
          }
        } else {
          // Si es el último elemento y es un título, asegurar que no quede solo al final
          const pageHasSubstantialContent = currentPageHeight > headerHeight + 150
          if (!pageHasSubstantialContent && currentPageElements.length > 0) {
            titleNeedsFollowingContent = true
            console.log(`Título "${element.content.substring(0, 30)}..." es el último elemento y la página no tiene suficiente contenido`)
          }
        }
        
        // Regla adicional: Si la página actual está muy llena y agregar el título + mínimo contenido 
        // excedería el límite, mover el título a nueva página
        if (!titleNeedsFollowingContent && nextElement) {
          const nextElementHeight = estimateElementHeight(nextElement)
          const minimumContentHeight = 60 // Al menos 3 líneas de texto
          const titlePlusMinimumContent = elementHeight + Math.min(nextElementHeight, minimumContentHeight)
          
          if (currentPageHeight + titlePlusMinimumContent > maxPageHeight) {
            titleNeedsFollowingContent = true
            console.log(`Título "${element.content.substring(0, 30)}..." necesita nueva página para tener espacio mínimo de contenido`)
          }
        }
      }
      
      // Decidir si crear nueva página
      const shouldCreateNewPage = (wouldExceedHeight || titleNeedsFollowingContent) && hasContent && (
        (!isUnseparable && hasMinimumContent) || // Párrafos pueden dividirse con menos contenido
        (isUnseparable && hasMinimumContent) || // Elementos no separables necesitan más contenido
        titleNeedsFollowingContent // Títulos que necesitan ir con contenido siguiente
      )
      
      if (shouldCreateNewPage) {
        console.log(`Creando nueva página ${pageNumber + 1}. Página anterior tenía ${currentPageElements.length} elementos y altura ${currentPageHeight}px`)
        
        // Guardar la página actual
        newPages.push({
          elements: [...currentPageElements],
          hasHeader: pageNumber === 1,
          pageNumber,
          totalPages: 0 // Se calculará después
        })
        
        // Empezar nueva página
        currentPageElements = [element]
        currentPageHeight = (pageNumber === 1 ? 80 : 50) + elementHeight // Header más pequeño para páginas siguientes
        pageNumber++
      } else {
        // Agregar elemento a la página actual
        currentPageElements.push(element)
        currentPageHeight += elementHeight
      }
    })
    
    // Agregar la última página si tiene contenido
    if (currentPageElements.length > 0) {
      newPages.push({
        elements: currentPageElements,
        hasHeader: pageNumber === 1,
        pageNumber,
        totalPages: 0
      })
    }
    
    // Si no hay páginas, crear una página vacía
    if (newPages.length === 0) {
      newPages.push({
        elements: [],
        hasHeader: true,
        pageNumber: 1,
        totalPages: 1
      })
    }
    
    // Actualizar el totalPages en todas las páginas
    const totalPages = newPages.length
    newPages.forEach(page => {
      page.totalPages = totalPages
    })
    
    console.log(`Artículo "${article.title}" dividido en ${totalPages} páginas`)
    newPages.forEach((page) => {
      console.log(`Página ${page.pageNumber}: ${page.elements.length} elementos`)
    })
    
    setPages(newPages)
  }

  // Función para medir las alturas reales de los elementos renderizados
  const measureElementHeights = () => {
    debugger

    const heights = new Map<number, number>()
    
    elementRefs.current.forEach((element, index) => {
      if (element) {
        const rect = element.getBoundingClientRect()
        heights.set(index, rect.height)
        console.log(`Elemento ${index}: altura real ${rect.height}px`)
      }
    })
    
    // setElementHeights(heights) // No longer needed
    return heights
  }

  // Función mejorada de paginación usando alturas reales
  const paginateWithRealHeights = (realHeights: Map<number, number>) => {
    const maxPageHeight = 880 // Altura máxima en pixels para el contenido
    const headerHeight = 100 // Altura del header del artículo
    const minPageHeight = 200 // Altura mínima antes de forzar una nueva página
    
    const originalElements = article.text || []
    
    console.log(`Re-paginando con alturas reales para "${article.title}"`)
    console.log('Alturas medidas:', Array.from(realHeights.entries()))
    
    const newPages: PageContent[] = []
    let currentPageElements: ArticleTextElement[] = []
    let currentPageHeight = headerHeight
    let pageNumber = 1
    
    originalElements.forEach((element, elementIndex) => {
      const elementHeight = realHeights.get(elementIndex) || estimateElementHeight(element)
      const wouldExceedHeight = currentPageHeight + elementHeight > maxPageHeight
      const hasContent = currentPageElements.length > 0
      const isUnseparable = isUnseparableElement(element)
      const hasMinimumContent = currentPageHeight > minPageHeight
      const availableSpace = maxPageHeight - currentPageHeight
      
      console.log(`--- PROCESANDO ELEMENTO ${elementIndex} ---`)
      console.log(`Tipo: ${element.type}, Contenido: "${element.content.substring(0, 50)}..."`)
      console.log(`Altura elemento: ${elementHeight}px, Altura página: ${currentPageHeight}px, Disponible: ${availableSpace}px`)
      console.log(`Página actual: ${pageNumber}, Elementos en página: ${currentPageElements.length}`)
      
      // Verificar reglas para títulos
      const isTitle = ['title', 'title2'].includes(element.type)
      let titleNeedsFollowingContent = false
      
      if (isTitle) {
        const nextElement = originalElements[elementIndex + 1]
        if (nextElement) {
          const isNextContentRelated = ['paragraph', 'paragraph2', 'question', 'image'].includes(nextElement.type)
          if (isNextContentRelated) {
            const nextElementHeight = realHeights.get(elementIndex + 1) || estimateElementHeight(nextElement)
            const wouldBothFit = currentPageHeight + elementHeight + nextElementHeight <= maxPageHeight
            
            if (!wouldExceedHeight && !wouldBothFit) {
              titleNeedsFollowingContent = true
              console.log(`Título "${element.content.substring(0, 30)}..." necesita ir con contenido siguiente (alturas reales)`)
            }
          }
        }
      }
      
      // Lógica especial para párrafos: intentar división dinámica
      const isParagraph = ['paragraph', 'paragraph2'].includes(element.type) && !('image' in element && element.image)
      let shouldTryDynamicSplit = false
      
      if (isParagraph && wouldExceedHeight && hasContent && availableSpace > 100) {
        // Hay espacio suficiente para al menos una parte del párrafo
        shouldTryDynamicSplit = true
        console.log(`Párrafo ${elementIndex} no cabe (${elementHeight}px > ${availableSpace}px), intentando división dinámica`)
      }
      
      if (shouldTryDynamicSplit) {
        // Crear fragmentos basados en líneas visuales
        const fragments = createLineBasedFragments(element, availableSpace, elementIndex)
        
        if (fragments.length > 1) {
          console.log(`🔧 DIVIDIENDO PÁRRAFO ${elementIndex} en ${fragments.length} fragmentos`)
          
          // Agregar el primer fragmento a la página actual
          const firstFragment = fragments[0]
          currentPageElements.push(firstFragment)
          console.log(`✅ Primer fragmento añadido a página ${pageNumber} (${currentPageElements.length} elementos total)`)
          
          // Completar y guardar la página actual
          newPages.push({
            elements: [...currentPageElements],
            hasHeader: pageNumber === 1,
            pageNumber,
            totalPages: 0
          })
          console.log(`📄 Página ${pageNumber} completada con ${currentPageElements.length} elementos`)
          
          // Empezar nueva página con el segundo fragmento
          pageNumber++
          currentPageElements = [fragments[1]]
          currentPageHeight = 50 + estimateElementHeight(fragments[1]) // Header reducido + fragmento
          
          console.log(`🆕 Nueva página ${pageNumber} iniciada con segundo fragmento`)
          console.log(`📏 Altura nueva página: ${currentPageHeight}px`)
          
          // Para simplificar, si hay más fragmentos, los añadimos a la página actual
          // (podemos mejorar esto después si es necesario)
          if (fragments.length > 2) {
            fragments.slice(2).forEach((fragment, fragIndex) => {
              const fragHeight = estimateElementHeight(fragment)
              if (currentPageHeight + fragHeight <= maxPageHeight) {
                currentPageElements.push(fragment)
                currentPageHeight += fragHeight
                console.log(`➕ Fragmento adicional ${fragIndex + 3} añadido a página ${pageNumber}`)
              } else {
                // Si no cabe, crear nueva página
                newPages.push({
                  elements: [...currentPageElements],
                  hasHeader: false,
                  pageNumber,
                  totalPages: 0
                })
                pageNumber++
                currentPageElements = [fragment]
                currentPageHeight = 50 + fragHeight
                console.log(`📄 Fragmento ${fragIndex + 3} en nueva página ${pageNumber}`)
              }
            })
          }
          
          console.log(`🎯 División completa. Página activa: ${pageNumber}, Elementos: ${currentPageElements.length}, Altura: ${currentPageHeight}px`)
          
          // CRÍTICO: NO hacer return aquí - continuar procesando elementos
        } else {
          // Si no se pudo dividir, usar lógica normal
          const shouldCreateNewPage = (wouldExceedHeight || titleNeedsFollowingContent) && hasContent && (
            (!isUnseparable && hasMinimumContent) ||
            (isUnseparable && hasMinimumContent) ||
            titleNeedsFollowingContent
          )
          
          if (shouldCreateNewPage) {
            console.log(`Nueva página ${pageNumber + 1} (altura real: ${currentPageHeight}px)`)
            
            newPages.push({
              elements: [...currentPageElements],
              hasHeader: pageNumber === 1,
              pageNumber,
              totalPages: 0
            })
            
            currentPageElements = [element]
            currentPageHeight = (pageNumber === 1 ? 80 : 50) + elementHeight
            pageNumber++
          } else {
            currentPageElements.push(element)
            currentPageHeight += elementHeight
          }
        }
      } else {
        // Lógica normal de paginación para elementos no divisibles
        const shouldCreateNewPage = (wouldExceedHeight || titleNeedsFollowingContent) && hasContent && (
          (!isUnseparable && hasMinimumContent) ||
          (isUnseparable && hasMinimumContent) ||
          titleNeedsFollowingContent
        )
        
        if (shouldCreateNewPage) {
          console.log(`Nueva página ${pageNumber + 1} (altura real: ${currentPageHeight}px)`)
          
          newPages.push({
            elements: [...currentPageElements],
            hasHeader: pageNumber === 1,
            pageNumber,
            totalPages: 0
          })
          
          currentPageElements = [element]
          currentPageHeight = (pageNumber === 1 ? 80 : 50) + elementHeight
          pageNumber++
        } else {
          currentPageElements.push(element)
          currentPageHeight += elementHeight
        }
      }
      
      console.log(`✓ COMPLETADO elemento ${elementIndex} (${element.type})`)
      console.log(`   └─ Página actual: ${pageNumber}, Elementos en página: ${currentPageElements.length}, Altura: ${currentPageHeight}px`)
      console.log(`   └─ ${currentPageElements.map(el => el.type).join(', ')}`)
    })
    
    // Agregar la última página
    if (currentPageElements.length > 0) {
      newPages.push({
        elements: currentPageElements,
        hasHeader: pageNumber === 1,
        pageNumber,
        totalPages: 0
      })
    }
    
    if (newPages.length === 0) {
      newPages.push({
        elements: [],
        hasHeader: true,
        pageNumber: 1,
        totalPages: 1
      })
    }
    
    // Actualizar totalPages
    const totalPages = newPages.length
    newPages.forEach(page => {
      page.totalPages = totalPages
    })
    
    console.log(`Re-paginación completada: ${totalPages} páginas usando alturas reales`)
    setPages(newPages)
    setIsInitialMeasurement(false)
  }

  useEffect(() => {
    if (isInitialMeasurement) {
      // Primera carga: usar estimaciones para render inicial
      paginateContent()
    }
  }, [article])

  useEffect(() => {
    if (isInitialMeasurement && pages.length > 0) {
      // Después del primer render, medir alturas reales
      setTimeout(() => {
        const realHeights = measureElementHeights()
        paginateWithRealHeights(realHeights)
      }, 100) // Pequeño delay para asegurar que el render esté completo
    }
  }, [pages, isInitialMeasurement])

  const renderElement = (element: ArticleTextElement, index: number, pageIndex: number, globalElementIndex?: number) => {
    const elementKey = `pdf-article-${article.url}-page-${pageIndex}-${index}`
    
    // Solo asignar refs durante la medición inicial
    const setElementRef = (el: HTMLDivElement | null) => {
      if (el && isInitialMeasurement && globalElementIndex !== undefined) {
        elementRefs.current.set(globalElementIndex, el)
      }
    }

    switch (element.type) {
      case 'paragraph':
      case 'paragraph2':
        if (element.image) {
          return (
            <div key={elementKey} ref={setElementRef} className="pdf-paragraph-with-image">
              <p
                className={`pdf-paragraph ${element.className || ''} ${('isSplitFirst' in element && element.isSplitFirst) ? 'pdf-paragraph-split-first' : ''} ${('isSplitSecond' in element && element.isSplitSecond) ? 'pdf-paragraph-split-second' : ''}`.trim()}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
              <div className="pdf-image-container">
                <img
                  src={`/api/images/${element.image.name}`}
                  alt=""
                  className="pdf-image"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )
        } else {
          return (
            <div key={elementKey} ref={setElementRef} className="pdf-paragraph-wrapper">
              <p
                className={`pdf-paragraph ${element.className || ''} ${('isSplitFirst' in element && element.isSplitFirst) ? 'pdf-paragraph-split-first' : ''} ${('isSplitSecond' in element && element.isSplitSecond) ? 'pdf-paragraph-split-second' : ''}`.trim()}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
            </div>
          )
        }

      case 'title':
      case 'title2':
        return (
          <div key={elementKey} ref={setElementRef} className="pdf-title-wrapper">
            <h3
              className={`pdf-subtitle ${element.type === 'title2' ? 'pdf-subtitle-2' : ''}`}
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          </div>
        )

      case 'question':
        return (
          <div key={elementKey} ref={setElementRef} className="pdf-question">
            <p dangerouslySetInnerHTML={{ __html: element.content }} />
          </div>
        )

      case 'image':
        return (
          <div key={elementKey} ref={setElementRef} className="pdf-image-container">
            <img
              src={`/api/images/${element.name}`}
              alt=""
              className="pdf-image"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
            {element.content && (
              <p className="pdf-image-caption">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </p>
            )}
          </div>
        )

      case 'video':
        return (
          <div key={elementKey} className="pdf-video-placeholder">
            <div className="pdf-video-icon">🎥</div>
            <p className="pdf-video-text">
              Vídeo disponible en línia: 
              <br />
              <span className="pdf-video-link">
                https://lletresbarbaras.com/{article.section}/{article.url}
              </span>
            </p>
            {element.content && (
              <p className="pdf-video-caption">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </p>
            )}
          </div>
        )

      case 'youtube':
        const getYouTubeId = (url: string) => {
          const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&"'>]+)/)
          return match ? match[1] : null
        }
        
        const youtubeId = getYouTubeId(element.content)
        const youtubeUrl = youtubeId ? `https://youtube.com/watch?v=${youtubeId}` : element.content

        return (
          <div key={elementKey} className="pdf-youtube-placeholder">
            <div className="pdf-video-icon">📺</div>
            <p className="pdf-video-text">
              Vídeo de YouTube: 
              <br />
              <span className="pdf-video-link">{youtubeUrl}</span>
            </p>
            {element.foot && (
              <p className="pdf-video-caption">
                <span dangerouslySetInnerHTML={{ __html: element.foot }} />
              </p>
            )}
          </div>
        )

      case 'biography':
        return (
          <div key={elementKey} className="pdf-biography">
            <h4 className="pdf-bibliography-title">Bibliografia</h4>
            <ul className="pdf-bibliography-list">
              {element.biography?.map((item, index) => (
                <li key={index} className="pdf-bibliography-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )

      case 'footnotes':
        return (
          <div key={elementKey} className="pdf-footnotes">
            <h4 className="pdf-footnotes-title">Notes</h4>
            <ol className="pdf-footnotes-list">
              {element.notes?.map((note, index) => (
                <li key={index} className="pdf-footnote-item">
                  <span dangerouslySetInnerHTML={{ __html: note.content }} />
                </li>
              ))}
            </ol>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {pages.map((page, pageIndex) => (
        <div key={`page-${pageIndex}`} className="pdf-page pdf-article">
          <div className="pdf-page-content">
            <article className="pdf-article-content">
              {/* Header del artículo solo en la primera página */}
              {page.hasHeader && (
                <header className="pdf-article-header">
                  <div className="pdf-article-section">{getSectionLabel(article.section)}</div>
                  <h1 className="pdf-article-title" dangerouslySetInnerHTML={{ __html: article.title }} />
                  <div className="pdf-article-meta">
                    <div className="pdf-article-authors">
                      {Array.isArray(article.authors) ? article.authors.join(', ') : article.author}
                    </div>
                  </div>
                </header>
              )}

              {/* Header reducido para páginas siguientes */}
              {!page.hasHeader && page.totalPages > 1 && (
                <header className="pdf-article-header-continued">
                  <h2 className="pdf-article-title-continued" dangerouslySetInnerHTML={{ __html: article.title }} />
                  <div className="pdf-page-indicator">
                    Pàgina {page.pageNumber} de {page.totalPages}
                  </div>
                </header>
              )}

              {/* Resumen del artículo solo en la primera página */}
              {/* {page.hasHeader && article.summary && (
                <div className="pdf-article-summary">
                  <p dangerouslySetInnerHTML={{ __html: article.summary }} />
                </div>
              )} */}

              {/* Contenido de la página */}
              <div className="pdf-article-text">
                {page.elements.map((element, index) => {
                  // Encontrar el índice original del elemento en article.text
                  const originalIndex = (article.text || []).findIndex((originalElement) => 
                    originalElement === element || 
                    (originalElement.type === element.type && originalElement.content === element.content)
                  )
                  return renderElement(element, index, pageIndex, originalIndex >= 0 ? originalIndex : undefined)
                })}
              </div>
            </article>
          </div>
        </div>
      ))}
      
      {/* Elemento de medición oculto */}
      <div 
        ref={measureRef} 
        style={{ 
          position: 'absolute', 
          visibility: 'hidden', 
          height: 'auto', 
          width: '170mm',
          top: '-9999px' 
        }}
      />
    </>
  )
}

export default PDFArticlePaginated