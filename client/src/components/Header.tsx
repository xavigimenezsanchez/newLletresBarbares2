import { useState } from 'react'
import ElegantSearch from './ElegantSearch'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      <nav className="newyorker-nav">
        <div className="flex items-center">
            <img src="/logo4.svg" alt="Lletres Bàrbares" className="h-10 w-auto" />
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