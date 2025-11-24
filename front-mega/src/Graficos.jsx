import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Treemap
} from 'recharts';
import {
  ChevronRight, ChevronLeft, Activity, Brain, Users, Building2,
  Zap, Database, Globe, Share2, Rocket, AlertTriangle
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
// --- SLIDE 6 (AI VISION) ---
 
const Block6 = ({ isActive }) => {
  const [aiData, setAiData] = useState(null);
  const [step, setStep] = useState(0);
 
  // Datos Mock para la visión, ya que no dependen de la DB de respuestas.
  const MOCK_AI_DATA = {
    hero: "Impulsar un crecimiento competitivo, digital y sostenible, potenciando la colaboración entre empresas MEGA y el ecosistema de Bogotá.",
    pillars: [
      { title: "Innovación & Datos", desc: "Decisiones ágiles basadas en analítica avanzada.", icon: "Brain" },
      { title: "Talento 4.0", desc: "Capacitación continua en habilidades digitales.", icon: "Users" },
      { title: "Sostenibilidad", desc: "Eficiencia energética y generación de valor social.", icon: "Globe" },
      { title: "Ecosistema", desc: "Co-innovación abierta con startups y academia.", icon: "Share2" },
      { title: "Escalabilidad", desc: "Plataformas estandarizadas para expansión regional.", icon: "Rocket" }
    ],
    tags: ["+Productividad", "+Omnicanalidad", "+IA Responsable", "+Ciberseguridad"]
  };
 
  useEffect(() => {
    if (isActive && !aiData) {
      setTimeout(() => setStep(1), 1000);
      // Simula la generación de IA/carga de datos estáticos
      setTimeout(() => {
        setAiData(MOCK_AI_DATA);
        setStep(2);
      }, 2500);
    }
  }, [isActive, aiData]);
 
  if (step < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white">
        <Brain size={64} className="text-[#E30613] animate-bounce mb-6" />
        <h2 className="text-3xl font-mono animate-pulse">GENERANDO VISIÓN CONJUNTA...</h2>
        <div className="w-64 h-2 bg-gray-800 rounded mt-4 overflow-hidden">
          <div className="h-full bg-[#E30613] animate-progress"></div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="h-full flex flex-col p-8 bg-gradient-to-b from-white to-gray-50 animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-black text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-widest flex items-center gap-2">
          <Zap size={12} className="text-yellow-400" /> Generado
        </div>
      </div>
      <div className="text-center max-w-4xl mx-auto mb-12 animate-slideUp">
        <h1 className="text-3xl md:text-4xl font-serif italic text-[#BA0C2F] leading-relaxed mb-6 relative">
          <span className="text-6xl absolute -top-4 -left-8 text-gray-200">“</span>
          {aiData.hero}
          <span className="text-6xl absolute -bottom-8 -right-8 text-gray-200">”</span>
        </h1>
        <div className="flex justify-center gap-3 flex-wrap mt-4">
          {aiData.tags.map((tag, i) => (
            <span key={i} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold animate-fadeIn" style={{animationDelay: `${i*200}ms`}}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {aiData.pillars.map((pillar, idx) => {
           const Icon = pillar.icon === 'Brain' ? Brain : pillar.icon === 'Users' ? Users : pillar.icon === 'Globe' ? Globe : pillar.icon === 'Share2' ? Share2 : Rocket;
           return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl shadow-md border-t-4 border-[#E30613] hover:-translate-y-2 transition-transform duration-300 animate-slideUp"
              style={{ animationDelay: `${idx * 150 + 500}ms`, animationFillMode: 'backwards' }}
            >
              <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[#E30613]">
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 leading-tight">{pillar.title}</h3>
              <p className="text-sm text-gray-600 leading-snug">{pillar.desc}</p>
            </div>
           )
        })}
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
 
 