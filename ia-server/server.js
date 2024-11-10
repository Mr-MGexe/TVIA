const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importar CORS

const app = express();

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(express.json());

// Habilitar CORS para permitir solicitudes desde cualquier origen
app.use(cors()); // Esto permite solicitudes desde cualquier origen (puedes ajustarlo si es necesario)

// Si necesitas restringir a un origen específico (por ejemplo, localhost:8081), puedes hacer lo siguiente:
// app.use(cors({
//   origin: 'http://localhost:8081'
// }));

const PORT = process.env.PORT || 3000;

// Ruta para procesar los comandos de voz
app.post('/process-voice', async (req, res) => {
  const { command } = req.body;

  try {
    // Procesa el comando de voz utilizando Hugging Face
    const response = await processCommandWithNLP(command);

    // Selecciona la acción con la puntuación más alta
    const action = response.labels[0]; // La etiqueta con la puntuación más alta

    // Enviar la respuesta con la acción detectada
    res.json({ action });
  } catch (error) {
    console.error('Error al procesar el comando:', error);
    res.status(500).json({ error: 'Error en el procesamiento de IA' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Función para procesar el comando usando Hugging Face
async function processCommandWithNLP(command) {
  const apiUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
  const apiKey = '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';

  try {
    const response = await axios.post(apiUrl, {
      inputs: command,
      parameters: {
        candidate_labels: ["encender_tv", "apagar_tv", "cambiar_canal", "volumen", "desconocido"]
      }
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const result = response.data;
    return result; // Devuelve toda la respuesta, que contiene "labels" y "scores"
  } catch (error) {
    throw new Error('Error en la API de Hugging Face');
  }
}

