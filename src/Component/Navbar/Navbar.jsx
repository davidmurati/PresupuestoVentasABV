import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
     
      <ul>
        <li><a href="/" exact>Inicio</a></li>
        <li><a href="/Presupuestoasadoenventas1">P I Ventas</a></li>
        <li><a href="/PresupuestoParaCliente">P Clientes</a></li>
        
      </ul>
    </nav>
  );
}

export default Navbar;