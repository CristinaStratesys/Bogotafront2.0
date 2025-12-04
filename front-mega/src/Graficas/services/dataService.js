// src/services/dataService.js
// Servicio de datos: todas las llamadas a Supabase y transformaciones de datos
// viven aquí para estandarizar el acceso a BBDD.

import {
  SUPABASE_CONFIG,
  SUPABASE_TABLES,
  buildSupabaseHeaders,
  logSupabaseEnv,
} from "../Config/supabaseConfig";
import { PALETTE, EMPLOYEE_ORDER } from "../constants/palette";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const { SUPABASE_URL, SUPABASE_KEY, BASE_URL } = SUPABASE_CONFIG;

// Log de entorno una vez al cargar el módulo
logSupabaseEnv();

/**
 * Método genérico para consultar una tabla de Supabase vía REST.
 * Centraliza logs, manejo de errores y parseo de JSON.
 */
async function fetchFromTable(tableName, queryString = "?select=*") {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ [Supabase] Faltan credenciales. No se puede conectar.");
    return null; // null indica error de conexión
  }

  const url = `${SUPABASE_URL}/rest/v1/${tableName}${queryString}`;
  const headers = buildSupabaseHeaders();

  try {
    console.log(`▶️ [Supabase] GET ${url}`);

    const response = await fetch(url, { headers });
    const raw = await response.clone().text();

    console.log("📡 [Supabase] Status:", response.status, response.statusText);
    console.log("📡 [Supabase] Raw Body:", raw);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${raw}`);
    }

    const data = raw ? JSON.parse(raw) : [];
    console.log(`📡 [Supabase] Parsed JSON (${tableName}):`, data);

    return data || [];
  } catch (err) {
    console.error(
      `❌ [Supabase] Error consultando tabla '${tableName}':`,
      err.message
    );
    return null;
  }
}

// --- Claves de adopción tecnológica (solo se usan aquí) ---
const ADOPTION_KEYS = {
  BAJO: "Bajo - Uso limitado de herramientas tecnologicas basicas",
  MEDIO: "Medio - Digitalizacion de algunos procesos",
  ALTO: "Alto - Automatizacion, analitica, plataformas integradas",
  AVANZADO:
    "Avanzado - Uso intensivo de tecnologias emergentes, IA, IoT, etc.",
};

const ALL_ADOPTION_KEYS = [
  ADOPTION_KEYS.BAJO,
  ADOPTION_KEYS.MEDIO,
  ADOPTION_KEYS.ALTO,
  ADOPTION_KEYS.AVANZADO,
];

const initAdoptionObject = () => ({
  [ADOPTION_KEYS.BAJO]: 0,
  [ADOPTION_KEYS.MEDIO]: 0,
  [ADOPTION_KEYS.ALTO]: 0,
  [ADOPTION_KEYS.AVANZADO]: 0,
});

// Mapeo de industrias normalizadas
const INDUSTRY_MAP = {
  agroindustria: "Agroindustria",
  manufactura: "Manufactura",
  comercio: "Comercio",
  tecnologia: "Tecnología",
  construccion: "Construcción",
  "energia y mineria": "Energía y Minería",
  servicios: "Servicios",
  servicio: "Servicios",
  salud: "Salud",
  otra: "Otra",
  otros: "Otra",
};

/**
 * Normaliza texto eliminando tildes y pasando a minúsculas.
 */
const normalizeText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * Dado un texto de adopción tecnológica (con posibles tildes/variantes),
 * lo mapea a una de las claves canónicas en ADOPTION_KEYS.
 */
const normalizeAdoptionLevel = (value) => {
  const normalized = (value || ADOPTION_KEYS.BAJO)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const normalizedKeys = ALL_ADOPTION_KEYS.map((k) =>
    k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const idx = normalizedKeys.indexOf(normalized);
  return idx >= 0 ? ALL_ADOPTION_KEYS[idx] : ADOPTION_KEYS.BAJO;
};

/**
 * Agrega tecnologías usadas a partir de la columna `techs` de la tabla respuestas.
 */
const getTechAggregated = (rows) => {
  if (!rows || rows.length === 0) return [];

  const techCount = {};

  rows.forEach((row) => {
    const arr = Array.isArray(row.techs) ? row.techs : [];

    arr.forEach((tech) => {
      const name = (tech || "").trim();
      if (!name) return;
      techCount[name] = (techCount[name] || 0) + 1;
    });
  });

  const result = Object.entries(techCount).map(([name, count]) => ({
    name,
    value: count,
  }));

  // Ordenar de mayor a menor
  result.sort((a, b) => b.value - a.value);
  return result;
};

/**
 * Devuelve el objeto completo de distribución:
 *  - treemap por industria
 *  - donut por empleados
 *  - adopción por industria
 *  - adopción por volumen de ventas
 */
const getDistributionData = async () => {
  try {
    console.log("[DataService] Llamando a backend /api/distribution...");

    const res = await fetch(`${API_BASE_URL}/api/distribution`);

    if (!res.ok) {
      const raw = await res.text();
      console.error(
        "[DataService] Error HTTP en /api/distribution:",
        res.status,
        res.statusText,
        raw
      );
      return {
        error: `No se pudo obtener la distribución (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    console.log("[DataService] Respuesta /api/distribution:", data);

    // Por si el backend marca tabla vacía
    const hasTreemap = Array.isArray(data.treemap) && data.treemap.length > 0;
    const hasEmployees =
      data.employees &&
      Array.isArray(data.employees.total) &&
      data.employees.total.length > 0;

    if (!hasTreemap && !hasEmployees) {
      return {
        ...data,
        empty:
          data.empty ||
          "No se encontraron datos en la tabla de respuestas.",
      };
    }

    // El backend ya devuelve la estructura lista:
    // { treemap, employees, techAdoption, salesAdoption, ... }
    return data;
  } catch (err) {
    console.error(
      "[DataService] Excepción al llamar a /api/distribution:",
      err
    );
    return {
      error:
        "Ocurrió un error al conectar con el backend de distribución de datos.",
    };
  }
};

/**
 * Lee todas las respuestas y devuelve el % de empresas que usan cada tecnología.
 */
const getTechUsagePercentages = async () => {
  try {
    console.log("[DataService] Llamando a backend /api/tech-usage...");

    const res = await fetch(`${API_BASE_URL}/api/tech-usage`);

    if (!res.ok) {
      const raw = await res.text();
      console.error(
        "[DataService] Error HTTP en /api/tech-usage:",
        res.status,
        res.statusText,
        raw
      );
      return {
        error: `No se pudo obtener tecnologías utilizadas (HTTP ${res.status}).`,
        techs: [],
      };
    }

    const data = await res.json();
    console.log("[DataService] Respuesta /api/tech-usage:", data);

    const techs = Array.isArray(data.techs) ? data.techs : [];

    if (!techs.length) {
      return {
        empty:
          data.empty ||
          "No se encontraron registros de tecnologías en las respuestas.",
        techs: [],
      };
    }

    // El backend ya envía [{ name, value }] con value = %
    return { techs };
  } catch (err) {
    console.error(
      "[DataService] Excepción al llamar a /api/tech-usage:",
      err
    );
    return {
      error:
        "Ocurrió un error al conectar con el backend de tecnologías utilizadas.",
      techs: [],
    };
  }
};

/**
 * Devuelve las palabras de la nube desde la tabla `nube_palabras`.
 */
const getWordCloudData = async () => {
  const params = new URLSearchParams({
    select: "palabra,frecuencia",
  });
  params.append("order", "frecuencia.desc");

  const data = await fetchFromTable(
    SUPABASE_TABLES.NUBE_PALABRAS,
    `?${params.toString()}`
  );

  if (data === null) {
    return {
      error:
        "No se pudo conectar a la base de datos para leer la tabla 'nube_palabras'.",
      words: [],
    };
  }

  if (!data.length) {
    return {
      empty: "No se encontraron registros en la tabla 'nube_palabras'.",
      words: [],
    };
  }

  const mapped = data
    .map((row) => ({
      text: (row.palabra || "").toUpperCase(),
      value: Number(row.frecuencia) || 0,
    }))
    .filter((w) => w.text && w.value > 0);

  return { words: mapped };
};

/**
 * Devuelve el último registro de la tabla `llm` con las tres columnas usadas.
 */
const getLatestLlmVision = async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ [Supabase] Faltan credenciales para leer 'llm'.");
    return null;
  }

  const query =
    "?select=pregunta_1,pregunta_2,resumen_final&order=created_at.desc&limit=1";
  const url = `${BASE_URL}/rest/v1/${SUPABASE_TABLES.LLM}${query}`;

  try {
    console.log("▶️ [Supabase] GET", url);
    const response = await fetch(url, {
      method: "GET",
      headers: buildSupabaseHeaders(),
    });

    const raw = await response.clone().text();
    console.log("📡 [Supabase llm] Status:", response.status, response.statusText);
    console.log("📡 [Supabase llm] Raw:", raw);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw}`);

    const data = raw ? JSON.parse(raw) : [];
    return data?.[0] || null;
  } catch (err) {
    console.error("❌ [Supabase] Error leyendo 'llm':", err);
    return null;
  }
};

export const DataService = {
  getDistributionData,
  getTechUsagePercentages,
  getWordCloudData,
  getLatestLlmVision,
};
