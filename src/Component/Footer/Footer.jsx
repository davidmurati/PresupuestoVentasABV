import React from 'react';
import './Footer.css';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-container">
      <p className="footer-text">
        &copy; {currentYear} Sistema de Presupuestos. Todos los derechos reservados.
      </p>
      <p className="footer-text" style={{marginTop: '10px', fontSize: '13px'}}>
        Desarrollado por David Murati
      </p>
      
      {/* Puedes añadir enlaces útiles si lo deseas */}
      <div className="footer-links">
        <a href="/ayuda">Ayuda</a>
        <a href="/contacto">Contacto</a>
        <a href="/terminos">Términos de Uso</a>
      </div>
      
      {/* Redes sociales - opcional */}
      <div className="footer-social">
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          <FaLinkedin />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          <FaGithub />
        </a>
        <a href="mailto:info@example.com" className="social-icon">
          <FaEnvelope />
        </a>
      </div>
    </footer>
  );
}

export default Footer;