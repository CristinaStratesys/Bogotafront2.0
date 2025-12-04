import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Send, Building2 } from 'lucide-react';

// --- CONFIGURACIÓN SUPABASE (misma que Formulario.jsx) ---
const supabaseUrl = 'https://xfivwryjelypnbmwoaan.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaXZ3cnlqZWx5cG5ibXdvYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzczOTMsImV4cCI6MjA3OTIxMzM5M30.D8f1IFZ5sVLLT4M6wfy5yjUOKT7H60Tv2UXV2i5gPYU';

// --- COMPONENTE PRINCIPAL ---
export default function Contacto() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [isClientLoading, setIsClientLoading] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    observacion: '',
    aceptaDatos: false,
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  // Cargar supabase-js desde CDN e inicializar cliente (mismo patrón que Formulario.jsx)
  useEffect(() => {
    const scriptUrl =
      'https://unpkg.com/@supabase/supabase-js@2.44.2/dist/umd/supabase.js';
    const script = document.createElement('script');
    script.src = scriptUrl;

    script.onload = () => {
      try {
        if (window.supabase && window.supabase.createClient) {
          const client = window.supabase.createClient(
            supabaseUrl,
            supabaseAnonKey
          );
          setSupabaseClient(client);
          console.log('[Contacto] Supabase client inicializado');
        } else {
          console.error(
            '[Contacto] Supabase script cargado pero createClient no está disponible'
          );
          setStatus('error');
        }
      } catch (e) {
        console.error('[Contacto] Error creando cliente Supabase:', e);
        setStatus('error');
      }
      setIsClientLoading(false);
    };

    script.onerror = (e) => {
      console.error('[Contacto] Error cargando script Supabase:', e);
      setStatus('error');
      setIsClientLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      const currentScript = document.querySelector(
        `script[src="${scriptUrl}"]`
      );
      if (currentScript) {
        document.head.removeChild(currentScript);
      }
    };
  }, []);

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Envío a tabla "contacto"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabaseClient || isClientLoading) {
      console.error('[Contacto] Supabase client no listo');
      setStatus('error');
      return;
    }

    if (!formData.aceptaDatos) {
      console.error(
        '[Contacto] Debe aceptar el tratamiento de datos personales.'
      );
      return;
    }

    setStatus('submitting');

    const dataToInsert = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      correo: formData.correo,
      observacion: formData.observacion,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabaseClient
        .from('contacto') // 👈 tabla contacto
        .insert([dataToInsert]);

      if (error) {
        console.error('[Contacto] Error al insertar en Supabase:', error);
        setStatus('error');
      } else {
        setStatus('success');
        setFormData({
          nombre: '',
          telefono: '',
          correo: '',
          observacion: '',
          aceptaDatos: false,
        });
      }
    } catch (err) {
      console.error('[Contacto] Error inesperado:', err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-['Poppins'] text-slate-800 flex flex-col">
      {/* Fuente y focus custom */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        
        .corporate-input:focus {
          border-color: #E30613;
          box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.1);
        }
      `}</style>

      {/* HEADER similar al de Formulario */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center justify-between px-6 md:px-12 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#E30613] rounded flex items-center justify-center text-white font-bold text-xs">
            CCB
          </div>
          <span className="font-semibold text-sm md:text-base text-gray-800 leading-tight">
            Cámara de Comercio
            <br />
            de Bogotá
          </span>
        </div>

        <div className="hidden md:block h-8 w-px bg-gray-300 mx-4" />

        <div className="flex items-center gap-2">
          <Building2 className="text-[#BA0C2F] h-6 w-6" />
          <span className="font-semibold text-lg text-gray-700 tracking-tight">
            stratesys
          </span>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-grow pt-28 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
            {/* franja roja superior */}
            <div className="h-2 w-full bg-gradient-to-r from-[#E30613] to-[#BA0C2F]" />

            <div className="p-8 md:p-10">
              {status === 'success' ? (
                // VISTA ÉXITO
                <div className="text-center py-12">
                  <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    ¡Gracias por contactarnos!
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    Hemos recibido tu información. Nos pondremos en contacto
                    contigo en breve.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-[#E30613] font-semibold hover:text-[#BA0C2F] transition-colors"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                // VISTA FORMULARIO
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                      Déjanos tus datos
                    </h1>
                    <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                      Completa este formulario si quieres que te contactemos
                      después de la presentación.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nombre */}
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                      >
                        Nombre y apellidos{' '}
                        <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="corporate-input w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                        placeholder="Ej. Ximena Ángel"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Correo */}
                    <div>
                      <label
                        htmlFor="correo"
                        className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                      >
                        Correo electrónico{' '}
                        <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="email"
                        id="correo"
                        name="correo"
                        required
                        className="corporate-input w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                        placeholder="nombre@empresa.com"
                        value={formData.correo}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label
                        htmlFor="telefono"
                        className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                      >
                        Teléfono de contacto{' '}
                        <span className="text-[#E30613]">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        className="corporate-input w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200"
                        placeholder="+57 300 123 4567"
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Observación */}
                    <div>
                      <label
                        htmlFor="observacion"
                        className="block text-sm font-medium text-gray-700 mb-1 ml-1"
                      >
                        Observación o comentario
                      </label>
                      <textarea
                        id="observacion"
                        name="observacion"
                        rows="3"
                        className="corporate-input w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 resize-none"
                        placeholder="Cuéntanos brevemente qué te gustaría profundizar o cómo podemos ayudarte."
                        value={formData.observacion}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* Checkbox datos */}
                    <div className="flex items-start pt-2">
                      <div className="flex items-center h-5">
                        <input
                          id="aceptaDatos"
                          name="aceptaDatos"
                          type="checkbox"
                          required
                          checked={formData.aceptaDatos}
                          onChange={handleChange}
                          className="h-5 w-5 rounded border-gray-300 text-[#E30613] focus:ring-[#E30613] cursor-pointer"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="aceptaDatos"
                          className="text-gray-600 cursor-pointer select-none"
                        >
                          Acepto el{' '}
                          <span className="font-semibold text-gray-800">
                            tratamiento de mis datos personales
                          </span>{' '}
                          para ser contactado.{' '}
                          <span className="text-[#E30613]">*</span>
                        </label>
                      </div>
                    </div>

                    {/* Botón */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={
                          status === 'submitting' ||
                          isClientLoading ||
                          !formData.aceptaDatos
                        }
                        className={`
                          w-full flex items-center justify-center py-4 px-6 border border-transparent 
                          text-base font-bold rounded-lg text-white 
                          bg-[#E30613] hover:bg-[#BA0C2F]
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E30613]
                          transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                          ${
                            status === 'submitting' ||
                            isClientLoading ||
                            !formData.aceptaDatos
                              ? 'opacity-70 cursor-not-allowed hover:transform-none'
                              : ''
                          }
                        `}
                      >
                        {status === 'submitting' || isClientLoading ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar datos
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                      {status === 'error' && (
                        <p className="mt-3 text-center text-red-600 text-sm">
                          Hubo un problema al enviar. Revisa la configuración
                          de Supabase (clave y reglas RLS para la tabla
                          &quot;contacto&quot;).
                        </p>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 text-center opacity-60">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Evento Tech Empresarial. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
