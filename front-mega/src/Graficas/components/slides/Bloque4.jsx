// src/components/slides/Bloque4.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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

const SingleLineTick = ({ x, y, payload }) => (
  <text
    x={x - 10}
    y={y}
    dy={4}
    textAnchor="end"
    fontSize={12}
    fill="#555"
    style={{ whiteSpace: "nowrap" }}
  >
    {String(payload.value).replace(/\s+/g, " ")}
  </text>
);

export const Bloque4 = ({ isActive }) => {
  const [techs, setTechs] = useState(null);
  const [error, setError] = useState(null);
  const [emptyMsg, setEmptyMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isActive || techs !== null || loading) return;

    const fetchTechs = async () => {
      setLoading(true);
      setError(null);
      setEmptyMsg(null);

      try {
        const result = await DataService.getTechUsagePercentages();

        if (result.error) {
          setError(result.error);
          setTechs([]);
        } else if (result.empty) {
          setEmptyMsg(result.empty);
          setTechs([]);
        } else {
          setTechs(result.techs);
        }
      } catch (err) {
        console.error("[Bloque4] Error:", err);
        setError("No se pudo leer las tecnologías utilizadas.");
        setTechs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTechs();
  }, [isActive, techs, loading]);

  if (loading || techs === null) {
    return (
      <LoadingOverlay text="Cargando Tecnologías Utilizadas..." />
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={error} isError={true} />
      </div>
    );
  }

  const visibleTechs = (techs || []).filter((t) => t.name);

  const maxValue = visibleTechs.length
    ? Math.max(...visibleTechs.map((t) => t.value))
    : 0;

  let domainX;
  let ticksX;

  // Caso 1: máximo < 80 → escala dinámica
  if (maxValue < 80) {
    domainX = [0, maxValue + 5];
    ticksX = undefined;
  } else {
    // Caso 2: máximo >= 80 → 0–100 fijo
    domainX = [0, 100];
    ticksX = [0, 20, 40, 60, 80, 100];
  }

  if (emptyMsg || !visibleTechs.length) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage
          message={
            emptyMsg ||
            "No se encontraron registros de tecnologías en las respuestas."
          }
          isError={false}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Tecnologías Utilizadas"
        subtitle="Porcentaje de empresas que declara usar cada tecnología"
      />

      <Card className="flex-1 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visibleTechs}
            layout="vertical"
            margin={{ top: 10, right: 50, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={<SingleLineTick />}
              width={200}
              interval={0}
            />
            <XAxis
              type="number"
              domain={domainX}
              ticks={ticksX}
              tickFormatter={(v) => `${v}%`}
            />
            <RechartsTooltip
              formatter={(value) => [`${value}%`, "Adopción"]}
              labelFormatter={(label) => label}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill={PALETTE.primary}
              barSize={24}
              radius={[4, 4, 4, 4]}
              label={({ x, y, width, value }) => (
                <text
                  x={x + width + 8}
                  y={y + 14}
                  fill="#444"
                  fontSize={12}
                >
                  {`${value}%`}
                </text>
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
