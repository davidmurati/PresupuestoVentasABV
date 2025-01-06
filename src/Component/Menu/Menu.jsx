import React, { useState } from "react";
import "./Menu.css";
import Footer from '../Footer/Footer';


function menu() {
  const [selectedTest, setSelectedTest] = useState(null);

  const handleTestSelection = (test) => {
    setSelectedTest(test);
  };

  return (
    <div className="app-container">
      <div className="welcome-message">
        <h1>¡Bienvenido al programa Presupuesto!</h1>

        <p>Selecciona una de las modalidades para hacer presupuesto para comenzar. ¡Te deseamos mucho éxito!</p>
        
      </div>

      <button className="boton1" onClick={() => window.location.href = "/PresupuestoVentas"}>
        Presupuesto Ventas
        </button>
        <button className="boton1" onClick={() => window.location.href = "/ConvertirArchivo"}>
        Construir el archivo VentasGastos para calcular presupuesto
        </button>

        <Footer />
    </div>
    
  );
}

export default menu;