import React, { useState } from "react";
import "./PresupuestoVentas.css"; // Importar el archivo CSS
import Navbar from '../Navbar/Navbar';

const JsonUploader = () => {
  const [jsonData, setJsonData] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);
  const [error, setError] = useState("");
  const [modifiedJson, setModifiedJson] = useState(null);
  const [productInputs, setProductInputs] = useState([]);
  const [gastosOperativos, setGastosOperativos] = useState("");

  // Función para manejar la carga del archivo VentasGastos
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setJsonData(data);
          setError("");
          initializeInputs(data.Mes1.productos); // Inicializar inputs con los datos de Mes1.productos
        } catch (err) {
          setError("El archivo no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Función para manejar la carga del segundo archivo JSON
  const handleAdditionalFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setAdditionalData(data);
          setError("");
        } catch (err) {
          setError("El archivo adicional no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Función para inicializar los inputs del usuario
  const initializeInputs = (data) => {
    const products = [];
    let productCounter = 1; // Contador para nombres predeterminados

    const processData = (obj, path = "") => {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => processData(item, `${path}[${index}]`));
      } else if (typeof obj === "object" && obj !== null) {
        if (obj.Unidades !== undefined) {
          // Asignar un nombre predeterminado si no existe el campo "Nombre"
          const productName = obj.Nombre || `Producto ${productCounter}`;
          productCounter++;

          products.push({
            path: path,
            name: productName, // Usar el nombre del producto
            nuevoPrecioUnitario: "",
            nuevoCostoUnitario: "",
            inventarioActual: "",
            inventarioDeseado: "",
            estimatedSales: "",
            growthFactor: "",
            productionCapacity: "",
          });
        }
        Object.entries(obj).forEach(([key, value]) => {
          processData(value, path ? `${path}.${key}` : key);
        });
      }
    };
    processData(data);
    setProductInputs(products);
  };

  // Función para manejar cambios en los inputs del usuario
  const handleInputChange = (index, field, value) => {
    setProductInputs((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index][field] = value;
      return newInputs;
    });
  };

  // Función para agregar los datos ingresados por el usuario al JSON
  const addUserData = () => {
    if (!jsonData || !jsonData.Mes1 || !jsonData.Mes1.productos) {
      setError("Por favor, carga un JSON válido con la estructura correcta.");
      return;
    }

    // Clonar el JSON original para no modificarlo directamente
    const modifiedData = JSON.parse(JSON.stringify(jsonData));

    // Crear la estructura de Mes2.productos si no existe
    if (!modifiedData.Mes2.productos) {
      modifiedData.Mes2.productos = {};
    }

    // Si hay datos adicionales, agregarlos al JSON
    if (additionalData) {
      // Agregar datos adicionales de Mes1
      if (additionalData.Mes1) {
        Object.assign(modifiedData.Mes1, additionalData.Mes1);
      }
      // Agregar datos adicionales de Mes2
      if (additionalData.Mes2) {
        Object.assign(modifiedData.Mes2, additionalData.Mes2);
      }
    }

    let totalVentas = 0;
    let totalCostos = 0;

    // Recorrer los productos ingresados por el usuario
    for (let i = 0; i < productInputs.length; i++) {
      const inputs = productInputs[i];
      const productPath = inputs.path.split(".");

      // Acceder a los datos de Mes1.productos
      let product = modifiedData.Mes1.productos;
      for (const key of productPath) {
        if (!product[key]) {
          setError(`El producto ${inputs.name} no existe en el JSON.`);
          return;
        }
        product = product[key];
      }

      // Obtener valores del producto
      const inventarioActual = parseFloat(inputs.inventarioActual) || 0;
      const inventarioDeseado = parseFloat(inputs.inventarioDeseado) || 0;
      const unidadesViejas = product.Unidades || 0;

      // Calcular unidades a vender
      let unidadesAVender;
      if (inputs.estimatedSales) {
        unidadesAVender = parseFloat(inputs.estimatedSales);
      } else if (inputs.growthFactor) {
        const growthFactor = parseFloat(inputs.growthFactor);
        unidadesAVender = unidadesViejas * growthFactor;
      } else {
        unidadesAVender = unidadesViejas;
      }

      // Calcular unidades a producir
      const unidadesAProducir = Math.max(0, inventarioDeseado - inventarioActual + unidadesAVender);

      // Validar capacidad de producción
      if (
        inputs.productionCapacity &&
        unidadesAProducir > parseFloat(inputs.productionCapacity)
      ) {
        setError(
          `La cantidad a producir para ${inputs.name} supera la capacidad máxima de producción.`
        );
        return;
      }

      // Obtener precios y costos
      const precioUnitario = inputs.nuevoPrecioUnitario
        ? parseFloat(inputs.nuevoPrecioUnitario)
        : product.Precio_unitario;
      const costoUnitario = inputs.nuevoCostoUnitario
        ? parseFloat(inputs.nuevoCostoUnitario)
        : product.Costo_unitario;

      // Calcular ventas y costos
      const ventaTotal = unidadesAVender * precioUnitario;
      const costoTotal = unidadesAProducir * costoUnitario;

      // Crear la estructura del producto en Mes2.productos
      modifiedData.Mes2.productos[inputs.name] = {
        Unidades: unidadesAVender,
        Precio_unitario: precioUnitario,
        Costo_unitario: costoUnitario,
        Venta_total: ventaTotal,
        Costo_total: costoTotal,
        UnidadesAProducir: unidadesAProducir,
        InventarioActual: inventarioActual,
        InventarioDeseado: inventarioDeseado,
      };

      // Guardar factor de crecimiento y capacidad de producción si existen
      if (inputs.growthFactor) {
        modifiedData.Mes2.productos[inputs.name].FactorCrecimiento = parseFloat(inputs.growthFactor);
      }
      if (inputs.productionCapacity) {
        modifiedData.Mes2.productos[inputs.name].CapacidadMaximaProduccion = parseFloat(inputs.productionCapacity);
      }

      // Acumular totales
      totalVentas += ventaTotal;
      totalCostos += costoTotal;
    }

    // Guardar gastos operativos en Mes2.Totales
    if (gastosOperativos) {
      modifiedData.Mes2.Totales.Gastos_Operativos_Otros_Costos = parseFloat(gastosOperativos);
    }

    // Guardar totales en Mes2.Totales
    modifiedData.Mes2.Totales = {
      Ventas_totales: totalVentas,
      Costo_de_ventas_totales: totalCostos,
      Gastos_Operativos_Otros_Costos: parseFloat(gastosOperativos) || 0,
    };

    // Actualizar el estado con el JSON modificado
    setModifiedJson(modifiedData);
    setError("");
  };

  // Función para descargar el JSON modificado
  const downloadJson = () => {
    if (!modifiedJson) {
      setError("No hay datos modificados para descargar.");
      return;
    }

    const jsonString = JSON.stringify(modifiedJson, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modifiedJson.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Función para renderizar una tabla a partir de un objeto JSON
  const renderTable = (data) => {
    if (!data || typeof data !== "object") return null;

    if (Array.isArray(data)) {
      return (
        <div>
          {data.map((item, index) => (
            <div key={index}>
              <h3>Elemento {index + 1}</h3>
              {renderTable(item)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Clave</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                {typeof value === "object" ? renderTable(value) : value.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>

      <h1>Cargar Información para empezar el presupuesto</h1>
      <div>
        <h2>Cargar Archivo VentasGastos en formato .JSON:</h2>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>
      <br />
      <div>
        <h2>Cargar Archivo Adicional:</h2>
        <h3>Información del mes 1 y 2 adicional relevante *Opcional*:</h3>
        <input type="file" accept=".json" onChange={handleAdditionalFileUpload} />
      </div>
      <br />
      {jsonData && (
        <div className="product-form">
          <h2>Ingresar datos para cada producto:</h2>
          {productInputs.map((product, index) => (
            <div key={index} className="product-section">
              <h3 className="product-title">Producto: {product.name}</h3>
              <label>
                Nuevo Precio Unitario:
                <input
                  type="text"
                  value={product.nuevoPrecioUnitario}
                  onChange={(e) =>
                    handleInputChange(index, "nuevoPrecioUnitario", e.target.value)
                  }
                  placeholder="Ej: 12"
                />
              </label>
              <br />
              <label>
                Nuevo Costo Unitario:
                <input
                  type="text"
                  value={product.nuevoCostoUnitario}
                  onChange={(e) =>
                    handleInputChange(index, "nuevoCostoUnitario", e.target.value)
                  }
                  placeholder="Ej: 6"
                />
              </label>
              <br />
              <label>
                Inventario Actual:
                <input
                  type="text"
                  value={product.inventarioActual}
                  onChange={(e) =>
                    handleInputChange(index, "inventarioActual", e.target.value)
                  }
                  placeholder="Ej: 100"
                />
              </label>
              <br />
              <label>
                Inventario Deseado:
                <input
                  type="text"
                  value={product.inventarioDeseado}
                  onChange={(e) =>
                    handleInputChange(index, "inventarioDeseado", e.target.value)
                  }
                  placeholder="Ej: 200"
                />
              </label>
              <br />
              <label>
                Cantidad Estimada a Vender:
                <input
                  type="text"
                  value={product.estimatedSales}
                  onChange={(e) =>
                    handleInputChange(index, "estimatedSales", e.target.value)
                  }
                  placeholder="Ej: 800"
                />
              </label>
              <br />
              <label>
                Factor de Crecimiento/Decaimiento:
                <input
                  type="text"
                  value={product.growthFactor}
                  onChange={(e) =>
                    handleInputChange(index, "growthFactor", e.target.value)
                  }
                  placeholder="Ej: 1.2 (crecimiento) o 0.8 (decaimiento)"
                />
              </label>
              <br />
              <label>
                Capacidad Máxima de Producción:
                <input
                  type="text"
                  value={product.productionCapacity}
                  onChange={(e) =>
                    handleInputChange(index, "productionCapacity", e.target.value)
                  }
                  placeholder="Ej: 1000"
                />
              </label>
            </div>
          ))}
          <label>
            Gastos Operativos totales y Otros Costos :
            <input
              type="text"
              value={gastosOperativos}
              onChange={(e) => setGastosOperativos(e.target.value)}
              placeholder="Ej: 5000"
            />
          </label>
          <br />
          <button onClick={addUserData}>Agregar Datos</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {jsonData && (
        <div>
          <h2>Contenido del JSON original:</h2>
          {renderTable(jsonData)}
        </div>
      )}
      {additionalData && (
        <div>
          <h2>Contenido del Archivo Adicional:</h2>
          {renderTable(additionalData)}
        </div>
      )}
      {modifiedJson && (
        <div>
          <h2>Contenido del JSON modificado:</h2>
          {renderTable(modifiedJson)}
          <h3>JSON modificado (texto):</h3>
          <pre>{JSON.stringify(modifiedJson, null, 2)}</pre>
          <button onClick={downloadJson}>Descargar JSON Modificado</button>
        </div>
      )}
      <button className="boton1" onClick={() => window.location.href = "/EstimarPresupuestoVentas"}>Estimar presupuesto</button>
    </div>
  );
};

export default JsonUploader;