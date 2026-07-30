import { GoogleGenAI, Type } from "@google/genai";
import type { Request, Response } from "express";

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

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({
        error: "Missing file data",
      });
    }

    const apiKey = (
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
    )?.trim();

    if (!apiKey) {
      return res.status(500).json({
        error: "Falta la clave GEMINI_API_KEY.",
        details:
          "Añade la variable GEMINI_API_KEY en Vercel (Project → Settings → Environment Variables).",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Extrae los datos de esta factura eléctrica.

Presta atención a lo siguiente:

- Si los consumos de energía (P1, P2, P3) o las potencias están divididos en varios tramos o periodos de fechas dentro de la misma factura (por ejemplo, diferentes líneas para el mismo periodo P1), SÚMALOS y devuelve el total.

- "dias" (días facturados) suele venir como el total de días o alquiler de equipos.

- "importeActual" es el importe total a pagar de la factura (con impuestos incluidos).

Devuelve ÚNICAMENTE un JSON con este formato y todas las claves requeridas.

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
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ].filter((m): m is string => Boolean(m));

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
                    mimeType,
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
                "importeActual",
              ],
            },
          },
        });

        const dataText = response.text;

        if (!dataText) {
          throw new Error("No response from AI");
        }

        return res.status(200).json(JSON.parse(dataText));
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError ?? new Error("No response from AI");
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "No se pudo leer la factura.",
      details: formatAiError(error),
    });
  }
}
