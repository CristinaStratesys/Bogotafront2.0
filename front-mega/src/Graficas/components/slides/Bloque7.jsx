// src/components/slides/Bloque7.jsx
import React from "react";

export const Bloque7 = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="w-full bg-gray-50 flex items-center justify-center px-4 md:px-8 py-8">
      <div
        className="
          w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden
          grid grid-cols-1 md:grid-cols-[1fr_1.4fr_0.8fr] animate-fadeIn
        "
      >
        {/* Columna izquierda */}
        <div className="bg-gradient-to-b from-red-50 to-gray-50 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
              <img
                src="/Ximena.jpg"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center">
            Ximena Ángel Gaviria
          </h2>

          <p className="mt-3 text-xs md:text-sm text-gray-500 text-center uppercase tracking-[0.25em]">
            Country Manager
          </p>
        </div>

        {/* Columna central */}
        <div className="px-6 md:px-10 py-10 flex flex-col justify-center">
          <p className="text-xl md:text-3xl font-bold text-gray-800">
            Stratesys
          </p>

          <ul className="mt-4 space-y-3 text-sm md:text-base text-gray-600 list-disc list-inside leading-relaxed">
            <li>
              Impulsamos el crecimiento de nuestros clientes como
              partners oficiales de SAP.
            </li>
            <li>
              Desarrollamos proyectos tecnológicos de nueva generación
              impulsados por inteligencia artificial.
            </li>
          </ul>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-6 text-gray-700 text-base md:text-lg">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-50 text-[#E30613] text-lg md:text-xl">
                📞
              </span>
              <span>3143950959</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-50 text-[#E30613] text-lg md:text-xl">
                ✉️
              </span>
              <span>Ximena.angel@stratesys-ts.com</span>
            </div>
          </div>
        </div>

        {/* Columna derecha – QR */}
        <div className="flex flex-col items-center justify-center px-6 py-10 border-l border-gray-100">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Escanea para más información
          </p>

          <div className="w-32 h-32 md:w-36 md:h-36 bg-gray-100 p-2 rounded-xl shadow-md">
            <img
              src="/qr-ejemplo.png"
              alt="Código QR"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
