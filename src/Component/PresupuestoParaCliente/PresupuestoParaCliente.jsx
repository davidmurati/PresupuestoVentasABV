import React, { useState } from "react";
import "./PresupuestoParaCLiente.css"; // Importar el archivo CSS
import Navbar from '../Navbar/Navbar';
import html2pdf from "html2pdf.js";

const PresupuestoParaCLiente = () => {
  // Estados para los datos del usuario
  const [fecha, setFecha] = useState("");
  const [empresaVendedora, setEmpresaVendedora] = useState({ nombre: "", rif: "" });
  const [empresaCompradora, setEmpresaCompradora] = useState({ nombre: "", rif: "" });
  const [nombrePartida, setNombrePartida] = useState("");
  const [descripcionPartida, setDescripcionPartida] = useState("");
  const [materiales, setMateriales] = useState([]);
  const [manoDeObra, setManoDeObra] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [porcentajes, setPorcentajes] = useState({
    administracionGastos: 10, // 10%
    utilidadImprevistos: 15, // 15%
    iva: 16, // 16%
  });
  const [resultados, setResultados] = useState(null);
  const [presupuestoTexto, setPresupuestoTexto] = useState("");
  const [condiciones, setCondiciones] = useState("");

  // Funciones para agregar materiales, mano de obra y equipos
  const agregarMaterial = () => {
    setMateriales([...materiales, { descripcion: "", unidad: "", cantidad: "", costoUSD: "" }]);
  };

  const agregarManoDeObra = () => {
    setManoDeObra([...manoDeObra, { descripcion: "", cantidad: "", salario: "" }]);
  };

  const agregarEquipo = () => {
    setEquipos([...equipos, { descripcion: "", montoDepreciacionUSD: "" }]);
  };

  // Funciones para manejar cambios en materiales, mano de obra y equipos
  const handleMaterialChange = (index, field, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index][field] = value;
    setMateriales(nuevosMateriales);
  };

  const handleManoDeObraChange = (index, field, value) => {
    const nuevaManoDeObra = [...manoDeObra];
    nuevaManoDeObra[index][field] = value;
    setManoDeObra(nuevaManoDeObra);
  };

  const handleEquipoChange = (index, field, value) => {
    const nuevosEquipos = [...equipos];
    nuevosEquipos[index][field] = value;
    setEquipos(nuevosEquipos);
  };

  const handlePorcentajesChange = (field, value) => {
    setPorcentajes({ ...porcentajes, [field]: parseFloat(value) || 0 });
  };

  // Función para calcular el presupuesto
  const calcularPresupuesto = () => {
    const totalMateriales = materiales.reduce((total, material) => {
      const cantidad = parseFloat(material.cantidad) || 0;
      const costoUSD = parseFloat(material.costoUSD) || 0;
      return total + cantidad * costoUSD;
    }, 0);

    const totalManoDeObra = manoDeObra.reduce((total, trabajo) => {
      const cantidad = parseFloat(trabajo.cantidad) || 0;
      const salario = parseFloat(trabajo.salario) || 0;
      return total + cantidad * salario;
    }, 0);

    const totalDepreciacionEquiposUSD = equipos.reduce((total, equipo) => {
      const montoDepreciacionUSD = parseFloat(equipo.montoDepreciacionUSD) || 0;
      return total + montoDepreciacionUSD;
    }, 0);

    const precioUnitarioDirecto = totalMateriales + totalManoDeObra + totalDepreciacionEquiposUSD;
    const administracionGastos = (precioUnitarioDirecto * porcentajes.administracionGastos) / 100;
    const subTotalUnitario = precioUnitarioDirecto + administracionGastos;
    const utilidadImprevistos = (subTotalUnitario * porcentajes.utilidadImprevistos) / 100;
    const totalPrecioUnitario = subTotalUnitario + utilidadImprevistos;
    const iva = (totalPrecioUnitario * porcentajes.iva) / 100;
    const totalPartida = totalPrecioUnitario + iva;

    // Guardar resultados internamente (no se mostrarán en el documento final)
    setResultados({
      precioUnitarioDirecto,
      administracionGastos,
      subTotalUnitario,
      utilidadImprevistos,
      totalPrecioUnitario,
      iva,
      totalPartida,
      totalDepreciacionEquiposUSD,
    });

    // Generar el texto del presupuesto con formato profesional
    const textoPresupuesto = `
      <div class="presupuesto-container">
        <h1>Presupuesto de Ventas</h1>
        <div class="seccion">
          <h2>Información General</h2>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Empresa Vendedora:</strong> ${empresaVendedora.nombre} (RIF: ${empresaVendedora.rif})</p>
          <p><strong>Empresa Compradora:</strong> ${empresaCompradora.nombre} (RIF: ${empresaCompradora.rif})</p>
          <p><strong>Nombre de la Partida:</strong> ${nombrePartida}</p>
          <p><strong>Descripción de la Partida:</strong> ${descripcionPartida}</p>
        </div>

        <div class="seccion">
          <h2>Cómputos Métricos</h2>
          <table class="computos-metricos">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Valor (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Precio Unitario</td>
                <td>${totalPrecioUnitario.toFixed(2)}</td>
              </tr>
              <tr>
                <td>IVA</td>
                <td>${iva.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total de la Partida</td>
                <td>${totalPartida.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="seccion">
          <h2>Condiciones del Servicio</h2>
          <p>${condiciones}</p>
        </div>
      </div>
    `;
    setPresupuestoTexto(textoPresupuesto);
  };

  // Función para descargar el presupuesto en PDF
  const descargarPDF = () => {
    const element = document.querySelector(".presupuesto-generado");
    if (element) {
      html2pdf()
        .from(element)
        .save("presupuesto.pdf");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>

      <h1>Presupuesto de Ventas</h1>

      {/* Sección de Información General */}
      <div>
        <h2>Información General</h2>
        <label>
          Fecha:
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label>
          Nombre de la empresa vendedora:
          <input
            type="text"
            value={empresaVendedora.nombre}
            onChange={(e) => setEmpresaVendedora({ ...empresaVendedora, nombre: e.target.value })}
          />
        </label>
        <label>
          RIF de la empresa vendedora:
          <input
            type="text"
            value={empresaVendedora.rif}
            onChange={(e) => setEmpresaVendedora({ ...empresaVendedora, rif: e.target.value })}
          />
        </label>
        <label>
          Nombre de la empresa compradora:
          <input
            type="text"
            value={empresaCompradora.nombre}
            onChange={(e) => setEmpresaCompradora({ ...empresaCompradora, nombre: e.target.value })}
          />
        </label>
        <label>
          RIF de la empresa compradora:
          <input
            type="text"
            value={empresaCompradora.rif}
            onChange={(e) => setEmpresaCompradora({ ...empresaCompradora, rif: e.target.value })}
          />
        </label>
        <label>
          Nombre de la partida:
          <input
            type="text"
            value={nombrePartida}
            onChange={(e) => setNombrePartida(e.target.value)}
          />
        </label>
        <label>
          Descripción de la partida:
          <textarea
            value={descripcionPartida}
            onChange={(e) => setDescripcionPartida(e.target.value)}
            rows={4}
            cols={80}
            placeholder="Describa en qué consiste la partida."
          />
        </label>
      </div>

      {/* Sección de Materiales */}
      <div>
        <h2>Materiales</h2>
        <button onClick={agregarMaterial}>Agregar Material</button>
        {materiales.map((material, index) => (
          <div key={index} className="material-section">
            <h3>Material {index + 1}</h3>
            <label>
              Descripción:
              <input
                type="text"
                value={material.descripcion}
                onChange={(e) => handleMaterialChange(index, "descripcion", e.target.value)}
              />
            </label>
            <label>
              Unidad:
              <input
                type="text"
                value={material.unidad}
                onChange={(e) => handleMaterialChange(index, "unidad", e.target.value)}
              />
            </label>
            <label>
              Cantidad:
              <input
                type="number"
                value={material.cantidad}
                onChange={(e) => handleMaterialChange(index, "cantidad", e.target.value)}
              />
            </label>
            <label>
              Precio Unitario (USD):
              <input
                type="number"
                value={material.costoUSD}
                onChange={(e) => handleMaterialChange(index, "costoUSD", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Sección de Mano de Obra */}
      <div>
        <h2>Mano de Obra</h2>
        <button onClick={agregarManoDeObra}>Agregar Mano de Obra</button>
        {manoDeObra.map((trabajo, index) => (
          <div key={index} className="mano-de-obra-section">
            <h3>Trabajo {index + 1}</h3>
            <label>
              Descripción:
              <input
                type="text"
                value={trabajo.descripcion}
                onChange={(e) => handleManoDeObraChange(index, "descripcion", e.target.value)}
              />
            </label>
            <label>
              Cantidad:
              <input
                type="number"
                value={trabajo.cantidad}
                onChange={(e) => handleManoDeObraChange(index, "cantidad", e.target.value)}
              />
            </label>
            <label>
              Salario (USD):
              <input
                type="number"
                value={trabajo.salario}
                onChange={(e) => handleManoDeObraChange(index, "salario", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Sección de Equipos */}
      <div>
        <h2>Equipos</h2>
        <button onClick={agregarEquipo}>Agregar Equipo</button>
        {equipos.map((equipo, index) => (
          <div key={index} className="equipo-section">
            <h3>Equipo {index + 1}</h3>
            <label>
              Descripción:
              <input
                type="text"
                value={equipo.descripcion}
                onChange={(e) => handleEquipoChange(index, "descripcion", e.target.value)}
              />
            </label>
            <label>
              Monto de Depreciación (USD):
              <input
                type="number"
                value={equipo.montoDepreciacionUSD}
                onChange={(e) => handleEquipoChange(index, "montoDepreciacionUSD", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Sección de Porcentajes */}
      <div>
        <h2>Porcentajes</h2>
        <label>
          Administración y Gastos Generales (%):
          <input
            type="number"
            value={porcentajes.administracionGastos}
            onChange={(e) => handlePorcentajesChange("administracionGastos", e.target.value)}
          />
        </label>
        <label>
          Utilidad e Imprevistos (%):
          <input
            type="number"
            value={porcentajes.utilidadImprevistos}
            onChange={(e) => handlePorcentajesChange("utilidadImprevistos", e.target.value)}
          />
        </label>
        <label>
          IVA (%):
          <input
            type="number"
            value={porcentajes.iva}
            onChange={(e) => handlePorcentajesChange("iva", e.target.value)}
          />
        </label>
      </div>

      {/* Sección de Condiciones */}
      <div>
        <h2>Condiciones del Presupuesto</h2>
        <label>
          Condiciones (opcional):
          <textarea
            value={condiciones}
            onChange={(e) => setCondiciones(e.target.value)}
            rows={4}
            cols={80}
            placeholder="Ingrese las condiciones del presupuesto, si aplican."
          />
        </label>
      </div>

      {/* Botón para calcular el presupuesto */}
      <button onClick={calcularPresupuesto}>Calcular Presupuesto</button>

      {/* Botón para descargar el presupuesto en PDF */}
      <button onClick={descargarPDF}>Descargar Presupuesto en PDF</button>

      {/* Mostrar el presupuesto generado */}
      {presupuestoTexto && (
        <div className="presupuesto-generado" dangerouslySetInnerHTML={{ __html: presupuestoTexto }} />
      )}

      {/* Mostrar los resultados del presupuesto en una tabla aparte */}
      {resultados && (
        <div className="resultados-container">
          <h2>Resultados del Presupuesto</h2>
          <table className="resultados">
            <tbody>
              <tr>
                <td>Precio Unitario Directo</td>
                <td>${resultados.precioUnitarioDirecto.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Administración y Gastos Generales</td>
                <td>${resultados.administracionGastos.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Sub-Total Unitario</td>
                <td>${resultados.subTotalUnitario.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Utilidad e Imprevistos</td>
                <td>${resultados.utilidadImprevistos.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Precio Unitario</td>
                <td>${resultados.totalPrecioUnitario.toFixed(2)}</td>
              </tr>
              <tr>
                <td>IVA</td>
                <td>${resultados.iva.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total de la Partida</td>
                <td>${resultados.totalPartida.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Depreciación de Equipos</td>
                <td>${resultados.totalDepreciacionEquiposUSD.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PresupuestoParaCLiente;