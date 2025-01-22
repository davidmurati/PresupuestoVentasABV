import { useState, useEffect  } from 'react'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch  } from "react-router-dom";
import Menu from "./Component/Menu/Menu";
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
