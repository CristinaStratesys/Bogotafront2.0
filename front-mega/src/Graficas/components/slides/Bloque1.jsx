// src/components/slides/Bloque1.jsx
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Treemap,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Building2, Users } from "lucide-react";

import { DataService } from "../../services/dataService";
import {
  Card,
  SectionTitle,
  LoadingOverlay,
  NoDataMessage,
} from "../ui/shared";
import {
  EMPLOYEE_ORDER,
  EMPLOYEE_COLORS,
} from "../../constants/palette";

export const Bloque1 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && !data && !loading) {
      setLoading(true);

      const loadData = async () => {
        console.log("▶️ [Bloque1] Ejecutando getDistributionData()");
        const result = await DataService.getDistributionData();
        console.log("📊 [Bloque1] Resultado recibido:", result);
        setData(result);
        setLoading(false);
      };

      loadData();
    }
  }, [isActive, data, loading]);

  if (loading || data === null)
    return <LoadingOverlay text="Cargando Demografía..." />;

  if (data.error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={data.error} isError={true} />
      </div>
    );
  }

  const totalSurveyed = data.employees.total.reduce(
    (sum, item) => sum + item.value,
    0
  );

  if (data.empty || totalSurveyed === 0) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage
          message={
            data.empty || "La tabla de respuestas está vacía."
          }
          isError={false}
        />
      </div>
    );
  }

  // Forzamos el orden del donut
  const displayedEmployees = EMPLOYEE_ORDER.map((name) => {
    const found = data.employees.total.find((e) => e.name === name);
    return found || { name, value: 0 };
  });

  const pieEmployees = displayedEmployees.filter((e) => e.value > 0);

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Distribución por Industria"
        subtitle={`Total de encuestados: ${totalSurveyed}`}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Treemap sectores */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Building2
                size={20}
                className="text-[#E30613]"
              />{" "}
              Sectores Empresariales
            </h3>
          </div>

          <div className="flex-1 relative">
            {/* Usamos un grid para simular la “mosaico” treemap */}
            <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
              {data.treemap.map((item, idx) => {
                const spanClass =
                  idx === 0
                    ? "col-span-2 row-span-2"
                    : idx <= 2
                    ? "col-span-2 row-span-1"
                    : "col-span-1 row-span-1";

                const isSelected = filter === item.name;

                return (
                  <div
                    key={item.name}
                    onClick={() => setFilter(item.name)}
                    className={`${spanClass} relative group cursor-pointer transition-all duration-300 overflow-hidden rounded-md border-2 ${
                      isSelected
                        ? "border-black scale-[0.98]"
                        : "border-transparent hover:border-white hover:scale-[1.02]"
                    }`}
                    style={{ backgroundColor: item.fill }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center">
                      <span className="font-bold text-shadow-sm text-sm md:text-base">
                        {item.name}
                      </span>
                      <span className="text-xs md:text-sm opacity-90">
                        {item.size} empresas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Donut empleados */}
        <Card className="flex flex-col relative">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#E30613]" />
            Distribución por Número de Empleados
          </h3>

          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieEmployees}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => `${name}`}
                  labelLine={false}
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieEmployees.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={EMPLOYEE_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  content={() => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginLeft: 16,
                      }}
                    >
                      {EMPLOYEE_ORDER.map((name) => (
                        <div
                          key={name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: EMPLOYEE_COLORS[name],
                            }}
                          />
                          <span
                            style={{
                              color: EMPLOYEE_COLORS[name],
                              fontWeight: 600,
                            }}
                          >
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
