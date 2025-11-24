import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Treemap 
} from 'recharts';
import { 
  ChevronRight, ChevronLeft, Activity, Brain, Users, Building2, 
  Zap, Database, Globe, ShieldCheck, Target, TrendingUp, 
  Lightbulb, Share2, Rocket, Award 
} from 'lucide-react';

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

// --- MOCK BACKEND / DATABASE SERVICES ---
// Simulamos una API con retardos para dar efecto de "procesamiento"
const MockBackend = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  getDistributionData: async () => {
    await MockBackend.delay(800); // Simular latencia de red
    return {
      treemap: [
        { name: 'Manufactura', size: 25, fill: PALETTE.industries['Manufactura'] },
        { name: 'Servicios', size: 20, fill: PALETTE.industries['Servicios'] },
        { name: 'Comercio', size: 15, fill: PALETTE.industries['Comercio'] },
        { name: 'Construcción', size: 12, fill: PALETTE.industries['Construcción'] },
        { name: 'Tecnología', size: 10, fill: PALETTE.industries['Tecnología'] },
        { name: 'Agroindustria', size: 8, fill: PALETTE.industries['Agroindustria'] },
        { name: 'Salud', size: 6, fill: PALETTE.industries['Salud'] },
        { name: 'Energía', size: 4, fill: PALETTE.industries['Energía y Minería'] },
      ],
      employees: {
        total: [
          { name: '1-50', value: 45 }, { name: '51-200', value: 30 },
          { name: '201-500', value: 15 }, { name: '>500', value: 10 }
        ],
        'Manufactura': [
          { name: '1-50', value: 20 }, { name: '51-200', value: 40 },
          { name: '201-500', value: 25 }, { name: '>500', value: 15 }
        ],
        'Tecnología': [
          { name: '1-50', value: 60 }, { name: '51-200', value: 30 },
          { name: '201-500', value: 8 }, { name: '>500', value: 2 }
        ]
        // ... otros mocks simplificados
      }
    };
  },

  getTechAdoption: async () => {
    await MockBackend.delay(600);
    return [
      { name: 'Manufactura', Bajo: 20, Medio: 40, Alto: 30, Avanzado: 10 },
      { name: 'Servicios', Bajo: 15, Medio: 35, Alto: 35, Avanzado: 15 },
      { name: 'Comercio', Bajo: 30, Medio: 40, Alto: 20, Avanzado: 10 },
      { name: 'Tecnología', Bajo: 5, Medio: 15, Alto: 40, Avanzado: 40 },
      { name: 'Salud', Bajo: 25, Medio: 35, Alto: 30, Avanzado: 10 },
    ];
  },

  getSalesAdoption: async () => {
    await MockBackend.delay(600);
    return [
      { name: '< $1.000 M', Bajo: 45, Medio: 35, Alto: 15, Avanzado: 5 },
      { name: '$1k-10k M', Bajo: 30, Medio: 40, Alto: 20, Avanzado: 10 },
      { name: '$10k-50k M', Bajo: 15, Medio: 35, Alto: 35, Avanzado: 15 },
      { name: '> $50.000 M', Bajo: 5, Medio: 20, Alto: 45, Avanzado: 30 },
    ];
  },

  getTechUsage: async () => {
    await MockBackend.delay(700);
    // Datos base para tecnologías
    const baseTechs = [
      { name: 'Big Data', value: 65 },
      { name: 'Cloud Comp.', value: 60 },
      { name: 'Ciberseguridad', value: 55 },
      { name: 'IoT', value: 40 },
      { name: 'Automatización', value: 38 },
      { name: 'IA', value: 35 },
      { name: 'Blockchain', value: 15 },
      { name: 'RA/RV', value: 10 },
    ];
    return {
      distribution: [
        { name: 'Manufactura', value: 30, fill: PALETTE.industries['Manufactura'] },
        { name: 'Servicios', value: 25, fill: PALETTE.industries['Servicios'] },
        { name: 'Comercio', value: 20, fill: PALETTE.industries['Comercio'] },
        { name: 'Tecnología', value: 15, fill: PALETTE.industries['Tecnología'] },
        { name: 'Otros', value: 10, fill: PALETTE.industries['Otra'] },
      ],
      rankings: {
        'Total': baseTechs,
        'Manufactura': [
          { name: 'Automatización', value: 70 }, { name: 'IoT', value: 60 },
          { name: 'Cloud', value: 40 }, { name: 'Big Data', value: 30 },
          { name: 'IA', value: 20 }
        ],
        'Tecnología': [
          { name: 'IA', value: 85 }, { name: 'Cloud', value: 80 },
          { name: 'Big Data', value: 75 }, { name: 'Ciberseguridad', value: 70 },
          { name: 'Blockchain', value: 40 }
        ]
      }
    };
  },

  getWordCloudData: async () => {
    await MockBackend.delay(900); // Un poco más lento por "NLP processing"
    return [
      { text: 'CRECIMIENTO', value: 100 },
      { text: 'INNOVACIÓN', value: 90 },
      { text: 'SOSTENIBILIDAD', value: 80 },
      { text: 'CLIENTE', value: 70 },
      { text: 'DIGITAL', value: 60 },
      { text: 'SERVICIO', value: 55 },
      { text: 'CALIDAD', value: 50 },
      { text: 'EXPANSIÓN', value: 45 },
      { text: 'FUTURO', value: 40 },
      { text: 'LIDERAZGO', value: 38 },
      { text: 'EFICIENCIA', value: 35 },
      { text: 'TRANSFORMACIÓN', value: 30 },
      { text: 'VALOR', value: 28 },
      { text: 'SOCIAL', value: 25 },
      { text: 'TALENTO', value: 20 },
    ];
  },

  getAIVision: async () => {
    await MockBackend.delay(2500); // Delay largo para simular generación de LLM
    return {
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
    <p className="text-gray-500 mt-2">Procesando datos en tiempo real...</p>
  </div>
);

// --- SLIDE COMPONENTS ---

const IntroSlide = ({ onNext }) => (
  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 text-center p-10 relative overflow-hidden">
    {/* Background elements */}
    <div className="absolute top-0 left-0 w-full h-2 bg-[#E30613]"></div>
    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#E30613]/5 rounded-full blur-3xl animate-pulse"></div>
    
    <div className="animate-slideUp space-y-8 z-10 max-w-4xl">
      <div className="flex justify-center gap-8 mb-8 opacity-0 animate-fadeIn delay-300" style={{ animationFillMode: 'forwards' }}>
        {/* Logos simulados con texto estilizado para el ejemplo */}
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
          className="group bg-[#E30613] text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:bg-[#BA0C2F] hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
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

  useEffect(() => {
    if (isActive && !data) {
      MockBackend.getDistributionData().then(setData);
    }
  }, [isActive, data]);

  if (!data) return <LoadingOverlay text="Cargando Demografía..." />;

  const displayedEmployees = filter && data.employees[filter] 
    ? data.employees[filter] 
    : data.employees.total;

  // Custom legend for Pie Chart
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle 
        title="Distribución por Industria y Tamaño" 
        subtitle="Participación por sector económico y volumen de empleados"
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Treemap Simulation using Grid */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Building2 size={20} className="text-[#E30613]" /> Participación por Industria
            </h3>
            {filter && (
              <button 
                onClick={() => setFilter(null)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 transition-colors"
              >
                Ver Total
              </button>
            )}
          </div>
          <div className="flex-1 relative">
             {/* Simulate Treemap using ResponsiveContainer and standard components not ideal, so using custom HTML grid layout for visual impact */}
             <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
                {data.treemap.map((item, idx) => {
                  // Simple logic to span cells based on size for demo effect
                  const spanClass = idx === 0 ? "col-span-2 row-span-2" : idx === 1 ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
                  const isSelected = filter === item.name;
                  return (
                    <div 
                      key={item.name}
                      onClick={() => setFilter(item.name)}
                      className={`${spanClass} relative group cursor-pointer transition-all duration-300 overflow-hidden rounded-md border-2 ${isSelected ? 'border-black scale-[0.98]' : 'border-transparent hover:border-white hover:scale-[1.02]'}`}
                      style={{ backgroundColor: item.fill }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center">
                        <span className="font-bold text-shadow-sm text-sm md:text-base">{item.name}</span>
                        <span className="text-xs md:text-sm opacity-90">{item.size}%</span>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic text-center">Clic en un bloque para filtrar la derecha</p>
        </Card>

        {/* Right: Donut Chart */}
        <Card className="flex flex-col relative">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#E30613]" /> 
            Empleados {filter ? `(${filter})` : '(Total)'}
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {displayedEmployees.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(PALETTE.industries)[index % 8]} />
                  ))}
                </Pie>
                <RechartsTooltip />
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

  useEffect(() => {
    if (isActive && !data) MockBackend.getTechAdoption().then(setData);
  }, [isActive, data]);

  if (!data) return <LoadingOverlay text="Analizando Madurez Digital..." />;

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle title="Nivel de Adopción Tecnológica" subtitle="Madurez digital por sector industrial" />
      <Card className="flex-1 p-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fill: '#666'}} />
            <YAxis unit="%" />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              cursor={{fill: 'transparent'}}
            />
            <Legend verticalAlign="top" height={36}/>
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

const Block3 = ({ isActive }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isActive && !data) MockBackend.getSalesAdoption().then(setData);
  }, [isActive, data]);

  if (!data) return <LoadingOverlay text="Correlacionando Ventas..." />;

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle title="Adopción por Volumen de Ventas" subtitle="Impacto del tamaño de facturación en la madurez tecnológica" />
      <Card className="flex-1 p-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="%" />
            <YAxis dataKey="name" type="category" width={100} tick={{fill: '#666', fontWeight: 600}} />
            <RechartsTooltip cursor={{fill: 'transparent'}} />
            <Legend verticalAlign="top" height={36}/>
            {['Bajo', 'Medio', 'Alto', 'Avanzado'].map((key) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={PALETTE.levels[key]} 
                barSize={40}
                animationDuration={1500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

const Block4 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    if (isActive && !data) MockBackend.getTechUsage().then(setData);
  }, [isActive, data]);

  if (!data) return <LoadingOverlay text="Escaneando Tecnologías..." />;

  const chartData = filter && data.rankings[filter] ? data.rankings[filter] : data.rankings['Total'];

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle title="Tecnologías Utilizadas" subtitle="Top tecnologías habilitadoras implementadas" />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Selector Pie */}
        <Card className="col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700">Filtrar por Industria</h3>
            {filter && (
              <button onClick={() => setFilter(null)} className="text-xs text-blue-500 font-semibold">Reset</button>
            )}
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(data) => setFilter(data.name)}
                  className="cursor-pointer"
                >
                  {data.distribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      stroke={filter === entry.name ? '#000' : 'none'}
                      strokeWidth={2}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm font-bold text-[#E30613] mt-[-20px]">
              {filter || "Ver Todo"}
            </p>
          </div>
        </Card>

        {/* Right: Ranking Bars */}
        <Card className="col-span-2 flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-gray-700">Ranking de Implementación {filter && `(${filter})`}</h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={chartData} 
                margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                <Bar dataKey="value" fill="#E30613" barSize={20} radius={[0, 4, 4, 0]}>
                  {
                    chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#BA0C2F' : '#E30613'} />
                    ))
                  }
                </Bar>
                 <RechartsTooltip 
                   cursor={{fill: '#f3f3f3'}}
                   content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       return (
                         <div className="bg-white p-2 shadow border rounded">
                           <p className="font-bold">{payload[0].payload.name}</p>
                           <p className="text-[#E30613]">{payload[0].value}% implementación</p>
                         </div>
                       );
                     }
                     return null;
                   }}
                 />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Block5 = ({ isActive }) => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (isActive && words.length === 0) {
      MockBackend.getWordCloudData().then(setWords);
    }
  }, [isActive, words]);

  if (words.length === 0) return <LoadingOverlay text="Procesando NLP (Lenguaje Natural)..." />;

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle title="Propósito Empresarial Actual" subtitle="Análisis de frecuencia de palabras clave (Q6)" />
      
      <Card className="flex-1 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-wrap justify-center items-center content-center gap-4 max-w-5xl p-10">
          {words.map((word, i) => {
            // Simulación visual de nube de palabras sin librería externa pesada
            const fontSize = Math.max(16, word.value / 1.5); 
            const opacity = Math.max(0.4, word.value / 100);
            const color = i % 3 === 0 ? PALETTE.primary : i % 3 === 1 ? PALETTE.secondary : '#555';
            
            return (
              <span 
                key={i}
                className="cursor-default hover:scale-110 transition-transform duration-300 font-bold inline-block"
                style={{ 
                  fontSize: `${fontSize}px`, 
                  color: color,
                  opacity: opacity,
                  margin: `${Math.random() * 10}px`
                }}
                title={`${word.text}: ${word.value} menciones`}
              >
                {word.text}
              </span>
            );
          })}
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-gray-400">
          * Stop-words excluidas por motor de análisis
        </div>
      </Card>
    </div>
  );
};

const Block6 = ({ isActive }) => {
  const [aiData, setAiData] = useState(null);
  const [step, setStep] = useState(0); // 0: Loading, 1: Hero, 2: Pillars

  useEffect(() => {
    if (isActive && !aiData) {
      // Secuencia de animación de IA
      setTimeout(() => setStep(1), 1000); // Mostrar loading
      MockBackend.getAIVision().then(data => {
        setTimeout(() => {
          setAiData(data);
          setStep(2); // Mostrar resultado
        }, 2500);
      });
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
        <p className="mt-4 text-gray-400 font-mono text-sm">
          Analizando respuestas abiertas Q6-Q7<br/>
          Sintetizando patrones estratégicos<br/>
          Redactando pilares...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 bg-gradient-to-b from-white to-gray-50 animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-black text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-widest flex items-center gap-2">
          <Zap size={12} className="text-yellow-400" /> Generated by AI
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
           // Icon selection map
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
      
      <div className="mt-auto text-center text-xs text-gray-400 pt-4">
        * Visión sintetizada automáticamente a partir de datos muestrales del Proyecto MEGA
      </div>
    </div>
  );
};

// --- MAIN APP CONTROLLER ---

export default function DashboardApp() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 7; // 0:Intro, 1-5:Blocks, 6:AI

  const nextSlide = () => setCurrentSlide(p => Math.min(p + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(p - 1, 0));

  // Keyboard navigation
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
      {/* Header - Fixed */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-50">
        <div className="flex items-center gap-4">
           {/* Logos placeholders */}
           <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 bg-[#E30613] rounded flex items-center justify-center text-white text-xs">CCB</div>
              <span className="hidden md:inline">Cámara de Comercio de Bogotá</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Stratesys</span>
           </div>
        </div>
        <div className="text-center font-semibold text-gray-700 text-sm uppercase tracking-wider hidden md:block">
          Proyecto MEGA
        </div>
        <div className="text-xs text-gray-400">
          Slide {currentSlide + 1} / {totalSlides}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {currentSlide === 0 && <IntroSlide onNext={nextSlide} />}
        {currentSlide === 1 && <Block1 isActive={true} />}
        {currentSlide === 2 && <Block2 isActive={true} />}
        {currentSlide === 3 && <Block3 isActive={true} />}
        {currentSlide === 4 && <Block4 isActive={true} />}
        {currentSlide === 5 && <Block5 isActive={true} />}
        {currentSlide === 6 && <Block6 isActive={true} />}
      </main>

      {/* Navigation Controls (Floating) */}
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

      {/* Global Styles for custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .animate-progress { animation: progress 2s ease-in-out forwards; }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}