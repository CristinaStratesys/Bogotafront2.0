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
  const realData = await fetchFromTable(SUPABASE_TABLES.RESPUESTAS);

  if (realData === null) {
    return {
      error: "No se pudo conectar a la base de datos.",
      treemap: [],
      employees: { total: [] },
    };
  }

  if (realData.length === 0) {
    return {
      empty: "No se encontraron datos en la tabla.",
      treemap: [],
      employees: { total: [] },
      techAdoption: { total: [] },
      salesAdoption: { total: [] },
    };
  }

  console.log("📡 [Service] Procesando datos de respuestas...");

  const sectors = {}; // Empresas por industria
  const employeesGroups = {
    "1-50": 0,
    "51-200": 0,
    "201-500": 0,
    ">500": 0,
  };
  const sectorsTech = {}; // Adopción por industria
  const salesVol = {}; // Adopción por volumen de ventas

  realData.forEach((row) => {
    // 1) INDUSTRIA
    const industriaRaw = row.industria
      ? normalizeText(row.industria)
      : "otra";

    const industria = INDUSTRY_MAP[industriaRaw] || "Otra";

    // Contar empresas por industria
    sectors[industria] = (sectors[industria] || 0) + 1;

    // Estructura de adopción por industria
    if (!sectorsTech[industria]) {
      sectorsTech[industria] = initAdoptionObject();
    }

    // 2) EMPLEADOS (normalizar guiones)
    let numEmpleados = (row.empleados || "1-50")
      .replace(/[\u2013\u2014\u2212]/g, "-") // – — − -> -
      .trim();

    if (!EMPLOYEE_ORDER.includes(numEmpleados)) {
      numEmpleados = ">500";
    }
    employeesGroups[numEmpleados] =
      (employeesGroups[numEmpleados] || 0) + 1;

    // 3) ADOPCIÓN TECNOLÓGICA
    const adopcion = normalizeAdoptionLevel(row.adopcion_tech);
    sectorsTech[industria][adopcion] += 1;

    // 4) VOLUMEN DE VENTAS
    const ventas =
      row.volumen_ventas && row.volumen_ventas.trim() !== ""
        ? row.volumen_ventas.trim()
        : "Otros";

    if (!salesVol[ventas]) {
      salesVol[ventas] = initAdoptionObject();
    }

    const adopcionSales = normalizeAdoptionLevel(row.adopcion_tech);
    salesVol[ventas][adopcionSales] += 1;
  });

  // --- Treemap por industria ---
  let treemapData = Object.keys(sectors).map((key) => ({
    name: key,
    size: sectors[key],
    fill: PALETTE.industries[key] || PALETTE.industries["Otra"],
  }));

  // Orden mayor→menor
  treemapData.sort((a, b) => b.size - a.size);

  // --- Distribución por empleados ---
  const employeeData = EMPLOYEE_ORDER.map((key) => ({
    name: key,
    value: employeesGroups[key] || 0,
  }));

  // --- Adopción tecnológica por industria (porcentajes) ---
  let techAdoptionData = Object.entries(sectorsTech).map(
    ([industry, levels]) => {
      const total = Object.values(levels).reduce((sum, n) => sum + n, 0);
      return {
        name: industry,
        Bajo: total ? (levels[ADOPTION_KEYS.BAJO] / total) * 100 : 0,
        Medio: total ? (levels[ADOPTION_KEYS.MEDIO] / total) * 100 : 0,
        Alto: total ? (levels[ADOPTION_KEYS.ALTO] / total) * 100 : 0,
        Avanzado: total ? (levels[ADOPTION_KEYS.AVANZADO] / total) * 100 : 0,
      };
    }
  );

  // Orden alfabético con "Otra" al final
  techAdoptionData.sort((a, b) => {
    if (a.name === "Otra") return 1;
    if (b.name === "Otra") return -1;
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });

  // --- Adopción por volumen de ventas ---
  let salesAdoptionData = Object.entries(salesVol).map(
    ([ventas, levels]) => {
      const total = Object.values(levels).reduce((sum, n) => sum + n, 0);
      return {
        name: ventas,
        Bajo: total ? (levels[ADOPTION_KEYS.BAJO] / total) * 100 : 0,
        Medio: total ? (levels[ADOPTION_KEYS.MEDIO] / total) * 100 : 0,
        Alto: total ? (levels[ADOPTION_KEYS.ALTO] / total) * 100 : 0,
        Avanzado: total ? (levels[ADOPTION_KEYS.AVANZADO] / total) * 100 : 0,
      };
    }
  );

  console.log("📡 [Service] Resultado final listo.", {
    treemapData,
    employeeData,
    techAdoptionData,
    salesAdoptionData,
  });

  return {
    treemap: treemapData,
    employees: { total: employeeData },
    techAdoption: { total: techAdoptionData },
    salesAdoption: { total: salesAdoptionData },
  };
};

/**
 * Lee todas las respuestas y devuelve el % de empresas que usan cada tecnología.
 */
const getTechUsagePercentages = async () => {
  const rows = await fetchFromTable(SUPABASE_TABLES.RESPUESTAS);

  if (rows === null) {
    return { error: "No se pudo conectar a la base de datos.", techs: [] };
  }

  if (rows.length === 0) {
    return { empty: "No se encontraron datos en la tabla.", techs: [] };
  }

  const aggregated = getTechAggregated(rows);
  const totalCompanies = rows.length;

  const percentTechs = aggregated.map((t) => ({
    name: t.name,
    value: totalCompanies
      ? Math.round((t.value / totalCompanies) * 100)
      : 0,
  }));

  return { techs: percentTechs };
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
