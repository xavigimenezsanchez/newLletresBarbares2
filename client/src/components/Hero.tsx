import { Link } from 'react-router-dom'
import LazyImage from './LazyImage'
import type { Article } from '../types'

interface HeroProps {
  title: string
  subtitle: string
  featuredArticle?: Article
}

const Hero = ({ title, subtitle, featuredArticle }: HeroProps) => {
  return (
    <section className="newyorker-hero">
      <div className="newyorker-hero-content">
        <h1 className="newyorker-hero-title">{title}</h1>
        <p className="newyorker-hero-subtitle">{subtitle}</p>
        
        {featuredArticle && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-sm text-newyorker-red mb-2">
                    Article destacat
                  </div>
                  <h2 className="text-2xl font-display text-newyorker-dark mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-newyorker-text mb-4 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Per {featuredArticle.author}
                    </div>
                    <Link
                      to={`/${featuredArticle.section}/${featuredArticle.url}`}
                      className="newyorker-button"
                    >
                      Llegir més
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                    <LazyImage
                      src={`/api/images/${featuredArticle.imageCard}`}
                      alt={featuredArticle.title}
                      className="w-full h-full rounded-lg"
                      fallbackText={featuredArticle.imageCard}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-12">
          <a href="/arxiu" className="newyorker-button-outline">
            Explorar arxiu
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero 