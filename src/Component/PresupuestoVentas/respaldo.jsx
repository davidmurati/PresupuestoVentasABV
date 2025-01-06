import React, { useState } from "react";
import "./EstimarPresupuestoVentas.css"; // Importar el archivo CSS
import Groq from "groq-sdk";

// Inicializar Groq con la clave de API y habilitar el uso en el navegador
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Habilitar el uso en el navegador
});

const Presupuesto = () => {
  const [jsonData, setJsonData] = useState(null); // Estado para almacenar el JSON cargado
  const [error, setError] = useState(""); // Estado para manejar errores
  const [selectedProduct, setSelectedProduct] = useState(""); // Estado para el producto seleccionado
  const [generatedJson, setGeneratedJson] = useState(null); // Estado para el JSON generado
  const [groqResponse, setGroqResponse] = useState(""); // Estado para la respuesta de Groq

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
          setSelectedProduct(Object.keys(data)[0]); // Seleccionar el primer producto por defecto
        } catch (err) {
          setError("El archivo no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Función para manejar el cambio de producto seleccionado
  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  // Función para generar el JSON con toda la información
  const generateJson = async () => {
    if (!jsonData) {
      setError("No hay datos para generar el JSON.");
      return;
    }

    // Crear una copia del JSON cargado
    const jsonGenerado = JSON.parse(JSON.stringify(jsonData));

    // Calcular el porcentaje de capacidad utilizada para cada producto
    Object.keys(jsonGenerado).forEach((key) => {
      if (
        key !== "Totales" &&
        key !== "FechaActual" &&
        key !== "FechaSiguiente" &&
        key !== "Gastos_Operativos_Otros_Costos"
      ) {
        const producto = jsonGenerado[key];

    // Calcular CantidadEstimadaVender si no está presente
    if (producto.CantidadEstimadaVender === undefined && producto.FactorCrecimiento !== undefined) {
      producto.CantidadEstimadaVender = producto.Unidades * producto.FactorCrecimiento;
    }

    // Calcular el porcentaje de capacidad utilizada
    if (producto.CantidadEstimadaVender !== undefined && producto.CapacidadMaximaProduccion !== undefined) {
      producto["% Capacidad Utilizada"] =
        (producto.CantidadEstimadaVender / producto.CapacidadMaximaProduccion) * 100;
    } else {
      producto["% Capacidad Utilizada"] = 0; // O manejar el caso en que no haya datos suficientes
    }

    
        producto["Margen de Ganancia"] =
          producto.VentaTotalNuevo - producto.CostoTotalNuevo;
      }
    });

    // Calcular el flujo de caja
    const nuevoMargenGananciaTotal =
      jsonGenerado.Totales.NuevasVentasTotales - jsonGenerado.Totales.NuevosCostosTotales;
    const flujoCaja =
      nuevoMargenGananciaTotal -
      (jsonGenerado.FechaActual?.ImpuestoSobreLaRenta || 0) -
      (jsonGenerado.FechaActual?.OtrosGastos || 0) -
      (jsonGenerado.FechaActual?.DevolucionesSobreVentas || 0) -
      (jsonGenerado.FechaActual?.OtrosProductos || 0) -
      (jsonGenerado.FechaSiguiente?.["Pago Prestamo"] || 0) -
      (jsonGenerado.Gastos_Operativos_Otros_Costos || 0);

    // Agregar el flujo de caja al JSON
    jsonGenerado["Flujo de Caja"] = flujoCaja;

    // Actualizar el estado con el JSON generado
    setGeneratedJson(jsonGenerado);

    // Enviar la consulta a Groq con el JSON generado
    await sendGroqQuery(jsonGenerado);
  };

  // Función para enviar la consulta a Groq
  const sendGroqQuery = async (jsonGenerado) => {
    const consulta = `Eres un experto en Contabilidad. Calcula las cantidades optimas a producir para cada producto, determina si el inventario esta bien, determina cuales mejoras son importantes en el plan de venta. Aquí están los datos en formato JSON: ${JSON.stringify(
      jsonGenerado,
      null,
      2
    )}`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: consulta,
          },
        ],
        model: "llama-3.3-70b-versatile",
        max_tokens:1000,
        temperature:0.5,
      });

      const response = chatCompletion.choices[0]?.message?.content || "";
      setGroqResponse(response);
      setError("");
    } catch (err) {
      setError("Error al realizar la consulta a Groq.");
      console.error(err);
    }
  };

  // Función para formatear la respuesta de Groq
  const formatGroqResponse = (response) => {
    // Verificar si la respuesta contiene una tabla en formato Markdown
    if (response.includes("|") && response.includes("-")) {
      const lines = response.split("\n");
      const tableRows = lines.filter((line) => line.includes("|"));

      // Crear la tabla HTML
      return (
        <table className="groq-table">
          <tbody>
            {tableRows.map((row, index) => {
              const cells = row.split("|").map((cell) => cell.trim());
              return (
                <tr key={index}>
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    // Si no es una tabla, mostrar el texto en un formato limpio
    return <pre className="groq-text">{response}</pre>;
  };

  // Función para renderizar la tabla de presupuesto
  const renderPresupuesto = () => {
    if (!jsonData || !selectedProduct) return null;

    // Obtener la información del producto seleccionado
    const producto = jsonData[selectedProduct];

    // Calcular el porcentaje de capacidad utilizada
    const porcentajeCapacidadUtilizada =
      (producto.CantidadEstimadaVender / producto.CapacidadMaximaProduccion) * 100;

    // Calcular el margen de ganancia
    const margenGanancia = producto.NuevasVentasTotales - producto.NuevosCostosTotales;

    // Extraer la información de los totales, gastos y otros datos
    const { Totales, FechaActual, FechaSiguiente, Gastos_Operativos_Otros_Costos } = jsonData;

    // Calcular el viejo Margen de Ganancia Total
    const viejoMargenGananciaTotal = Totales.VentasTotales - Totales.CostosTotales;

    // Calcular el nuevo Margen de Ganancia Total
    const nuevoMargenGananciaTotal = Totales.NuevasVentasTotales - Totales.NuevosCostosTotales;

    // Determinar si las ganancias aumentan o disminuyen
    const comparacionGanancias =
      nuevoMargenGananciaTotal > viejoMargenGananciaTotal
        ? "Aumentan"
        : nuevoMargenGananciaTotal < viejoMargenGananciaTotal
        ? "Disminuyen"
        : "Se mantienen igual";

    // Calcular el flujo de caja
    const flujoCaja =
      nuevoMargenGananciaTotal -
      (FechaActual?.ImpuestoSobreLaRenta || 0) -
      (FechaActual?.OtrosGastos || 0) -
      (FechaActual?.DevolucionesSobreVentas || 0) -
      (FechaActual?.OtrosProductos || 0) -
      (FechaSiguiente?.["Pago Prestamo"] || 0) -
      (Gastos_Operativos_Otros_Costos || 0);

    return (
      <div className="presupuesto-tabla">
        <h2>Presupuesto en Tabla</h2>

        {/* Selector de productos */}
        <div className="product-selector">
          <label htmlFor="productSelect">Seleccionar Producto: </label>
          <select id="productSelect" value={selectedProduct} onChange={handleProductChange}>
            {Object.keys(jsonData)
              .filter(
                (key) =>
                  key !== "Totales" &&
                  key !== "FechaActual" &&
                  key !== "FechaSiguiente" &&
                  key !== "Gastos_Operativos_Otros_Costos"
              )
              .map((productoKey) => (
                <option key={productoKey} value={productoKey}>
                  {productoKey}
                </option>
              ))}
          </select>
        </div>

        {/* Tabla de producto seleccionado (vertical) */}
        <table className="vertical-table">
          <tbody>
            <tr>
              <th>Producto</th>
              <td>{selectedProduct}</td>
            </tr>
            <tr>
              <th>Unidades</th>
              <td>{producto.Unidades}</td>
            </tr>
            <tr>
              <th>Precio Unitario</th>
              <td>${producto.Precio_unitario}</td>
            </tr>
            <tr>
              <th>Costo Unitario</th>
              <td>${producto.Costo_unitario}</td>
            </tr>
            <tr>
              <th>Venta Total</th>
              <td>${producto.Venta_total}</td>
            </tr>
            <tr>
              <th>Costo Total</th>
              <td>${producto.Costo_total}</td>
            </tr>
            <tr>
              <th>Cantidad Estimada a Vender</th>
              <td>{producto.CantidadEstimadaVender}</td>
            </tr>
            <tr>
              <th>Capacidad Máxima de Producción</th>
              <td>{producto.CapacidadMaximaProduccion}</td>
            </tr>
            <tr>
              <th>% Capacidad Utilizada</th>
              <td>{porcentajeCapacidadUtilizada.toFixed(2)}%</td>
            </tr>
            <tr>
              <th>Nuevas Ventas Totales</th>
              <td>${producto.NuevasVentasTotales}</td>
            </tr>
            <tr>
              <th>Nuevos Costos Totales</th>
              <td>${producto.NuevosCostosTotales}</td>
            </tr>
            <tr>
              <th>Margen de Ganancia</th>
              <td>${margenGanancia}</td>
            </tr>
          </tbody>
        </table>

        {/* Tabla de totales */}
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ventas Totales (Viejo)</td>
              <td>${Totales.VentasTotales}</td>
            </tr>
            <tr>
              <td>Costos Totales (Viejo)</td>
              <td>${Totales.CostosTotales}</td>
            </tr>
            <tr>
              <td>Viejo Margen de Ganancia Total</td>
              <td>${viejoMargenGananciaTotal}</td>
            </tr>
            <tr>
              <td>Nuevas Ventas Totales</td>
              <td>${Totales.NuevasVentasTotales}</td>
            </tr>
            <tr>
              <td>Nuevos Costos Totales</td>
              <td>${Totales.NuevosCostosTotales}</td>
            </tr>
            <tr>
              <td>Nuevo Margen de Ganancia Total</td>
              <td>${nuevoMargenGananciaTotal}</td>
            </tr>
            <tr>
              <td>Comparación de Ganancias</td>
              <td>{comparacionGanancias}</td>
            </tr>
          </tbody>
        </table>

        {/* Tabla de gastos y flujo de caja */}
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Impuesto sobre la Renta</td>
              <td>${FechaActual?.ImpuestoSobreLaRenta || 0}</td>
            </tr>
            <tr>
              <td>Otros Gastos</td>
              <td>${FechaActual?.OtrosGastos || 0}</td>
            </tr>
            <tr>
              <td>Devoluciones sobre Ventas</td>
              <td>${FechaActual?.DevolucionesSobreVentas || 0}</td>
            </tr>
            <tr>
              <td>Otros Productos</td>
              <td>${FechaActual?.OtrosProductos || 0}</td>
            </tr>
            <tr>
              <td>Pago de Préstamo</td>
              <td>${FechaSiguiente?.["Pago Prestamo"] || 0}</td>
            </tr>
            <tr>
              <td>Gastos Operativos y Otros Costos</td>
              <td>${Gastos_Operativos_Otros_Costos || 0}</td>
            </tr>
            <tr>
              <td>Flujo de Caja</td>
              <td>${flujoCaja}</td>
            </tr>
          </tbody>
        </table>

        {/* Botón para generar el JSON */}
        <div className="generate-json-button">
          <button onClick={generateJson}>Generar JSON y Consultar a Groq</button>
        </div>

        {/* Mostrar el JSON generado en pantalla */}
        {generatedJson && (
          <div className="json-display">
            <h3>JSON Generado</h3>
            <pre>{JSON.stringify(generatedJson, null, 2)}</pre>
          </div>
        )}

        {/* Mostrar la respuesta de Groq */}
        {groqResponse && (
          <div className="groq-response">
            <h3>Respuesta de Groq</h3>
            {formatGroqResponse(groqResponse)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
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

      {/* Mostrar el presupuesto en tabla */}
      {jsonData && renderPresupuesto()}
    </div>
  );
};

export default Presupuesto;