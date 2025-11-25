import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Treemap
} from 'recharts';
import {
  ChevronRight, ChevronLeft, Activity, Brain, Users, Building2,
  Zap, Database, Globe, Share2, Rocket, AlertTriangle, Clock, TrendingUp
} from 'lucide-react';
// La librería @supabase/supabase-js ha sido eliminada. Usaremos 'fetch' directamente.
 
 
// --- SUPABASE INITIALIZATION (Direct Access via Env Vars) ---
// Accedemos a las variables de entorno inyectadas por el entorno de desarrollo.
// Usamos window.env para compatibilidad y evitamos 'import.meta.env' para solucionar la advertencia.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const TABLE_NAME = "respuestas"; // Nombre de la tabla
const BASE_URL = SUPABASE_URL.endsWith('/') ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
const ENDPOINT = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`;
 
console.log("🔍 [ENV] VITE_SUPABASE_URL:", SUPABASE_URL);
console.log("🔍 [ENV] VITE_SUPABASE_KEY (primeros 6 chars):", SUPABASE_KEY?.substring(0, 6));
 
console.log("🔍 [ENV] ENDPOINT construido:", ENDPOINT);
console.log("🔍 [ENV] URL final usada en la llamada:", `${ENDPOINT}?select=*`);
 
 
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_KEY en el archivo .env. No se podrá conectar a Supabase.");
} else {
    // LOGS: Añadimos logs de depuración aquí para ver a dónde intenta conectar.
    console.log(`[DEBUG] Intentando conectar a: ${ENDPOINT}`);
    console.log(`[DEBUG] Con Supabase Key (Prefix): ${SUPABASE_KEY.substring(0, 4)}...`);
}
 
// --- CONSTANTS & PALETTE ---
const PALETTE = {
  primary: '#E30613',    // Rojo CCB
  secondary: '#BA0C2F',  // Rojo Oscuro
  dark: '#1A1A1A',
  light: '#F9F9F9',
  white: '#FFFFFF',
  text: '#333333',
  gray: '#CCCCCC',
  industries: {
    'Manufactura': '#E30613',
    'Construcción': '#0E3A63',
    'Tecnología': '#5CA6D1',
    'Comercio': '#F4C542',
    'Energía y Minería': '#9A70D6',
    'Agroindustria': '#9DD9C4',
    'Salud': '#30A66D',
    'Servicios': '#5BB3C4',
    'Otra': '#EFA86E'
  },
  levels: {
    'Bajo': '#E30613',
    'Medio': '#F4C542',
    'Alto': '#30A66D',
    'Avanzado': '#0E3A63'
  }
};
 
// --- DATA SERVICE (SUPABASE ONLY) ---
const DataService = {
  /**
   * Intenta obtener datos reales de Supabase usando la API REST nativa.
   * Devuelve un array con los datos o null/empty array si hay error/no hay datos.
   */
  fetchFromSupabase: async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("Faltan credenciales de Supabase. No se puede conectar.");
        return null;
    }
 
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Accept": "application/json",
    };
 
    try {
        const response = await fetch(`${ENDPOINT}?select=*`, { headers });
       
        console.log("📡 [RESPONSE] Status:", response.status);
        console.log("📡 [RESPONSE] Status Text:", response.statusText);
 
        const raw = await response.clone().text();
        console.log("📡 [RESPONSE] Raw Body:", raw);
 
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
       
        const data = await response.json();
        console.log("📡 [RESPONSE] Parsed JSON Data:", data);
        // Si no hay datos, devolvemos un array vacío para indicar que la consulta fue exitosa pero no hay registros
        return data || [];
    } catch (err) {
        console.error("Error conectando a Supabase REST API:", err.message);
        // Si hay un error de conexión, devolvemos null para indicar el fallo
        return null;
    }
  },
 
  getDistributionData: async () => {
  const realData = await DataService.fetchFromSupabase();
 
  if (realData === null) {
    return { error: "No se pudo conectar a la base de datos.", treemap: [], employees: { total: [] } };
  }
 
  if (realData.length === 0) {
    return { empty: "No se encontraron datos en la tabla.", treemap: [], employees: { total: [] } };
  }
 
  console.log("📡 [Service] Procesando datos...");
 
 
  ///HACER TODOS LOS PROCESAMIENTOS AQUI
  // Agrupaciones reales  
  const sectors = {};
  const employeesGroups = { '1-50': 0, '51-200': 0, '201-500': 0, '>500': 0 };
  //const techLevels = { 'Bajo - Uso limitado de herramientas tecnológicas básicas': 0, 'Medio - Digitalización de algunos procesos': 0, 'Alto - Automatización, analítica, plataformas integradas': 0, 'Avanzado - Uso intensivo de tecnologías emergentes, IA, IoT, etc.': 0 };
  const sectorsTech = {};
 
 
  realData.forEach(row => {
    // Procesar industrias
    const industria = row.industria && row.industria.trim() !== "" ? row.industria : "Otros";
    sectors[industria] = (sectors[industria] || 0) + 1;
   
    // Procesar número de empleados
    const numEmpleados = row.empleados || '1-50';
    employeesGroups[numEmpleados] = employeesGroups[numEmpleados] || 0;
     if (employeesGroups.hasOwnProperty(numEmpleados)) {
      employeesGroups[numEmpleados] += 1;
    }
    // Procesar nivel de adopción tecnológica
 
    const adopcion_tech = row.adopcion_tech || 'Bajo - Uso limitado de herramientas tecnológicas básicas';
    if (!sectorsTech[industria]) {
    sectorsTech[industria] = {
      'Bajo - Uso limitado de herramientas tecnológicas básicas': 0,
      'Medio - Digitalización de algunos procesos': 0,
      'Alto - Automatización, analítica, plataformas integradas': 0,
      'Avanzado - Uso intensivo de tecnologías emergentes, IA, IoT, etc.': 0
    };
  }
 
  sectorsTech[industria][adopcion_tech] += 1;
});
   
 
 
 
 
  const treemapData = Object.keys(sectors).map(key => ({
    name: key,
    size: sectors[key],
    fill: PALETTE.industries[key] || PALETTE.industries['Otra']
  }));
 
  const employeeData = Object.keys(employeesGroups).map(key => ({
    name: key,
    value: employeesGroups[key]
  }));
 
  const techAdoptionData = Object.entries(sectorsTech).map(([industry, levels]) => {
    const total = Object.values(levels).reduce((sum, n) => sum + n, 0);
    return {
      name: industry,
      Bajo: total ? (levels["Bajo - Uso limitado de herramientas tecnológicas básicas"] / total) * 100 : 0,
      Medio: total ? (levels["Medio - Digitalización de algunos procesos"] / total) * 100 : 0,
      Alto: total ? (levels["Alto - Automatización, analítica, plataformas integradas"] / total) * 100 : 0,
      Avanzado: total ? (levels["Avanzado - Uso intensivo de tecnologías emergentes, IA, IoT, etc."] / total) * 100 : 0,
    };
  });
 
 
  console.log("📡 [Service] Resultado final listo.");
 
  return {
    treemap: treemapData,
    employees: { total: employeeData },
    techAdoption:{ total: techAdoptionData}
  };
}
 
};
 
// --- UI COMPONENTS ---
 
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);
 
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
      <div className="w-2 h-8 bg-[#E30613] rounded-full"></div>
      {title}
    </h2>
    {subtitle && <p className="text-gray-500 mt-1 ml-5 text-lg">{subtitle}</p>}
  </div>
);
 
const LoadingOverlay = ({ text }) => (
  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fadeIn">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-[#E30613] rounded-full border-t-transparent animate-spin"></div>
      <Brain className="absolute inset-0 m-auto text-[#E30613] animate-pulse" size={32} />
    </div>
    <h3 className="text-2xl font-bold text-[#E30613] animate-pulse">{text}</h3>
    <p className="text-gray-500 mt-2">Intentando conexión con la API REST de Supabase...</p>
  </div>
);
 
const NoDataMessage = ({ message, isError }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-xl border-4 border-dashed border-gray-200">
    <AlertTriangle size={48} className={isError ? "text-red-500" : "text-yellow-500"} />
    <h3 className="mt-4 text-2xl font-bold text-gray-700">{isError ? "Error de Conexión" : "Sin Datos"}</h3>
    <p className="mt-2 text-gray-500">{message}</p>
    <p className="mt-4 text-sm text-gray-400">Verifica tus variables de entorno y el estado de la tabla '{TABLE_NAME}' en Supabase.</p>
  </div>
);
 
 
// --- SLIDE COMPONENTS ---
 
const IntroSlide = ({ onNext }) => (
  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 text-center p-10 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-2 bg-[#E30613]"></div>
    <div className="animate-slideUp space-y-8 z-10 max-w-4xl">
      <div className="flex justify-center gap-8 mb-8 opacity-0 animate-fadeIn delay-300" style={{ animationFillMode: 'forwards' }}>
        <div className="flex flex-col items-end border-r-2 border-gray-300 pr-8">
          <h3 className="text-3xl font-bold text-[#333]">Cámara de Comercio</h3>
          <h3 className="text-3xl font-light text-[#E30613]">de Bogotá</h3>
        </div>
        <div className="flex flex-col items-start pl-2 justify-center">
           <h3 className="text-4xl font-bold text-gray-800 tracking-tight">stratesys</h3>
        </div>
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-sm">
        Resultados Proyecto <span className="text-[#E30613]">MEGA</span>
      </h1>
      <h2 className="text-3xl text-gray-600 font-light">
        Encuesta de Visión Empresarial 2025
      </h2>
      <div className="pt-12">
        <button
          onClick={onNext}
          className="group bg-[#E30613] text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:bg-[#BA0C2F] hover:scale-105 transition-all flex items-center gap-3 mx-auto"
        >
          Iniciar Presentación
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
);

// --- NUEVA ESTRUCTURA DE DATOS MOCK PARA IA ---
const AI_TIMELINE_DATA = [
    {
        period: "HOY (2025)", // Título fijo
        icon: Clock, // Icono fijo
        theme: "Foco en la Resiliencia",
        description: "El análisis actual se centra en la **resiliencia operativa y la digitalización básica** para asegurar la estabilidad del flujo de caja y mantener la competitividad en mercados volátiles."
    },
    {
        period: "EVOLUCIÓN", // Título fijo
        icon: TrendingUp, // Icono fijo
        theme: "La Brecha Estratégica",
        description: "La **transición** crítica exige pasar de la eficiencia (estandarización) a la creación de valor mediante la **innovación continua**, la construcción de una sólida gobernanza de datos y el desarrollo de nuevos liderazgos."
    },
    {
        period: "+18 AÑOS (2043)", // Título fijo
        icon: Rocket, // Icono fijo
        theme: "Visión de Liderazgo Global",
        description: "El futuro se define por la **integración total de la IA** para la toma de decisiones predictiva, modelos de negocio regenerativos basados en la economía circular y una fuerza laboral especializada en Deep Tech."
    }
];

 
const Block1 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
  if (isActive && !data) {
    setLoading(true);
 
    const loadData = async () => {
      console.log("▶️ [Block1] Ejecutando getDistributionData()");
      const result = await DataService.getDistributionData();
      console.log("📊 [Block1] Resultado recibido:", result);
 
      setData(result);
      setLoading(false);
    };
 
    loadData();
  }
}, [isActive, data]);
 
  if (loading || data === null) return <LoadingOverlay text="Cargando Demografía..." />;
 
  if (data.error) {
    return <div className="p-8 h-full"><NoDataMessage message={data.error} isError={true} /></div>;
  }
 
  const totalSurveyed = data.employees.total.reduce((sum, item) => sum + item.value, 0);
 
  if (data.empty || totalSurveyed === 0) {
    return <div className="p-8 h-full"><NoDataMessage message={data.empty || "La tabla de respuestas está vacía."} isError={false} /></div>;
  }
 
  // En un escenario real, deberías tener lógica de filtrado de empleados por sector aquí.
  // Como no tenemos datos mock/real para esa complejidad, usamos el total.
  const displayedEmployees = data.employees.total;
 
  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Distribución por Industria"
        subtitle={`Total de encuestados: ${totalSurveyed}`}
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Building2 size={20} className="text-[#E30613]" /> Sectores Empresariales
            </h3>
          </div>
          <div className="flex-1 relative">
             <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
                {data.treemap.map((item, idx) => {
                  const spanClass = idx === 0 ? "col-span-2 row-span-2" : idx === 1 ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
                  const isSelected = filter === item.name; // Lógica de filtrado de ejemplo
                  return (
                    <div
                      key={item.name}
                      onClick={() => setFilter(item.name)}
                      className={`${spanClass} relative group cursor-pointer transition-all duration-300 overflow-hidden rounded-md border-2 ${isSelected ? 'border-black scale-[0.98]' : 'border-transparent hover:border-white hover:scale-[1.02]'}`}
                      style={{ backgroundColor: item.fill }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center">
                        <span className="font-bold text-shadow-sm text-sm md:text-base">{item.name}</span>
                        <span className="text-xs md:text-sm opacity-90">{item.size} empresas</span>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </Card>
 
        <Card className="flex flex-col relative">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#E30613]" />
            Distribución por Número de Empleados
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayedEmployees}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}`}
                  labelLine={false}
                >
                  {displayedEmployees.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(PALETTE.industries)[index % 8]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
 
const Block2 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (isActive && !data) {
      setLoading(true);
 
      const loadData = async () => {
        console.log("▶️ [Block2] Ejecutando getDistributionData()");
        try {
          const result = await DataService.getDistributionData(); // <-- llamada real
          console.log("📊 [Block2] Resultado recibido:", result);
          setData(result);
        } catch (error) {
          console.error("[Block2] Error al cargar datos:", error);
          setData({ error: "No se pudo cargar la información de adopción tecnológica." });
        } finally {
          setLoading(false);
        }
      };
 
      loadData();
    }
  }, [isActive, data]);
 
  if (loading || !data) return <LoadingOverlay text="Analizando Madurez Digital..." />;
 
  if (data.error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={data.error} isError={true} />
      </div>
    );
  }
 
  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle title="Nivel de Adopción Tecnológica" subtitle="Madurez digital por sector industrial" />
      <Card className="flex-1 p-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.techAdoption.total} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#666' }} />
            <YAxis unit="%" />
            <RechartsTooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend verticalAlign="top" height={36} />
            {['Bajo', 'Medio', 'Alto', 'Avanzado'].map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={PALETTE.levels[key]}
                animationDuration={1500}
                animationBegin={300}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
 
 

 
// --- BLOQUE 6 (NUEVA LÍNEA DE TIEMPO CON EFECTO WOW) ---
const TimelineItem = ({ data, index }) => {
    const Icon = data.icon;
    
    // Lógica Invertida: HOY (0) y +18 AÑOS (2) a la izquierda. EVOLUCIÓN (1) a la derecha.
    // isLeft = TRUE para índices pares (0, 2...)
    const isLeft = index % 2 === 0; 
 
    return (
        <div 
            className={`flex w-full mb-6 md:mb-8 animate-slideUp items-start`} // 4. Reducción de margin-bottom: de mb-8 a mb-6
            style={{ animationDelay: `${index * 300 + 500}ms` }}
        >
            
            {/* Columna de Contenido (Texto de IA) */}
            <div className={`w-1/2 ${isLeft ? 'pr-4 sm:pr-8' : 'pl-4 sm:pl-8'} ${isLeft ? 'order-1' : 'order-3'}`}>
                <div className={`bg-white p-4 rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 h-full flex flex-col ${isLeft ? 'text-right border-r-4' : 'text-left border-l-4'} border-[#E30613]`}>
                    
                    {/* Título del Período (Alineado con el contenido) */}
                    <h3 className={`text-xl md:text-xl font-bold text-[#E30613] mb-2 ${isLeft ? 'self-end' : 'self-start'}`}>
                        {data.period}
                    </h3>
 
                    {/* Descripción de IA */}
                    <p className="text-sm md:text-base font-medium text-gray-800 italic leading-relaxed whitespace-pre-line flex-1">
                        {data.description}
                    </p>
                    
                    {/* Énfasis en la generación por IA */}
                    <span className={`inline-flex items-center mt-2 text-xs font-semibold text-[#BA0C2F] bg-red-50 px-2 py-0.5 rounded-full ${isLeft ? 'self-end' : 'self-start'}`}>
                        <Brain size={10} className="mr-1" />
                        Síntesis de IA
                    </span>
                </div>
            </div>
 
            {/* Línea de Tiempo y Nodo Central (Fijo en el centro) */}
            <div className="w-8 flex flex-col items-center order-2">
                {/* Círculo del Nodo */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-[#E30613] flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <Icon size={14} className="text-white" />
                </div>
            </div>

            {/* Columna de Espaciado (Vacío) - solo se usa para forzar el layout */}
            <div className={`w-1/2 ${isLeft ? 'order-3' : 'order-1'}`}>
                {/* Este div está vacío, pero su orden asegura que la caja de contenido ocupe el lado correcto */}
            </div>
            
        </div>
    );
};
 
const Block6 = ({ isActive }) => {
    const [loading, setLoading] = useState(true);
 
    useEffect(() => {
        if (isActive) {
            // Simula el tiempo de procesamiento y síntesis de la IA
            const timer = setTimeout(() => {
                setLoading(false);
            }, 3000); // 3 segundos para el "WOW" effect
            return () => clearTimeout(timer);
        } else {
            setLoading(true); // Reinicia si el slide no está activo para el próximo uso
        }
    }, [isActive]);
 
    if (loading) {
        // Usa el LoadingOverlay para el efecto "WOW" de análisis de IA
        return (
            <div className="h-full relative flex items-center justify-center bg-gray-900">
                <LoadingOverlay />
            </div>
        );
    }
 
    return (
        <div className="h-full flex flex-col pt-4 md:pt-6 bg-gray-50 animate-fadeIn overflow-y-auto"> {/* 1. pt-4/pt-6 para subir el contenido */}
            
            {/* 1. Título Eliminado */}
            
            {/* Contenedor de la Línea de Tiempo */}
            <div className="flex justify-center w-full min-h-[50vh] pb-40"> {/* 2. pb-40 para alargar visualmente la línea */}
                <div className="relative w-full max-w-6xl pt-4"> 
                    
                    {/* La verdadera línea vertical - Centered */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-200"></div> 
 
                    {AI_TIMELINE_DATA.map((item, index) => (
                        <TimelineItem key={index} data={item} index={index} />
                    ))}
                    
                    {/* Nota Final de IA */}
                    <div className="text-center mt-10 p-3 bg-red-50 rounded-lg max-w-md mx-auto shadow-md animate-slideUp" style={{ animationDelay: `${(AI_TIMELINE_DATA.length) * 300 + 500}ms` }}>
                         <p className="text-xs text-[#BA0C2F] font-semibold"> 
                            Estos puntos representan la síntesis de la evolución de las respuestas del cuestionario (Hoy vs. 18 Años).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
 


export default function DashboardApp() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4; // Reducido a 3: Intro, Block1, Block2, Block6
 
  const nextSlide = () => setCurrentSlide(p => Math.min(p + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(p - 1, 0));
 
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
 
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-50">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 bg-[#E30613] rounded flex items-center justify-center text-white text-xs">CCB</div>
              <span className="hidden md:inline">Cámara de Comercio de Bogotá</span>
           </div>
        </div>
        <div className="text-xs text-gray-400">
          Slide {currentSlide + 1} / {totalSlides}
        </div>
      </header>
 
      <main className="flex-1 relative overflow-hidden">
        {currentSlide === 0 && <IntroSlide onNext={nextSlide} />}
        {currentSlide === 1 && <Block1 isActive={true} />}
        {currentSlide === 2 && <Block2 isActive={true} />}
       
        {currentSlide === 3 && <Block6 isActive={true} />}
      </main>
 
      <div className="absolute bottom-8 right-8 flex gap-4 z-50">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-white shadow-lg text-gray-600 hover:text-[#E30613] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="p-3 rounded-full bg-[#E30613] shadow-lg text-white hover:bg-[#BA0C2F] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight />
        </button>
      </div>
 
      {/* FIX: Se eliminan los atributos 'jsx' y 'global' del tag <style> para evitar la advertencia de React sobre atributos no booleanos. */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { transform: translateY(0); } }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .animate-progress { animation: progress 2s ease-in-out forwards; }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}
 
 