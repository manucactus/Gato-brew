import { useState, useEffect } from "react";
import { Coffee, Sun, Moon, Sparkles, BookOpen, Clock, AlertCircle, Settings, Key, Check, Palette } from "lucide-react";
import NewRecipeForm from "./components/NewRecipeForm";
import RecipeDetails from "./components/RecipeDetails";
import InteractiveTimer from "./components/InteractiveTimer";
import HistoryAndNotes from "./components/HistoryAndNotes";
import { RecetaCafe, RegistroCata } from "./types";
import logoUrl from "./assets/images/gato_brew_sticker_logo_1784336418292.jpg";
import { generateLocalFallbackRecipe } from "./utils/localRecipeGenerator";

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

  // Request Recipe from Backend
  const handleGenerateRecipe = async (params: { origen: string; variedad?: string; proceso: string; metodo: string; molino: string; observaciones?: string }) => {
    setIsGenerating(true);
    setError(null);
    setActiveRecipe(null);

    try {
      let data;
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey.trim()) {
          headers["x-gemini-api-key"] = customApiKey.trim();
        }

        const response = await fetch("/api/generate-recipe", {
          method: "POST",
          headers,
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Ocurrió un error al calcular tu receta ideal.");
        }

        data = await response.json();
      } catch (fetchErr: any) {
        console.warn("Backend API not reachable. Generating recipe client-side:", fetchErr);
        data = generateLocalFallbackRecipe(
          params.origen,
          params.proceso,
          params.metodo,
          params.molino,
          params.observaciones,
          undefined,
          undefined,
          params.variedad
        );
      }
      
      const newRecipe: RecetaCafe = {
        ...data,
        id: `recipe-${Date.now()}`,
        origen: params.origen,
        variedad: params.variedad || data.variedad,
        proceso: params.proceso,
        molino: params.molino,
        fecha: new Date().toLocaleDateString("es-ES"),
        notasPersonales: data.isFallback ? "Receta calculada localmente (ideal para despliegues estáticos)." : ""
      };

      setActiveRecipe(newRecipe);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al calcular la receta. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calibrate and optimize a past recipe from history
  const handleOptimizeRecipe = async (originalEntry: RegistroCata, feedback: string) => {
    setIsGenerating(true);
    setError(null);
    setActiveRecipe(null);
    setActiveTab("preparar"); // Switch to preparing tab to show loading state!

    try {
      let data;
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey.trim()) {
          headers["x-gemini-api-key"] = customApiKey.trim();
        }

        const response = await fetch("/api/generate-recipe", {
          method: "POST",
          headers,
          body: JSON.stringify({
            origen: originalEntry.origenCafe,
            proceso: originalEntry.procesoCafe || "Lavado",
            metodo: originalEntry.metodoCafe,
            molino: originalEntry.moliendaCafe,
            feedback: feedback
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Ocurrió un error al calibrar tu receta.");
        }

        data = await response.json();
      } catch (fetchErr: any) {
        console.warn("Backend API not reachable. Calibrating recipe client-side:", fetchErr);
        data = generateLocalFallbackRecipe(
          originalEntry.origenCafe,
          originalEntry.procesoCafe || "Lavado",
          originalEntry.metodoCafe,
          originalEntry.moliendaCafe,
          undefined,
          undefined,
          feedback,
          originalEntry.variedadCafe
        );
      }
      
      const newRecipe: RecetaCafe = {
        ...data,
        id: `recipe-${Date.now()}`,
        originalCataId: originalEntry.id,
        origen: originalEntry.origenCafe,
        proceso: originalEntry.procesoCafe || "Lavado",
        molino: originalEntry.moliendaCafe,
        fecha: new Date().toLocaleDateString("es-ES"),
        notasPersonales: data.isFallback 
          ? `Receta calibrada localmente. Ajuste sugerido para tu preparación del ${originalEntry.fecha}: "${feedback}"`
          : `Receta calibrada por IA. Ajuste sugerido basado en tu preparación del ${originalEntry.fecha}: "${feedback}"`
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

              {/* Sub-tab 1: API Key */}
              {settingsTab === "api" && (
                <div className="space-y-3">
                  <div className="text-xs space-y-2 text-[#8a7e72] dark:text-[#a8a29e]">
                    <p className="leading-relaxed text-[11px]">
                      Para evitar límites de cuota generales y que la IA procese con total detalle tus recetas a medida, puedes usar tu propia API Key de Gemini:
                    </p>
                    
                    {/* Instructions */}
                    <div className="p-3 rounded-xl bg-[#faf6f0] dark:bg-[#121212] border border-[#e6dfd5] dark:border-[#2a2a2a]/60 text-[11px] leading-relaxed space-y-1.5">
                      <p className="font-bold text-[#7f5539] dark:text-[#d4a373]">¿Cómo conseguirla gratis?</p>
                      <ol className="list-decimal pl-4 space-y-0.5 text-[#3e362e] dark:text-[#c7c1bb] text-[11px]">
                        <li>Entra en <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-[#a98467] dark:text-[#d4a373] underline font-medium">Google AI Studio</a>.</li>
                        <li>Haz clic en <b>"Get API Key"</b>.</li>
                        <li>Crea una clave de API nueva y cópiala.</li>
                        <li>Pégala aquí abajo para guardarla de forma segura.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider">
                      Tu API Key de Gemini
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Escribe o pega tu clave de API (AIzaSy...)"
                        value={customApiKey}
                        onChange={(e) => handleSaveApiKey(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border font-mono text-xs outline-none transition-all duration-200 ${
                          isDarkMode
                            ? "bg-[#121212] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/30 focus:border-[#d4a373]"
                            : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/30 focus:border-[#a98467]"
                        }`}
                      />
                      {customApiKey.trim() ? (
                        <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      ) : (
                        <Key className="w-3.5 h-3.5 text-[#8a7e72]/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 pt-1 border-t dark:border-[#2a2a2a]/60 border-[#e6dfd5]/60">
                    <span className={`w-2.5 h-2.5 rounded-full ${customApiKey.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-semibold">
                      {customApiKey.trim() ? (
                        <span className="text-emerald-600 dark:text-emerald-400">API Key propia activa (Sin límites de cuota)</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-500">API general por defecto activa (Cuota compartida)</span>
                      )}
                    </span>
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
