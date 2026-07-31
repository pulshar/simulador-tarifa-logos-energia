import { GoogleGenAI } from "@google/genai";

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
Analiza esta factura eléctrica.

Extrae únicamente estos campos:

{
  "potenciaP1": number,
  "potenciaP2": number,
  "consumoP1": number,
  "consumoP2": number,
  "consumoP3": number,
  "dias": number,
  "importeActual": number
}

Reglas:

- Responde EXCLUSIVAMENTE con un JSON válido.
- No escribas explicaciones.
- No uses Markdown.
- No utilices \`\`\`.
- Si un dato no existe devuelve 0.
- Si un valor aparece en varias líneas, súmalo.
`;

    let lastError: unknown;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: fileBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

     let data;

     try {
       data = JSON.parse(response.text);
     } catch {
       throw new Error(
         `Gemini no devolvió un JSON válido:\n\n${response.text}`,
       );
     }

      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      };
    } catch (err) {
      lastError = err;
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
