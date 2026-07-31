import { GoogleGenAI, Type } from "@google/genai";

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

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  try {
    const { fileBase64, mimeType } = JSON.parse(event.body || "{}");

    if (!fileBase64 || !mimeType) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing file data",
        }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Falta la clave GEMINI_API_KEY.",
        }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Extrae los datos de esta factura eléctrica.

Presta atención a lo siguiente:

- Si los consumos de energía (P1, P2, P3) o las potencias están divididos en varios tramos o periodos de fechas dentro de la misma factura, súmalos.

- "dias" son los días facturados.

- "importeActual" es el importe total con impuestos.

Devuelve únicamente:

{
  "potenciaP1": 0,
  "potenciaP2": 0,
  "consumoP1": 0,
  "consumoP2": 0,
  "consumoP3": 0,
  "dias": 0,
  "importeActual": 0
}
`;

    const models = [
      process.env.GEMINI_MODEL?.trim(),
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ].filter(Boolean) as string[];

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

        if (!response.text) {
          throw new Error("No response from AI");
        }

        return {
          statusCode: 200,
          body: response.text,
          headers: {
            "Content-Type": "application/json",
          },
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "No se pudo leer la factura.",
        details: formatAiError(error),
      }),
    };
  }
};
