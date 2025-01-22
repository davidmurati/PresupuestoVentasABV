import { useState, useEffect  } from 'react'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch  } from "react-router-dom";
import Menu from "./Component/Menu/Menu";
import PresupuestoVentas from "./Component/PresupuestoVentas/PresupuestoVentas";
import EstimarPresupuestoVentas from "./Component/PresupuestoVentas/EstimarPresupuestoVentas";
import ConvertirArchivo from "./Component/ConvertirArchivo/ConvertirArchivo";
import ConsultaIA from "./Component/Consulta/ConsultaIA";
import PresupuestoParaCliente from "./Component/PresupuestoParaCliente/PresupuestoParaCliente";
import PresupuestoParaClienteServ from "./Component/PresupuestoParaClienteServ/PresupuestoParaClienteServ";
import Presupuestoasadoenventas1 from "./Component/Presupuestoasadoenventas1/Presupuestoasadoenventas1";

function App() {

  
  return (
    <div className="container">
    <Router>
     <Switch>
        <Route exact path="/">
          <Menu />
        </Route>
        <Route exact path="/PresupuestoVentas">
          <PresupuestoVentas />
        </Route>
        <Route exact path="/EstimarPresupuestoVentas">
          <EstimarPresupuestoVentas />
        </Route>
        <Route exact path="/ConvertirArchivo">
          <ConvertirArchivo />
        </Route>
        <Route exact path="/ConsultaIA">
          <ConsultaIA />
        </Route>
        <Route exact path="/PresupuestoParaCliente">
          <PresupuestoParaCliente />
        </Route>
        <Route exact path="/PresupuestoParaClienteServ">
          <PresupuestoParaClienteServ />
        </Route>
        <Route exact path="/Presupuestoasadoenventas1">
          <Presupuestoasadoenventas1 />
        </Route>
     </Switch>
     </Router>
    </div>
  )
}

export default App
