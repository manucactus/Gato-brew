import React, { useState, useEffect } from "react";
import { Coffee, Star, Trash2, Calendar, Scale, RefreshCw, Layers, Compass, ArrowRight, BarChart2, Check, Sparkles, Edit2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { RegistroCata, RecetaCafe } from "../types";

interface HistoryAndNotesProps {
  history: RegistroCata[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry?: (updatedEntry: RegistroCata) => void;
  isDarkMode: boolean;
  onOptimizeRecipe?: (originalEntry: RegistroCata, feedback: string) => void;
  isOptimizing?: boolean;
}

export default function HistoryAndNotes({ 
  history, 
  onDeleteEntry, 
  onUpdateEntry,
  isDarkMode, 
  onOptimizeRecipe, 
  isOptimizing 
}: HistoryAndNotesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("Todos");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Title editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMethod]);

  const getItemTitle = (item: RegistroCata) => {
    if (item.titulo && item.titulo.trim()) {
      return item.titulo;
    }
    return `${item.origenCafe}${item.variedadCafe ? `, ${item.variedadCafe}` : ""}${item.procesoCafe ? ` (${item.procesoCafe})` : ""}`;
  };

  useEffect(() => {
    if (history.length > 0 && (!selectedLogId || !history.some(h => h.id === selectedLogId))) {
      setSelectedLogId(history[0].id);
    }
  }, [history, selectedLogId]);

  // List of unique methods present in history for quick filtering
  const availableMethods = ["Todos", ...Array.from(new Set(history.map(item => item.metodoCafe)))];

  // Filtering logic
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.origenCafe.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.saborNotas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === "Todos" || item.metodoCafe === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectForCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(item => item !== id));
    } else {
      if (compareIds.length < 2) {
        setCompareIds([...compareIds, id]);
      } else {
        // Replace the oldest one
        setCompareIds([compareIds[1], id]);
      }
    }
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    setIsCompareMode(false);
  };

  const renderStarRating = (rating: number, size = 3) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 3 ? "w-3 h-3" : "w-4 h-4"} ${
              rating >= star
                ? "fill-[#d4a373] text-[#d4a373] dark:fill-[#d4a373]"
                : "text-[#e6dfd5] dark:text-[#2a2a2a]"
            }`}
          />
        ))}
      </div>
    );
  };

  // Sensory Polygon or SVG Bar display for taste dimensions
  const renderSensoryBars = (item: RegistroCata) => {
    const attrs = [
      { label: "Acidez", val: item.acidez, color: "bg-[#7f5539]" },
      { label: "Cuerpo", val: item.cuerpo, color: "bg-[#a98467]" },
      { label: "Dulzor", val: item.dulzor, color: "bg-[#d4a373]" },
      { label: "Amargor", val: item.amargor, color: "bg-[#b5a494]" },
      { label: "Balance", val: item.balance, color: "bg-[#c69262]" }
    ];

    return (
      <div className="space-y-1.5 pt-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e] block">Perfil de taza:</span>
        <div className="grid grid-cols-5 gap-1 pt-0.5">
          {attrs.map((attr) => (
            <div key={attr.label} className="text-center">
              <span className="text-[8px] font-bold text-[#8a7e72] dark:text-[#a8a29e] block leading-none">{attr.label}</span>
              <div className="w-full h-10 bg-[#faf6f0] dark:bg-[#1c1c1c] border border-[#e6dfd5]/50 dark:border-[#2a2a2a]/50 rounded-md relative overflow-hidden mt-1 flex flex-col justify-end">
                <div
                  style={{ height: `${(attr.val / 5) * 100}%` }}
                  className={`w-full ${attr.color} rounded-t-sm transition-all duration-300`}
                />
              </div>
              <span className="text-[10px] font-bold text-[#3e362e] dark:text-[#e6e2df] mt-1 block">{attr.val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Compare Panel Component
  if (isCompareMode && compareIds.length === 2) {
    const brewA = history.find(b => b.id === compareIds[0]);
    const brewB = history.find(b => b.id === compareIds[1]);

    if (brewA && brewB) {
      return (
        <div className="space-y-4 px-1 py-1 font-sans">
          <div className="flex justify-between items-center pb-2 border-b dark:border-[#2a2a2a] border-[#e6dfd5]">
            <h2 className="text-sm font-bold font-serif text-[#7f5539] dark:text-[#d4a373] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#a98467] dark:text-[#d4a373]" />
              Comparativa de Tazas
            </h2>
            <button
              id="btn-close-compare"
              onClick={handleClearCompare}
              className={`text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                isDarkMode
                  ? "border-[#2a2a2a] text-[#a8a29e] hover:bg-[#1c1c1c]"
                  : "border-[#e6dfd5] text-[#8a7e72] hover:bg-[#faf6f0]"
              }`}
            >
              Volver
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Brew A Card */}
            <div className={`p-3 rounded-xl border space-y-2 bg-white dark:bg-[#1c1c1c] border-[#e6dfd5] dark:border-[#2a2a2a]`}>
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#8a7e72] dark:text-[#a8a29e] block font-mono">{brewA.fecha}</span>
                <span className="font-bold text-[#3e362e] dark:text-[#e6e2df] block truncate" title={getItemTitle(brewA)}>
                  {getItemTitle(brewA)}
                </span>
                <span className="text-[10px] text-[#a98467] dark:text-[#d4a373] font-semibold">{brewA.metodoCafe}</span>
              </div>
              {renderStarRating(brewA.puntuacion, 3)}
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2 space-y-1 text-[10px]">
                <p><span className="text-[#8a7e72]">Molienda:</span> <span className="font-semibold dark:text-[#e6e2df] text-[#3e362e]">{brewA.moliendaCafe}</span></p>
                <p className="line-clamp-2"><span className="text-[#8a7e72]">Notas:</span> {brewA.saborNotas || "Sin notas"}</p>
              </div>
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2">
                {renderSensoryBars(brewA)}
              </div>
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2 text-[9px] text-[#8a7e72] dark:text-[#a8a29e]">
                <p className="font-semibold text-[#7f5539] dark:text-[#d4a373]">Ajustes propuestos:</p>
                <p className="italic">{brewA.ajustesFuturos || "Ninguno"}</p>
              </div>
            </div>

            {/* Brew B Card */}
            <div className={`p-3 rounded-xl border space-y-2 bg-white dark:bg-[#1c1c1c] border-[#e6dfd5] dark:border-[#2a2a2a]`}>
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#8a7e72] dark:text-[#a8a29e] block font-mono">{brewB.fecha}</span>
                <span className="font-bold text-[#3e362e] dark:text-[#e6e2df] block truncate" title={getItemTitle(brewB)}>
                  {getItemTitle(brewB)}
                </span>
                <span className="text-[10px] text-[#a98467] dark:text-[#d4a373] font-semibold">{brewB.metodoCafe}</span>
              </div>
              {renderStarRating(brewB.puntuacion, 3)}
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2 space-y-1 text-[10px]">
                <p><span className="text-[#8a7e72]">Molienda:</span> <span className="font-semibold dark:text-[#e6e2df] text-[#3e362e]">{brewB.moliendaCafe}</span></p>
                <p className="line-clamp-2"><span className="text-[#8a7e72]">Notas:</span> {brewB.saborNotas || "Sin notas"}</p>
              </div>
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2">
                {renderSensoryBars(brewB)}
              </div>
              <div className="border-t border-[#e6dfd5]/60 dark:border-[#2a2a2a]/60 pt-2 text-[9px] text-[#8a7e72] dark:text-[#a8a29e]">
                <p className="font-semibold text-[#7f5539] dark:text-[#d4a373]">Ajustes propuestos:</p>
                <p className="italic">{brewB.ajustesFuturos || "Ninguno"}</p>
              </div>
            </div>
          </div>

          {/* Analysis / Insight Banner */}
          <div className="p-4 rounded-xl bg-[#a98467]/5 dark:bg-[#d4a373]/5 border border-[#a98467]/20 dark:border-[#d4a373]/20 text-xs text-[#3e362e] dark:text-[#c7c1bb] leading-relaxed">
            <span className="font-bold text-[#a98467] dark:text-[#d4a373] flex items-center gap-1 mb-1">
              <BarChart2 className="w-4 h-4" />
              ¿Qué diferencia hay en la taza?
            </span>
            <p>
              Al comparar tus preparaciones, puedes rastrear cómo tus cambios en la molienda (<b>{brewA.moliendaCafe}</b> vs <b>{brewB.moliendaCafe}</b>) y tus notas afectaron directamente la puntuación final de <b>{brewA.puntuacion} ⭐</b> a <b>{brewB.puntuacion} ⭐</b>. Ajustando la técnica progresivamente lograrás extraer siempre la taza ideal para cada café de especialidad.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4 px-1 py-1 font-sans">
      {/* Filters and Action Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            id="input-search-history"
            type="text"
            placeholder="Buscar por origen o nota (ej: Colombia)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-grow px-3.5 py-2 rounded-xl border text-xs outline-none transition-all duration-150 ${
              isDarkMode
                ? "bg-[#1c1c1c] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467]"
            }`}
          />
          {compareIds.length === 2 && (
            <button
              id="btn-compare-action"
              onClick={() => setIsCompareMode(true)}
              className="px-3.5 py-2 rounded-xl bg-[#a98467] text-white dark:bg-[#d4a373] dark:text-[#121212] hover:bg-[#7f5539] dark:hover:bg-[#c69262] font-semibold text-xs flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparar (2)</span>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {availableMethods.slice(0, 5).map((method) => (
            <button
              key={method}
              id={`filter-method-${method}`}
              onClick={() => setSelectedMethod(method)}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all shrink-0 font-bold cursor-pointer ${
                selectedMethod === method
                  ? "bg-[#a98467]/10 border-[#a98467] text-[#a98467] dark:bg-[#d4a373]/10 dark:border-[#d4a373] dark:text-[#d4a373]"
                  : "bg-transparent border-[#e6dfd5] text-[#8a7e72] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c]"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Ajuste Inteligente por IA (Bitácora Optimizer) */}
      {history.length > 0 && (
        <div className="p-4 rounded-xl border border-[#a98467]/20 dark:border-[#d4a373]/20 bg-[#faf6f0]/60 dark:bg-[#1c1c1c]/50 space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-[#a98467] dark:text-[#d4a373] animate-pulse shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">
              Ajustar Receta por IA
            </h3>
          </div>
          <p className="text-[11px] text-[#8a7e72] dark:text-[#a8a29e] leading-relaxed">
            ¿Tu café no quedó perfecto? Elige una preparación guardada, escribe qué corregir (ej. "muy amargo", "falta acidez") y la IA recalculará una receta mejorada.
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Selector de preparación */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider">
                1. Selección de preparación:
              </label>
              <select
                id="select-log-optimize"
                value={selectedLogId}
                onChange={(e) => setSelectedLogId(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-all ${
                  isDarkMode
                    ? "bg-[#121212] border-[#2a2a2a] text-[#e6e2df] focus:border-[#d4a373]"
                    : "bg-white border-[#e6dfd5] text-[#3e362e] focus:border-[#a98467]"
                }`}
              >
                {history.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fecha.split(" ")[0]} - {item.origenCafe} ({item.metodoCafe})
                  </option>
                ))}
              </select>
            </div>

            {/* Observaciones / Feedback sensorial */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#8a7e72] dark:text-[#a8a29e] uppercase tracking-wider">
                2. Comentarios sobre el resultado en taza:
              </label>
              <textarea
                id="textarea-optimize-feedback"
                placeholder="Ej: 'Faltó dulzor y salió con un amargor seco' o 'La extracción fue muy lenta, tardó 4m, ajustar molino'..."
                rows={2}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-all resize-none font-sans ${
                  isDarkMode
                    ? "bg-[#121212] border-[#2a2a2a] text-[#e6e2df] placeholder-[#a8a29e]/40 focus:border-[#d4a373]"
                    : "bg-white border-[#e6dfd5] text-[#3e362e] placeholder-[#8a7e72]/40 focus:border-[#a98467]"
                }`}
              />
            </div>
          </div>

          <button
            id="btn-optimize-recipe"
            type="button"
            disabled={!feedbackText.trim() || !selectedLogId || isOptimizing}
            onClick={() => {
              const selectedItem = history.find((h) => h.id === selectedLogId);
              if (selectedItem && onOptimizeRecipe) {
                onOptimizeRecipe(selectedItem, feedbackText.trim());
                setFeedbackText(""); // reset input field
              }
            }}
            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all duration-200 cursor-pointer shadow-sm select-none ${
              !feedbackText.trim() || !selectedLogId || isOptimizing
                ? "bg-[#e6dfd5]/40 text-[#8a7e72]/40 dark:bg-[#121212]/50 dark:text-[#a8a29e]/40 border border-[#e6dfd5]/50 dark:border-[#2a2a2a]/50 cursor-not-allowed"
                : "bg-[#a98467] text-white hover:bg-[#7f5539] dark:bg-[#d4a373] dark:text-[#121212] dark:hover:bg-[#c69262] active:scale-[0.98]"
            }`}
          >
            {isOptimizing ? (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#121212] border-t-transparent animate-spin"></span>
                <span>Calibrando receta...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Calibrar y Diseñar Nueva Receta</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Comparison Instruction if selected is only 1 */}
      {compareIds.length === 1 && (
        <div className="p-2.5 rounded-xl bg-[#faf6f0]/50 dark:bg-[#1c1c1c]/20 border border-dashed dark:border-[#2a2a2a] border-[#e6dfd5] text-[10px] text-[#8a7e72] dark:text-[#a8a29e] text-center flex items-center justify-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-[#a98467] dark:text-[#d4a373]" />
          <span>Selecciona una segunda preparación abajo para habilitar la comparativa.</span>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 space-y-2 border border-dashed dark:border-[#2a2a2a] border-[#e6dfd5] rounded-xl bg-[#faf6f0]/20 dark:bg-[#1c1c1c]/10">
          <Coffee className="w-8 h-8 mx-auto text-[#8a7e72]/30 dark:text-[#a8a29e]/30" />
          <p className="text-xs font-semibold text-[#8a7e72] dark:text-[#a8a29e]">Sin preparaciones guardadas</p>
          <p className="text-[10px] text-[#8a7e72]/60 dark:text-[#a8a29e]/50 px-4">
            Prepara una receta utilizando el cronómetro y registra tus notas al finalizar para comenzar tu historial.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {paginatedHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSelectedForCompare = compareIds.includes(item.id);
            const isModifiedByIA = item.modificadaPorIA || !!item.recetaCalibrada;

            return (
              <div
                key={item.id}
                id={`history-card-${item.id}`}
                className={`border rounded-xl transition-all duration-200 overflow-hidden relative ${
                  isSelectedForCompare
                    ? "border-[#a98467] bg-[#a98467]/5 dark:border-[#d4a373] dark:bg-[#d4a373]/5"
                    : "border-[#e6dfd5] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c]/40"
                } shadow-sm`}
              >
                {/* Clickable Card Body */}
                <div className="p-3 flex items-start gap-2.5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  {/* Compare Checkbox */}
                  <button
                    type="button"
                    id={`btn-toggle-compare-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectForCompare(item.id);
                    }}
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelectedForCompare
                        ? "bg-[#a98467] border-[#a98467] text-white dark:bg-[#d4a373] dark:border-[#d4a373] dark:text-[#121212]"
                        : "border-[#e6dfd5] hover:border-[#a98467] dark:border-[#2a2a2a] dark:hover:border-[#d4a373]"
                    }`}
                    title="Seleccionar para comparar"
                  >
                    {isSelectedForCompare && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-grow space-y-1 min-w-0">
                    {/* Header Row: Date & Rating & IA Badge */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] text-[#8a7e72] dark:text-[#a8a29e] font-mono flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-[#a98467] dark:text-[#d4a373]" />
                        {item.fecha}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {isModifiedByIA && (
                          <span 
                            className="inline-flex items-center gap-0.5 text-[8.5px] bg-[#a98467]/10 text-[#a98467] dark:bg-[#d4a373]/10 dark:text-[#d4a373] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
                            title="Receta optimizada por IA o vinculada a una recomendación de ajuste"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                            <span>Ajustada por IA</span>
                          </span>
                        )}
                        {renderStarRating(item.puntuacion, 2.5)}
                      </div>
                    </div>

                    {/* Title Row: Inline Editor or Normal text */}
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5 w-full mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className={`px-2 py-0.5 rounded border text-xs outline-none flex-grow font-serif font-bold ${
                            isDarkMode 
                              ? "bg-[#121212] border-[#a98467] text-[#e6e2df]" 
                              : "bg-white border-[#e6dfd5] text-[#3e362e]"
                          }`}
                          autoFocus
                          placeholder="Título de la preparación..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateEntry) {
                              onUpdateEntry({
                                ...item,
                                titulo: editedTitle.trim()
                              });
                            }
                            setEditingId(null);
                          }}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shrink-0"
                          title="Guardar Título"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 cursor-pointer shrink-0"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1 mt-1 group w-full min-w-0">
                        <h4 
                          className="text-xs font-bold text-[#3e362e] dark:text-[#e6e2df] truncate flex items-center gap-1 font-serif flex-grow min-w-0" 
                          title={getItemTitle(item)}
                        >
                          <Coffee className="w-3.5 h-3.5 text-[#a98467] dark:text-[#d4a373] shrink-0" />
                          <span className="truncate">{getItemTitle(item)}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(item.id);
                            setEditedTitle(getItemTitle(item));
                          }}
                          className="opacity-50 group-hover:opacity-100 focus:opacity-100 p-1 text-[#8a7e72] hover:text-[#a98467] dark:text-[#a8a29e] dark:hover:text-[#d4a373] transition-opacity cursor-pointer shrink-0"
                          title="Editar Título"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Coffee Specs */}
                    <p className="text-[10px] text-[#8a7e72] dark:text-[#a8a29e] font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="text-[#a98467] dark:text-[#d4a373] font-bold">{item.metodoCafe}</span>
                      <span>•</span>
                      <span className="truncate">Molienda: {item.moliendaCafe}</span>
                    </p>

                    {/* Brief Note preview when collapsed */}
                    {item.saborNotas && !isExpanded && (
                      <p className="text-[10px] text-[#8a7e72]/80 dark:text-[#a8a29e]/80 italic truncate mt-1">
                        &ldquo;{item.saborNotas}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1.5 border-t dark:border-[#2a2a2a] border-[#e6dfd5] space-y-3 bg-[#faf6f0]/30 dark:bg-[#1c1c1c]/10 text-xs">
                    {/* Sensory Attributes */}
                    {renderSensoryBars(item)}

                    {/* Descriptores de Sabor */}
                    {item.saborNotas && (
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a7e72] dark:text-[#a8a29e]">Notas de Cata:</span>
                        <p className="text-[#3e362e] dark:text-[#e6e2df] font-medium leading-normal">
                          {item.saborNotas}
                        </p>
                      </div>
                    )}

                    {/* Ajustes de Futuras Preparaciones */}
                    {item.ajustesFuturos && (
                      <div className="space-y-0.5 p-2 rounded-lg bg-[#a98467]/5 dark:bg-[#d4a373]/5 border border-[#a98467]/20 dark:border-[#d4a373]/20">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#a98467] dark:text-[#d4a373]">Ajustes para el futuro:</span>
                        <p className="text-[#3e362e]/80 dark:text-[#a8a29e]/80 italic leading-normal whitespace-pre-line">
                          {item.ajustesFuturos}
                        </p>
                      </div>
                    )}

                    {/* IA-Linked Calibrated Recipe Details Card */}
                    {item.recetaCalibrada && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/15 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>Receta Calibrada por IA</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 text-[11px] pt-1">
                          <div>
                            <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-mono">Molienda</span>
                            <span className="font-semibold text-[#3e362e] dark:text-[#e6e2df]">{item.recetaCalibrada.molienda}</span>
                          </div>
                          <div>
                            <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-mono">Temperatura</span>
                            <span className="font-semibold text-[#3e362e] dark:text-[#e6e2df]">{item.recetaCalibrada.temperatura}</span>
                          </div>
                          <div>
                            <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-mono">Ratio</span>
                            <span className="font-semibold text-[#3e362e] dark:text-[#e6e2df]">{item.recetaCalibrada.ratio} ({item.recetaCalibrada.cafeGramos}g / {item.recetaCalibrada.aguaGramos}g)</span>
                          </div>
                          <div>
                            <span className="text-[#8a7e72] dark:text-[#a8a29e] block text-[9px] uppercase tracking-wider font-mono">Extracción</span>
                            <span className="font-semibold text-[#3e362e] dark:text-[#e6e2df]">{item.recetaCalibrada.tiempoExtraccion}</span>
                          </div>
                        </div>
                        {item.recetaCalibrada.notasBarista && (
                          <div className="text-[10.5px] text-[#8a7e72] dark:text-[#a8a29e] bg-[#faf6f0] dark:bg-[#121212]/50 p-2 rounded-lg leading-normal italic border border-[#e6dfd5]/60 dark:border-[#2a2a2a]/40 mt-1">
                            &ldquo;{item.recetaCalibrada.notasBarista}&rdquo;
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delete trigger */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        id={`btn-delete-cata-${item.id}`}
                        onClick={() => onDeleteEntry(item.id)}
                        className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-1 py-1 px-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-bold cursor-pointer animate-fade-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Registro</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#e6dfd5] dark:border-[#2a2a2a] text-xs">
              <button
                type="button"
                id="btn-prev-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                  currentPage === 1
                    ? "bg-transparent border-[#e6dfd5]/40 text-[#8a7e72]/30 dark:border-[#2a2a2a]/30 dark:text-[#a8a29e]/30 cursor-not-allowed"
                    : "bg-white border-[#e6dfd5] text-[#8a7e72] dark:bg-[#1c1c1c] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c] active:scale-95"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <span className="font-medium text-[#8a7e72] dark:text-[#a8a29e]">
                Página <span className="font-bold text-[#3e362e] dark:text-[#e6e2df]">{currentPage}</span> de <span className="font-bold text-[#3e362e] dark:text-[#e6e2df]">{totalPages}</span>
              </span>

              <button
                type="button"
                id="btn-next-page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                  currentPage === totalPages
                    ? "bg-transparent border-[#e6dfd5]/40 text-[#8a7e72]/30 dark:border-[#2a2a2a]/30 dark:text-[#a8a29e]/30 cursor-not-allowed"
                    : "bg-white border-[#e6dfd5] text-[#8a7e72] dark:bg-[#1c1c1c] dark:border-[#2a2a2a] dark:text-[#a8a29e] hover:bg-[#faf6f0] dark:hover:bg-[#1c1c1c] active:scale-95"
                }`}
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
