// src/components/ui/shared.js
import React from "react";
import { Brain, AlertTriangle } from "lucide-react";
import { PALETTE } from "../../constants/palette";

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}
  >
    {children}
  </div>
);

export const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
      <div className="w-2 h-8 bg-[#E30613] rounded-full"></div>
      {title}
    </h2>
    {subtitle && (
      <p className="text-gray-500 mt-1 ml-5 text-lg">{subtitle}</p>
    )}
  </div>
);

export const LoadingOverlay = ({ text }) => (
  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fadeIn">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-[#E30613] rounded-full border-t-transparent animate-spin"></div>
      <Brain
        className="absolute inset-0 m-auto text-[#E30613] animate-pulse"
        size={32}
      />
    </div>
    <h3 className="text-2xl font-bold text-[#E30613] animate-pulse">
      {text}
    </h3>
    <p className="text-gray-500 mt-2">
      Intentando conexión con la API REST de Supabase...
    </p>
  </div>
);

// Animación específica para el bloque 6
export const LoadingOverlayBloque6 = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-black text-white">
    <Brain size={64} className="text-[#E30613] animate-bounce mb-6" />
    <h2 className="text-3xl font-mono animate-pulse">
      GENERANDO VISIÓN CONJUNTA...
    </h2>
    <div className="w-64 h-2 bg-gray-800 rounded mt-4 overflow-hidden">
      <div className="h-full bg-[#E30613] animate-progress"></div>
    </div>
  </div>
);

export const NoDataMessage = ({ message, isError }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-xl border-4 border-dashed border-gray-200">
    <AlertTriangle
      size={48}
      className={isError ? "text-red-500" : "text-yellow-500"}
    />
    <h3 className="mt-4 text-2xl font-bold text-gray-700">
      {isError ? "Error de Conexión" : "Sin Datos"}
    </h3>
    <p className="mt-2 text-gray-500">{message}</p>
    <p className="mt-4 text-sm text-gray-400">
      Verifica tus variables de entorno y el estado de las tablas en Supabase.
    </p>
  </div>
);

// Panel genérico por si lo necesitas en el futuro (no usado ahora)
export const VisionPanel = ({ title, color, content }) => {
  const textColor = color === "red" ? "text-white" : "text-gray-800";
  const bg =
    color === "red"
      ? "bg-red-700 hover:shadow-red-900"
      : "bg-white hover:shadow-blue-300";
  const borderIcon = color === "red" ? "text-red-300" : "text-blue-500";

  return (
    <div
      className={`${bg} p-6 rounded-xl shadow-2xl transition-all flex flex-col`}
    >
      <h2
        className={`text-2xl font-bold border-b-2 pb-3 mb-4 flex items-center ${textColor}`}
      >
        <svg
          className={`w-6 h-6 mr-2 ${borderIcon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3"
          />
        </svg>
        {title}
      </h2>

      <p className={`${textColor} text-lg leading-relaxed whitespace-pre-line`}>
        {content}
      </p>
    </div>
  );
};
