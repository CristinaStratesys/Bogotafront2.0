// src/Graficas/Config/supabaseConfig.js

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";

const BASE_URL = SUPABASE_URL.endsWith("/")
  ? SUPABASE_URL.slice(0, -1)
  : SUPABASE_URL;

export const SUPABASE_TABLES = {
  RESPUESTAS: "respuestas",
  NUBE_PALABRAS: "nube_palabras",
  LLM: "llm",
};

export const SUPABASE_CONFIG = {
  SUPABASE_URL,
  SUPABASE_KEY,
  BASE_URL,
};

export const buildSupabaseHeaders = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export const logSupabaseEnv = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "⚠️ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_KEY en el .env. No se podrá conectar a Supabase."
    );
  } else {
    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLES.RESPUESTAS}`;
    console.log("🔍 [ENV] VITE_SUPABASE_URL:", SUPABASE_URL);
    console.log(
      "🔍 [ENV] VITE_SUPABASE_KEY (primeros 6 chars):",
      SUPABASE_KEY.substring(0, 6)
    );
    console.log("🔍 [ENV] ENDPOINT construido:", endpoint);
    console.log("🔍 [ENV] URL de prueba:", `${endpoint}?select=*`);
  }
};
