import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ArxiuPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-newyorker-red">Inici</Link>
            <span className="mx-2">›</span>
            <span>Arxiu</span>
          </nav>
          
          <div className="mb-8">
            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4" style={{ fontFamily: 'TNYAdobeCaslonPro, "Times New Roman", Times, serif' }}>
              Arxiu
            </h1>
            
            {/* Descripción */}
            <p className="text-xl text-gray-600">
              Aquesta és la pàgina d'arxiu de la revista Lletres Barbares. Aquí podràs trobar tots els números publicats organitzats per any i edició.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default ArxiuPage