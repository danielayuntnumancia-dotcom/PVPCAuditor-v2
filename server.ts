import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
// Support large image payloads for billing scanning
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// --- API Endpoints ---

// 1. Scan Electricity Bill (Image Analysis with gemini-3.1-pro-preview)
app.post("/api/audit/scan-bill", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Falta la imagen de la factura." });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image,
      },
    };

    const promptPart = {
      text: `Analiza detalladamente esta factura de electricidad de España (típicamente tarifa PVPC 2.0TD o mercado libre). 
Extrae los datos clave y devuélvelos EXACTAMENTE en el siguiente formato JSON estructurado:

{
  "fechaInicio": "YYYY-MM-DD",
  "fechaFin": "YYYY-MM-DD",
  "kwPunta": 4.5,
  "kwValle": 4.5,
  "kwhPunta": 120.5,
  "kwhLlano": 150.2,
  "kwhValle": 180.8,
  "costeTotal": 75.30,
  "esPVPC": true,
  "explicacion": "Análisis rápido de la factura extraída..."
}

Reglas:
- Si no encuentras la fechaInicio o fechaFin de forma exacta, estima unas fechas coherentes basadas en la factura.
- El valor "kwPunta" y "kwValle" suelen estar entre 3.0 y 5.5 kW.
- El valor "kwhPunta", "kwhLlano" y "kwhValle" representan el consumo activo medido en kWh para cada periodo de discriminación horaria (Punta, Llano, Valle).
- El valor "costeTotal" debe ser el importe total de la factura (€).
- El valor "esPVPC" es un booleano: true si indica mercado regulado o comercializadora de referencia (ej: Curenergía, Energía XXI, Baser, Régsiti, Comercializadora Regulada, etc.), false si es mercado libre.
- La "explicacion" debe ser un texto explicativo amigable de lo que has leído (ej. 'Factura de Curenergía del periodo X, con un consumo total de Y kWh. Se observa que la potencia contratada de Z kW es adecuada...').`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", // Use gemini-3.5-flash for faster and reliable free-tier multi-modal analysis
      contents: [imagePart, promptPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fechaInicio: { type: Type.STRING },
            fechaFin: { type: Type.STRING },
            kwPunta: { type: Type.NUMBER },
            kwValle: { type: Type.NUMBER },
            kwhPunta: { type: Type.NUMBER },
            kwhLlano: { type: Type.NUMBER },
            kwhValle: { type: Type.NUMBER },
            costeTotal: { type: Type.NUMBER },
            esPVPC: { type: Type.BOOLEAN },
            explicacion: { type: Type.STRING },
          },
          required: [
            "fechaInicio",
            "fechaFin",
            "kwPunta",
            "kwValle",
            "kwhPunta",
            "kwhLlano",
            "kwhValle",
            "costeTotal",
            "esPVPC",
            "explicacion"
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error al escanear la factura con Gemini:", error);
    res.status(500).json({ error: error.message || "Error procesando la imagen de la factura." });
  }
});

// 2. Gemini Multi-turn Chat Energy Auditor
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, mode, billData } = req.body;

    let modelName = "gemini-3.5-flash";
    const config: any = {};

    // Expert Spanish Energy Auditor System Instructions
    let systemInstruction = `Eres "GemProgramador Luz", un asesor y auditor energético virtual de España, experto en la tarifa regulada PVPC 2.0TD, tarifas de mercado libre, autoconsumo fotovoltaico y optimización del gasto eléctrico.
Habla siempre en español de España de forma clara, empática, didáctica y sumamente profesional.
Utiliza formato Markdown (listas con viñetas, negritas, subtítulos) para que tus respuestas sean perfectamente legibles y estructuradas.

Tus objetivos:
1. Explicar los conceptos de la factura española con palabras sencillas (término fijo de potencia, término variable de energía, peajes de transporte, cargos de distribución, IEE, IVA, alquiler de equipo).
2. Proporcionar recomendaciones de ahorro personalizadas (ej: bajar la potencia si está sobredimensionada, desplazar lavadoras o termo eléctrico a horas llano/valle o fines de semana).
3. Informar sobre el Bono Social de electricidad (requisitos, descuentos de consumidor vulnerable o severo).
4. Realizar comparativas objetivas entre PVPC y mercado libre, explicando los pros y contras de cada uno.`;

    if (billData) {
      systemInstruction += `

CONTEXTO EN TIEMPO REAL - DATOS DE LA AUDITORÍA ACTIVA DEL USUARIO:
- Periodo de facturación: de ${billData.fechaInicio || "no especificado"} a ${billData.fechaFin || "no especificado"} (${billData.dias || 0} días)
- Presupuesto establecido por el usuario: ${billData.presupuesto || "Sin límite"} €
- Potencia Contratada:
  * Punta: ${billData.kwPunta || 0} kW
  * Valle: ${billData.kwValle || 0} kW
- Consumo introducido:
  * Punta: ${billData.kwhPunta || 0} kWh (Precios: peaje ${billData.precioKwhPunta || 0} €/kWh, energía ${billData.costeEnergiaPunta || billData.costeEnergiaVariable || 0} €/kWh)
  * Llano: ${billData.kwhLlano || 0} kWh (Precios: peaje ${billData.precioKwhLlano || 0} €/kWh, energía ${billData.costeEnergiaLlano || billData.costeEnergiaVariable || 0} €/kWh)
  * Valle: ${billData.kwhValle || 0} kWh (Precios: peaje ${billData.precioKwhValle || 0} €/kWh, energía ${billData.costeEnergiaValle || billData.costeEnergiaVariable || 0} €/kWh)
  * Consumo Total: ${billData.kwhTotal || 0} kWh
- Desglose de costes calculados:
  * Término Fijo (Potencia): ${billData.totalFijo || 0} €
  * Término Variable (Energía + Peajes): ${billData.totalVariable || 0} €
  * Impuesto Eléctrico (IEE 5.11%): ${billData.totalIee || 0} €
  * Conceptos Regulados (Bono Social + Alquiler Contador): ${billData.totalRegulados || 0} €
  * Telecomunicaciones (Internet opcional): ${billData.totalInternet || 0} €
  * IVA: ${billData.totalIva || 0} €
  * TOTAL ESTIMADO DE FACTURA: ${billData.totalFactura || 0} €

Usa estos datos activamente en tus respuestas para hacer auditorías a medida. Por ejemplo, calcula qué porcentaje consume en cada periodo y dile si está optimizando bien (el valle es lo más barato, luego llano, y punta lo más caro).`;
    }

    config.systemInstruction = systemInstruction;

    // Apply configuration based on mode
    if (mode === "fast") {
      modelName = "gemini-3.1-flash-lite"; // Low-latency
    } else if (mode === "thinking") {
      modelName = "gemini-3.5-flash"; // High thinking without free tier quota limitations
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Do not set maxOutputTokens for thinking mode per guidelines
    } else if (mode === "grounded") {
      modelName = "gemini-3.5-flash"; // Google Search grounded
      config.tools = [{ googleSearch: {} }];
    } else {
      modelName = "gemini-3.5-flash"; // Normal
    }

    // Convert history for the @google/genai SDK format
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const text = response.text || "No se pudo generar respuesta.";

    // Get search citations
    let citations: any[] = [];
    if (mode === "grounded") {
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        citations = chunks
          .map((chunk: any) => ({
            title: chunk.web?.title || "Fuente de información",
            url: chunk.web?.uri || "",
          }))
          .filter((item: any) => item.url);
      }
    }

    res.json({ text, citations });
  } catch (error: any) {
    console.error("Error en chat de Gemini:", error);
    res.status(500).json({ error: error.message || "Error al procesar la consulta." });
  }
});

// --- Server & Vite Middleware Configuration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PVPC Auditor] Servidor escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer();
