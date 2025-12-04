// src/components/slides/Bloque3.jsx
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

const SALES_ORDER = [
  "Grande - > $50.000 M",
  "Mediana (Alta) - $10.000-50.000 M",
  "Mediana (Baja) - $1.000-10.000 M",
  "Pequeña - < $1.000 M",
];

export const Bloque3 = ({ isActive }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && !data && !loading) {
      setLoading(true);

      const loadData = async () => {
        console.log(
          "▶️ [Bloque3] Ejecutando getDistributionData() para Ventas/Adopción"
        );
        try {
          const result = await DataService.getDistributionData();
          console.log("📊 [Bloque3] Resultado recibido:", result);
          setData(result);
        } catch (error) {
          console.error("[Bloque3] Error al cargar datos:", error);
          setData({
            error:
              "No se pudo cargar la información de adopción por volumen de ventas.",
          });
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isActive, data, loading]);

  if (loading || data === null)
    return (
      <LoadingOverlay text="Correlacionando Ventas..." />
    );

  if (data.error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={data.error} isError={true} />
      </div>
    );
  }

  const salesData = [...data.salesAdoption.total];

  // Reordenar según SALES_ORDER
  salesData.sort(
    (a, b) => SALES_ORDER.indexOf(a.name) - SALES_ORDER.indexOf(b.name)
  );

  if (data.empty || salesData.length === 0) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage
          message={
            data.empty ||
            "No hay datos de adopción para rangos de ventas."
          }
          isError={false}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Adopción por Volumen de Ventas"
        subtitle="Impacto del tamaño de facturación en la madurez tecnológica"
      />

      <Card className="flex-1 p-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={salesData}
            margin={{ top: 20, right: 45, left: 25, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={300}
              tick={{ fill: "#666", fontWeight: 600 }}
            />

            <RechartsTooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
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
                barSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
