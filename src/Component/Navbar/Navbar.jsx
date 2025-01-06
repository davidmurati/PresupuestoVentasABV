import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
     
      <ul>
        <li><a href="/" exact>Inicio</a></li>
        <li><a href="/PresupuestoVentas">PresupuestoVentas</a></li>
        <li><a href="/ConvertirArchivo">Generar Archivo VentasGastos</a></li>
        
      </ul>
    </nav>
  );
}

export default Navbar;