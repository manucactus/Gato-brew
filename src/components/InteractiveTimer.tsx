import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, SkipForward, ChevronRight, Award, Flame, Droplet, Star, Check, Sparkles } from "lucide-react";
import { RecetaCafe, PasoCronometro, RegistroCata } from "../types";

interface InteractiveTimerProps {
  recipe: RecetaCafe;
  onBrewCompleted: (cata: Omit<RegistroCata, "id" | "fecha">) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export default function InteractiveTimer({ recipe, onBrewCompleted, onCancel, isDarkMode }: InteractiveTimerProps) {
  const steps = recipe.pasosCronometro && recipe.pasosCronometro.length > 0
    ? recipe.pasosCronometro
    : [
        {
          tiempoInicio: 0,
          tiempoFin: 30,
          nombre: "Pre-infusión (Blooming)",
          descripcion: "Vierte 40g de agua lentamente humedeciendo todo el café y espera.",
          aguaAcumulada: 40
        },
        {
          tiempoInicio: 30,
          tiempoFin: 90,
          nombre: "Primer Vertido",
          descripcion: "Vierte agua en círculos concéntricos desde el centro hacia afuera hasta llegar a 130g.",
          aguaAcumulada: 130
        },
        {
          tiempoInicio: 90,
          tiempoFin: 150,
          nombre: "Segundo Vertido",
          descripcion: "Vierte suavemente en el centro del filtrado hasta completar los " + recipe.aguaGramos + "g totales.",
          aguaAcumulada: recipe.aguaGramos
        },
        {
          tiempoInicio: 150,
          tiempoFin: 180,
          nombre: "Filtrado Final",
          descripcion: "Deja que el agua percole por completo. Da un suave giro al filtro para asentar la cama de café.",
          aguaAcumulada: recipe.aguaGramos
        }
      ];

  const totalDuration = steps[steps.length - 1].tiempoFin;

  // Timer states
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // Cata Form states
  const [puntuacion, setPuntuacion] = useState(4);
  const [acidez, setAcidez] = useState(3);
  const [cuerpo, setCuerpo] = useState(3);
  const [dulzor, setDulzor] = useState(3);
  const [amargor, setAmargor] = useState(2);
  const [balance, setBalance] = useState(4);
  const [saborNotas, setSaborNotas] = useState("");
  const [ajustesFuturos, setAjustesFuturos] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio chime using Web Audio API Synthesizer
  const playChime = (type: "step" | "finish") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === "step") {
        // High crisp ping for step transitions
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5 note
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Lovely finished chord (C major arpeggio)
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.08, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      }
    } catch (e) {
      console.warn("Could not play synthesized audio:", e);
    }
  };

  // Timer interval engine
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const nextSec = prev + 1;
          if (nextSec >= totalDuration) {
            // Brew Finished!
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            playChime("finish");
            setShowCompletionForm(true);
            return totalDuration;
          }

          // Check if we need to advance the step
          const currentStep = steps[currentStepIndex];
          if (nextSec >= currentStep.tiempoFin) {
            const nextIdx = currentStepIndex + 1;
            if (nextIdx < steps.length) {
              setCurrentStepIndex(nextIdx);
              playChime("step");
            }
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentStepIndex, steps, totalDuration]);

  // Derived step data
  const activeStep = steps[currentStepIndex];
  const stepSecondsElapsed = seconds - activeStep.tiempoInicio;
  const stepDuration = activeStep.tiempoFin - activeStep.tiempoInicio;
  const stepProgress = Math.min(100, (stepSecondsElapsed / stepDuration) * 100);

  // Format mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSeconds(0);
    setCurrentStepIndex(0);
  };

  const handleSkipStep = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < steps.length) {
      setSeconds(steps[nextIdx].tiempoInicio);
      setCurrentStepIndex(nextIdx);
      playChime("step");
    } else {
      // It was the last step, complete brew
      setSeconds(totalDuration);
      setIsPlaying(false);
      playChime("finish");
      setShowCompletionForm(true);
    }
  };

  const handleBackStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setSeconds(steps[prevIdx].tiempoInicio);
      setCurrentStepIndex(prevIdx);
      playChime("step");
    } else {
      setSeconds(0);
    }
  };

  const handleSubmitCata = (e: React.FormEvent) => {
    e.preventDefault();
    onBrewCompleted({
      recetaId: recipe.id,
      puntuacion,
      acidez,
      cuerpo,
      dulzor,
      amargor,
      balance,
      saborNotas: saborNotas.trim(),
      ajustesFuturos: ajustesFuturos.trim(),
      origenCafe: recipe.origen,
      metodoCafe: recipe.metodo,
      moliendaCafe: recipe.molienda,
      procesoCafe: recipe.proceso,
      variedadCafe: recipe.variedad
    });
  };

  // Completion Form UI
  if (showCompletionForm) {
    return (
      <div className="space-y-4 px-1 py-1 font-sans">
        <div className="text-center space-y-1.5 pb-2 border-b dark:border-[#2a2a2a] border-[#e6dfd5]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#a98467]/10 text-[#a98467] dark:bg-[#d4a373]/10 dark:text-[#d4a373]">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold font-serif text-[#7f5539] dark:text-[#d4a373]">¡Extracción Completada!</h2>
          <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e]">
            Disfruta de tu taza de {recipe.origen} y registra tus notas de cata para perfeccionar tu técnica.
          </p>
        </div>

        <form onSubmit={handleSubmitCata} className="space-y-4">
          {/* Valoración General */}
          <div className="space-y-1.5 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">Puntuación General</span>
            <div className="flex justify-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`btn-star-${star}`}
                  onClick={() => setPuntuacion(star)}
                  className="p-1 cursor-pointer transition-transform active:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      puntuacion >= star
                        ? "fill-[#d4a373] text-[#d4a373] dark:fill-[#d4a373]"
                        : "text-[#e6dfd5] dark:text-[#2a2a2a]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Perfil Sensorial (1-5 sliders) */}
          <div className="space-y-2 bg-[#faf6f0] dark:bg-[#1c1c1c] p-3.5 rounded-xl border border-[#e6dfd5] dark:border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Perfil de Taza (Cata)
            </span>
            
            <div className="space-y-2.5 pt-1.5">
              {[
                { label: "Acidez", value: acidez, setValue: setAcidez, desc: "Brillo / Chispa" },
                { label: "Cuerpo", value: cuerpo, setValue: setCuerpo, desc: "Densidad / Peso" },
                { label: "Dulzor", value: dulzor, setValue: setDulzor, desc: "Sabor a caramelo/azúcar" },
                { label: "Amargor", value: amargor, setValue: setAmargor, desc: "Tostado / Seco" },
                { label: "Balance", value: balance, setValue: setBalance, desc: "Armonía de sabores" }
              ].map((attr) => (
                <div key={attr.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#3e362e] dark:text-[#e6e2df]">{attr.label}</span>
                    <span className="text-[#8a7e72] dark:text-[#a8a29e]/70 text-[10px]">{attr.desc}</span>
                    <span className="font-bold text-[#a98467] dark:text-[#d4a373]">{attr.value}</span>
                  </div>
                  <input
                    type="range"
                    id={`range-cata-${attr.label.toLowerCase()}`}
                    min="1"
                    max="5"
                    step="1"
                    value={attr.value}
                    onChange={(e) => attr.setValue(parseInt(e.target.value))}
                    className="w-full accent-[#a98467] dark:accent-[#d4a373] cursor-pointer h-1 bg-[#e6dfd5] dark:bg-[#2a2a2a] rounded-lg appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notas de Sabor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
              Descriptores de Sabor (Notas de Cata)
            </label>
            <input
              type="text"
              id="input-sabor-notas"
              placeholder="Ej: Chocolate con leche, frutos del bosque, té negro..."
              value={saborNotas}
              onChange={(e) => setSaborNotas(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all duration-150 ${
                isDarkMode
                  ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                  : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
              }`}
            />
          </div>

          {/* Ajustes Futuros */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">
              Ajustes para la Próxima Vez
            </label>
            <textarea
              id="textarea-ajustes-futuros"
              placeholder="Ej: Moler 2 clics más fino para mayor dulzor, bajar agua a 91°C para reducir amargor..."
              value={ajustesFuturos}
              onChange={(e) => setAjustesFuturos(e.target.value)}
              rows={2}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all duration-150 resize-none ${
                isDarkMode
                  ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                  : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
              }`}
            />
          </div>

          {/* Acciones del formulario */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              id="btn-cata-cancel"
              onClick={onCancel}
              className={`py-3.5 px-4 rounded-xl border font-semibold text-xs text-center transition-colors cursor-pointer ${
                isDarkMode
                  ? "border-[#2a2a2a] text-[#a8a29e] hover:bg-[#1c1c1c]"
                  : "border-[#e6dfd5] text-[#8a7e72] hover:bg-[#faf6f0]"
              }`}
            >
              Cerrar sin guardar
            </button>
            <button
              type="submit"
              id="btn-cata-save"
              className="py-3.5 px-4 rounded-xl bg-[#a98467] hover:bg-[#7f5539] text-white dark:bg-[#d4a373] dark:text-[#121212] dark:hover:bg-[#c69262] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Historial</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Active Timer UI
  return (
    <div className="flex flex-col h-[calc(100vh-210px)] max-h-[500px] justify-between font-sans">
      {/* Top Header info */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">
          Preparando: {recipe.origen}
        </span>
        <h2 className="text-sm font-semibold text-[#3e362e] dark:text-[#e6e2df]">
          Paso {currentStepIndex + 1} de {steps.length} • {activeStep.nombre}
        </h2>
      </div>

      {/* Circle Clock & Water displays */}
      <div className="flex items-center justify-center my-2 relative">
        {/* SVG Circle Progress bar */}
        <svg className="w-44 h-44 transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-[#faf6f0] dark:stroke-[#1c1c1c]/80"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="88"
            cy="88"
            r="80"
            className="stroke-[#a98467] dark:stroke-[#d4a373] transition-all duration-500 ease-linear"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 80}
            strokeDashoffset={2 * Math.PI * 80 * (1 - stepProgress / 100)}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Clock text and info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e]/80 uppercase tracking-widest text-[9px]">
            Tiempo de Paso
          </span>
          <span className="text-4xl font-extrabold text-[#3e362e] dark:text-[#e6e2df] font-mono tracking-tight leading-none my-1">
            {formatTime(stepSecondsElapsed)}
          </span>
          <span className="text-[10px] text-[#a98467] dark:text-[#d4a373] font-bold bg-[#faf6f0] dark:bg-[#1c1c1c] px-3 py-1 rounded-lg border border-[#e6dfd5]/40 dark:border-[#2a2a2a]/40">
            Objetivo: {activeStep.tiempoFin - activeStep.tiempoInicio}s
          </span>
        </div>
      </div>

      {/* Target parameters dashboard */}
      <div className="grid grid-cols-2 gap-2 bg-[#faf6f0]/50 dark:bg-[#1c1c1c]/40 p-3 rounded-xl border border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60">
        {/* Cumulative Water target */}
        <div className="text-center border-r dark:border-[#2a2a2a]/80 border-[#e6dfd5]/60 flex flex-col items-center justify-center py-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] flex items-center gap-1">
            <Droplet className="w-3 h-3 text-[#a98467] dark:text-[#d4a373] fill-current" />
            Agua Vertida
          </span>
          <span className="text-base font-bold text-[#3e362e] dark:text-[#e6e2df] font-mono mt-1">
            {activeStep.aguaAcumulada}g
          </span>
          <span className="text-[9px] text-[#8a7e72]/70 dark:text-[#a8a29e]/60">
            Total receta: {recipe.aguaGramos}g
          </span>
        </div>

        {/* Total Elapsed Time */}
        <div className="text-center flex flex-col items-center justify-center py-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#a98467] dark:text-[#d4a373]" />
            Tiempo Total
          </span>
          <span className="text-base font-bold text-[#3e362e] dark:text-[#e6e2df] font-mono mt-1">
            {formatTime(seconds)}
          </span>
          <span className="text-[9px] text-[#8a7e72]/70 dark:text-[#a8a29e]/60">
            Objetivo: {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Current Step Instruction card */}
      <div className="p-3 bg-white dark:bg-[#1c1c1c]/30 border dark:border-[#2a2a2a] border-[#e6dfd5] rounded-xl text-center shadow-sm">
        <p className="text-xs font-bold text-[#a98467] dark:text-[#d4a373] mb-0.5 uppercase tracking-wide text-[10px]">
          Instrucción Actual
        </p>
        <p className="text-xs text-[#3e362e] dark:text-[#e6e2df] leading-relaxed font-medium">
          {activeStep.descripcion}
        </p>
      </div>

      {/* Controls panel */}
      <div className="flex items-center justify-between gap-2 border-t border-dashed dark:border-[#2a2a2a] border-[#e6dfd5]/40 pt-3.5">
        <button
          id="btn-timer-reset"
          onClick={handleReset}
          className={`p-3 rounded-full border transition-colors cursor-pointer ${
            isDarkMode
              ? "border-[#2a2a2a] hover:bg-[#1c1c1c] text-[#a8a29e]"
              : "border-[#e6dfd5] hover:bg-[#faf6f0] text-[#8a7e72]"
          }`}
          title="Reiniciar"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            id="btn-timer-back"
            onClick={handleBackStep}
            disabled={currentStepIndex === 0}
            className={`p-3 rounded-full border transition-colors ${
              currentStepIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "cursor-pointer"
            } ${
              isDarkMode
                ? "border-[#2a2a2a] hover:bg-[#1c1c1c] text-[#a8a29e]"
                : "border-[#e6dfd5] hover:bg-[#faf6f0] text-[#8a7e72]"
            }`}
            title="Paso Anterior"
          >
            <ChevronRight className="w-4.5 h-4.5 transform rotate-180" />
          </button>

          <button
            id="btn-timer-play-pause"
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full bg-[#a98467] hover:bg-[#7f5539] dark:bg-[#d4a373] text-white dark:text-[#121212] dark:hover:bg-[#c69262] flex items-center justify-center shadow-lg transition-transform active:scale-[0.95] cursor-pointer"
            title={isPlaying ? "Pausar" : "Iniciar"}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            id="btn-timer-skip"
            onClick={handleSkipStep}
            className={`p-3 rounded-full border transition-colors cursor-pointer ${
              isDarkMode
                ? "border-[#2a2a2a] hover:bg-[#1c1c1c] text-[#a8a29e]"
                : "border-[#e6dfd5] hover:bg-[#faf6f0] text-[#8a7e72]"
            }`}
            title="Saltar Paso"
          >
            <SkipForward className="w-4.5 h-4.5" />
          </button>
        </div>

        <button
          id="btn-timer-cancel"
          onClick={onCancel}
          className={`py-1.5 px-3 text-[10px] font-bold tracking-wider uppercase border rounded-lg transition-colors cursor-pointer ${
            isDarkMode
              ? "border-[#2a2a2a] text-[#a8a29e]/80 hover:bg-[#1c1c1c]"
              : "border-[#e6dfd5] text-[#8a7e72]/80 hover:bg-[#faf6f0]"
          }`}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
