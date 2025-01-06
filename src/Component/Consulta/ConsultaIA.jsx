import React, { useState } from "react";
import "./ConsultaIA.css"; // Importar el archivo CSS
import Groq from "groq-sdk";
import Navbar from '../Navbar/Navbar';

// Inicializar Groq con la clave de API y habilitar el uso en el navegador
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Habilitar el uso en el navegador
});

const GroqQueryComponent = () => {
  const [jsonData, setJsonData] = useState(null); // Estado para almacenar el JSON cargado
  const [error, setError] = useState(""); // Estado para manejar errores
  const [groqResponse, setGroqResponse] = useState(""); // Estado para la respuesta de Groq
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el loading

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
        } catch (err) {
          setError("El archivo no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Función para enviar la consulta a Groq
  const sendGroqQuery = async () => {
    if (!jsonData) {
      setError("No hay datos para realizar la consulta.");
      return;
    }

    setIsLoading(true);
    setGroqResponse("");

    const consulta = `Eres un Contador y Economista experto en presupuestos en base a ventas. Analiza el siguiente JSON y proporciona recomendaciones y observaciones basadas en los datos: ${JSON.stringify(
      jsonData,
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
        max_tokens: 1000,
        temperature: 0.5,
      });

      const response = chatCompletion.choices[0]?.message?.content || "";
      setGroqResponse(response);
      setError("");
    } catch (err) {
      setError("Error al realizar la consulta a Groq.");
      console.error(err);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container">
        
        <header className="header">
        <Navbar />
      </header>
      
      <h1>Consulta de Datos</h1>

      {/* Botón para cargar el archivo JSON */}
      <div className="upload-section">
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

      {/* Botón para realizar la consulta a Groq */}
      {jsonData && (
        <div className="query-section">
          <button onClick={sendGroqQuery} disabled={isLoading}>
            {isLoading ? "Consultando..." : "Consultar Groq"}
          </button>
        </div>
      )}

      {/* Mostrar la respuesta de Groq */}
      {groqResponse && (
        <div className="groq-response">
          <h2>Respuesta</h2>
          {formatGroqResponse(groqResponse)}
        </div>
      )}
    </div>
  );
};

export default GroqQueryComponent;