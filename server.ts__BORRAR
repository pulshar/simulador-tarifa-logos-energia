import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: ".env.local" });
dotenv.config();

function formatAiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("quota") ||
      message.includes("rate limit") ||
      message.includes("resource_exhausted") ||
      message.includes("429")
    ) {
      return "La API de Gemini ha excedido su cuota o límite de peticiones. Espera unos minutos o usa una cuenta con acceso de pago para seguir subiendo facturas.";
    }
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }
  }

  return "Error procesando la factura";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to accommodate Base64 encoded PDFs
  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.post("/api/extract-invoice", async (req, res) => {
    try {
      const { fileBase64, mimeType } = req.body;
      if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing file data" });
      }

      const apiKey = (
        process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
      )?.trim();
      if (!apiKey) {
        return res.status(500).json({
          error: "Falta la clave GEMINI_API_KEY.",
          details:
            "Añade tu clave en el archivo .env.local o en la configuración del entorno antes de volver a intentar.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Extrae los datos de esta factura eléctrica.
        Presta atención a lo siguiente:
        - Si los consumos de energía (P1, P2, P3) o las potencias están divididos en varios tramos o periodos de fechas dentro de la misma factura (por ejemplo, diferentes líneas para el mismo periodo P1), SÚMALOS y devuelve el total.
        - "dias" (días facturados) suele venir como el total de días o alquiler de equipos.
        - "importeActual" es el importe total a pagar de la factura (con impuestos incluidos).
        Devuelve ÚNICAMENTE un JSON con este formato y todas las claves requeridas. Los valores deben ser numéricos:
        {
          "potenciaP1": 4.4,
          "potenciaP2": 4.4,
          "consumoP1": 25.0,
          "consumoP2": 30.0,
          "consumoP3": 34.0,
          "dias": 30,
          "importeActual": 40.17
        }
      `;

      const models = [
        process.env.GEMINI_MODEL?.trim(),
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
      ].filter((model): model is string => Boolean(model));

      let lastError: unknown;
      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      data: fileBase64,
                      mimeType: mimeType,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  potenciaP1: { type: Type.NUMBER },
                  potenciaP2: { type: Type.NUMBER },
                  consumoP1: { type: Type.NUMBER },
                  consumoP2: { type: Type.NUMBER },
                  consumoP3: { type: Type.NUMBER },
                  dias: { type: Type.NUMBER },
                  importeActual: { type: Type.NUMBER },
                },
                required: [
                  "potenciaP1",
                  "potenciaP2",
                  "consumoP1",
                  "consumoP2",
                  "consumoP3",
                  "dias",
                ],
              },
            },
          });

          const dataText = response.text;
          if (!dataText) {
            throw new Error("No response from AI");
          }

          const data = JSON.parse(dataText);
          return res.json(data);
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ?? new Error("No response from AI");
    } catch (error) {
      console.error("Error processing invoice:", error);
      const message = formatAiError(error);
      res.status(500).json({
        error: "No se pudo leer la factura.",
        details: message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
