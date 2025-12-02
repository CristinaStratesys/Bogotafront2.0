// src/components/slides/Bloque2.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { DataService } from "../../services/dataService";
import {
  Card,
  SectionTitle,
  LoadingOverlay,
  NoDataMessage,
} from "../ui/shared";
import { PALETTE } from "../../constants/palette";

export const Bloque2 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && !data && !loading) {
      setLoading(true);

      const loadData = async () => {
        console.log("▶️ [Bloque2] Ejecutando getDistributionData()");
        try {
          const result = await DataService.getDistributionData();
          console.log("📊 [Bloque2] Resultado recibido:", result);
          setData(result);
        } catch (error) {
          console.error("[Bloque2] Error al cargar datos:", error);
          setData({
            error:
              "No se pudo cargar la información de adopción tecnológica.",
          });
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isActive, data, loading]);

  if (loading || !data)
    return (
      <LoadingOverlay text="Analizando Madurez Digital..." />
    );

  if (data.error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={data.error} isError={true} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Nivel de Adopción Tecnológica"
        subtitle="Madurez digital por sector industrial"
      />

      <Card className="flex-1 p-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.techAdoption.total}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#666" }} />
            <YAxis
              unit="%"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value) => `${value}`}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              cursor={{ fill: "transparent" }}
            />

            <Legend
              verticalAlign="top"
              height={70}
              content={() => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "35px",
                    width: "100%",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: PALETTE.levels["Bajo"],
                      }}
                    ></span>
                    Bajo
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: PALETTE.levels["Medio"],
                      }}
                    ></span>
                    Medio
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: PALETTE.levels["Alto"],
                      }}
                    ></span>
                    Alto
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: PALETTE.levels["Avanzado"],
                      }}
                    ></span>
                    Avanzado
                  </span>
                </div>
              )}
            />

            {["Bajo", "Medio", "Alto", "Avanzado"].map((key) => (
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
