import React from "react";
import "./Menu.css";
import Footer from '../Footer/Footer';
import { FaChartLine, FaBoxOpen, FaTools } from 'react-icons/fa';

function Menu() {
  return (
    <div className="app-container">
      <div className="welcome-message">
        <h1>Bienvenido al Sistema de Presupuestos</h1>
        <p>
          Seleccione una de las siguientes opciones para comenzar a gestionar sus presupuestos.
          Nuestra plataforma le ofrece herramientas profesionales para optimizar sus recursos y maximizar resultados.
        </p>
      </div>

      <div className="buttons-container">
        <button 
          className="boton1" 
          onClick={() => window.location.href = "/Presupuestoasadoenventas1"}
        >
          <div className="boton-content">
            <FaChartLine className="menu-icon" />
            <div className="button-text">
              <span className="button-title">Presupuesto Interno basado en Ventas</span>
            </div>
          </div>
        </button>

        <button 
          className="boton1" 
          onClick={() => window.location.href = "/PresupuestoParaCliente"}
        >
          <div className="boton-content">
            <FaBoxOpen className="menu-icon" />
            <div className="button-text">
              <span className="button-title">Presupuesto para Cliente - Materiales</span>
            </div>
          </div>
        </button>

        <button 
          className="boton1" 
          onClick={() => window.location.href = "/PresupuestoParaClienteServ"}
        >
          <div className="boton-content">
            <FaTools className="menu-icon" />
            <div className="button-text">
              <span className="button-title">Presupuesto para Cliente - Servicios</span>
            </div>
          </div>
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Menu;