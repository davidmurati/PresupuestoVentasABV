import React, { useState } from "react";
import "./ConvertirArchivo.css"; // Importar el archivo CSS
import Navbar from '../Navbar/Navbar';

const EditableJsonGenerator = () => {
  // Estado inicial con la estructura JSON principal
  const [jsonData, setJsonData] = useState({
    Mes1: {
      productos: {
        "Producto 1": {
          Unidades: 55,
          Precio_unitario: 10,
          Costo_unitario: 5,
          Venta_total: 550,
          Costo_total: 275,
        },
        "Producto 2": {
          Unidades: 10,
          Precio_unitario: 20,
          Costo_unitario: 12,
          Venta_total: 200,
          Costo_total: 120,
        },
      },
      Totales: {
        Ventas_totales: 750,
        Costo_de_ventas_totales: 395,
        Gastos_Operativos_Otros_Costos: 50,
      },
    },
    Mes2: {
      productos: {},
      Totales: {
        Ventas_totales: 0,
        Costo_de_ventas_totales: 0,
        Gastos_Operativos_Otros_Costos: 0,
      },
    },
  });

  // Estado para la estructura JSON adicional
  const [jsonAdicional, setJsonAdicional] = useState({
    Mes1: {
      ImpuestoSobreLaRenta: 1.16,
      OtrosGastos: 0,
      DevolucionesSobreVentas: 0,
      OtrosProductos: 0,
      PagoPrestamo: 0,
    },
    Mes2: {
      ImpuestoSobreLaRenta: 1.16,
      OtrosGastos: 0,
      DevolucionesSobreVentas: 0,
      OtrosProductos: 0,
      PagoPrestamo: 0,
    },
  });

  // Maneja cambios en los campos editables de la estructura principal
  const handleInputChange = (mes, producto, campo, valor) => {
    const newValue = isNaN(valor) ? valor : Number(valor); // Convierte a número si es posible

    setJsonData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[mes].productos[producto][campo] = newValue;

      // Recalcular Venta_total y Costo_total
      if (campo === "Unidades" || campo === "Precio_unitario") {
        updatedData[mes].productos[producto].Venta_total =
          updatedData[mes].productos[producto].Unidades *
          updatedData[mes].productos[producto].Precio_unitario;
      }
      if (campo === "Unidades" || campo === "Costo_unitario") {
        updatedData[mes].productos[producto].Costo_total =
          updatedData[mes].productos[producto].Unidades *
          updatedData[mes].productos[producto].Costo_unitario;
      }

      // Recalcular totales
      updatedData[mes].Totales.Ventas_totales = Object.values(
        updatedData[mes].productos
      ).reduce((sum, prod) => sum + prod.Venta_total, 0);

      updatedData[mes].Totales.Costo_de_ventas_totales = Object.values(
        updatedData[mes].productos
      ).reduce((sum, prod) => sum + prod.Costo_total, 0);

      return updatedData;
    });
  };

  // Maneja cambios en los gastos operativos de la estructura principal
  const handleGastosChange = (mes, valor) => {
    const newValue = isNaN(valor) ? 0 : Number(valor); // Convierte a número si es posible

    setJsonData((prevData) => ({
      ...prevData,
      [mes]: {
        ...prevData[mes],
        Totales: {
          ...prevData[mes].Totales,
          Gastos_Operativos_Otros_Costos: newValue,
        },
      },
    }));
  };

  // Maneja cambios en la estructura JSON adicional
  const handleJsonAdicionalChange = (mes, campo, valor) => {
    const newValue = isNaN(valor) ? 0 : Number(valor); // Convierte a número si es posible

    setJsonAdicional((prevData) => ({
      ...prevData,
      [mes]: {
        ...prevData[mes],
        [campo]: newValue,
      },
    }));
  };

  // Agregar un nuevo producto solo para Mes1
  const addProduct = () => {
    const newProductName = `Producto ${Object.keys(jsonData.Mes1.productos).length + 1}`;
    setJsonData((prevData) => ({
      ...prevData,
      Mes1: {
        ...prevData.Mes1,
        productos: {
          ...prevData.Mes1.productos,
          [newProductName]: {
            Unidades: 0,
            Precio_unitario: 0,
            Costo_unitario: 0,
            Venta_total: 0,
            Costo_total: 0,
          },
        },
      },
    }));
  };

  // Eliminar un producto de Mes1
  const removeProduct = (producto) => {
    setJsonData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData.Mes1.productos[producto]; // Eliminar el producto

      // Recalcular totales después de eliminar el producto
      updatedData.Mes1.Totales.Ventas_totales = Object.values(
        updatedData.Mes1.productos
      ).reduce((sum, prod) => sum + prod.Venta_total, 0);

      updatedData.Mes1.Totales.Costo_de_ventas_totales = Object.values(
        updatedData.Mes1.productos
      ).reduce((sum, prod) => sum + prod.Costo_total, 0);

      return updatedData;
    });
  };

  // Descargar el archivo JSON principal
  const downloadJson = () => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ventas_gastos.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // Descargar el archivo JSON adicional
  const downloadJsonAdicional = () => {
    const jsonString = JSON.stringify(jsonAdicional, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "json_adicional.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>
      <h1>Generador de JSON Editable</h1>
      <div className="button-container">
        <button onClick={downloadJson} className="convert-button">
          Generar y Descargar JSON Principal
        </button>
        <button onClick={downloadJsonAdicional} className="convert-button">
          Generar JSON Adicional
        </button>
      </div>

      {/* Sección para Mes1 */}
      <div className="section">
        <h2>Mes1</h2>
        <button onClick={addProduct} className="convert-button">
          Agregar Producto
        </button>
        <div className="table-responsive">
          <table className="editable-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
                <th>Precio Unitario</th>
                <th>Costo Unitario</th>
                <th>Venta Total</th>
                <th>Costo Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(jsonData.Mes1.productos).map(([producto, datos]) => (
                <tr key={`Mes1-${producto}`}>
                  <td>{producto}</td>
                  <td>
                    <input
                      type="number"
                      value={datos.Unidades}
                      onChange={(e) =>
                        handleInputChange("Mes1", producto, "Unidades", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={datos.Precio_unitario}
                      onChange={(e) =>
                        handleInputChange("Mes1", producto, "Precio_unitario", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={datos.Costo_unitario}
                      onChange={(e) =>
                        handleInputChange("Mes1", producto, "Costo_unitario", e.target.value)
                      }
                    />
                  </td>
                  <td>{datos.Venta_total}</td>
                  <td>{datos.Costo_total}</td>
                  <td>
                    <button
                      onClick={() => removeProduct(producto)}
                      className="convert-button"
                      style={{ backgroundColor: "#e74c3c" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Totales:</h3>
        <p>Ventas Totales: {jsonData.Mes1.Totales.Ventas_totales}</p>
        <p>Costo de Ventas Totales: {jsonData.Mes1.Totales.Costo_de_ventas_totales}</p>
        <p>
          Gastos Operativos y Otros Costos:
          <input
            type="number"
            value={jsonData.Mes1.Totales.Gastos_Operativos_Otros_Costos}
            onChange={(e) =>
              handleGastosChange("Mes1", e.target.value)
            }
            className="input-field"
          />
        </p>
      </div>

      {/* Sección para Mes2 */}
      <div className="section">
        <h2>Mes2</h2>
        <h3>Totales:</h3>
        <p>Ventas Totales: {jsonData.Mes2.Totales.Ventas_totales}</p>
        <p>Costo de Ventas Totales: {jsonData.Mes2.Totales.Costo_de_ventas_totales}</p>
      </div>

      {/* Sección para JSON Adicional */}
      <div className="section">
        <h2>JSON Adicional</h2>
        <h3>Mes1:</h3>
        <p>
          Impuestos:
          <input
            type="number"
            value={jsonAdicional.Mes1.ImpuestoSobreLaRenta}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes1", "ImpuestoSobreLaRenta", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Otros Gastos:
          <input
            type="number"
            value={jsonAdicional.Mes1.OtrosGastos}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes1", "OtrosGastos", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Devoluciones sobre Ventas:
          <input
            type="number"
            value={jsonAdicional.Mes1.DevolucionesSobreVentas}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes1", "DevolucionesSobreVentas", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Ingresos adicionales u Productos:
          <input
            type="number"
            value={jsonAdicional.Mes1.OtrosProductos}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes1", "OtrosProductos", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Pago Préstamo:
          <input
            type="number"
            value={jsonAdicional.Mes1.PagoPrestamo}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes1", "PagoPrestamo", e.target.value)
            }
            className="input-field"
          />
        </p>

        <h3>Mes2:</h3>
        <p>
          Impuestos:
          <input
            type="number"
            value={jsonAdicional.Mes2.ImpuestoSobreLaRenta}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes2", "ImpuestoSobreLaRenta", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Otros Gastos:
          <input
            type="number"
            value={jsonAdicional.Mes2.OtrosGastos}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes2", "OtrosGastos", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Devoluciones sobre Ventas:
          <input
            type="number"
            value={jsonAdicional.Mes2.DevolucionesSobreVentas}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes2", "DevolucionesSobreVentas", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Ingresos adicionales u Otros Productos:
          <input
            type="number"
            value={jsonAdicional.Mes2.OtrosProductos}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes2", "OtrosProductos", e.target.value)
            }
            className="input-field"
          />
        </p>
        <p>
          Pago Préstamo:
          <input
            type="number"
            value={jsonAdicional.Mes2.PagoPrestamo}
            onChange={(e) =>
              handleJsonAdicionalChange("Mes2", "PagoPrestamo", e.target.value)
            }
            className="input-field"
          />
        </p>
      </div>

      <h2>Vista previa del JSON Principal:</h2>
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>

      <h2>Vista previa del JSON Adicional:</h2>
      <pre>{JSON.stringify(jsonAdicional, null, 2)}</pre>
    </div>
  );
};

export default EditableJsonGenerator;