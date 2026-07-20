import { useState, useEffect } from "react";
import { Coffee, Sun, Moon, Sparkles, BookOpen, Clock, AlertCircle, Settings, Key, Check, Palette } from "lucide-react";
import NewRecipeForm from "./components/NewRecipeForm";
import RecipeDetails from "./components/RecipeDetails";
import InteractiveTimer from "./components/InteractiveTimer";
import HistoryAndNotes from "./components/HistoryAndNotes";
import { RecetaCafe, RegistroCata } from "./types";
import logoUrl from "./assets/images/gato_brew_sticker_logo_1784336418292.jpg";
import { generateLocalFallbackRecipe } from "./utils/localRecipeGenerator";
import { generateRecipeWithAI } from "./utils/aiProviders";
import { buscarRecetasSimilares } from "./utils/campeonesDatabase";

// Helper para formatear tiempo
function formatTiempo(segundos: number): string {
  if (segundos < 60) {
    return `${segundos} seg`;
  }
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  if (secs === 0) {
    return `${mins}:00 min`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

const SEED_HISTORY: RegistroCata[] = [
  {
    id: "seed-1",
    recetaId: "seed-receta-1",
    fecha: "16/07/2026 15:30",
    puntuacion: 5,
    acidez: 5,
    cuerpo: 3,
    dulzor: 4,
    amargor: 1,
    balance: 4,
    saborNotas: "Jazmín muy intenso, acidez cítrica brillante a bergamota y final dulce de té de limón.",
    ajustesFuturos: "Excelente resultado. Conservar molienda de 22 clics en Comandante y temperatura de 93°C.",
    origenCafe: "Etiopía Yirgacheffe",
    metodoCafe: "V60",
    moliendaCafe: "22 clics en Comandante C40"
  },
  {
    id: "seed-2",
    recetaId: "seed-receta-2",
    fecha: "15/07/2026 09:15",
    puntuacion: 4,
    acidez: 2,
    cuerpo: 4,
    dulzor: 3,
    amargor: 3,
    balance: 3,
    saborNotas: "Cacao tostado, notas sutiles de ciruela pasa, cuerpo pesado.",
    ajustesFuturos: "Un poco amargo al final. Moler 2 pasos más grueso (Baratza Encore paso 16) y reducir temperatura a 91°C.",
    origenCafe: "Brasil Bourbon Amarillo",
    metodoCafe: "Prensa Francesa",
    moliendaCafe: "Paso 14 en Baratza Encore"
  }
];

const LOADING_MESSAGES = [
  "Analizando origen y tipo de proceso...",
  "Buscando notas de cata características en internet...",
  "Calculando ratio ideal de agua y café...",
  "Estableciendo tamaño óptimo de molienda...",
  "Configurando tiempos para el cronómetro interactivo...",
  "Afinando los perfiles aromáticos de tu taza..."
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"preparar" | "cronometro" | "historial">("preparar");
  const [activeRecipe, setActiveRecipe] = useState<RecetaCafe | null>(null);
  const [history, setHistory] = useState<RegistroCata[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"api" | "estilo">("api");
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("gato_brew_theme_color") || "estandar";
  });

  // Estado de IA activa
  const [activeAIProvider, setActiveAIProvider] = useState<string>("local");
  const [expandedAIOption, setExpandedAIOption] = useState<string | null>(null);

  // Verificar IA activa al montar
  useEffect(() => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    const geminiKey = localStorage.getItem("gato_brew_gemini_api_key");
    const openaiKey = localStorage.getItem("gato_brew_openai_api_key");
    const claudeKey = localStorage.getItem("gato_brew_claude_api_key");

    if (groqKey) {
      setActiveAIProvider("groq");
    } else if (geminiKey) {
      setActiveAIProvider("gemini");
    } else if (openaiKey) {
      setActiveAIProvider("openai");
    } else if (claudeKey) {
      setActiveAIProvider("claude");
    } else {
      setActiveAIProvider("local");
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("gato_brew_custom_api_key", key);
  };

  const handleSaveThemeColor = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("gato_brew_theme_color", color);
  };

  // Sync data-theme attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem("gato_brew_custom_api_key") || "";
  });

  // Initialize History from LocalStorage (or seed if empty)
  useEffect(() => {
    const cached = localStorage.getItem("cafe_especialidad_historial");
    if (cached) {
      try {
        setHistory(JSON.parse(cached));
      } catch (e) {
        setHistory(SEED_HISTORY);
      }
    } else {
      setHistory(SEED_HISTORY);
      localStorage.setItem("cafe_especialidad_historial", JSON.stringify(SEED_HISTORY));
    }

    // Set theme default (prefer dark per soft color requirement)
    const cachedTheme = localStorage.getItem("cafe_especialidad_theme");
    if (cachedTheme) {
      setIsDarkMode(cachedTheme === "dark");
    } else {
      setIsDarkMode(true);
    }
  }, []);

  // Update localStorage when history changes
  const updateHistory = (newHistory: RegistroCata[]) => {
    setHistory(newHistory);
    localStorage.setItem("cafe_especialidad_historial", JSON.stringify(newHistory));
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem("cafe_especialidad_theme", nextTheme ? "dark" : "light");
  };

  // Sync dark class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Cycle loading messages for smooth experience
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Request Recipe with AI enhancement
  const handleGenerateRecipe = async (params: { origen: string; variedad?: string; proceso: string; metodo: string; molino: string; observaciones?: string }) => {
    setIsGenerating(true);
    setError(null);
    setActiveRecipe(null);

    try {
      // Buscar receta base en la base de datos de campeones
      const recetasBase = buscarRecetasSimilares(params.origen, params.proceso, params.metodo, params.variedad);
      const recetaBase = recetasBase.length > 0 ? recetasBase[0] : null;

      // Llamar al servicio de IA (Groq -> API usuario -> fallback local)
      const resultado = await generateRecipeWithAI({
        origen: params.origen,
        proceso: params.proceso,
        metodo: params.metodo,
        molino: params.molino,
        variedad: params.variedad,
        observaciones: params.observaciones
      }, recetaBase);

      const { receta: data, provider, isFallback } = resultado;

      const newRecipe: RecetaCafe = {
        id: `recipe-${Date.now()}`,
        origen: params.origen,
        variedad: params.variedad || data.variedad || "",
        proceso: params.proceso,
        metodo: params.metodo,
        molino: params.molino,
        temperatura: `${data.temperatura}°C`,
        temperaturaNum: data.temperatura,
        molienda: `${data.molienda.tipo} (${data.molienda.granulometria}) - ${data.molienda.clics}`,
        moliendaDetalle: {
          tipo: data.molienda.tipo as any,
          granulometria: data.molienda.granulometria,
          clicsComandante: data.molienda.clics,
          descripcion: ""
        },
        ratio: `1:${data.ratio}`,
        ratioNum: data.ratio,
        cafeGramos: data.cafeGramos,
        aguaGramos: data.aguaGramos,
        tiempoExtraccion: formatTiempo(data.tiempoExtraccion),
        tiempoExtraccionSegundos: data.tiempoExtraccion,
        saborPerfil: data.saborPerfil,
        instrucciones: data.instrucciones,
        notasBarista: data.notaBarista,
        fecha: new Date().toLocaleDateString("es-ES"),
        notasPersonales: isFallback
          ? "Receta calculada localmente (sin IA)."
          : `Receta generada con IA (${provider.toUpperCase()}).`,
        isFallback,
        isIA: !isFallback,
        recetaBaseOrigen: recetaBase ? `${recetaBase.competencia} ${recetaBase.year}` : "Base de datos Gato Brew",
        recetaBaseBarista: recetaBase?.barista,
        variacionAplicada: true,
        pasosCronometro: []
      };

      setActiveRecipe(newRecipe);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al calcular la receta. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calibrate and optimize a past recipe with AI
  const handleOptimizeRecipe = async (originalEntry: RegistroCata, feedback: string) => {
    setIsGenerating(true);
    setError(null);
    setActiveRecipe(null);
    setActiveTab("preparar");

    try {
      // Buscar receta base
      const recetasBase = buscarRecetasSimilares(
        originalEntry.origenCafe,
        originalEntry.procesoCafe || "Lavado",
        originalEntry.metodoCafe,
        originalEntry.variedadCafe
      );
      const recetaBase = recetasBase.length > 0 ? recetasBase[0] : null;

      // Llamar al servicio de IA
      const resultado = await generateRecipeWithAI({
        origen: originalEntry.origenCafe,
        proceso: originalEntry.procesoCafe || "Lavado",
        metodo: originalEntry.metodoCafe,
        molino: originalEntry.moliendaCafe,
        variedad: originalEntry.variedadCafe,
        feedback: feedback
      }, recetaBase);

      const { receta: data, provider, isFallback } = resultado;

      const newRecipe: RecetaCafe = {
        id: `recipe-${Date.now()}`,
        originalCataId: originalEntry.id,
        origen: originalEntry.origenCafe,
        variedad: originalEntry.variedadCafe || data.variedad || "",
        proceso: originalEntry.procesoCafe || "Lavado",
        metodo: originalEntry.metodoCafe,
        molino: originalEntry.moliendaCafe,
        temperatura: `${data.temperatura}°C`,
        temperaturaNum: data.temperatura,
        molienda: `${data.molienda.tipo} (${data.molienda.granulometria}) - ${data.molienda.clics}`,
        moliendaDetalle: {
          tipo: data.molienda.tipo as any,
          granulometria: data.molienda.granulometria,
          clicsComandante: data.molienda.clics,
          descripcion: ""
        },
        ratio: `1:${data.ratio}`,
        ratioNum: data.ratio,
        cafeGramos: data.cafeGramos,
        aguaGramos: data.aguaGramos,
        tiempoExtraccion: formatTiempo(data.tiempoExtraccion),
        tiempoExtraccionSegundos: data.tiempoExtraccion,
        saborPerfil: data.saborPerfil,
        instrucciones: data.instrucciones,
        notasBarista: data.notaBarista,
        fecha: new Date().toLocaleDateString("es-ES"),
        notasPersonales: isFallback
          ? `Receta calibrada localmente. Ajuste sugerido para tu preparación del ${originalEntry.fecha}: "${feedback}"`
          : `Receta calibrada por ${provider.toUpperCase()}. Ajuste sugerido basado en tu preparación del ${originalEntry.fecha}: "${feedback}"`,
        isFallback,
        isIA: !isFallback,
        recetaBaseOrigen: recetaBase ? `${recetaBase.competencia} ${recetaBase.year}` : "Base de datos Gato Brew",
        recetaBaseBarista: recetaBase?.barista,
        variacionAplicada: true,
        pasosCronometro: []
      };

      setActiveRecipe(newRecipe);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al calibrar la receta. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save personal notes for the currently active recipe
  const handleSaveRecipeNotes = (notes: string) => {
    if (activeRecipe) {
      const updated = { ...activeRecipe, notasPersonales: notes };
      setActiveRecipe(updated);
    }
  };

  // Handle Brew session completed (saves to History list)
  const handleBrewCompleted = (cataData: Omit<RegistroCata, "id" | "fecha">) => {
    const formattedDate = new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const originalEntry = activeRecipe?.originalCataId
      ? history.find(item => item.id === activeRecipe.originalCataId)
      : undefined;

    const newCata: RegistroCata = {
      ...cataData,
      id: `cata-${Date.now()}`,
      fecha: formattedDate,
      titulo: originalEntry?.titulo || undefined, // keep custom title if parent has one
      modificadaPorIA: activeRecipe?.originalCataId ? true : false,
      originalCataId: activeRecipe?.originalCataId,
      recetaCalibrada: activeRecipe?.originalCataId ? activeRecipe : undefined,
    };

    let updatedHistory = [...history];
    if (activeRecipe?.originalCataId) {
      updatedHistory = updatedHistory.map(item => {
        if (item.id === activeRecipe.originalCataId) {
          return {
            ...item,
            modificadaPorIA: true,
            recetaCalibrada: activeRecipe,
            ajustesFuturos: `${item.ajustesFuturos ? item.ajustesFuturos + "\n\n" : ""}Calibración aplicada el ${formattedDate}: ${activeRecipe.notasPersonales || "Nueva receta recomendada por IA."}`
          };
        }
        return item;
      });
    }

    updatedHistory = [newCata, ...updatedHistory];
    updateHistory(updatedHistory);
    setActiveTab("historial");
  };

  // Delete history entry
  const handleDeleteHistoryEntry = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro de cata?")) {
      const updated = history.filter(item => item.id !== id);
      updateHistory(updated);
    }
  };

  // Update single history entry (e.g. customized title)
  const handleUpdateHistoryEntry = (updatedEntry: RegistroCata) => {
    const updated = history.map(item => item.id === updatedEntry.id ? updatedEntry : item);
    updateHistory(updated);
  };

  // Save the currently generated recipe to history directly (bookmarks)
  const handleSaveRecipeToHistoryDirectly = () => {
    if (!activeRecipe) return;

    // Create a cata log preset
    const formattedDate = new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const originalEntry = activeRecipe.originalCataId
      ? history.find(item => item.id === activeRecipe.originalCataId)
      : undefined;

    const directCata: RegistroCata = {
      id: `cata-${Date.now()}`,
      recetaId: activeRecipe.id,
      fecha: formattedDate,
      puntuacion: 5, // default
      acidez: 3,
      cuerpo: 3,
      dulzor: 3,
      amargor: 2,
      balance: 3,
      saborNotas: "Guardado directo de receta. Pendiente de cata activa.",
      ajustesFuturos: activeRecipe.notasPersonales || "",
      origenCafe: activeRecipe.origen,
      metodoCafe: activeRecipe.metodo,
      moliendaCafe: activeRecipe.molienda,
      procesoCafe: activeRecipe.proceso,
      variedadCafe: activeRecipe.variedad,
      titulo: originalEntry?.titulo || undefined,
      modificadaPorIA: activeRecipe.originalCataId ? true : false,
      originalCataId: activeRecipe.originalCataId,
      recetaCalibrada: activeRecipe.originalCataId ? activeRecipe : undefined,
    };

    let updatedHistory = [...history];
    if (activeRecipe.originalCataId) {
      updatedHistory = updatedHistory.map(item => {
        if (item.id === activeRecipe.originalCataId) {
          return {
            ...item,
            modificadaPorIA: true,
            recetaCalibrada: activeRecipe,
            ajustesFuturos: `${item.ajustesFuturos ? item.ajustesFuturos + "\n\n" : ""}Calibración guardada directamente el ${formattedDate}: ${activeRecipe.notasPersonales || "Nueva receta recomendada por IA."}`
          };
        }
        return item;
      });
    }

    updateHistory([directCata, ...updatedHistory]);
    alert("¡Receta guardada en tu bitácora de preparaciones!");
  };

  const isCurrentRecipeSavedInHistory = activeRecipe
    ? history.some(item => item.recetaId === activeRecipe.id)
    : false;

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#121212] text-[#3e362e] dark:text-[#e6e2df] flex flex-col font-sans transition-colors duration-200">
        
        {/* Navigation Top Header */}
        <header className="sticky top-0 z-30 w-full max-w-md mx-auto px-4 py-3 bg-[#faf8f5]/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-[#e6dfd5] dark:border-[#2a2a2a] relative">
          <div className="flex items-center gap-4 w-full pr-16">
            {/* Beautiful Gato Brew Sticker Logo - Expanded and optimized for details and full cat's head */}
            <div className="relative h-32 w-32 flex items-center justify-center bg-white rounded-2xl border-2 border-[#e6dfd5] dark:border-white shadow-md overflow-hidden p-1 shrink-0">
              <img 
                src={logoUrl} 
                alt="Gato Brew Sticker Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            
            {/* Right half: Name of the App */}
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-sm font-black tracking-widest text-[#a98467] dark:text-[#d4a373] uppercase leading-tight font-sans">
                GATO BREW
              </h1>
              <h2 className="text-[10px] font-semibold text-[#8a7e72] dark:text-[#a8a29e] tracking-tight leading-normal mt-1">
                Recetas de Filtrados • IA
              </h2>
            </div>
          </div>

          {/* Settings and Theme Toggle Buttons absolute inside header */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              id="settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showSettings 
                  ? "bg-[#a98467]/15 text-[#a98467] dark:bg-[#d4a373]/15 dark:text-[#d4a373]" 
                  : "hover:bg-[#e6dfd5]/40 dark:hover:bg-[#2a2a2a] text-[#8a7e72] dark:text-[#a8a29e]"
              }`}
              title="Configurar API Key propia"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-[#e6dfd5]/40 dark:hover:bg-[#2a2a2a] text-[#8a7e72] dark:text-[#a8a29e] transition-colors cursor-pointer"
              title="Cambiar Modo"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-neutral-600" />}
            </button>
          </div>
        </header>

        {/* Main View Container */}
        <main className="flex-grow w-full max-w-md mx-auto px-4 pt-3 pb-24 overflow-y-auto">
          {/* Settings / API Key and Style Configuration Card */}
          {showSettings && (
            <div className="mb-4 p-4 rounded-2xl bg-white dark:bg-[#1c1c1c] border border-[#e6dfd5] dark:border-[#2a2a2a] shadow-md space-y-4 font-sans">
              <div className="flex items-center justify-between border-b pb-2 dark:border-[#2a2a2a] border-[#e6dfd5]">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#a98467] dark:text-[#d4a373] animate-[spin_4s_linear_infinite]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e362e] dark:text-[#e6e2df]">
                    Configuración de la App
                  </h3>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e] hover:underline font-bold"
                >
                  Cerrar
                </button>
              </div>

              {/* Settings Sub-tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#faf6f0] dark:bg-[#121212]/60 border border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60">
                <button
                  id="tab-settings-api"
                  onClick={() => setSettingsTab("api")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    settingsTab === "api"
                      ? "bg-white dark:bg-[#1c1c1c] text-[#a98467] dark:text-[#d4a373] shadow-sm"
                      : "text-[#8a7e72] dark:text-[#a8a29e] hover:bg-[#faf6f0]/60 dark:hover:bg-[#1c1c1c]/40"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>API Key</span>
                </button>
                <button
                  id="tab-settings-style"
                  onClick={() => setSettingsTab("estilo")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    settingsTab === "estilo"
                      ? "bg-white dark:bg-[#1c1c1c] text-[#a98467] dark:text-[#d4a373] shadow-sm"
                      : "text-[#8a7e72] dark:text-[#a8a29e] hover:bg-[#faf6f0]/60 dark:hover:bg-[#1c1c1c]/40"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Estilo Visual</span>
                </button>
              </div>

              {/* Sub-tab 1: API Key - Multi Provider (Expandible) */}
              {settingsTab === "api" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider">
                    Selecciona proveedor de IA
                  </p>

                  {/* Opción 1: Groq (gratis) - Solo mostrar instrucciones */}
                  <div className="border border-[#e6dfd5] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedAIOption(expandedAIOption === "groq" ? null : "groq")}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between ${
                        activeAIProvider === "groq"
                          ? "bg-green-500/10"
                          : "hover:bg-[#faf6f0] dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3e362e] dark:text-[#e6e2df]">Groq (Recomendado)</p>
                            {activeAIProvider === "groq" && (
                              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">ACTIVO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e]">Gratis y rápido</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7e72] text-xs">{expandedAIOption === "groq" ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {expandedAIOption === "groq" && (
                      <div className="p-3 border-t border-[#e6dfd5] dark:border-[#2a2a2a] bg-[#faf6f0]/50 dark:bg-[#121212]/30 space-y-3">
                        <div className="text-[11px] space-y-1.5">
                          <p className="font-bold text-[#7f5539] dark:text-[#d4a373]">⚡ ¿Cómo activar Groq?</p>
                          <ol className="list-decimal pl-4 text-[#3e362e] dark:text-[#c7c1bb] space-y-0.5">
                            <li>Crea cuenta en <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-[#a98467] dark:text-[#d4a373] underline">console.groq.com</a></li>
                            <li>Ve a "API Keys" y crea una nueva clave</li>
                            <li>Añade <code className="bg-[#e6dfd5] dark:bg-[#2a2a2a] px-1 rounded font-mono text-[10px]">VITE_GROQ_API_KEY=tu_clave</code> en el archivo <code className="bg-[#e6dfd5] dark:bg-[#2a2a2a] px-1 rounded font-mono text-[10px]">.env</code></li>
                            <li>Reinicia el servidor con <code className="bg-[#e6dfd5] dark:bg-[#2a2a2a] px-1 rounded font-mono text-[10px]">npm run dev</code></li>
                          </ol>
                        </div>
                        {import.meta.env.VITE_GROQ_API_KEY ? (
                          <button
                            onClick={() => {
                              localStorage.removeItem("gato_brew_gemini_api_key");
                              localStorage.removeItem("gato_brew_openai_api_key");
                              localStorage.removeItem("gato_brew_claude_api_key");
                              setActiveAIProvider("groq");
                              window.location.reload();
                            }}
                            className="w-full py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Activar Groq
                          </button>
                        ) : (
                          <p className="text-[11px] text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-2 rounded-lg text-center">
                            ⚠️ Añade tu API key en el archivo .env
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Opción 2: Google AI Studio */}
                  <div className="border border-[#e6dfd5] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedAIOption(expandedAIOption === "gemini" ? null : "gemini")}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between ${
                        activeAIProvider === "gemini"
                          ? "bg-green-500/10"
                          : "hover:bg-[#faf6f0] dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔮</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3e362e] dark:text-[#e6e2df]">Google AI Studio</p>
                            {activeAIProvider === "gemini" && (
                              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">ACTIVO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e]">Gratis (15 req/min)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7e72] text-xs">{expandedAIOption === "gemini" ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {expandedAIOption === "gemini" && (
                      <div className="p-3 border-t border-[#e6dfd5] dark:border-[#2a2a2a] bg-[#faf6f0]/50 dark:bg-[#121212]/30 space-y-3">
                        <div className="text-[11px] space-y-1.5">
                          <p className="font-bold text-[#7f5539] dark:text-[#d4a373]">🔮 ¿Cómo obtener tu API Key?</p>
                          <ol className="list-decimal pl-4 text-[#3e362e] dark:text-[#c7c1bb] space-y-0.5">
                            <li>Entra en <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-[#a98467] dark:text-[#d4a373] underline">Google AI Studio</a></li>
                            <li>Haz clic en "Get API Key"</li>
                            <li>Crea una clave nueva y cópiala</li>
                          </ol>
                        </div>
                        <div className="flex gap-2">
                          <input
                            id="gemini-api-key"
                            type="password"
                            placeholder="Pega tu API Key aquí..."
                            defaultValue={localStorage.getItem("gato_brew_gemini_api_key") || ""}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e6dfd5] dark:border-[#2a2a2a] bg-white dark:bg-[#121212] text-xs font-mono outline-none focus:border-[#a98467]"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById("gemini-api-key") as HTMLInputElement;
                              const key = input.value.trim();
                              if (key) {
                                localStorage.setItem("gato_brew_gemini_api_key", key);
                                localStorage.removeItem("gato_brew_openai_api_key");
                                localStorage.removeItem("gato_brew_claude_api_key");
                                setActiveAIProvider("gemini");
                                window.location.reload();
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            Activar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opción 3: OpenAI */}
                  <div className="border border-[#e6dfd5] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedAIOption(expandedAIOption === "openai" ? null : "openai")}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between ${
                        activeAIProvider === "openai"
                          ? "bg-green-500/10"
                          : "hover:bg-[#faf6f0] dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🤖</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3e362e] dark:text-[#e6e2df]">OpenAI</p>
                            {activeAIProvider === "openai" && (
                              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">ACTIVO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e]">GPT-3.5/4 (pago por uso)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7e72] text-xs">{expandedAIOption === "openai" ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {expandedAIOption === "openai" && (
                      <div className="p-3 border-t border-[#e6dfd5] dark:border-[#2a2a2a] bg-[#faf6f0]/50 dark:bg-[#121212]/30 space-y-3">
                        <div className="text-[11px] space-y-1.5">
                          <p className="font-bold text-[#7f5539] dark:text-[#d4a373]">🤖 ¿Cómo obtener tu API Key?</p>
                          <ol className="list-decimal pl-4 text-[#3e362e] dark:text-[#c7c1bb] space-y-0.5">
                            <li>Entra en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#a98467] dark:text-[#d4a373] underline">platform.openai.com</a></li>
                            <li>Crea una nueva API key</li>
                            <li>Copia y pega la clave</li>
                          </ol>
                        </div>
                        <div className="flex gap-2">
                          <input
                            id="openai-api-key"
                            type="password"
                            placeholder="sk-..."
                            defaultValue={localStorage.getItem("gato_brew_openai_api_key") || ""}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e6dfd5] dark:border-[#2a2a2a] bg-white dark:bg-[#121212] text-xs font-mono outline-none focus:border-[#a98467]"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById("openai-api-key") as HTMLInputElement;
                              const key = input.value.trim();
                              if (key) {
                                localStorage.setItem("gato_brew_openai_api_key", key);
                                localStorage.removeItem("gato_brew_gemini_api_key");
                                localStorage.removeItem("gato_brew_claude_api_key");
                                setActiveAIProvider("openai");
                                window.location.reload();
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            Activar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opción 4: Claude */}
                  <div className="border border-[#e6dfd5] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedAIOption(expandedAIOption === "claude" ? null : "claude")}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between ${
                        activeAIProvider === "claude"
                          ? "bg-green-500/10"
                          : "hover:bg-[#faf6f0] dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🧠</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3e362e] dark:text-[#e6e2df]">Claude (Anthropic)</p>
                            {activeAIProvider === "claude" && (
                              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">ACTIVO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e]">Requiere API Key de pago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7e72] text-xs">{expandedAIOption === "claude" ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {expandedAIOption === "claude" && (
                      <div className="p-3 border-t border-[#e6dfd5] dark:border-[#2a2a2a] bg-[#faf6f0]/50 dark:bg-[#121212]/30 space-y-3">
                        <div className="text-[11px] space-y-1.5">
                          <p className="font-bold text-[#7f5539] dark:text-[#d4a373]">🧠 ¿Cómo obtener tu API Key?</p>
                          <ol className="list-decimal pl-4 text-[#3e362e] dark:text-[#c7c1bb] space-y-0.5">
                            <li>Entra en <a href="https://console.anthropic.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#a98467] dark:text-[#d4a373] underline">console.anthropic.com</a></li>
                            <li>Crea una nueva API key</li>
                            <li>Copia y pega la clave</li>
                          </ol>
                        </div>
                        <div className="flex gap-2">
                          <input
                            id="claude-api-key"
                            type="password"
                            placeholder="sk-ant-..."
                            defaultValue={localStorage.getItem("gato_brew_claude_api_key") || ""}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e6dfd5] dark:border-[#2a2a2a] bg-white dark:bg-[#121212] text-xs font-mono outline-none focus:border-[#a98467]"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById("claude-api-key") as HTMLInputElement;
                              const key = input.value.trim();
                              if (key) {
                                localStorage.setItem("gato_brew_claude_api_key", key);
                                localStorage.removeItem("gato_brew_gemini_api_key");
                                localStorage.removeItem("gato_brew_openai_api_key");
                                setActiveAIProvider("claude");
                                window.location.reload();
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            Activar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opción 5: Modo Local */}
                  <div className="border border-[#e6dfd5] dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        localStorage.removeItem("gato_brew_gemini_api_key");
                        localStorage.removeItem("gato_brew_openai_api_key");
                        localStorage.removeItem("gato_brew_claude_api_key");
                        setActiveAIProvider("local");
                        setExpandedAIOption(null);
                        window.location.reload();
                      }}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between ${
                        activeAIProvider === "local"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : "hover:bg-[#faf6f0] dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📦</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3e362e] dark:text-[#e6e2df]">Modo Local</p>
                            {activeAIProvider === "local" && (
                              <span className="text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold">ACTIVO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e]">Sin IA, usa base de datos</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Style Modifier */}
              {settingsTab === "estilo" && (
                <div className="space-y-3 pt-1">
                  <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e] leading-relaxed">
                    Personaliza los colores de los menús y botones por defecto. Tu selección se guardará en la memoria local del navegador y se adaptará al modo noche:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Estándar / Marrón */}
                    <button
                      id="theme-btn-estandar"
                      onClick={() => handleSaveThemeColor("estandar")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        themeColor === "estandar"
                          ? "border-[#a98467] dark:border-[#d4a373] bg-[#a98467]/5 dark:bg-[#d4a373]/5 ring-1 ring-[#a98467] dark:ring-[#d4a373]"
                          : "border-[#e6dfd5] dark:border-[#2a2a2a] hover:bg-neutral-50 dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#a98467] border border-white dark:border-[#1c1c1c] shadow-sm block" />
                        <span className="w-4 h-4 rounded-full bg-[#d4a373] border border-white dark:border-[#1c1c1c] shadow-sm block -ml-2.5" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3e362e] dark:text-[#e6e2df]">
                        Estándar (Café)
                      </span>
                    </button>

                    {/* Azul Barista */}
                    <button
                      id="theme-btn-azul"
                      onClick={() => handleSaveThemeColor("azul")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        themeColor === "azul"
                          ? "border-sky-600 dark:border-sky-400 bg-sky-500/5 dark:bg-sky-400/5 ring-1 ring-sky-600 dark:ring-sky-400"
                          : "border-[#e6dfd5] dark:border-[#2a2a2a] hover:bg-neutral-50 dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-sky-600 border border-white dark:border-[#1c1c1c] shadow-sm block" />
                        <span className="w-4 h-4 rounded-full bg-sky-400 border border-white dark:border-[#1c1c1c] shadow-sm block -ml-2.5" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3e362e] dark:text-[#e6e2df]">
                        Azul Barista
                      </span>
                    </button>

                    {/* Rosa Sakura */}
                    <button
                      id="theme-btn-rosado"
                      onClick={() => handleSaveThemeColor("rosado")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        themeColor === "rosado"
                          ? "border-pink-600 dark:border-pink-400 bg-pink-500/5 dark:bg-pink-400/5 ring-1 ring-pink-600 dark:ring-pink-400"
                          : "border-[#e6dfd5] dark:border-[#2a2a2a] hover:bg-neutral-50 dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-pink-600 border border-white dark:border-[#1c1c1c] shadow-sm block" />
                        <span className="w-4 h-4 rounded-full bg-pink-400 border border-white dark:border-[#1c1c1c] shadow-sm block -ml-2.5" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3e362e] dark:text-[#e6e2df]">
                        Rosa Sakura
                      </span>
                    </button>

                    {/* Gris Carbón */}
                    <button
                      id="theme-btn-oscuro"
                      onClick={() => handleSaveThemeColor("oscuro")}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        themeColor === "oscuro"
                          ? "border-zinc-500 dark:border-zinc-400 bg-zinc-500/5 dark:bg-zinc-400/5 ring-1 ring-zinc-500 dark:ring-zinc-400"
                          : "border-[#e6dfd5] dark:border-[#2a2a2a] hover:bg-neutral-50 dark:hover:bg-[#121212]/30"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-zinc-600 border border-white dark:border-[#1c1c1c] shadow-sm block" />
                        <span className="w-4 h-4 rounded-full bg-zinc-200 border border-white dark:border-[#1c1c1c] shadow-sm block -ml-2.5" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3e362e] dark:text-[#e6e2df]">
                        Gris Carbón
                      </span>
                    </button>
                  </div>

                  <div className="pt-1.5 border-t dark:border-[#2a2a2a]/60 border-[#e6dfd5]/60 flex justify-between items-center text-[10px]">
                    <span className="text-[#8a7e72] dark:text-[#a8a29e]">Estilo actual:</span>
                    <span className="font-bold text-[#a98467] dark:text-[#d4a373] uppercase tracking-wider">
                      {themeColor === "estandar" && "Estándar (Café)"}
                      {themeColor === "azul" && "Azul Barista"}
                      {themeColor === "rosado" && "Rosa Sakura"}
                      {themeColor === "oscuro" && "Gris Carbón"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-900/10 dark:bg-rose-950/10 border border-amber-900/20 dark:border-rose-900/40 text-xs text-amber-900 dark:text-rose-300 flex gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-700 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Error al calcular la receta</p>
                <p className="leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Views */}
          {activeTab === "preparar" && (
            <div className="space-y-4">
              {/* Form and Recipient */}
              {!activeRecipe && !isGenerating && (
                <div className="space-y-4">
                  {/* Hero Prompt Intro without duplicate logo */}
                  <div className="p-5 rounded-2xl bg-[#f5ebe0] dark:bg-[#1c1c1c] text-[#3e362e] dark:text-[#e6e2df] shadow-sm border border-[#e6dfd5] dark:border-[#2a2a2a] relative overflow-hidden flex flex-col gap-2">
                    <div className="flex gap-1.5 items-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#a98467] dark:text-[#d4a373] animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">Gato Brew AI</span>
                    </div>
                    <h2 className="text-sm font-bold font-serif italic leading-snug text-[#7f5539] dark:text-[#d4a373]">Fórmula tu Extracción Ideal</h2>
                    <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e] leading-relaxed mt-0.5">
                      Completa los parámetros de tu grano. Buscaremos notas de cata y configuraciones de molienda en internet para diseñarte una receta experta de filtrados.
                    </p>

                    {/* Alerta de estado de IA */}
                    {activeAIProvider !== "local" ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-[11px] flex items-center gap-2">
                        <span className="text-green-500">✨</span>
                        <span className="font-bold">IA Activa:</span>
                        <span className="font-mono bg-green-500/20 px-1.5 py-0.5 rounded">{activeAIProvider.toUpperCase()}</span>
                      </div>
                    ) : (
                      <div className="mt-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-[11px] flex items-center gap-2">
                        <span className="text-yellow-500">⚠️</span>
                        <span className="font-bold">Modo Local:</span>
                        <span>Sin IA configurada</span>
                      </div>
                    )}
                  </div>

                  <NewRecipeForm
                    onGenerate={handleGenerateRecipe}
                    isLoading={isGenerating}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* Loader screen */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
                  {/* Brew Animation */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#a98467]/10 dark:border-[#d4a373]/10 border-t-[#a98467] dark:border-t-[#d4a373] animate-spin"></div>
                    <Coffee className="w-6 h-6 text-[#a98467] dark:text-[#d4a373] absolute animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#3e362e] dark:text-[#e6e2df] transition-all duration-300">
                      {LOADING_MESSAGES[loadingMsgIdx]}
                    </p>
                    <p className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e]">
                      Consultando bases especializadas de barismo...
                    </p>
                  </div>
                </div>
              )}

              {/* Recipe Display */}
              {activeRecipe && !isGenerating && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      id="btn-return-form"
                      onClick={() => setActiveRecipe(null)}
                      className="text-xs text-[#a98467] dark:text-[#d4a373] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Preparar otro café
                    </button>
                    <span className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e] font-medium">Receta recalculada con IA</span>
                  </div>

                  <RecipeDetails
                    recipe={activeRecipe}
                    onStartBrew={() => setActiveTab("cronometro")}
                    onSaveNotes={handleSaveRecipeNotes}
                    isDarkMode={isDarkMode}
                    onSaveToHistory={handleSaveRecipeToHistoryDirectly}
                    isSavedInHistory={isCurrentRecipeSavedInHistory}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "cronometro" && (
            <div className="space-y-4">
              {activeRecipe ? (
                <InteractiveTimer
                  recipe={activeRecipe}
                  onBrewCompleted={handleBrewCompleted}
                  onCancel={() => setActiveTab("preparar")}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="text-center py-20 px-6 space-y-4 border border-dashed dark:border-[#2a2a2a] border-[#e6dfd5] rounded-2xl bg-white/50 dark:bg-[#1c1c1c]/50">
                  <Clock className="w-10 h-10 mx-auto text-[#8a7e72] dark:text-[#a8a29e]" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#3e362e] dark:text-[#e6e2df]">Cronómetro inactivo</h3>
                    <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e] max-w-xs mx-auto leading-relaxed">
                      Primero debes ingresar los datos de tu café y generar una receta ideal en la pestaña <b>Preparar</b> para iniciar el cronómetro interactivo.
                    </p>
                  </div>
                  <button
                    id="btn-go-prepare"
                    onClick={() => setActiveTab("preparar")}
                    className="py-2.5 px-4 rounded-xl bg-[#a98467] text-white dark:bg-[#d4a373] dark:text-[#121212] font-semibold text-xs active:scale-95 transition-all cursor-pointer hover:bg-[#7f5539] dark:hover:bg-[#c69262]"
                  >
                    Ir a Preparar Café
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "historial" && (
            <div className="space-y-4">
              <div className="pb-1">
                <h2 className="text-base font-bold font-serif italic text-[#a98467] dark:text-[#d4a373] leading-tight">Bitácora de Cata</h2>
                <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e] mt-0.5 leading-normal">
                  Historial de tus preparaciones anteriores. Compara resultados para perfeccionar tu molienda y temperatura.
                </p>
              </div>

              <HistoryAndNotes
                history={history}
                onDeleteEntry={handleDeleteHistoryEntry}
                onUpdateEntry={handleUpdateHistoryEntry}
                isDarkMode={isDarkMode}
                onOptimizeRecipe={handleOptimizeRecipe}
                isOptimizing={isGenerating}
              />
            </div>
          )}
        </main>

        {/* Bottom Tab Bar Navigation */}
        <nav className="fixed bottom-0 inset-x-0 bg-[#faf8f5]/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-t border-[#e6dfd5] dark:border-[#2a2a2a] z-40 py-3 shadow-lg">
          <div className="w-full max-w-md mx-auto px-6 flex justify-between items-center">
            {/* Tab 1: Preparar */}
            <button
              id="tab-preparar"
              onClick={() => setActiveTab("preparar")}
              className={`flex flex-col items-center gap-1.5 text-center group cursor-pointer transition-all ${
                activeTab === "preparar"
                  ? "text-[#a98467] dark:text-[#d4a373]"
                  : "text-[#8a7e72]/60 dark:text-[#e6e2df]/40 hover:text-[#8a7e72] dark:hover:text-[#e6e2df]/80"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Preparar</span>
            </button>

            {/* Tab 2: Cronómetro */}
            <button
              id="tab-cronometro"
              onClick={() => setActiveTab("cronometro")}
              className={`flex flex-col items-center gap-1.5 text-center group cursor-pointer transition-all ${
                activeTab === "cronometro"
                  ? "text-[#a98467] dark:text-[#d4a373]"
                  : "text-[#8a7e72]/60 dark:text-[#e6e2df]/40 hover:text-[#8a7e72] dark:hover:text-[#e6e2df]/80"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Cronómetro</span>
            </button>

            {/* Tab 3: Bitácora */}
            <button
              id="tab-historial"
              onClick={() => setActiveTab("historial")}
              className={`flex flex-col items-center gap-1.5 text-center group cursor-pointer transition-all ${
                activeTab === "historial"
                  ? "text-[#a98467] dark:text-[#d4a373]"
                  : "text-[#8a7e72]/60 dark:text-[#e6e2df]/40 hover:text-[#8a7e72] dark:hover:text-[#e6e2df]/80"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Bitácora</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  );
}
