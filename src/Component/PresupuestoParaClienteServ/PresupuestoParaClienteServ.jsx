import React, { useState } from "react";
import "./PresupuestoParaClienteServ.css"; // Importar el archivo CSS
import Navbar from '../Navbar/Navbar';
import html2pdf from "html2pdf.js";

const PresupuestoParaClienteServ = () => {
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
  const [logo, setLogo] = useState(null); // Estado para almacenar la imagen del logo

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

  // Función para manejar la subida del logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result); // Guardar la imagen en base64
      };
      reader.readAsDataURL(file);
    }
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

    // Guardar resultados internamente
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
        ${logo ? `<div class="logo-container"><img src="${logo}" alt="Logo de la compañía" class="logo" /></div>` : ""}
        <h1>Presupuesto de Servicios</h1>
        <div class="seccion">
          <h2>Información General</h2>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Empresa Vendedora:</strong> ${empresaVendedora.nombre} (RIF: ${empresaVendedora.rif})</p>
          <p><strong>Empresa Compradora:</strong> ${empresaCompradora.nombre} (RIF: ${empresaCompradora.rif})</p>
          <p><strong>Nombre de la Partida:</strong> ${nombrePartida}</p>
          <p><strong>Descripción de la Partida:</strong> ${descripcionPartida}</p>
        </div>

        <!-- Sección de Materiales -->
        <div class="seccion">
          <h2>Materiales</h2>
          <table class="computos-metricos">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Precio Unitario (USD)</th>
                <th>Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${materiales
                .map(
                  (material) => `
                <tr>
                  <td>${material.descripcion}</td>
                  <td>${material.unidad}</td>
                  <td>${material.cantidad}</td>
                  <td>${material.costoUSD}</td>
                  <td>${(material.cantidad * material.costoUSD).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td colspan="4"><strong>Total Materiales</strong></td>
                <td><strong>${totalMateriales.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sección de Mano de Obra -->
        <div class="seccion">
          <h2>Mano de Obra</h2>
          <table class="computos-metricos">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Salario (USD)</th>
                <th>Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${manoDeObra
                .map(
                  (trabajo) => `
                <tr>
                  <td>${trabajo.descripcion}</td>
                  <td>${trabajo.cantidad}</td>
                  <td>${trabajo.salario}</td>
                  <td>${(trabajo.cantidad * trabajo.salario).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td colspan="3"><strong>Total Mano de Obra</strong></td>
                <td><strong>${totalManoDeObra.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sección de Depreciación de Equipos -->
        <div class="seccion">
          <h2>Depreciación de Equipos</h2>
          <table class="computos-metricos">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Monto de Depreciación (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${equipos
                .map(
                  (equipo) => `
                <tr>
                  <td>${equipo.descripcion}</td>
                  <td>${equipo.montoDepreciacionUSD}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td><strong>Total Depreciación de Equipos</strong></td>
                <td><strong>${totalDepreciacionEquiposUSD.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sección de Totales -->
        <div class="seccion">
          <h2>Totales</h2>
          <table class="computos-metricos">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Valor (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Materiales</td>
                <td>${totalMateriales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Mano de Obra</td>
                <td>${totalManoDeObra.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Depreciación de Equipos</td>
                <td>${totalDepreciacionEquiposUSD.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Precio Unitario Directo</strong></td>
                <td><strong>${precioUnitarioDirecto.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Administración y Gastos Generales (${porcentajes.administracionGastos}%)</td>
                <td>${administracionGastos.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Sub-Total Unitario</strong></td>
                <td><strong>${subTotalUnitario.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Utilidad e Imprevistos (${porcentajes.utilidadImprevistos}%)</td>
                <td>${utilidadImprevistos.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Total Precio Unitario</strong></td>
                <td><strong>${totalPrecioUnitario.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>IVA (${porcentajes.iva}%)</td>
                <td>${iva.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Total de la Partida</strong></td>
                <td><strong>${totalPartida.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sección de Condiciones -->
        <div class="seccion">
          <h2>Condiciones del Servicio</h2>
          <p>${condiciones}</p>
        </div>
      </div>
    `;
    setPresupuestoTexto(textoPresupuesto);
  };

  // Función para preparar el elemento antes de generar el PDF
  const prepareElementForPDF = (element) => {
    // Crear una hoja de estilos temporal para la impresión
    const styleSheet = document.createElement('style');
    styleSheet.id = 'pdf-styles';
    styleSheet.textContent = `
      .presupuesto-container {
        width: 100% !important;
        max-width: 215.9mm !important; /* Ancho de carta */
        margin: 0 auto !important;
        padding: 0 !important;
        font-size: 11pt !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      
      .presupuesto-container h1 {
        font-size: 16pt !important;
        margin-bottom: 15px !important;
      }
      
      .presupuesto-container h2 {
        font-size: 14pt !important;
        margin-top: 20px !important;
        margin-bottom: 10px !important;
      }
      
      .presupuesto-container p {
        font-size: 10pt !important;
        margin: 5px 0 !important;
        word-wrap: break-word !important;
      }
      
      .seccion {
        margin-bottom: 15mm !important;
        page-break-inside: avoid !important;
        width: 100% !important;
      }
      
      .computos-metricos {
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        page-break-inside: auto !important;
        font-size: 9pt !important;
      }
      
      .computos-metricos th, .computos-metricos td {
        padding: 4px !important;
        font-size: 9pt !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 150px !important;
      }
      
      .computos-metricos tr {
        page-break-inside: avoid !important;
      }
      
      .logo-container {
        text-align: center !important;
        margin-bottom: 10mm !important;
      }
      
      .logo {
        max-width: 120px !important;
        max-height: 80px !important;
      }
    `;
    document.head.appendChild(styleSheet);
    
    // También podemos modificar directamente el DOM para ajustar tablas muy anchas
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
      // Guardar el ancho original
      table.dataset.originalWidth = table.style.width || '';
      
      // Aplicar ajustes
      table.style.width = '100%';
      table.style.tableLayout = 'fixed';
      
      // Añadir clases para control de flujo
      table.classList.add('pdf-optimized-table');
    });
  };

  // Función para restaurar los elementos después de generar el PDF
  const restoreElementAfterPDF = (element) => {
    // Eliminar la hoja de estilos temporal
    const styleSheet = document.getElementById('pdf-styles');
    if (styleSheet) {
      document.head.removeChild(styleSheet);
    }
    
    // Restaurar los anchos originales de las tablas
    const tables = element.querySelectorAll('.pdf-optimized-table');
    tables.forEach(table => {
      if (table.dataset.originalWidth) {
        table.style.width = table.dataset.originalWidth;
        table.style.tableLayout = '';
        table.classList.remove('pdf-optimized-table');
      }
    });
  };

  // Función mejorada para descargar el presupuesto en PDF
  const descargarPDF = () => {
    const element = document.querySelector(".presupuesto-generado");
    if (element) {
      // Preparamos el elemento para la impresión
      prepareElementForPDF(element);
      
      // Opciones avanzadas para formato carta y control de desbordamiento
      const options = {
        margin: [15, 15, 15, 15], // Márgenes en mm [superior, izquierdo, inferior, derecho]
        filename: "presupuesto_servicio.pdf",
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before'
        }
      };

      html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
          // Restaurar estilos originales si es necesario
          restoreElementAfterPDF(element);
        });
    }
  };

  // Estilo para centrar inputs específicos
  const centeredInputStyle = {
    textAlign: 'center',
    maxWidth: '70%',
    margin: '0 auto',
    display: 'block'
  };
  
  // Estilo para labels centrados
  const centeredLabelStyle = {
    textAlign: 'center'
  };

  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>

      <h1>Presupuesto de Servicios</h1>

      {/* Sección para subir el logo */}
      <div className="form-section fade-in">
        <h2>Logo de la Compañía</h2>
        <div style={{textAlign: 'center'}}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleLogoChange}
            style={{margin: '0 auto', display: 'block'}}
          />
        </div>
        {logo && (
          <div className="logo-preview text-center mt-4">
            <img src={logo} alt="Vista previa del logo" style={{ maxHeight: '100px' }} />
          </div>
        )}
      </div>

      {/* Sección de Información General */}
      <div className="form-section fade-in">
        <h2>Información General</h2>
        <div style={centeredLabelStyle}>
          <label>
            Fecha:
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            Nombre de la empresa vendedora:
            <input
              type="text"
              value={empresaVendedora.nombre}
              onChange={(e) => setEmpresaVendedora({ ...empresaVendedora, nombre: e.target.value })}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            RIF de la empresa vendedora:
            <input
              type="text"
              value={empresaVendedora.rif}
              onChange={(e) => setEmpresaVendedora({ ...empresaVendedora, rif: e.target.value })}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            Nombre de la empresa compradora:
            <input
              type="text"
              value={empresaCompradora.nombre}
              onChange={(e) => setEmpresaCompradora({ ...empresaCompradora, nombre: e.target.value })}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            RIF de la empresa compradora:
            <input
              type="text"
              value={empresaCompradora.rif}
              onChange={(e) => setEmpresaCompradora({ ...empresaCompradora, rif: e.target.value })}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            Nombre de la partida:
            <input
              type="text"
              value={nombrePartida}
              onChange={(e) => setNombrePartida(e.target.value)}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            Descripción de la partida:
            <textarea
              value={descripcionPartida}
              onChange={(e) => setDescripcionPartida(e.target.value)}
              rows={6}
              placeholder="Describa en qué consiste la partida."
              style={centeredInputStyle}
            />
          </label>
        </div>
      </div>

      {/* Sección de Materiales */}
      <div className="form-section fade-in">
        <h2>Materiales</h2>
        <div style={{textAlign: 'center'}}>
          <button onClick={agregarMaterial} className="mt-4 mb-4">Agregar Material</button>
        </div>
        
        {materiales.length === 0 && (
          <div className="text-center mt-4 mb-4" style={{ color: 'var(--neutral-600)' }}>
            Añada materiales para su presupuesto haciendo clic en el botón superior.
          </div>
        )}
        
        {materiales.map((material, index) => (
          <div key={index} className="input-group slide-up">
            <h3>Material {index + 1}</h3>
            <div style={centeredLabelStyle}>
              <label>
                Descripción:
                <input
                  type="text"
                  value={material.descripcion}
                  onChange={(e) => handleMaterialChange(index, "descripcion", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Unidad:
                <input
                  type="text"
                  value={material.unidad}
                  onChange={(e) => handleMaterialChange(index, "unidad", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Cantidad:
                <input
                  type="number"
                  value={material.cantidad}
                  onChange={(e) => handleMaterialChange(index, "cantidad", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Precio Unitario (USD):
                <input
                  type="number"
                  value={material.costoUSD}
                  onChange={(e) => handleMaterialChange(index, "costoUSD", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Mano de Obra */}
      <div className="form-section fade-in">
        <h2>Mano de Obra</h2>
        <div style={{textAlign: 'center'}}>
          <button onClick={agregarManoDeObra} className="mt-4 mb-4">Agregar Mano de Obra</button>
        </div>
        
        {manoDeObra.length === 0 && (
          <div className="text-center mt-4 mb-4" style={{ color: 'var(--neutral-600)' }}>
            Añada trabajadores para su presupuesto haciendo clic en el botón superior.
          </div>
        )}
        
        {manoDeObra.map((trabajo, index) => (
          <div key={index} className="input-group slide-up">
            <h3>Trabajo {index + 1}</h3>
            <div style={centeredLabelStyle}>
              <label>
                Descripción:
                <input
                  type="text"
                  value={trabajo.descripcion}
                  onChange={(e) => handleManoDeObraChange(index, "descripcion", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Cantidad:
                <input
                  type="number"
                  value={trabajo.cantidad}
                  onChange={(e) => handleManoDeObraChange(index, "cantidad", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Salario (USD):
                <input
                  type="number"
                  value={trabajo.salario}
                  onChange={(e) => handleManoDeObraChange(index, "salario", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Equipos */}
      <div className="form-section fade-in">
        <h2>Equipos</h2>
        <div style={{textAlign: 'center'}}>
          <button onClick={agregarEquipo} className="mt-4 mb-4">Agregar Equipo</button>
        </div>
        
        {equipos.length === 0 && (
          <div className="text-center mt-4 mb-4" style={{ color: 'var(--neutral-600)' }}>
            Añada equipos para su presupuesto haciendo clic en el botón superior.
          </div>
        )}
        
        {equipos.map((equipo, index) => (
          <div key={index} className="input-group slide-up">
            <h3>Equipo {index + 1}</h3>
            <div style={centeredLabelStyle}>
              <label>
                Descripción:
                <input
                  type="text"
                  value={equipo.descripcion}
                  onChange={(e) => handleEquipoChange(index, "descripcion", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
            <div style={centeredLabelStyle}>
              <label>
                Monto de Depreciación (USD):
                <input
                  type="number"
                  value={equipo.montoDepreciacionUSD}
                  onChange={(e) => handleEquipoChange(index, "montoDepreciacionUSD", e.target.value)}
                  style={centeredInputStyle}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Porcentajes */}
      <div className="form-section fade-in">
        <h2>Porcentajes</h2>
        <div style={centeredLabelStyle}>
          <label>
            Administración y Gastos Generales (%):
            <input
              type="number"
              value={porcentajes.administracionGastos}
              onChange={(e) => handlePorcentajesChange("administracionGastos", e.target.value)}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            Utilidad e Imprevistos (%):
            <input
              type="number"
              value={porcentajes.utilidadImprevistos}
              onChange={(e) => handlePorcentajesChange("utilidadImprevistos", e.target.value)}
              style={centeredInputStyle}
            />
          </label>
        </div>
        <div style={centeredLabelStyle}>
          <label>
            IVA (%):
            <input
              type="number"
              value={porcentajes.iva}
              onChange={(e) => handlePorcentajesChange("iva", e.target.value)}
              style={centeredInputStyle}
            />
          </label>
        </div>
      </div>

      {/* Sección de Condiciones */}
      <div className="form-section fade-in">
        <h2>Condiciones del Servicio</h2>
        <div style={centeredLabelStyle}>
          <label>
            Condiciones (opcional):
            <textarea
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              rows={6}
              placeholder="Ingrese las condiciones del servicio, si aplican."
              style={centeredInputStyle}
            />
          </label>
        </div>
      </div>

      {/* Botones de acción */}
      <div style={{textAlign: 'center'}}>
        <button className="calculate-button" onClick={calcularPresupuesto}>Calcular Presupuesto</button>
        
        {presupuestoTexto && (
          <button className="download-button" onClick={descargarPDF}>Descargar Presupuesto en PDF</button>
        )}
      </div>

      {/* Mostrar el presupuesto generado */}
      {presupuestoTexto && (
        <div className="presupuesto-generado slide-up" dangerouslySetInnerHTML={{ __html: presupuestoTexto }} />
      )}

      {/* Mostrar los resultados del presupuesto en una tabla aparte */}
      {resultados && (
        <div className="resultados-container slide-up">
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

export default PresupuestoParaClienteServ;