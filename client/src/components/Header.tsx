import { useState, useEffect } from 'react'
import ElegantSearch from './ElegantSearch'
import JaraLogo from '../assets/Jara logo.svg'
import  JaraLogoPetit from '../assets/Jara logo petit.svg'

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
    { label: 'La Revista', href: '/' },
    // { label: 'Arxiu', href: '/arxiu' },
    { label: 'Autors', href: '/autors' },
    { label: 'Articles', href: '/articles' },
    { label: 'Creació', href: '/creacio' },
    { label: 'Entrevistes', href: '/entrevistes' },
    { label: 'Llibres', href: '/llibres' },
    { label: 'Llocs', href: '/llocs' },
    { label: 'Recomanacions', href: '/recomanacions' },
  ]

  return (
    <div className="newyorker-header-container">
    <header className="newyorker-header">
      <div className="scroll-block" aria-hidden="true"></div>
      <div className="max-w-6xl mx-auto px-6">
        <div className="header-contents">
          <div className="main-navigation-holder">
            <div className="main-navigation">
              <span className="burgerstack-search">
                <ul>
                  <li className="burgerstack">
                    <svg version="1.1" baseProfile="tiny" className="burgerstackIcon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 16" xml:space="preserve"><polygon className="top" fill-rule="evenodd" fill="#313130" points="0,0 20,0 20,2 0,2"></polygon><polygon className="middle" fill-rule="evenodd" fill="#313130" points="0,7 20,7 20,9 0,9"></polygon><polygon className="bottom" fill-rule="evenodd" fill="#313130" points="0,14 20,14 20,16 0,16"></polygon></svg>
                  </li>
                  <li className="search">
                      <ElegantSearch />
                  </li>
                </ul>
              </span>
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
            </div>
            <div className="logo-row">
              <div className="logo">
                
                 <img src={JaraLogo} alt="Lletres Bàrbares" className="h-20 w-auto" /> 
                
              </div>
              <p className=" overflow-hidden h-10 md:block text-sm md:text-lg text-black-700 font-medium transition-all duration-300">
                Una revista de cultura, literatura i pensament en català
              </p>
            </div>
          </div>
        <div className="header-button-editions">
          <a href="/arxiu" className="header-button-edition">
            Ediciones Anteriores
          </a>
        </div>
        </div>
      </div>      {/* Logo y texto superior - visible cuando no está comprimido */}

    </header>
    </div>

  )
}

export default Header 