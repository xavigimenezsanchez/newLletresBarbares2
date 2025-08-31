import { Link } from "react-router-dom"
import instagram from "../assets/instagram.svg"
import twitter from "../assets/twitter.svg"
import youtube from "../assets/youtube.svg"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="newyorker-footer">
      <div className="newyorker-footer-content">
        <div className="grid md:grid-cols-4 gap-16">
          <div>
            <div className="mb-4">
              <img 
                src="/Jara logo footer.svg" 
                alt="Lletres Bàrbares" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              Revista mensual de cultura, literatura i pensament. 
              Un espai per a la reflexió i el debat intel·lectual.
            </p>
          </div>
          
          <div >
            <h4 className="font-sans font-medium mb-4 text-white">Seccions</h4>
            <ul className="space-y-2">
              <li><Link to="/articles" className="text-gray-300 hover:text-white transition-colors">Articles</Link></li>
              <li><Link to="/creacio" className="text-gray-300 hover:text-white transition-colors">Creació</Link></li>
              <li><Link to="/entrevistes" className="text-gray-300 hover:text-white transition-colors">Entrevistes</Link></li>
              <li><Link to="/llibres" className="text-gray-300 hover:text-white transition-colors">Llibres</Link></li>
              <li><Link to="/llocs" className="text-gray-300 hover:text-white transition-colors">Llocs</Link></li>
              <li><Link to="/recomanacions" className="text-gray-300 hover:text-white transition-colors">Recomanacions</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-medium mb-4 text-white">Xarxes Socials</h4>
            <ul className="space-y-2">
              <li><a href="https://www.instagram.com/lletresbarbares/" className="text-gray-300 hover:text-white transition-colors"><img src={instagram} alt="Instagram" className="m-0 md:m-7 w-7" /></a></li>
              <li><a href="https://twitter.com/lletresbarbares" className="text-gray-300 hover:text-white transition-colors"><img src={twitter} alt="Twitter" className="m-0 md:m-7 w-6" /></a></li>
              <li><a href="https://www.youtube.com/@lletresbarbares5962" className="text-gray-300 hover:text-white transition-colors"><img src={youtube} alt="Youtube" className="m-0 md:m-7 w-7" /></a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-medium mb-4">Contacte</h4>
            <ul className="space-y-2 text-gray-300">
              <li>info@lletresbarbares.cat</li>
              <li>Redacció i administració</li>
              {/* <li>ISSN: 1234-5678</li> */}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} Lletres Bàrbares. Tots els drets reservats.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 