// Proveedores de IA para refinar recetas
// Prioridad: Groq (gratis) > API de usuario > Fallback local

import { RecetaCampeon } from "./campeonesDatabase";
import { generateRecetaConBaseDeDatos } from "./localRecipeGenerator";

// Tipos de proveedores
export type AIProvider = "groq" | "gemini" | "openai" | "claude" | "local";

export interface RecipeParams {
  origen: string;
  proceso: string;
  metodo: string;
  molino: string;
  variedad?: string;
  observacionesProceso?: string;
  observaciones?: string;
  feedback?: string;
}

export interface GeneratedRecipe {
  temperatura: number;
  ratio: number;
  cafeGramos: number;
  aguaGramos: number;
  tiempoExtraccion: number;
  molienda: {
    tipo: string;
    granulometria: string;
    clics: string;
  };
  saborPerfil: string;
  instrucciones: string[];
  notaBarista: string;
}

// Clave Groq (gratuita, 14k req/día)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Función para construir el prompt
function construirPrompt(params: RecipeParams, baseRecipe?: RecetaCampeon | null): string {
  const baseInfo = baseRecipe 
    ? `
RECETA BASE DE REFERENCIA:
- Competencia: ${baseRecipe.competencia} ${baseRecipe.year}
- Barista: ${baseRecipe.barista}
- Origen: ${baseRecipe.origen}
- Variedad: ${baseRecipe.variedad || 'No especificada'}
- Proceso: ${baseRecipe.proceso}
- Método: ${baseRecipe.metodo}
- Temperatura: ${baseRecipe.temperatura}°C
- Ratio: 1:${baseRecipe.ratio}
- Café: ${baseRecipe.cafeGramos}g
- Agua: ${baseRecipe.aguaGramos}g
- Tiempo: ${baseRecipe.tiempoExtraccion}s
- Molino: ${baseRecipe.molino}
`
    : "";

  return `Eres un barista experto en café de especialidad. Based on real competition recipes, refine parameters for a custom recipe.

${baseInfo}

PARÁMETROS DEL USUARIO:
- Origen del café: ${params.origen}
- Proceso: ${params.proceso}
- Método de extracción: ${params.metodo}
- Molino: ${params.molino}
${params.variedad ? `- Variedad: ${params.variedad}` : ''}
${params.observacionesProceso ? `- Observaciones del proceso: ${params.observacionesProceso}` : ''}
${params.observaciones ? `- Notas adicionales: ${params.observaciones}` : ''}
${params.feedback ? `- Feedback de cata anterior: ${params.feedback}` : ''}

Devuelve SOLO un objeto JSON válido con esta estructura exacta:
{
  "temperatura": número en °C (ej: 93),
  "ratio": número (ej: 15.5),
  "cafeGramos": número (ej: 15),
  "aguaGramos": número (ej: 232),
  "tiempoExtraccion": número en segundos (ej: 195),
  "molienda": {
    "tipo": "gruesa|media-gruesa|media|media-fina|fina|extra-fina",
    "granulometria": "rango en μm (ej: 300-400 μm)",
    "clics": "rango de clics según molino (ej: 20-24 clics)"
  },
  "saborPerfil": "notas de cata separadas por coma (ej: Jazmín, Bergamota, Té negro)",
  "instrucciones": ["paso 1", "paso 2", ...],
  "notaBarista": "consejo breve del barista"
}

Consideraciones:
- La temperatura varía según proceso: Lavado (92-94°C), Natural (90-92°C), Honey (91-93°C), Anaeróbico (89-91°C)
- El ratio varía según proceso: Lavado (1:15-16), Natural (1:14-15), Honey (1:14.5-15.5), Anaeróbico (1:13.5-14.5)
- Considera la variedad y origen para notas de cata
- Adapta la molienda al molino específico del usuario`;
}

// Llamar a Groq (gratuito)
async function callGroq(prompt: string): Promise<GeneratedRecipe> {
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content from Groq");
  }

  return JSON.parse(content);
}

// Llamar a Gemini (API del usuario)
async function callGemini(prompt: string, apiKey: string): Promise<GeneratedRecipe> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error("No content from Gemini");
  }

  return JSON.parse(content);
}

// Llamar a OpenAI (API del usuario)
async function callOpenAI(prompt: string, apiKey: string, model = "gpt-3.5-turbo"): Promise<GeneratedRecipe> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content from OpenAI");
  }

  return JSON.parse(content);
}

// Llamar a Claude (API del usuario)
async function callClaude(prompt: string, apiKey: string): Promise<GeneratedRecipe> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  
  if (!content) {
    throw new Error("No content from Claude");
  }

  return JSON.parse(content);
}

// Función principal para generar receta con IA
export async function generateRecipeWithAI(
  params: RecipeParams,
  baseRecipe?: RecetaCampeon | null
): Promise<{
  receta: GeneratedRecipe;
  provider: AIProvider;
  isFallback: boolean;
}> {
  
  // 1. Intentar con Groq (gratuito)
  if (GROQ_API_KEY) {
    try {
      const prompt = construirPrompt(params, baseRecipe);
      const receta = await callGroq(prompt);
      return { receta, provider: "groq", isFallback: false };
    } catch (error) {
      console.warn("Groq failed, trying user API:", error);
    }
  }

  // 2. Intentar con API del usuario (Gemini)
  const userGeminiKey = localStorage.getItem("gato_brew_gemini_api_key");
  if (userGeminiKey) {
    try {
      const prompt = construirPrompt(params, baseRecipe);
      const receta = await callGemini(prompt, userGeminiKey);
      return { receta, provider: "gemini", isFallback: false };
    } catch (error) {
      console.warn("Gemini failed:", error);
    }
  }

  // 3. Intentar con API del usuario (OpenAI)
  const userOpenAIKey = localStorage.getItem("gato_brew_openai_api_key");
  if (userOpenAIKey) {
    try {
      const prompt = construirPrompt(params, baseRecipe);
      const receta = await callOpenAI(prompt, userOpenAIKey);
      return { receta, provider: "openai", isFallback: false };
    } catch (error) {
      console.warn("OpenAI failed:", error);
    }
  }

  // 4. Intentar con API del usuario (Claude)
  const userClaudeKey = localStorage.getItem("gato_brew_claude_api_key");
  if (userClaudeKey) {
    try {
      const prompt = construirPrompt(params, baseRecipe);
      const receta = await callClaude(prompt, userClaudeKey);
      return { receta, provider: "claude", isFallback: false };
    } catch (error) {
      console.warn("Claude failed:", error);
    }
  }

  // 5. Fallback: base de datos + variación aleatoria
  console.log("Using local fallback (base de datos + random)");
  const recetaLocal = generateRecetaConBaseDeDatos(
    params.origen,
    params.proceso,
    params.metodo,
    params.molino,
    params.observaciones,
    params.observacionesProceso,
    params.feedback,
    params.variedad
  );

  return {
    receta: {
      temperatura: recetaLocal.temperaturaNum,
      ratio: recetaLocal.ratioNum,
      cafeGramos: recetaLocal.cafeGramos,
      aguaGramos: recetaLocal.aguaGramos,
      tiempoExtraccion: recetaLocal.tiempoExtraccionSegundos,
      molienda: {
        tipo: recetaLocal.moliendaDetalle?.tipo || "media-fina",
        granulometria: recetaLocal.moliendaDetalle?.granulometria || "300-400 μm",
        clics: recetaLocal.moliendaDetalle?.clicsComandante || "20-24"
      },
      saborPerfil: recetaLocal.saborPerfil,
      instrucciones: recetaLocal.instrucciones,
      notaBarista: recetaLocal.notasBarista
    },
    provider: "local",
    isFallback: true
  };
}

// Verificar si Groq está configurado
export function isGroqConfigured(): boolean {
  return Boolean(GROQ_API_KEY);
}
