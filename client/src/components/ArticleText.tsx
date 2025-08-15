import LazyImage from './LazyImage'
import type { ArticleTextElement } from '../types'

interface ArticleTextProps {
  elements: ArticleTextElement[]
}

const ArticleText = ({ elements }: ArticleTextProps) => {
  let key = 1

  const renderElement = (element: ArticleTextElement) => {
    const elementKey = `article-${key++}`

    switch (element.type) {
      case 'paragraph':
        if (element.image) {
          return (
            <div key={elementKey}>
              <p
                style={element.styles ? JSON.parse(element.styles) : undefined}
                className={element.className}
                dangerouslySetInnerHTML={{ __html: element.content }}
              />
              <div className="flex justify-center">
                <div className="max-w-[600px] w-full">
                  <LazyImage
                    src={`/api/images/${element.image.name}`}
                    alt=""
                    className="w-full h-auto rounded-lg"
                    usePlaceholder={true}
                  />
                </div>
              </div>
            </div>
          )
        } else if (element.className === 'image-foot') {
          return (
            <p
              key={elementKey}
              style={element.styles ? JSON.parse(element.styles) : undefined}
              className="text-sm text-gray-600 mt-2 text-center"
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          )
        } else {
          return (
            <p
              key={elementKey}
              style={element.styles ? JSON.parse(element.styles) : undefined}
              className={`text-lg leading-relaxed mb-6 font-newyorker ${element.className || ''}`}
              dangerouslySetInnerHTML={{ __html: element.content }}
            />
          )
        }

      case 'paragraph2':
        if (element.reference) {
          return (
            <figure key={elementKey} className="my-8">
              <blockquote className="border-l-4 border-gray-300 pl-6 italic text-lg">
                <p dangerouslySetInnerHTML={{ __html: element.content }} />
              </blockquote>
              <figcaption className="text-sm text-gray-600 mt-2">
                <span dangerouslySetInnerHTML={{ __html: element.reference }} />
              </figcaption>
            </figure>
          )
        } else {
          return (
            <figure key={elementKey} className="my-8">
              <blockquote className="border-l-4 border-gray-300 pl-6 italic text-lg">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </blockquote>
            </figure>
          )
        }

      case 'title':
        return (
          <h4 key={elementKey} className="text-2xl font-newyorker font-medium mt-8 mb-4">
            <span dangerouslySetInnerHTML={{ __html: element.content }} />
          </h4>
        )

      case 'title2':
        return (
          <h5 key={elementKey} className="text-xl font-newyorker font-medium mt-6 mb-3">
            <span dangerouslySetInnerHTML={{ __html: element.content }} />
          </h5>
        )

      case 'question':
        return (
          <h5 key={elementKey} className="text-xl font-newyorker font-medium mt-6 mb-3 text-gray-700">
            <span dangerouslySetInnerHTML={{ __html: element.content }} />
          </h5>
        )

      case 'image':
        return (
          <div key={elementKey} className="my-8 flex justify-center">
            <div className="max-w-[600px] w-full">
              <LazyImage
                src={`/api/images/${element.name}`}
                alt=""
                className={`w-full h-auto rounded-lg ${element.className || ''}`}
                usePlaceholder={true}
              />
              {element.content && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  <span dangerouslySetInnerHTML={{ __html: element.content }} />
                </p>
              )}
            </div>
          </div>
        )

      case 'video':
        return (
          <div key={elementKey} className="my-8">
            <video controls width="100%" className="rounded-lg">
              <source src={`/api/videos/${element.name}`} />
              El teu navegador no suporta el format de vídeo.
            </video>
            {element.content && (
              <p className="text-sm text-gray-600 mt-2">
                <span dangerouslySetInnerHTML={{ __html: element.content }} />
              </p>
            )}
          </div>
        )

      case 'youtube':
        return (
          <div key={elementKey} className="my-8">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={element.content}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
            {element.foot && (
              <p className="text-sm text-gray-600 mt-2">
                <span dangerouslySetInnerHTML={{ __html: element.foot }} />
              </p>
            )}
          </div>
        )

      case 'biography':
        return (
          <div key={elementKey} className="my-8">
            <h3 className="text-xl font-newyorker font-medium mb-4">Bibliografia</h3>
            <ul className="list-disc list-inside space-y-2">
              {element.biography?.map((item, index) => (
                <li key={index} className="text-lg leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        )

      case 'footnotes':
        return (
          <div key={elementKey} className="my-8 border-t border-gray-200 pt-6">
            <h3 className="text-xl font-newyorker font-medium mb-4">Notes</h3>
            <ol className="list-decimal list-inside space-y-2">
              {element.notes?.map((note, index) => (
                <li key={index} className="text-lg leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: note.content }} />
                </li>
              ))}
            </ol>
          </div>
        )

      default:
        return <div key={elementKey} />
    }
  }

  return (
    <div className="article-text">
      {elements?.map((element) => renderElement(element))}
    </div>
  )
}

export default ArticleText 