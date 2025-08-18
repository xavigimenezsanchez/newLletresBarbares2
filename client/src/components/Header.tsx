import { useState, useEffect } from 'react'
import ElegantSearch from './ElegantSearch'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCompressed, setIsCompressed] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (y > 120 && !isCompressed) setIsCompressed(true)
          else if (y < 40 && isCompressed) setIsCompressed(false)
          setIsScrolled(y > 50)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isCompressed])

  const navigationItems = [
    { label: 'Última edició', href: '/' },
    { label: 'Arxiu', href: '/arxiu' },
    { label: 'Autors', href: '/autors' },
    { label: 'Articles', href: '/articles' },
    { label: 'Creació', href: '/creacio' },
    { label: 'Entrevistes', href: '/entrevistes' },
    { label: 'Llibres', href: '/llibres' },
    { label: 'Llocs', href: '/llocs' },
    { label: 'Recomanacions', href: '/recomanacions' },
  ]

  return (
    <header className="newyorker-header sticky top-0 z-50">
      {/* Logo y texto superior - visible cuando no está comprimido */}
      {!isCompressed && (
        <div className="header-top-section transition-opacity duration-500 ease-out">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex flex-col items-center space-y-1">
              <img 
                src="/Jara logo.svg" 
                alt="Lletres Bàrbares" 
                className="h-20 w-auto"
              />
              <p className="text-sm md:text-lg text-black-700 font-medium">
                Una revista de cultura, literatura i pensament en català
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="newyorker-nav">
        <div className="flex items-center">
              <img 
                src="/Jara logo petit.svg" 
                alt="Lletres Bàrbares" 
                className={`h-10 w-auto transition-all duration-300 ease-out transform ${
                  isCompressed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'
                }`}
              />
          </div>

        {/* Desktop Navigation */}
        <div className="newyorker-nav-links">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="newyorker-nav-link"
            >
              {item.label}
            </a>
          ))}
        </div>

                {/* Elegant Search (responsive) */}
        <ElegantSearch />

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-newyorker-light-gray">
          <div className="px-6 py-4 space-y-4">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block newyorker-nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 