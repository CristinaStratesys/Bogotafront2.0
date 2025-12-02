// src/components/slides/Bloque2.jsx
import React, { useEffect, useState } from "react";
import { DataService } from "../../services/dataService";
import {
  LoadingOverlayBloque6,
  NoDataMessage,
} from "../ui/shared";

export const Bloque6 = ({ isActive }) => {
  const [loading, setLoading] = useState(true);
  const [llmData, setLlmData] = useState(null);

  // Efecto máquina de escribir
  const typeWriter = (element, text, speed = 15) =>
    new Promise((resolve) => {
      let i = 0;
      if (!element) return resolve();

      element.innerHTML = "";

      const typing = () => {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i += 1;
          setTimeout(typing, speed);
        } else {
          resolve();
        }
      };

      typing();
    });

  const startSequence = async (data) => {
    const elA = document.getElementById("visionActual");
    const elB = document.getElementById("vision18");
    const elC = document.getElementById("evolucion");

    if (!elA || !elB || !elC) return;

    await typeWriter(elA, data.pregunta_1 || "");
    await typeWriter(elB, data.pregunta_2 || "");
    await typeWriter(elC, data.resumen_final || "");
  };

  useEffect(() => {
    if (!isActive) return;

    setLoading(true);

    const timer = setTimeout(async () => {
      const latest = await DataService.getLatestLlmVision();
      setLlmData(latest);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (!loading && llmData) {
      startSequence(llmData);
    }
  }, [loading, llmData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <LoadingOverlayBloque6 />
      </div>
    );
  }

  if (!llmData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8">
        <NoDataMessage
          message="No se encontraron datos de visión en la tabla 'llm'."
          isError={false}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-10 gap-4 p-6 bg-gray-50">
      {/* Columna izquierda (70%) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col gap-4">
        <div className="flex-1 bg-white p-6 rounded-xl shadow-xl h-full">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
            Propósito Actual
          </h2>
          <p
            id="visionActual"
            className="text-gray-700 text-lg leading-relaxed"
          ></p>
        </div>

        <div className="flex-1 bg-white p-6 rounded-xl shadow-xl h-full">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
            Propósito en 18 Años
          </h2>
          <p
            id="vision18"
            className="text-gray-700 text-lg leading-relaxed"
          ></p>
        </div>
      </div>

      {/* Columna derecha (30%) */}
      <div className="col-span-1 lg:col-span-3 bg-red-700 p-8 rounded-xl shadow-2xl flex flex-col h-full">
        <h2 className="text-2xl font-bold text-white border-b border-red-500 pb-3 mb-6">
          Evolución de propósito
        </h2>
        <p
          id="evolucion"
          className="text-white text-lg leading-relaxed"
        ></p>
      </div>
    </div>
  );
};
