import React, { useState, useEffect } from 'react';
import './Presupuestoasadoenventas1.css';
import Navbar from '../Navbar/Navbar';
import * as XLSX from 'xlsx';

const PresupuestoUnificado = () => {
  // Estados principales
  const [etapa, setEtapa] = useState(1);
  const [jsonBase, setJsonBase] = useState(null);
  const [jsonModificado, setJsonModificado] = useState(null);
  const [resultados, setResultados] = useState(null);
  
  // Estados para configuración
  const [tasaImpuestos, setTasaImpuestos] = useState(16);
  const [gastosOperativos, setGastosOperativos] = useState(0);
  
  // Estados para Etapa 1
  const [productosMes1, setProductosMes1] = useState({});
  const [nombresTemporal, setNombresTemporal] = useState({}); // Estado para edición fluida de nombres
  const [totalesMes1, setTotalesMes1] = useState({
    Ventas_totales: 0,
    Costo_de_ventas_totales: 0,
    Gastos_Operativos_Otros_Costos: 0
  });
  
  // Estados para Etapa 2
  const [inputsUsuario, setInputsUsuario] = useState([]);

  // Efectos
  useEffect(() => {
    if (etapa === 2 && jsonBase) {
      inicializarInputsProyeccion();
    }
  }, [etapa, jsonBase]);

  // ====================
  // Lógica Etapa 1: Configuración inicial
  // ====================
  const manejarCambioProducto = (nombre, campo, valor) => {
    const nuevosProductos = { ...productosMes1 };
    nuevosProductos[nombre][campo] = Number(valor);
    
    if (['Unidades', 'Precio_unitario'].includes(campo)) {
      nuevosProductos[nombre].Venta_total = 
        nuevosProductos[nombre].Unidades * nuevosProductos[nombre].Precio_unitario;
    }
    
    if (['Unidades', 'Costo_unitario'].includes(campo)) {
      nuevosProductos[nombre].Costo_total = 
        nuevosProductos[nombre].Unidades * nuevosProductos[nombre].Costo_unitario;
    }
    
    setProductosMes1(nuevosProductos);
    calcularTotalesMes1(nuevosProductos);
  };

  const calcularTotalesMes1 = (productos) => {
    const nuevosTotales = {
      Ventas_totales: Object.values(productos).reduce((a, b) => a + b.Venta_total, 0),
      Costo_de_ventas_totales: Object.values(productos).reduce((a, b) => a + b.Costo_total, 0),
      Gastos_Operativos_Otros_Costos: totalesMes1.Gastos_Operativos_Otros_Costos
    };
    setTotalesMes1(nuevosTotales);
  };

  const agregarProducto = () => {
    const nuevoNombre = `Producto ${Object.keys(productosMes1).length + 1}`;
    setProductosMes1(prev => ({
      ...prev,
      [nuevoNombre]: {
        Unidades: 0,
        Precio_unitario: 0,
        Costo_unitario: 0,
        Venta_total: 0,
        Costo_total: 0
      }
    }));
    // Añadir el nuevo nombre al estado temporal
    setNombresTemporal(prev => ({ ...prev, [nuevoNombre]: nuevoNombre }));
  };

  // Función para manejar cambios en el input sin actualizar inmediatamente el estado
  const manejarCambioNombre = (nombreViejo, nuevoNombre) => {
    setNombresTemporal({ ...nombresTemporal, [nombreViejo]: nuevoNombre });
  };

  // Función para aplicar el cambio de nombre cuando el input pierde el foco
  const aplicarCambioNombre = (nombreViejo) => {
    // Si no hay un nombre temporal o es indefinido, salimos
    if (!nombresTemporal[nombreViejo]) return;
    
    const nuevoNombre = nombresTemporal[nombreViejo].trim();
    
    // Validaciones
    if (nuevoNombre === '' || 
        (nuevoNombre !== nombreViejo && productosMes1[nuevoNombre])) {
      // Si está vacío o ya existe, revertimos al nombre original
      setNombresTemporal({ ...nombresTemporal, [nombreViejo]: nombreViejo });
      return;
    }
    
    // Si el nombre ha cambiado, actualizamos el estado de productos
    if (nuevoNombre !== nombreViejo) {
      const nuevosProductos = { ...productosMes1 };
      nuevosProductos[nuevoNombre] = nuevosProductos[nombreViejo];
      delete nuevosProductos[nombreViejo];
      setProductosMes1(nuevosProductos);
      
      // Actualizamos el estado temporal
      const nuevoNombresTemporal = { ...nombresTemporal };
      delete nuevoNombresTemporal[nombreViejo];
      nuevoNombresTemporal[nuevoNombre] = nuevoNombre;
      setNombresTemporal(nuevoNombresTemporal);
    }
  };

  const eliminarProducto = (nombre) => {
    const nuevosProductos = { ...productosMes1 };
    delete nuevosProductos[nombre];
    setProductosMes1(nuevosProductos);
    
    // También eliminar del estado de nombres temporales
    const nuevoNombresTemporal = { ...nombresTemporal };
    delete nuevoNombresTemporal[nombre];
    setNombresTemporal(nuevoNombresTemporal);
    
    calcularTotalesMes1(nuevosProductos);
  };

  // ====================
  // Lógica Etapa 2: Proyecciones
  // ====================
  const inicializarInputsProyeccion = () => {
    const productos = jsonBase.Mes1.productos;
    const inputs = Object.keys(productos).map((nombre, index) => ({
      id: index,
      nombre,
      nuevoPrecioUnitario: '',
      nuevoCostoUnitario: '',
      inventarioActual: '',
      inventarioDeseado: '',
      estimatedSales: '',
      growthFactor: '',
      productionCapacity: ''
    }));
    setInputsUsuario(inputs);
  };

  const manejarCambioInput = (id, campo, valor) => {
    setInputsUsuario(prev => prev.map(input => 
      input.id === id ? { ...input, [campo]: valor } : input
    ));
  };

  const validarProyecciones = () => {
    return inputsUsuario.every(input => 
      (input.estimatedSales || input.growthFactor) && 
      input.inventarioActual !== '' && 
      input.inventarioDeseado !== ''
    );
  };

  const generarProyecciones = () => {
    if (!validarProyecciones()) {
      alert('Complete todos los campos requeridos en las proyecciones');
      return;
    }

    const modificado = {
      Mes1: { 
        ...jsonBase.Mes1, 
        Totales: {
          ...totalesMes1,
          Tasa_Impuestos: tasaImpuestos / 100
        }
      },
      Mes2: {
        productos: {},
        Totales: {
          Ventas_totales: 0,
          Costo_de_ventas_totales: 0,
          Gastos_Operativos_Otros_Costos: Number(gastosOperativos) || 0,
          Tasa_Impuestos: tasaImpuestos / 100
        }
      }
    };

    inputsUsuario.forEach(input => {
      const productoOriginal = jsonBase.Mes1.productos[input.nombre];
      
      const unidadesAVender = input.estimatedSales ? 
        Number(input.estimatedSales) : 
        productoOriginal.Unidades * (Number(input.growthFactor) || 1);
      
      const unidadesAProducir = Math.max(
        0,
        (Number(input.inventarioDeseado) || 0) - 
        (Number(input.inventarioActual) || 0) + 
        unidadesAVender
      );

      const nuevoPrecio = Number(input.nuevoPrecioUnitario) || productoOriginal.Precio_unitario;
      const nuevoCosto = Number(input.nuevoCostoUnitario) || productoOriginal.Costo_unitario;

      modificado.Mes2.productos[input.nombre] = {
        ...productoOriginal,
        Unidades: unidadesAVender,
        Precio_unitario: nuevoPrecio,
        Costo_unitario: nuevoCosto,
        UnidadesAProducir: unidadesAProducir,
        InventarioActual: Number(input.inventarioActual) || 0,
        InventarioDeseado: Number(input.inventarioDeseado) || 0,
        CapacidadMaximaProduccion: Number(input.productionCapacity) || 0
      };

      modificado.Mes2.Totales.Ventas_totales += unidadesAVender * nuevoPrecio;
      modificado.Mes2.Totales.Costo_de_ventas_totales += unidadesAProducir * nuevoCosto;
    });

    setJsonModificado(modificado);
    setEtapa(3);
  };

  // ====================
  // Lógica Etapa 3: Resultados
  // ====================
  const calcularResultadosFinales = () => {
    const estadoResultados = calcularEstadoResultados();
    const indicadores = calcularIndicadoresFinancieros(estadoResultados);

    setResultados({
      PresupuestoVentas: calcularPresupuestoVentas(),
      EstadoResultados: estadoResultados,
      Indicadores: indicadores
    });
  };

  const calcularPresupuestoVentas = () => {
    return Object.entries(jsonModificado.Mes2.productos).reduce((acc, [nombre, datos]) => ({
      ...acc,
      [nombre]: {
        Unidades: datos.Unidades,
        PrecioUnitario: datos.Precio_unitario,
        VentasProyectadas: datos.Unidades * datos.Precio_unitario
      }
    }), {});
  };

  const calcularEstadoResultados = () => {
    const mes1 = jsonModificado.Mes1.Totales;
    const mes2 = jsonModificado.Mes2.Totales;

    const utilidadOperativaMes1 = mes1.Ventas_totales - mes1.Costo_de_ventas_totales - mes1.Gastos_Operativos_Otros_Costos;
    const utilidadOperativaMes2 = mes2.Ventas_totales - mes2.Costo_de_ventas_totales - mes2.Gastos_Operativos_Otros_Costos;

    const impuestosMes1 = utilidadOperativaMes1 * mes1.Tasa_Impuestos;
    const impuestosMes2 = utilidadOperativaMes2 * mes2.Tasa_Impuestos;

    const flujoCajaMes1 = (utilidadOperativaMes1 - impuestosMes1);
    const flujoCajaMes2 = (utilidadOperativaMes2 - impuestosMes2);

    return {
      VentasTotalesMes1: mes1.Ventas_totales,
      VentasTotalesMes2: mes2.Ventas_totales,
      CostosTotalesMes1: mes1.Costo_de_ventas_totales,
      CostosTotalesMes2: mes2.Costo_de_ventas_totales,
      GastosOperativosMes1: mes1.Gastos_Operativos_Otros_Costos,
      GastosOperativosMes2: mes2.Gastos_Operativos_Otros_Costos,
      UtilidadOperativaMes1: utilidadOperativaMes1,
      UtilidadOperativaMes2: utilidadOperativaMes2,
      ImpuestosMes1: impuestosMes1,
      ImpuestosMes2: impuestosMes2,
      UtilidadNetaMes1: utilidadOperativaMes1 - impuestosMes1,
      UtilidadNetaMes2: utilidadOperativaMes2 - impuestosMes2,
      FlujoCajaMes1: flujoCajaMes1,
      FlujoCajaMes2: flujoCajaMes2,
      FlujoCajaTotal: flujoCajaMes1 + flujoCajaMes2
    };
  };

  const calcularIndicadoresFinancieros = (estado) => {
    return {
      MargenGanancia: ((estado.UtilidadNetaMes2) / 
                      (estado.VentasTotalesMes2)) * 100,
      Rentabilidad: ((estado.UtilidadNetaMes2) / 
                    (jsonModificado.Mes2.Totales.Costo_de_ventas_totales + 
                     jsonModificado.Mes2.Totales.Gastos_Operativos_Otros_Costos)) * 100,
      FlujoCajaTotal: estado.FlujoCajaTotal
    };
  };

  const exportarAExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Hoja de Ventas
    const wsVentas = XLSX.utils.json_to_sheet(
      Object.entries(calcularPresupuestoVentas()).map(([nombre, datos]) => ({
        Producto: nombre,
        Unidades: datos.Unidades,
        'Precio Unitario': datos.PrecioUnitario,
        'Ventas Proyectadas': datos.VentasProyectadas
      }))
    );
    XLSX.utils.book_append_sheet(workbook, wsVentas, "Ventas");

    // Hoja de Resultados
    const wsResultados = XLSX.utils.json_to_sheet([
      resultados.EstadoResultados,
      resultados.Indicadores
    ]);
    XLSX.utils.book_append_sheet(workbook, wsResultados, "Resultados");

    XLSX.writeFile(workbook, 'Reporte_Presupuesto.xlsx');
  };

  return (
    <div className="presupuesto-container">
      <Navbar />
      
      <div className="progreso-etapas">
        <div className={`etapa ${etapa >= 1 ? 'activa' : ''}`}>
          <div className="numero-etapa">1</div>
          <div className="texto-etapa">Configuración</div>
        </div>
        <div className={`etapa ${etapa >= 2 ? 'activa' : ''}`}>
          <div className="numero-etapa">2</div>
          <div className="texto-etapa">Proyecciones</div>
        </div>
        <div className={`etapa ${etapa >= 3 ? 'activa' : ''}`}>
          <div className="numero-etapa">3</div>
          <div className="texto-etapa">Resultados</div>
        </div>
      </div>

      {/* Etapa 1: Configuración inicial */}
      {etapa === 1 && (
        <div className="seccion-etapa">
          <h2>Configuración Inicial</h2>
          
          <div className="instrucciones">
            <p>Complete la información base de sus productos</p>
            <button onClick={agregarProducto} className="boton-primario">
              ＋ Agregar Producto
            </button>
          </div>

          <div className="tabla-productos">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Precio ($)</th>
                  <th>Costo ($)</th>
                  <th>Venta Total</th>
                  <th className="columna-opcional">Costo Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(productosMes1).map(([nombre, datos]) => (
                  <tr key={nombre}>
                    <td>
                      <input
                        type="text"
                        value={nombresTemporal[nombre] !== undefined ? nombresTemporal[nombre] : nombre}
                        onChange={(e) => manejarCambioNombre(nombre, e.target.value)}
                        onBlur={() => aplicarCambioNombre(nombre)}
                        className="input-nombre"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={datos.Unidades}
                        onChange={(e) => manejarCambioProducto(nombre, 'Unidades', e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={datos.Precio_unitario}
                        onChange={(e) => manejarCambioProducto(nombre, 'Precio_unitario', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={datos.Costo_unitario}
                        onChange={(e) => manejarCambioProducto(nombre, 'Costo_unitario', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>${datos.Venta_total.toFixed(2)}</td>
                    <td className="columna-opcional">${datos.Costo_total.toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => eliminarProducto(nombre)}
                        className="boton-peligro"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="configuracion-avanzada">
            <div className="tarjeta-configuracion">
              <label>Tasa de Impuestos (%)</label>
              <input
                type="number"
                value={tasaImpuestos}
                onChange={(e) => setTasaImpuestos(Math.min(100, Math.max(0, e.target.value)))}
                min="0"
                max="100"
              />
            </div>
            <div className="tarjeta-configuracion">
              <label>Gastos Operativos Iniciales ($)</label>
              <input
                type="number"
                value={totalesMes1.Gastos_Operativos_Otros_Costos}
                onChange={(e) => setTotalesMes1({
                  ...totalesMes1,
                  Gastos_Operativos_Otros_Costos: Number(e.target.value)
                })}
                min="0"
              />
            </div>
          </div>

          <button 
            onClick={() => {
              setJsonBase({
                Mes1: { productos: productosMes1, Totales: totalesMes1 },
                Mes2: { productos: {}, Totales: { ...totalesMes1, Ventas_totales: 0 } }
              });
              setEtapa(2);
            }} 
            className="boton-siguiente"
            disabled={Object.keys(productosMes1).length === 0}
          >
            Continuar a Proyecciones →
          </button>
        </div>
      )}

      {/* Etapa 2: Proyecciones */}
      {etapa === 2 && jsonBase && (
        <div className="seccion-etapa">
          <h2>Proyecciones del Próximo Mes</h2>
          
          <div className="instrucciones">
            <p>Complete los datos de proyección para cada producto</p>
          </div>

          {inputsUsuario.map(input => (
            <div key={input.id} className="grupo-proyecciones">
              <h3>{input.nombre}</h3>
              
              <div className="fila-proyecciones">
                <div className="grupo-input">
                  <label>Nuevo Precio Unitario ($)</label>
                  <input
                    type="number"
                    value={input.nuevoPrecioUnitario}
                    onChange={(e) => manejarCambioInput(input.id, 'nuevoPrecioUnitario', e.target.value)}
                    step="0.01"
                  />
                </div>
                
                <div className="grupo-input">
                  <label>Nuevo Costo Unitario ($)</label>
                  <input
                    type="number"
                    value={input.nuevoCostoUnitario}
                    onChange={(e) => manejarCambioInput(input.id, 'nuevoCostoUnitario', e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="fila-proyecciones">
                <div className="grupo-input">
                  <label>Inventario Actual</label>
                  <input
                    type="number"
                    value={input.inventarioActual}
                    onChange={(e) => manejarCambioInput(input.id, 'inventarioActual', e.target.value)}
                  />
                </div>
                
                <div className="grupo-input">
                  <label>Inventario Deseado</label>
                  <input
                    type="number"
                    value={input.inventarioDeseado}
                    onChange={(e) => manejarCambioInput(input.id, 'inventarioDeseado', e.target.value)}
                  />
                </div>
              </div>

              <div className="fila-proyecciones">
                <div className="grupo-input">
                  <label>Ventas Estimadas</label>
                  <input
                    type="number"
                    value={input.estimatedSales}
                    onChange={(e) => manejarCambioInput(input.id, 'estimatedSales', e.target.value)}
                  />
                </div>
                
                <div className="grupo-input">
                  <label>Factor de Crecimiento</label>
                  <input
                    type="number"
                    value={input.growthFactor}
                    onChange={(e) => manejarCambioInput(input.id, 'growthFactor', e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grupo-input">
                <label>Capacidad Máxima de Producción</label>
                <input
                  type="number"
                  value={input.productionCapacity}
                  onChange={(e) => manejarCambioInput(input.id, 'productionCapacity', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="configuracion-avanzada">
            <div className="tarjeta-configuracion">
              <label>Gastos Operativos Adicionales ($)</label>
              <input
                type="number"
                value={gastosOperativos}
                onChange={(e) => setGastosOperativos(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <button onClick={generarProyecciones} className="boton-siguiente">
            Generar Proyecciones →
          </button>
        </div>
      )}

      {/* Etapa 3: Resultados */}
      {etapa === 3 && jsonModificado && (
        <div className="seccion-etapa">
          <h2>Resultados Finales</h2>
          
          <button onClick={calcularResultadosFinales} className="boton-primario">
            Calcular Resultados
          </button>

          {resultados && (
            <>
              <div className="resultado-grupo">
                <h3>📊 Presupuesto de Ventas</h3>
                <div className="tabla-responsive">
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Unidades</th>
                        <th>Precio Unitario</th>
                        <th>Ventas Proyectadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resultados.PresupuestoVentas).map(([nombre, datos]) => (
                        <tr key={nombre}>
                          <td>{nombre}</td>
                          <td>{datos.Unidades}</td>
                          <td>${datos.PrecioUnitario.toFixed(2)}</td>
                          <td>${datos.VentasProyectadas.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="resultado-grupo">
                <h3>💰 Estado de Resultados</h3>
                <div className="tabla-responsive">
                  <table className="tabla-resultados">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th>Mes 1 ($)</th>
                        <th>Mes 2 ($)</th>
                        <th>Dif ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ventas Totales</td>
                        <td>{resultados.EstadoResultados.VentasTotalesMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.VentasTotalesMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.VentasTotalesMes2 - resultados.EstadoResultados.VentasTotalesMes1).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Costos Totales</td>
                        <td>{resultados.EstadoResultados.CostosTotalesMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.CostosTotalesMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.CostosTotalesMes2 - resultados.EstadoResultados.CostosTotalesMes1).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Gastos Operativos</td>
                        <td>{resultados.EstadoResultados.GastosOperativosMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.GastosOperativosMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.GastosOperativosMes2 - resultados.EstadoResultados.GastosOperativosMes1).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Utilidad Operativa</td>
                        <td>{resultados.EstadoResultados.UtilidadOperativaMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.UtilidadOperativaMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.UtilidadOperativaMes2 - resultados.EstadoResultados.UtilidadOperativaMes1).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Impuestos ({tasaImpuestos}%)</td>
                        <td>{resultados.EstadoResultados.ImpuestosMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.ImpuestosMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.ImpuestosMes2 - resultados.EstadoResultados.ImpuestosMes1).toFixed(2)}</td>
                      </tr>
                      <tr className="total-final">
                        <td>Utilidad Neta</td>
                        <td>{resultados.EstadoResultados.UtilidadNetaMes1.toFixed(2)}</td>
                        <td>{resultados.EstadoResultados.UtilidadNetaMes2.toFixed(2)}</td>
                        <td>{(resultados.EstadoResultados.UtilidadNetaMes2 - resultados.EstadoResultados.UtilidadNetaMes1).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="resultado-grupo">
                <h3>📈 Indicadores Clave</h3>
                <div className="indicadores-grid">
                  <div className="indicador">
                    <label>Margen de Ganancia mes 2</label>
                    <div className="valor-indicador">
                      {resultados.Indicadores.MargenGanancia.toFixed(2)}%
                    </div>
                  </div>
                  <div className="indicador">
                    <label>Rentabilidad mes 2</label>
                    <div className="valor-indicador">
                      {resultados.Indicadores.Rentabilidad.toFixed(2)}%
                    </div>
                  </div>
                  <div className="indicador">
                    <label>Flujo de Caja Total</label>
                    <div className="valor-indicador">
                      ${resultados.EstadoResultados.FlujoCajaTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="acciones-finales">
                <button onClick={exportarAExcel} className="boton-exportar">
                  📊 Exportar a Excel
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(resultados, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'resultados-presupuesto.json';
                    a.click();
                  }} 
                  className="boton-exportar"
                >
                  📁 Descargar JSON
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PresupuestoUnificado;