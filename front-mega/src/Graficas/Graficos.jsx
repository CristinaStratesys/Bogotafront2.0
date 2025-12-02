// src/Graficas/Graficos.jsx
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { IntroSlide } from "./components/slides/Introslides";
import { Bloque1 } from "./components/slides/Bloque1";
import { Bloque2 } from "./components/slides/Bloque2";
import { Bloque3 } from "./components/slides/Bloque3";
import { Bloque4 } from "./components/slides/Bloque4";
import { Bloque5 } from "./components/slides/Bloque5";
import { Bloque6 } from "./components/slides/Bloque6";
import { Bloque7 } from "./components/slides/Bloque7";

export default function Graficos() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 8;

  const nextSlide = () =>
    setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1));
  const prevSlide = () =>
    setCurrentSlide((p) => Math.max(p - 1, 0));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-50">
        <img
          src="/Cámara_de_Comercio_de_Bogotá_logo.png"
          alt="Cámara de Comercio de Bogotá"
          className="h-10 object-contain"
        />
        <img
          src="/Stratesys.png"
          alt="Stratesys"
          className="h-8 opacity-90 hover:opacity-100 transition-opacity"
        />
      </header>

      <main className="flex-1 relative overflow-hidden">
        {currentSlide === 0 && <IntroSlide onNext={nextSlide} />}
        {currentSlide === 1 && <Bloque1 isActive={true} />}
        {currentSlide === 2 && <Bloque2 isActive={true} />}
        {currentSlide === 3 && <Bloque3 isActive={true} />}
        {currentSlide === 4 && <Bloque4 isActive={true} />}
        {currentSlide === 5 && <Bloque5 isActive={true} />}
        {currentSlide === 6 && <Bloque6 isActive={true} />}
        {currentSlide === 7 && <Bloque7 isActive={true} />}
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
    </div>
  );
}
