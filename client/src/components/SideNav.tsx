import { Link, useLocation } from 'react-router-dom'
import Logo from '../assets/icon.svg'
import './SideNav.css'

interface SideNavProps {
  isOpen: boolean
  onClose: () => void
}

const SideNav = ({ isOpen, onClose }: SideNavProps) => {
  const location = useLocation()

  const navigationItems = [
    { path: '/', label: 'La revista' },
    { path: '/articles', label: 'Articles' },
    { path: '/creacio', label: 'Creació' },
    { path: '/entrevistes', label: 'Entrevistes' },
    { path: '/llibres', label: 'Llibres' },
    { path: '/llocs', label: 'Llocs' },
    { path: '/recomanacions', label: 'Recomanacions' },
    { path: '/arxiu', label: 'Edicions anteriors' },
    { path: '/autors', label: 'Autors' }
  ]

  return (
    <>
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isOpen && <div className="sidenav-overlay" onClick={onClose} />}
      
      <nav className={`sidenav ${isOpen ? 'sidenav--open' : ''}`}>
        {/* Header con botón de cierre */}
        <div className="sidenav__header">
          <img src={Logo} alt="Logo" className="sidenav__logo" />
          <button 
            className="sidenav__close-btn"
            onClick={onClose}
            aria-label="Tancar menú"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Lista de navegación */}
        <ul className="sidenav__list">
          {navigationItems.map((item) => (
            <li key={item.path} className="sidenav__item">
              <Link
                to={item.path}
                className={`sidenav__link ${
                  location.pathname === item.path ? 'sidenav__link--active' : ''
                }`}
                onClick={onClose}
              >
                <span className="sidenav__label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer del SideNav */}
        <div className="sidenav__footer">
          <p className="sidenav__copyright">
            © 2025 Lletres Bàrbares
          </p>
        </div>
      </nav>
    </>
  )
}

export default SideNav