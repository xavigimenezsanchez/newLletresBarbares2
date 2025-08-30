import { useState, useEffect } from 'react'
import ElegantSearch from './ElegantSearch'
import JaraLogo from '../assets/Jara logo.svg'
import Burguer from '../assets/burguer.svg'
import SideNav from './SideNav'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isCompressed, setIsCompressed] = useState(false)
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (y > 120 && !isCompressed) setIsCompressed(true)
          else if (y < 40 && isCompressed) setIsCompressed(false)
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
    <>
      {/* SideNav Component */}
      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      
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
                    <button 
                      onClick={() => setIsSideNavOpen(true)}
                      className="burgerstack-btn"
                      aria-label="Abrir menú"
                    >
                      <img src={Burguer} alt="Burger" className="h-6 w-6 p-1" />
                    </button>
                  </li>
                  <li className="search">
                      <ElegantSearch />
                  </li>
                </ul>
              </span>
              <div className="newyorker-nav-links">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className="newyorker-nav-link"
                  >
                    {item.label}
                  </Link>
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
            Edicions anteriors
          </a>
        </div>
        </div>
      </div>      {/* Logo y texto superior - visible cuando no está comprimido */}

    </header>
    </div>
    </>
  )
}

export default Header 