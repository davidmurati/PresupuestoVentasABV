import React, { useState } from "react";
import "./EstimarPresupuestoVentas.css"; // Importar el archivo CSS
import Navbar from '../Navbar/Navbar';
import * as XLSX from "xlsx"; // Importar la librería xlsx

const Presupuesto = () => {
  const [jsonData, setJsonData] = useState(null); // Estado para almacenar el JSON cargado
  const [error, setError] = useState(""); // Estado para manejar errores
  const [selectedProduct, setSelectedProduct] = useState(""); // Estado para el producto seleccionado
  const [generatedJson, setGeneratedJson] = useState(null); // Estado para el JSON generado
  const impuestos1=0
  const impuestos2=0


  // Función para manejar la carga del archivo JSON
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setJsonData(data);
          setError("");
          setSelectedProduct(Object.keys(data.Mes2.productos)[0]); // Seleccionar el primer producto por defecto
        } catch (err) {
          setError("El archivo no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Función para calcular el Presupuesto de Ventas
  const calcularPresupuestoVentas = (jsonData) => {
    const presupuestoVentas = {};

    Object.keys(jsonData.Mes2.productos).forEach((key) => {
      const producto = jsonData.Mes2.productos[key];
      const ventasProyectadas = producto.Unidades * producto.Precio_unitario;
      presupuestoVentas[key] = {
        Unidades: producto.Unidades,
        PrecioUnitario: producto.Precio_unitario,
        VentasProyectadas: ventasProyectadas,
      };
    });

    return presupuestoVentas;
  };

  // Función para calcular el Presupuesto de Producción
  const calcularPresupuestoProduccion = (jsonData) => {
    const presupuestoProduccion = {};

    Object.keys(jsonData.Mes2.productos).forEach((key) => {
      const producto = jsonData.Mes2.productos[key];
      const unidadesAProducir = producto.UnidadesAProducir || 0;
      const capacidadUtilizada =
        (unidadesAProducir / (producto.CapacidadMaximaProduccion || 1)) * 100;

      presupuestoProduccion[key] = {
        UnidadesAProducir: unidadesAProducir,
        CapacidadUtilizada: capacidadUtilizada.toFixed(2) + "%",
      };
    });

    return presupuestoProduccion;
  };

  // Función para calcular el Análisis de Costos
  const calcularAnalisisCostos = (jsonData) => {
    const analisisCostos = {};

    Object.keys(jsonData.Mes2.productos).forEach((key) => {
      const producto = jsonData.Mes2.productos[key];
      const costoTotal = producto.Costo_total || 0;
      const margenGanancia = producto.Venta_total - costoTotal;

      analisisCostos[key] = {
        CostoTotal: costoTotal,
        MargenGanancia: margenGanancia,
      };
    });

    return analisisCostos;
  };

  // Función para calcular el Estado de Resultados Proyectado
  const calcularEstadoResultados = (jsonData) => {
    if (!jsonData.Mes2.Totales) {
      console.error("El JSON no tiene la propiedad 'Totales' en Mes2.");
      return {
        Ingresos: 0,
        Costos: 0,
        GastosOperativos: 0,
        Impuestos: 0,
        UtilidadNetaAntesDeImpuestos: 0,
        UtilidadNeta: 0,
      };
    }

    // Tasa de impuesto sobre la renta (ejemplo: 30%)
    const tasaImpuesto1 = ((jsonData.Mes1.ImpuestoSobreLaRenta || 0)-1);
    const tasaImpuesto2 = ((jsonData.Mes2.ImpuestoSobreLaRenta || 0)-1);

    // Calcular la utilidad neta antes de impuestos
    const utilidadNetaAntesDeImpuestos1 =
      (jsonData.Mes1.Totales.Ventas_totales || 0) -
      (jsonData.Mes1.Totales.Costo_de_ventas_totales || 0) -
      (jsonData.Mes1.Totales.Gastos_Operativos_Otros_Costos || 0)+
      (jsonData.Mes1.OtrosProductos || 0);

    // Calcular la utilidad neta antes de impuestos
    const utilidadNetaAntesDeImpuestos2 =
      (jsonData.Mes2.Totales.Ventas_totales || 0) -
      (jsonData.Mes2.Totales.Costo_de_ventas_totales || 0) -
      (jsonData.Mes2.Totales.Gastos_Operativos_Otros_Costos || 0)+
      (jsonData.Mes2.OtrosProductos || 0);

    // Calcular el impuesto sobre la renta
    const impuestos1 = utilidadNetaAntesDeImpuestos1 * tasaImpuesto1;
    const impuestos2 = utilidadNetaAntesDeImpuestos2 * tasaImpuesto2;

    // Calcular la utilidad neta después de impuestos
    const utilidadNeta1 = utilidadNetaAntesDeImpuestos1 - impuestos1;
    const utilidadNeta2 = utilidadNetaAntesDeImpuestos2 - impuestos2;

    // Calcular ingresos totales
    const ingresostotales = (jsonData.Mes2.Totales.Ventas_totales || 0) + (jsonData.Mes2.OtrosProductos || 0);


    const estadoResultados = {
      IngresosAdicionalesMes2: (jsonData.Mes2.OtrosProductos || 0),
      Ingresos: ingresostotales,
      Costos: jsonData.Mes2.Totales.Costo_de_ventas_totales || 0,
      GastosOperativos: jsonData.Mes2.Totales.Gastos_Operativos_Otros_Costos || 0,
      UtilidadNetaAntesDeImpuestos: utilidadNetaAntesDeImpuestos2,
      Impuestos: impuestos2,
      UtilidadNeta: utilidadNeta2,
    };

    return estadoResultados;
  };

  // Función para calcular los Indicadores Financieros Clave
  const calcularIndicadoresFinancieros = (jsonData) => {
    if (!jsonData.Mes1 || !jsonData.Mes2) {
      console.error("El JSON no tiene las propiedades 'Mes1' o 'Mes2'.");
      return {
        MargenGananciaTotal: 0,
        FlujoCajaMes1: 0,
        FlujoCajaMes2: 0,
        CapacidadUtilizadaPromedio: 0,
      };
    }

    //.................bloque reperido porque no lo generalice arriba
    const tasaImpuesto1 = ((jsonData.Mes1.ImpuestoSobreLaRenta || 0)-1);
    const tasaImpuesto2 = ((jsonData.Mes2.ImpuestoSobreLaRenta || 0)-1);
    // Calcular la utilidad neta antes de impuestos
    const utilidadNetaAntesDeImpuestos1 =
      (jsonData.Mes1.Totales.Ventas_totales || 0) -
      (jsonData.Mes1.Totales.Costo_de_ventas_totales || 0) -
      (jsonData.Mes1.Totales.Gastos_Operativos_Otros_Costos || 0)-
      (jsonData.Mes1.OtrosGastos || 0)-
      (jsonData.Mes1.DevolucionesSobreVentas || 0) +
      (jsonData.Mes1.OtrosProductos || 0)-
      (jsonData.Mes1["PagoPrestamo"] || 0);

    // Calcular la utilidad neta antes de impuestos
    const utilidadNetaAntesDeImpuestos2 =
    (jsonData.Mes2.Totales.Ventas_totales || 0) -
    (jsonData.Mes2.Totales.Costo_de_ventas_totales || 0) -
    (jsonData.Mes2.Totales.Gastos_Operativos_Otros_Costos || 0)-
    (jsonData.Mes2.OtrosGastos || 0)-
    (jsonData.Mes2.DevolucionesSobreVentas || 0) +
    (jsonData.Mes2.OtrosProductos || 0)-
    (jsonData.Mes2["PagoPrestamo"] || 0);

    // Calcular el impuesto sobre la renta
    const impuestos1 = utilidadNetaAntesDeImpuestos1 * tasaImpuesto1;
    const impuestos2 = utilidadNetaAntesDeImpuestos2 * tasaImpuesto2;
//.................bloque reperido porque no lo generalice arriba

    const flujoCajaMes1 =
      
    (jsonData.Mes1.Totales?.Ventas_totales || 0) -
      (jsonData.Mes1.Totales?.Costo_de_ventas_totales || 0) -
      (jsonData.Mes1.Totales?.Gastos_Operativos_Otros_Costos || 0) -
      impuestos1 -
      (jsonData.Mes1.OtrosGastos || 0) -
      (jsonData.Mes1.DevolucionesSobreVentas || 0) +
      (jsonData.Mes1.OtrosProductos || 0)-
      (jsonData.Mes1["PagoPrestamo"] || 0); 

    const flujoCajaMes2 =
      
    (jsonData.Mes2.Totales?.Ventas_totales || 0) -
      (jsonData.Mes2.Totales?.Costo_de_ventas_totales || 0) -
      (jsonData.Mes2.Totales?.Gastos_Operativos_Otros_Costos || 0) -
      impuestos2 -
      (jsonData.Mes2.OtrosGastos || 0) -
      (jsonData.Mes2.DevolucionesSobreVentas || 0) +
      (jsonData.Mes2.OtrosProductos || 0)-
      (jsonData.Mes2["PagoPrestamo"] || 0); 


    const flujoCajaTotalMes2 = flujoCajaMes1+flujoCajaMes2

    const indicadores = {
      MargenGananciaTotal:
        (jsonData.Mes2.Totales?.Ventas_totales || 0) - (jsonData.Mes2.Totales?.Costo_de_ventas_totales || 0),
      FlujoCajaMes1: flujoCajaMes1,
      FlujoCajaMes2: flujoCajaMes2,
      FlujoCajaTotalMes2: flujoCajaTotalMes2,
      CapacidadUtilizadaPromedio:
        Object.keys(jsonData.Mes2.productos)
          .reduce((sum, key) => {
            const producto = jsonData.Mes2.productos[key];
            return sum + ((producto.UnidadesAProducir || 0) / (producto.CapacidadMaximaProduccion || 1)) * 100;
          }, 0) /
        Object.keys(jsonData.Mes2.productos).length,
    };

    return indicadores;
  };

  // Función para calcular todo
  const calcularTodo = () => {
    if (!jsonData) {
      setError("No hay datos para calcular.");
      return;
    }

    const presupuestoVentas = calcularPresupuestoVentas(jsonData);
    const presupuestoProduccion = calcularPresupuestoProduccion(jsonData);
    const analisisCostos = calcularAnalisisCostos(jsonData);
    const estadoResultados = calcularEstadoResultados(jsonData);
    const indicadoresFinancieros = calcularIndicadoresFinancieros(jsonData);

    setGeneratedJson({
      PresupuestoVentas: presupuestoVentas,
      PresupuestoProduccion: presupuestoProduccion,
      AnalisisCostos: analisisCostos,
      EstadoResultados: estadoResultados,
      IndicadoresFinancieros: indicadoresFinancieros,
    });
  };

  // Función para exportar a Excel desde las tablas
  const exportTablesToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Función para extraer datos de una tabla
    const extractTableData = (tableId) => {
      const table = document.getElementById(tableId);
      if (!table) return [];

      const rows = table.querySelectorAll("tr");
      const data = [];

      rows.forEach((row, rowIndex) => {
        const rowData = [];
        row.querySelectorAll("th, td").forEach((cell) => {
          rowData.push(cell.innerText);
        });
        data.push(rowData);
      });

      return data;
    };

    // Extraer datos de cada tabla y agregarlos al libro de Excel
    const tables = [
      { id: "presupuesto-ventas-table", sheetName: "Presupuesto Ventas" },
      { id: "presupuesto-produccion-table", sheetName: "Presupuesto Producción" },
      { id: "analisis-costos-table", sheetName: "Análisis de Costos" },
      { id: "estado-resultados-table", sheetName: "Estado de Resultados" },
      { id: "indicadores-financieros-table", sheetName: "Indicadores Financieros" },
    ];

    tables.forEach(({ id, sheetName }) => {
      const tableData = extractTableData(id);
      if (tableData.length > 0) {
        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, "Presupuesto.xlsx");
  };

  // Función para descargar el JSON generado
  const downloadJson = () => {
    if (!generatedJson) {
      setError("No hay datos generados para descargar.");
      return;
    }

    const jsonString = JSON.stringify(generatedJson, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Presupuesto.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // Función para renderizar una tabla genérica
  const renderTable = (data, title, tableId) => {
    if (!data) return null;

    return (
      <div className="table-container">
        <h3>{title}</h3>
        <table id={tableId}>
          <thead>
            <tr>
              <th>Producto</th>
              {Object.keys(data[Object.keys(data)[0]]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((item) => (
              <tr key={item}>
                <td>{item}</td>
                {Object.values(data[item]).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Función para renderizar el estado de resultados
  const renderEstadoResultados = (estadoResultados) => {
    if (!estadoResultados) return null;

    return (
      <div className="table-container">
        <h3>Estado de Resultados Proyectado</h3>
        <table id="estado-resultados-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(estadoResultados).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Función para renderizar los indicadores financieros
  const renderIndicadoresFinancieros = (indicadores) => {
    if (!indicadores) return null;

    return (
      <div className="table-container">
        <h3>Indicadores Financieros Clave</h3>
        <table id="indicadores-financieros-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Margen de Ganancia Total para el mes2</td>
              <td>{indicadores.MargenGananciaTotal}</td>
            </tr>
            <tr>
              <td>Flujo de Caja (Mes1)</td>
              <td>{indicadores.FlujoCajaMes1}</td>
            </tr>
            <tr>
              <td>Flujo de Caja (Mes2)</td>
              <td>{indicadores.FlujoCajaMes2}</td>
            </tr>
            <tr>
              <td>Flujo de Caja Total (Mes2)</td>
              <td>{indicadores.FlujoCajaTotalMes2}</td>
            </tr>
            <tr>
              <td>Capacidad Utilizada Promedio</td>
              <td>{indicadores.CapacidadUtilizadaPromedio.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>

      <h1>Generador de Presupuesto</h1>

      {/* Botón para cargar el archivo JSON */}
      <div>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label htmlFor="fileInput" className="upload-button">
          Cargar Archivo JSON
        </label>
      </div>

      {/* Mostrar errores */}
      {error && <p className="error">{error}</p>}

      {/* Botón para calcular todo */}
      <div className="calculate-button">
        <button onClick={calcularTodo}>Calcular Todo</button>
      </div>

      {/* Mostrar resultados en tablas */}
      {generatedJson && (
        <div className="results">
          {renderTable(generatedJson.PresupuestoVentas, "Presupuesto de Ventas", "presupuesto-ventas-table")}
          {renderTable(generatedJson.PresupuestoProduccion, "Presupuesto de Producción", "presupuesto-produccion-table")}
          {renderTable(generatedJson.AnalisisCostos, "Análisis de Costos", "analisis-costos-table")}
          {renderEstadoResultados(generatedJson.EstadoResultados)}
          {renderIndicadoresFinancieros(generatedJson.IndicadoresFinancieros)}

          {/* Botón para descargar el archivo Excel */}
          <div className="export-button">
            <button onClick={exportTablesToExcel}>Descargar Excel</button>
          </div>

          {/* Botón para descargar el JSON */}
          <div className="export-button">
            <button onClick={downloadJson}>Descargar JSON</button>
          </div>

          <button className="export-button" onClick={() => window.location.href = "/ConsultaIA"}>
            Consultar a la IA sobre la información del JSON
        </button>

          {/* Mostrar el JSON en bruto */}
          <div className="json-display">
            <h3>JSON Generado</h3>
            <pre>{JSON.stringify(generatedJson, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presupuesto;