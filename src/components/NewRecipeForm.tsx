import React, { useState, useEffect } from "react";
import { Coffee, Layers, Hammer, Compass, Sparkles } from "lucide-react";
import {
  PRESET_PROCESOS,
  PRESET_METODOS,
  PRESET_MOLINOS
} from "../constants";

// Entire pool of countries including existing and new ones as requested
const ALL_COUNTRIES_POOL = [
  "Colombia",
  "Etiopía",
  "Brasil",
  "Kenia",
  "Guatemala",
  "Honduras",
  "México",
  "China",
  "Ruanda",
  "Perú",
  "Bolivia",
  "Costa Rica",
  "El Salvador",
  "Ecuador",
  "Panamá",
  "Nicaragua",
  "Indonesia",
  "Burundi"
];

const ALL_GRINDERS_POOL = [
  "Baratza Encore",
  "Comandante C40",
  "Fellow Ode",
  "Wilfa Svart",
  "Timemore C2/C3",
  "1Zpresso K-Ultra",
  "Kingrinder K6",
  "Eureka Mignon",
  "Mahlkönig X54",
  "Baratza Sette",
  "Varia VS3",
  "Mazzer Mini",
  "DF64"
];

interface NewRecipeFormProps {
  onGenerate: (data: { 
    origen: string; 
    variedad?: string;
    proceso: string; 
    metodo: string; 
    molino: string; 
    observaciones?: string;
    observacionesProceso?: string;
  }) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

export default function NewRecipeForm({ onGenerate, isLoading, isDarkMode }: NewRecipeFormProps) {
  const [origen, setOrigen] = useState("");
  const [variedad, setVariedad] = useState("");
  const [proceso, setProceso] = useState("Lavado");
  const [observacionesProceso, setObservacionesProceso] = useState("");
  const [metodo, setMetodo] = useState("V60");
  const [observaciones, setObservaciones] = useState("");
  
  // Custom grinder model remembered by the app (autofilled from localStorage)
  const [molino, setMolino] = useState(() => {
    return localStorage.getItem("cafe_especialidad_molino_usuario") || "";
  });

  const PRESET_VARIEDADES = ["Caturra", "Bourbon", "Geisha", "Castillo", "Typica", "Pacamara"];

  // Suggested lists that vary
  const [suggestedCountries, setSuggestedCountries] = useState<string[]>([]);
  const [suggestedGrinders, setSuggestedGrinders] = useState<string[]>([]);

  const getRandomCountries = () => {
    const shuffled = [...ALL_COUNTRIES_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const getRandomGrinders = () => {
    const shuffled = [...ALL_GRINDERS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    setSuggestedCountries(getRandomCountries());
    setSuggestedGrinders(getRandomGrinders());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origen.trim() || !molino.trim()) {
      return;
    }
    
    // Save the written grinder model for the next usages
    localStorage.setItem("cafe_especialidad_molino_usuario", molino.trim());
    
    // Shuffle suggestions for the next usage
    setSuggestedCountries(getRandomCountries());
    setSuggestedGrinders(getRandomGrinders());

    onGenerate({
      origen: origen.trim(),
      variedad: variedad.trim(),
      proceso,
      metodo,
      molino: molino.trim(),
      observaciones: observaciones.trim(),
      observacionesProceso: observacionesProceso.trim()
    });
  };

  const isFormValid = origen.trim() !== "" && molino.trim() !== "";

  return (
    <form id="new-recipe-form" onSubmit={handleSubmit} className="space-y-5 px-1 py-2">
      {/* Origen del Café */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
          <Compass className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
          Origen del Café
        </label>
        <input
          id="input-origen"
          type="text"
          placeholder="Escribe el país (ej: Guatemala, Ruanda, Perú)..."
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all duration-200 ${
            isDarkMode
              ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/50 focus:border-[#d4a373]"
              : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/50 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
          }`}
        />
        {/* Exactly one line of suggested countries, scrollable horizontally if needed */}
        <div className="flex overflow-x-auto scrollbar-none gap-1.5 pt-1 w-full pb-1">
          {suggestedCountries.map((preset) => (
            <button
              key={preset}
              type="button"
              id={`preset-origen-${preset}`}
              onClick={() => setOrigen(preset)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 shrink-0 ${
                origen.toLowerCase() === preset.toLowerCase()
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373] font-bold"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Variedad del Café */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
          <Coffee className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
          Variedad del Café (Opcional)
        </label>
        <input
          id="input-variedad"
          type="text"
          placeholder="Ej: Caturra, Bourbon, Geisha, Pacamara..."
          value={variedad}
          onChange={(e) => setVariedad(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all duration-200 ${
            isDarkMode
              ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/50 focus:border-[#d4a373]"
              : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/50 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
          }`}
        />
        <div className="flex overflow-x-auto scrollbar-none gap-1.5 pt-1 w-full pb-1">
          {PRESET_VARIEDADES.map((preset) => (
            <button
              key={preset}
              type="button"
              id={`preset-variedad-${preset}`}
              onClick={() => setVariedad(preset)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 shrink-0 ${
                variedad.toLowerCase() === preset.toLowerCase()
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373] font-bold"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de Proceso */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
          <Layers className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
          Tipo de Proceso
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROCESOS.map((p) => (
            <button
              key={p}
              type="button"
              id={`preset-proceso-${p}`}
              onClick={() => setProceso(p)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all duration-150 flex-grow text-center ${
                proceso === p
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373] font-semibold scale-[1.02]"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Observaciones del Proceso */}
        <div className="pt-1">
          <label className="block text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider mb-1">
            Observaciones del Proceso (Opcional)
          </label>
          <input
            id="input-observaciones-proceso"
            type="text"
            placeholder="Ej: fermentación anaeróbica 72h, levadura de frutas, thermal shock..."
            value={observacionesProceso}
            onChange={(e) => setObservacionesProceso(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-xs outline-none transition-all duration-200 ${
              isDarkMode
                ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467]"
            }`}
          />
        </div>
      </div>

      {/* Método de Extracción */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
          <Coffee className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
          Método de Extracción
        </label>
        {/* Exactly 6 options (Espresso removed) rendered beautifully in 2 lines */}
        <div className="grid grid-cols-3 gap-1.5">
          {PRESET_METODOS.map((m) => (
            <button
              key={m}
              type="button"
              id={`preset-metodo-${m}`}
              onClick={() => setMetodo(m)}
              className={`text-xs py-2 px-1.5 rounded-xl border transition-all duration-150 text-center truncate ${
                metodo === m
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373] font-semibold scale-[1.02]"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Informacion adicional / Observaciones del Metodo */}
        <div className="pt-1.5">
          <label className="block text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider mb-1.5">
            Información adicional / Observaciones (Opcional)
          </label>
          <input
            id="input-observaciones"
            type="text"
            placeholder="Ej: cono de cerámica, filtro grueso, sistema switch, variante UFO..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-xs outline-none transition-all duration-200 ${
              isDarkMode
                ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467]"
            }`}
          />
        </div>
      </div>

      {/* Modelo de Molino */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
          <Hammer className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
          Modelo de Molino
        </label>
        <input
          id="input-molino"
          type="text"
          placeholder="Escribe tu molino (ej: Baratza Encore, Comandante C40)..."
          value={molino}
          onChange={(e) => setMolino(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm outline-none transition-all duration-200 ${
            isDarkMode
              ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/50 focus:border-[#d4a373]"
              : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/50 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
          }`}
        />
        {/* Grinder suggestion line with horizontal overflow */}
        <div className="flex overflow-x-auto scrollbar-none gap-1.5 pt-1 w-full pb-1">
          {suggestedGrinders.map((preset) => (
            <button
              key={preset}
              type="button"
              id={`preset-molino-${preset}`}
              onClick={() => setMolino(preset)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 shrink-0 ${
                molino.toLowerCase() === preset.toLowerCase()
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373] font-bold"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Botón de Generar */}
      <button
        id="btn-generar"
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 cursor-pointer shadow-sm select-none ${
          !isFormValid || isLoading
            ? "bg-[#e6dfd5]/40 text-[#8a7e72]/40 dark:bg-[#1c1c1c] dark:text-[#a8a29e]/40 cursor-not-allowed border border-[#e6dfd5] dark:border-[#2a2a2a]"
            : "bg-[#a98467] text-white hover:bg-[#7f5539] dark:bg-[#d4a373] dark:text-[#121212] dark:hover:bg-[#c69262] font-semibold active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white dark:border-[#121212] border-t-transparent animate-spin"></span>
            <span>Calculando receta ideal...</span>
          </div>
        ) : (
          <>
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Calcular Receta Ideal</span>
          </>
        )}
      </button>
    </form>
  );
}
