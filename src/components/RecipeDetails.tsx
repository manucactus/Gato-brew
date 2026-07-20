import React, { useState, useEffect } from "react";
import { Play, Clipboard, Heart, Share2, BookOpen, PenTool, CheckCircle, Info, Sparkles, ChevronDown, ChevronUp, Award, Coffee } from "lucide-react";
import { RecetaCafe } from "../types";

interface VariedadInfo {
  nombre: string;
  descripcion: string;
  notasSabor: string;
  origen: string;
  intensidadAcidez: string;
  perfilTaza: string;
}

const BIBLIOTECA_VARIEDADES: VariedadInfo[] = [
  {
    nombre: "Geisha",
    descripcion: "Una de las variedades más exclusivas y codiciadas del mundo. Se destaca por un perfil extraordinariamente aromático, floral y delicado que se asemeja al té.",
    notasSabor: "Jazmín, bergamota, durazno, flor de naranjo, té de limón.",
    origen: "Etiopía (popularizado en Panamá)",
    intensidadAcidez: "Alta (Brillante y Cítrica)",
    perfilTaza: "Cuerpo ligero, floral de elegancia suprema y final dulce."
  },
  {
    nombre: "Bourbon",
    descripcion: "Variedad clásica fundamental en el café de especialidad. Con un rendimiento bajo pero una taza dulce y compleja, es el punto de referencia para el dulzor en cata.",
    notasSabor: "Caramelo, chocolate con leche, cereza, frutos secos tostados.",
    origen: "Isla de la Reunión (antes llamada Isla Bourbon)",
    intensidadAcidez: "Media-Alta (Equilibrada)",
    perfilTaza: "Cuerpo medio-alto, dulzor acaramelado muy persistente."
  },
  {
    nombre: "Caturra",
    descripcion: "Mutación natural enana de la variedad Bourbon encontrada en Brasil. Muy popular en Latinoamérica debido a su alta productividad y perfil limpio, balanceado y cítrico.",
    notasSabor: "Limón, ciruela roja, manzana verde, chocolate oscuro.",
    origen: "Brasil (común en Colombia y Centroamérica)",
    intensidadAcidez: "Media (Limpia)",
    perfilTaza: "Cuerpo medio, acidez brillante y taza muy redonda."
  },
  {
    nombre: "Typica",
    descripcion: "El linaje genético original de los cafés Arabica cultivados globalmente. Ofrece una taza limpia, dulce e impecablemente equilibrada, de calidad excepcional.",
    notasSabor: "Flores blancas, caña de azúcar, limón amarillo, cacao sutil.",
    origen: "Etiopía (luego Yemen, India y Java)",
    intensidadAcidez: "Media-Alta (Elegante)",
    perfilTaza: "Cuerpo medio-ligero, dulzor cristalino y balance perfecto."
  },
  {
    nombre: "Pacamara",
    descripcion: "Un híbrido único desarrollado en El Salvador (cruce de Pacas y Maragogype). Produce granos gigantescos con un perfil sensorial salvaje, herbal y frutal.",
    notasSabor: "Mango, maracuyá, lúpulo, eucalipto, chocolate amargo.",
    origen: "El Salvador",
    intensidadAcidez: "Alta (Compleja y Jugosa)",
    perfilTaza: "Cuerpo muy pesado, notas herbales y exóticas ácidas."
  },
  {
    nombre: "Castillo",
    descripcion: "Variedad altamente resistente desarrollada en Colombia. Bien cultivada y procesada en altitudes elevadas, revela un cuerpo denso y un perfil chocolatoso robusto.",
    notasSabor: "Cacao tostado, frutos rojos, panela, notas de nueces.",
    origen: "Colombia",
    intensidadAcidez: "Media-Baja (Suave)",
    perfilTaza: "Cuerpo denso, dulzor terroso y perfil chocolatoso clásico."
  },
  {
    nombre: "Maragogype",
    descripcion: "Conocido popularmente como 'grano elefante' debido a su tamaño descomunal. Es una mutación natural de Typica con un perfil suave, cremoso y sutilmente amaderado.",
    notasSabor: "Avellana, azúcar morena, manzana horneada, notas de madera fina.",
    origen: "Brasil (común en Centroamérica)",
    intensidadAcidez: "Baja-Media (Suave)",
    perfilTaza: "Cuerpo cremoso, notas de frutos secos y taza aterciopelada."
  },
  {
    nombre: "Pink Bourbon",
    descripcion: "Hibridación natural rara entre Bourbon Rojo y Amarillo. Destaca por el color rosa de sus cerezas maduras y un perfil extremadamente dulce, sedoso y de notas florales.",
    notasSabor: "Pomelo rosado, nectarina, miel de maple, cereza blanca.",
    origen: "Colombia (principalmente Huila)",
    intensidadAcidez: "Media-Alta (Compleja)",
    perfilTaza: "Cuerpo sedoso, dulzor masivo y acidez afrutada jugosa."
  },
  {
    nombre: "SL28",
    descripcion: "Creada por los laboratorios Scott en Kenia durante la década de 1930. Famosa por producir tazas increíblemente jugosas, complejas y con acidez que recuerda al vino.",
    notasSabor: "Grosella negra, mora silvestre, uva tinta, arándano.",
    origen: "Kenia",
    intensidadAcidez: "Muy Alta (Intensa y Vinosa)",
    perfilTaza: "Cuerpo jugoso, acidez fosfórica brillante y notas de frutos del bosque."
  },
  {
    nombre: "Sidra",
    descripcion: "Una variedad híbrida de élite (cruce de Bourbon y Typica, con rasgos de Geisha). Ofrece una taza sumamente compleja, floral, sedosa y con un dulzor almibarado.",
    notasSabor: "Miel, jazmín, manzana roja, mandarina, uva verde.",
    origen: "Ecuador",
    intensidadAcidez: "Alta (Vibrante y Cítrica)",
    perfilTaza: "Cuerpo almibarado, dulzor intenso y gran persistencia aromática."
  }
];

interface RecipeDetailsProps {
  recipe: RecetaCafe;
  onStartBrew: () => void;
  onSaveNotes: (notes: string) => void;
  isDarkMode: boolean;
  onSaveToHistory?: () => void;
  isSavedInHistory?: boolean;
}

export default function RecipeDetails({
  recipe,
  onStartBrew,
  onSaveNotes,
  isDarkMode,
  onSaveToHistory,
  isSavedInHistory = false
}: RecipeDetailsProps) {
  const [personalNotes, setPersonalNotes] = useState(recipe.notasPersonales || "");
  const [isCopied, setIsCopied] = useState(false);
  const [showVarietyLibrary, setShowVarietyLibrary] = useState(false);
  const [notesPlaceholder, setNotesPlaceholder] = useState("Escribe ajustes de temperatura, molienda o detalles específicos que quieras recordar para la próxima vez...");

  // Sync state if recipe changes
  useEffect(() => {
    setPersonalNotes(recipe.notasPersonales || "");
    setNotesPlaceholder("Escribe ajustes de temperatura, molienda o detalles específicos que quieras recordar para la próxima vez...");
  }, [recipe]);

  const handleNotesFocus = () => {
    setNotesPlaceholder("");
  };

  const handleNotesBlur = () => {
    if (!personalNotes.trim()) {
      setNotesPlaceholder("Escribe ajustes de temperatura, molienda o detalles específicos que quieras recordar para la próxima vez...");
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPersonalNotes(val);
    onSaveNotes(val);
  };

  const copyToClipboard = () => {
    const text = `
☕ RECETA DE CAFÉ DE ESPECIALIDAD ☕
Origen: ${recipe.origen}${recipe.variedad ? ` | Variedad: ${recipe.variedad}` : ""} | Proceso: ${recipe.proceso}
Método: ${recipe.metodo} | Molino: ${recipe.molino}

PARÁMETROS:
- Método: ${recipe.metodo}
- Temperatura: ${recipe.temperatura}
- Molienda: ${recipe.molienda}
- Ratio: ${recipe.ratio} (${recipe.cafeGramos}g café / ${recipe.aguaGramos}g agua)
- Tiempo de extracción: ${recipe.tiempoExtraccion}

PERFIL DE SABOR:
${recipe.saborPerfil}

INSTRUCCIONES:
${recipe.instrucciones.map((inst, idx) => `${idx + 1}. ${inst}`).join("\n")}

CONSEJO BARISTA:
${recipe.notasBarista}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans py-1">
      {/* Cabecera de la receta */}
      <div className="flex justify-between items-start border-b pb-3 dark:border-[#2a2a2a] border-[#e6dfd5]">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#a98467]/10 text-[#a98467] border border-[#a98467]/20 dark:bg-[#d4a373]/10 dark:text-[#d4a373] dark:border-[#d4a373]/20">
            {recipe.proceso}
          </span>
          <h2 className="text-lg font-bold font-serif italic text-[#7f5539] dark:text-[#d4a373] mt-2">
            {recipe.origen} • {recipe.metodo}
          </h2>
          <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e] mt-1 font-medium">
            Molino: {recipe.molino}
          </p>
          {recipe.variedad && (
            <div className="mt-2 flex flex-col gap-0.5 px-3 py-1.5 rounded-xl border border-[#e6dfd5] dark:border-[#2a2a2a] bg-[#faf6f0] dark:bg-[#1c1c1c] shadow-sm w-fit">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">Variedad</span>
              <span className="text-xs font-semibold text-[#3e362e] dark:text-[#e6e2df]">{recipe.variedad}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            id="btn-copy-recipe"
            onClick={copyToClipboard}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isCopied
                ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400"
                : "bg-transparent border-[#e6dfd5] text-[#8a7e72] hover:bg-[#faf6f0] dark:border-[#2a2a2a] text-[#a8a29e] dark:hover:bg-[#1c1c1c]"
            }`}
            title="Copiar receta"
          >
            {isCopied ? <CheckCircle className="w-4.5 h-4.5" /> : <Clipboard className="w-4.5 h-4.5" />}
          </button>
          {onSaveToHistory && (
            <button
              id="btn-favorite-recipe"
              onClick={onSaveToHistory}
              disabled={isSavedInHistory}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSavedInHistory
                  ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72]/60 hover:text-rose-500 hover:bg-[#faf6f0] dark:border-[#2a2a2a] dark:text-[#a8a29e]/60 dark:hover:bg-[#1c1c1c]"
              }`}
              title={isSavedInHistory ? "Guardado en bitácora" : "Guardar en bitácora"}
            >
              <Heart className={`w-4.5 h-4.5 ${isSavedInHistory ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Fallback local engine notice */}
      {recipe.isFallback && (
        <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-[#d4a373]/5 border border-amber-500/20 dark:border-[#d4a373]/20 flex items-start gap-2.5 text-[#8a7e72] dark:text-[#a8a29e]">
          <Sparkles className="w-4.5 h-4.5 text-[#a98467] dark:text-[#d4a373] shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-[#7f5539] dark:text-[#d4a373]">Fórmula Offline Activa: </span>
            Calculada con éxito por nuestro motor barista local de precisión. Disfruta de parámetros optimizados y cálculo exacto de clics.
          </div>
        </div>
      )}

      {/* Tabla de Parámetros Generales */}
      <div className="overflow-hidden rounded-xl border border-[#e6dfd5] dark:border-[#2a2a2a] shadow-sm bg-white dark:bg-[#1c1c1c]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#faf6f0] dark:bg-[#262626] border-b border-[#e6dfd5] dark:border-[#2a2a2a]">
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373] w-1/3 text-[10px]">Parámetro</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373] text-[10px]">Valor Recomendado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6dfd5]/60 dark:divide-[#2a2a2a]/60">
            <tr>
              <td className="px-3.5 py-2.5 font-medium text-[#8a7e72] dark:text-[#a8a29e]">Método</td>
              <td className="px-3.5 py-2.5 font-semibold text-[#3e362e] dark:text-[#e6e2df]">{recipe.metodo}</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 font-medium text-[#8a7e72] dark:text-[#a8a29e]">Temperatura</td>
              <td className="px-3.5 py-2.5 font-semibold text-[#3e362e] dark:text-[#e6e2df]">{Math.round(recipe.temperaturaNum)}°C</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 font-medium text-[#8a7e72] dark:text-[#a8a29e]">Molienda</td>
              <td className="px-3.5 py-2.5 font-semibold text-[#a98467] dark:text-[#d4a373]">{recipe.molienda}</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 font-medium text-[#8a7e72] dark:text-[#a8a29e]">Ratio ideal</td>
              <td className="px-3.5 py-2.5 font-semibold text-[#3e362e] dark:text-[#e6e2df]">
                {recipe.ratio} <span className="font-normal text-[#8a7e72] dark:text-[#a8a29e]/70">({recipe.cafeGramos}g café / {recipe.aguaGramos}g agua)</span>
              </td>
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 font-medium text-[#8a7e72] dark:text-[#a8a29e]">Tiempo Extracción</td>
              <td className="px-3.5 py-2.5 font-semibold text-[#3e362e] dark:text-[#e6e2df] font-mono">{recipe.tiempoExtraccion}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Perfil de Sabor Destacado */}
      <div className="p-4 rounded-xl bg-[#a98467]/5 dark:bg-[#d4a373]/5 border border-[#a98467]/20 dark:border-[#d4a373]/20 flex gap-2.5">
        <Info className="w-4.5 h-4.5 text-[#a98467] dark:text-[#d4a373] shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">Perfil de Sabor Destacado</span>
          <p className="text-xs text-[#3e362e] dark:text-[#c7c1bb] font-medium leading-normal mt-0.5">
            {recipe.saborPerfil}
          </p>
        </div>
      </div>

      {/* Biblioteca de Variedades Expandible */}
      <div className="space-y-2">
        <button
          type="button"
          id="btn-toggle-variety-library"
          onClick={() => setShowVarietyLibrary(!showVarietyLibrary)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
            showVarietyLibrary 
              ? "bg-[#a98467]/10 border-[#a98467] text-[#7f5539] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373]"
              : "bg-white dark:bg-[#1c1c1c] border-[#e6dfd5] dark:border-[#2a2a2a] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]/80 text-[#8a7e72] dark:text-[#a8a29e]"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Coffee className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
            <span>Biblioteca de Variedades</span>
          </div>
          <div className="flex items-center gap-2">
            {recipe.variedad && (
              <span className="text-[9px] bg-[#a98467]/15 text-[#a98467] dark:bg-[#d4a373]/15 dark:text-[#d4a373] px-2 py-0.5 rounded-full font-bold">
                Cata de {recipe.variedad}
              </span>
            )}
            {showVarietyLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showVarietyLibrary && (
          <div className="p-4 rounded-xl border border-[#e6dfd5] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] space-y-3.5 animate-fade-in shadow-sm max-h-96 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-widest font-bold border-b pb-1.5 dark:border-[#2a2a2a] border-[#e6dfd5]">
              Guía de Variedades de Especialidad
            </div>

            {/* If there is a direct match, show it first as highlighted */}
            {recipe.variedad && BIBLIOTECA_VARIEDADES.some(v => recipe.variedad!.toLowerCase().trim().includes(v.nombre.toLowerCase())) && (
              <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border-2 border-amber-500/30 dark:border-amber-400/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Award className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span>Variedad de tu Café Detectada</span>
                  </div>
                  <span className="text-[8px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Excelente Elección
                  </span>
                </div>
                {BIBLIOTECA_VARIEDADES.filter(v => recipe.variedad!.toLowerCase().trim().includes(v.nombre.toLowerCase())).map(v => (
                  <div key={v.nombre} className="space-y-1.5 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-bold text-[#7f5539] dark:text-amber-400 text-sm">{v.nombre}</span>
                      <span className="text-[10px] font-mono text-[#8a7e72] dark:text-[#a8a29e] italic">Origen: {v.origen}</span>
                    </div>
                    <p className="text-[#3e362e]/90 dark:text-[#c7c1bb] leading-relaxed italic">
                      &ldquo;{v.descripcion}&rdquo;
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/10 dark:border-amber-400/10 text-[10.5px]">
                      <div>
                        <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-semibold">Notas de Sabor:</span>
                        <span className="font-medium text-[#3e362e] dark:text-[#e6e2df]">{v.notasSabor}</span>
                      </div>
                      <div>
                        <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-semibold">Acidez Típica:</span>
                        <span className="font-medium text-[#3e362e] dark:text-[#e6e2df]">{v.intensidadAcidez}</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-semibold">Perfil en Taza:</span>
                      <span className="font-medium text-[#3e362e] dark:text-[#e6e2df]">{v.perfilTaza}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List of other standard varieties */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] block">
                Explorar Otras Variedades
              </span>
              <div className="divide-y divide-[#e6dfd5]/60 dark:divide-[#2a2a2a]/60">
                {BIBLIOTECA_VARIEDADES.map((v) => {
                  const isCurrent = recipe.variedad && recipe.variedad.toLowerCase().trim().includes(v.nombre.toLowerCase());
                  return (
                    <div key={v.nombre} className={`py-3.5 space-y-2 transition-all ${isCurrent ? "opacity-40" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-[#3e362e] dark:text-[#e6e2df] text-sm">
                          {v.nombre}
                        </span>
                        <span className="text-[10px] font-mono text-[#8a7e72] dark:text-[#a8a29e]">
                          {v.origen}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a7e72] dark:text-[#a8a29e] leading-relaxed">
                        {v.descripcion}
                      </p>
                      <div className="text-[10.5px] grid grid-cols-1 gap-1.5 bg-[#faf6f0]/50 dark:bg-[#121212]/30 p-2 rounded-lg border border-[#e6dfd5]/40 dark:border-[#2a2a2a]/40">
                        <div>
                          <span className="font-bold text-[#a98467] dark:text-[#d4a373]">Sensorial:</span>{" "}
                          <span className="text-[#3e362e] dark:text-[#c7c1bb]">{v.notasSabor}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#a98467] dark:text-[#d4a373]">Acidez:</span>{" "}
                          <span className="text-[#3e362e] dark:text-[#c7c1bb]">{v.intensidadAcidez}</span>
                        </div>
                        <div className="mt-0.5 border-t border-[#e6dfd5]/30 dark:border-[#2a2a2a]/30 pt-1">
                          <span className="font-bold text-[#a98467] dark:text-[#d4a373]">Taza:</span>{" "}
                          <span className="text-[#3e362e]/80 dark:text-[#c7c1bb]/80 italic">{v.perfilTaza}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Flotante/Principal: Iniciar Preparación */}
      <button
        id="btn-launch-brew"
        onClick={onStartBrew}
        className="w-full py-3.5 px-4 rounded-xl bg-[#a98467] hover:bg-[#7f5539] text-white dark:bg-[#d4a373] dark:text-[#121212] dark:hover:bg-[#c69262] font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Iniciar Preparación con Cronómetro</span>
      </button>

      {/* Instrucciones */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Instrucciones de Preparación
        </h3>
        <ol className="space-y-2">
          {recipe.instrucciones.map((inst, index) => (
            <li
              key={index}
              className={`text-xs leading-relaxed p-3 rounded-xl border flex gap-3 ${
                isDarkMode
                  ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#c7c1bb]"
                  : "bg-[#faf6f0] border-[#e6dfd5] text-[#3e362e]"
              }`}
            >
              <span className="font-mono font-bold text-[#a98467] dark:text-[#d4a373]">{String(index + 1).padStart(2, '0')}.</span>
              <p>{inst}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Nota del Barista */}
      <div className="text-xs border-t border-dashed dark:border-[#2a2a2a] border-[#e6dfd5] pt-3.5">
        <span className="font-bold text-[#a98467] dark:text-[#d4a373]">Consejo Barista Especial: </span>
        <span className="text-[#3e362e] dark:text-[#a8a29e] italic leading-relaxed">{recipe.notasBarista}</span>
      </div>

      {/* Notas Personales */}
      <div className="space-y-2 border-t dark:border-[#2a2a2a] border-[#e6dfd5] pt-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5" />
          Tus Notas Personales
        </h3>
        <textarea
          id="textarea-personal-notes"
          value={personalNotes}
          onChange={handleNotesChange}
          onFocus={handleNotesFocus}
          onBlur={handleNotesBlur}
          placeholder={notesPlaceholder}
          rows={3}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all duration-150 leading-relaxed resize-none ${
            isDarkMode
              ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
              : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467] focus:ring-1 focus:ring-[#e6dfd5]"
          }`}
        />
        <div className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e] flex justify-between">
          <span>Tus notas se auto-guardan localmente.</span>
          <span>{personalNotes.length} caracteres</span>
        </div>
      </div>
    </div>
  );
}
