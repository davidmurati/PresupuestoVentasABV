import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { FaHome, FaChartBar, FaUserTie, FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cerrar menú al hacer clic en un enlace
  const closeMenu = () => {
    if (window.innerWidth <= 576) {
      setMenuOpen(false);
    }
  };

  // Cerrar menú al redimensionar ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 576 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menú">
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <ul className={menuOpen ? 'open' : ''}>
        <li>
          <a 
            href="/" 
            onClick={closeMenu}
          >
            <FaHome /> Inicio
          </a>
        </li>
        <li>
          <a 
            href="/Presupuestoasadoenventas1" 
            onClick={closeMenu}
          >
            <FaChartBar /> Presupuesto Ventas
          </a>
        </li>
        <li>
          <a 
            href="/PresupuestoParaCliente" 
            onClick={closeMenu}
          >
            <FaUserTie /> Presupuesto Clientes
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;