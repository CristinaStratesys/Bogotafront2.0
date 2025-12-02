// src/Graficas/components/slides/Introslides.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

export const IntroSlide = ({ onNext }) => (
  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 text-center p-10 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-2 bg-[#E30613]"></div>

    <div className="animate-slideUp space-y-8 z-10 max-w-4xl">
      <div className="flex justify-center items-center gap-12 mb-8 opacity-0 animate-fadeIn delay-300">
        <img
          src="/Cámara_de_Comercio_de_Bogotá_logo.png"
          alt="Cámara de Comercio de Bogotá"
          className="h-20 object-contain"
        />
        <div className="w-px h-16 bg-gray-300"></div>
        <img
          src="/Stratesys.png"
          alt="Stratesys"
          className="h-16 object-contain"
        />
      </div>

      <h1 className="text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-sm">
        III Encuentro Nacional de Empresas en{" "}
        <span className="text-[#E30613]">Trayectoria MEGA</span>
      </h1>

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

// export default IntroSlide;
