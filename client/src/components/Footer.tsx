const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="newyorker-footer">
      <div className="newyorker-footer-content">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-display mb-4">Lletres Barbares</h3>
            <p className="text-gray-300 leading-relaxed">
              Revista mensual de cultura, literatura i pensament. 
              Un espai per a la reflexió i el debat intel·lectual.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans font-medium mb-4 text-white">Seccions</h4>
            <ul className="space-y-2">
              <li><a href="/articles" className="text-gray-300 hover:text-white transition-colors">Articles</a></li>
              <li><a href="/creacio" className="text-gray-300 hover:text-white transition-colors">Creació</a></li>
              <li><a href="/entrevistes" className="text-gray-300 hover:text-white transition-colors">Entrevistes</a></li>
              <li><a href="/llibres" className="text-gray-300 hover:text-white transition-colors">Llibres</a></li>
              <li><a href="/llocs" className="text-gray-300 hover:text-white transition-colors">Llocs</a></li>
              <li><a href="/recomanacions" className="text-gray-300 hover:text-white transition-colors">Recomanacions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-medium mb-4 text-white">Arxiu</h4>
            <ul className="space-y-2">
              <li><a href="/arxiu/2024" className="text-gray-300 hover:text-white transition-colors">2024</a></li>
              <li><a href="/arxiu/2023" className="text-gray-300 hover:text-white transition-colors">2023</a></li>
              <li><a href="/arxiu/2022" className="text-gray-300 hover:text-white transition-colors">2022</a></li>
              <li><a href="/arxiu/2021" className="text-gray-300 hover:text-white transition-colors">2021</a></li>
              <li><a href="/arxiu/2020" className="text-gray-300 hover:text-white transition-colors">2020</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-medium mb-4">Contacte</h4>
            <ul className="space-y-2 text-gray-300">
              <li>info@lletresbarbares.cat</li>
              <li>Redacció i administració</li>
              <li>ISSN: 1234-5678</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} Lletres Barbares. Tots els drets reservats.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 