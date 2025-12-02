// src/components/slides/Bloque5.jsx
import React, { useEffect, useState } from "react";
import { DataService } from "../../services/dataService";
import {
  Card,
  SectionTitle,
  LoadingOverlay,
  NoDataMessage,
} from "../ui/shared";
import { PALETTE } from "../../constants/palette";

export const Bloque5 = ({ isActive }) => {
  const [words, setWords] = useState(null);
  const [error, setError] = useState(null);
  const [emptyMsg, setEmptyMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isActive || words !== null || loading) return;

    const fetchWordCloud = async () => {
      setLoading(true);
      setError(null);
      setEmptyMsg(null);

      try {
        const result = await DataService.getWordCloudData();

        if (result.error) {
          setError(result.error);
          setWords([]);
        } else if (result.empty) {
          setEmptyMsg(result.empty);
          setWords([]);
        } else {
          setWords(result.words);
        }
      } catch (err) {
        console.error("❌ [Bloque5] Error:", err);
        setError(
          `No se pudo cargar la nube de palabras desde la base de datos.`
        );
        setWords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWordCloud();
  }, [isActive, words, loading]);

  if (loading || words === null) {
    return (
      <LoadingOverlay text="Procesando Nube de Palabras..." />
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage message={error} isError={true} />
      </div>
    );
  }

  if (emptyMsg || !words.length) {
    return (
      <div className="p-8 h-full">
        <NoDataMessage
          message={
            emptyMsg ||
            "No se encontraron registros en la tabla 'nube_palabras'."
          }
          isError={false}
        />
      </div>
    );
  }

  const maxValue = Math.max(...words.map((w) => w.value));
  const minValue = Math.min(...words.map((w) => w.value));
  const minFont = 16;
  const maxFont = 60;

  return (
    <div className="h-full flex flex-col p-8 animate-fadeIn">
      <SectionTitle
        title="Propósito Empresarial Actual"
        subtitle="Palabras más usadas en la encuesta"
      />

      <Card className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
        <div className="flex flex-wrap justify-center items-center content-center gap-4 max-w-5xl p-10">
          {words.map((word, i) => {
            const range = Math.max(1, maxValue - minValue);
            const norm = (word.value - minValue) / range;

            const fontSize = minFont + norm * (maxFont - minFont);
            const opacity = 0.3 + norm * 0.7;

            const color =
              i % 3 === 0
                ? PALETTE.primary
                : i % 3 === 1
                ? PALETTE.secondary
                : "#555";

            return (
              <span
                key={`${word.text}-${i}`}
                className="cursor-default hover:scale-110 transition-transform duration-300 font-bold inline-block"
                style={{
                  fontSize: `${fontSize}px`,
                  color,
                  opacity,
                }}
                title={`${word.text}: ${word.value} menciones`}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
