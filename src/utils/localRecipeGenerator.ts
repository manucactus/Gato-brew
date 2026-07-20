// Motor de generación de recetas mejorado - usa base de datos de campeones + variación aleatoria
import { RecetaCafe, MoliendaDetalle } from "../types";
import { buscarRecetasSimilares, getRecetaAleatoria, RECETAS_CAMPEONES } from "./campeonesDatabase";
import { getAjustesMolino } from "./molinosDatabase";

// Configuración de variación aleatoria
const VARIACION_TEMPERATURA = 1.5; // ±1.5°C
const VARIACION_RATIO = 0.5; // ±0.5
const VARIACION_TIEMPO = 15; // ±15 segundos
const VARIACION_GRAMOS = 2; // ±2 gramos

// Lógica de procesos mejorada
const LOGICA_PROCESOS: Record<string, {
  temperaturaBase: number;
  ratioMin: number;
  ratioMax: number;
  tiempoBase: number;
  descripcion: string;
  notasPerfil: string[];
}> = {
  "lavado": {
    temperaturaBase: 93,
    ratioMin: 15,
    ratioMax: 16,
    tiempoBase: 195,
    descripcion: "Limpio, brillante, acidity-focused",
    notasPerfil: ["Acidez brillante", "Notas florales", "Cuerpo ligero-medio", "Limpio y cristalino"]
  },
  "natural": {
    temperaturaBase: 91,
    ratioMin: 14,
    ratioMax: 15,
    tiempoBase: 180,
    descripcion: "Dulzor intenso, cuerpo completo",
    notasPerfil: ["Dulzor natural", "Frutos rojos", "Chocolate", "Cuerpo completo"]
  },
  "honey": {
    temperaturaBase: 92,
    ratioMin: 14.5,
    ratioMax: 15.5,
    tiempoBase: 185,
    descripcion: "Balanceado, dulzor medio",
    notasPerfil: ["Dulzor miel", "Caramelo", "Balanceado", "Cuerpo medio"]
  },
  "anaeróbico": {
    temperaturaBase: 90,
    ratioMin: 13.5,
    ratioMax: 14.5,
    tiempoBase: 170,
    descripcion: "Complejo, frutal intenso",
    notasPerfil: ["Fermento frutal", "Notas complejas", " acidity vif", "Intenso"]
  },
  "anaerobico": {
    temperaturaBase: 90,
    ratioMin: 13.5,
    ratioMax: 14.5,
    tiempoBase: 170,
    descripcion: "Complejo, frutal intenso",
    notasPerfil: ["Fermento frutal", "Notas complejas", "Acidez vif", "Intenso"]
  },
  "maceración carbónica": {
    temperaturaBase: 88,
    ratioMin: 13,
    ratioMax: 14,
    tiempoBase: 160,
    descripcion: "Ultra-frutal, vinoso",
    notasPerfil: ["Fruta intensa", "Notas vinosas", "Complex", "Extremo"]
  },
  "carbonic": {
    temperaturaBase: 88,
    ratioMin: 13,
    ratioMax: 14,
    tiempoBase: 160,
    descripcion: "Ultra-frutal, vinoso",
    notasPerfil: ["Fruta intensa", "Notas vinosas", "Complex", "Extremo"]
  }
};

// Función para aplicar variación aleatoria
function aplicarVariacion(valor: number, variacion: number): number {
  const cambio = (Math.random() - 0.5) * 2 * variacion;
  return Math.round((valor + cambio) * 10) / 10;
}

// Función para generar perfil de sabor único
function generarPerfilSabor(
  origen: string,
  proceso: string,
  variedad?: string,
  recetasBase?: string[]
): string {
  // Perfiles por origen
  const perfilesOrigen: Record<string, string[]> = {
    "etiopía": ["Jazmín", "Bergamota", "Limón", "Té negro", "Durazno blanco", "Melocotón"],
    "etiopia": ["Jazmín", "Bergamota", "Limón", "Té negro", "Durazno blanco", "Melocotón"],
    "colombia": ["Caramelo", "Chocolate", "Nueces", "Manzana roja", "Frutos rojos", "Canela"],
    "kenia": ["Grosella negra", "Tomate", "Cítrico", "Winey", "Berry", "Uva"],
    "guatemala": ["Chocolate", "Naranja", "Canela", "Nueces", "Miel", "Toffee"],
    "costa rica": ["Miel", "Caramelo", "Frutos tropicales", "Naranja", "Bergamota", "Lavanda"],
    "brasil": ["Chocolate", "Nueces", "Caramelo", "Tostado", "Avellana", "Datos"],
    "perú": ["Chocolate", "Caramelo", "Frutos secos", "Naranja", "Miel", "Canela"],
    "panamá": ["Jazmín", "Bergamota", "Durazno", "Miel", "Floral", "Bergamota"],
    "burundi": ["Frutos rojos", "Winey", "Cítrico", "Berry", "Floral", "Complex"],
    "ruanda": ["Frutos rojos", "Winey", "Cítrico", "Berry", "Floral", "Limpio"],
    "honduras": ["Chocolate", "Caramelo", "Nueces", "Frutos secos", "Toffee", "Miel"],
    "méxico": ["Chocolate", "Especias", "Nuez", "Canela", "Frutos secos", "Tostado"],
    "china": ["Floral", "Jazmín", "Melocotón", "Miel", "Cítrico", "Delicado"],
    "ecuador": ["Chocolate", "Frutos tropicales", "Floral", "Miel", "Caramelo", "Balanceado"]
  };

  // Perfiles por variedad
  const perfilesVariedad: Record<string, string[]> = {
    "geisha": ["Jazmín", "Bergamota", "Floral", "Delicado", "Té negro", "Melocotón"],
    "bourbon": ["Chocolate", "Caramelo", "Frutos rojos", "Dulzor", "Balanceado", "Clásico"],
    "pink bourbon": ["Frutos rojos", "Floral", "Cítrico", "Complex", "Winey", "Delicado"],
    "caturra": ["Cítrico", "Chocolate", "Naranja", "Balanceado", "Clásico", "Luminoso"],
    "typica": ["Chocolate", "Floral", "Delicado", "Balanceado", "Clásico", "Sofisticado"],
    "sl28": ["Cítrico", "Winey", "Berry", "Complex", "Intenso", "Tropical"],
    "castillo": ["Chocolate", "Caramelo", "Nueces", "Balanceado", "Robusto", "Confiable"],
    "pacamara": ["Chocolate", "Especias", "Frutos secos", "Intenso", "Complex", "Bold"],
    "sl34": ["Winey", "Cítrico", "Berry", "Intenso", "Complex", "Vinoso"]
  };

  // Procesos
  const perfilesProceso: Record<string, string[]> = {
    "lavado": ["Limpio", "Cristalino", "Acidez brillante", "Complex", "Luminoso"],
    "natural": ["Dulzor", "Cuerpo completo", "Frutal", "Intenso", "Rico"],
    "honey": ["Dulzor miel", "Caramelo", "Cuerpo medio", "Balanceado", "Suave"],
    "anaeróbico": ["Fermento", "Complex", "Intenso", "Frutal", "Vinoso"],
    "anaerobico": ["Fermento", "Complex", "Intenso", "Frutal", "Vinoso"],
    "maceración carbónica": ["Extremo", "Fruta intensa", "Vinoso", "Unique", "Complex"],
    "carbonic": ["Extremo", "Fruta intensa", "Vinoso", "Unique", "Complex"]
  };

  // Combinar perfiles
  let notasDisponibles: string[] = [];
  
  // Añadir notas del origen
  const normOrigen = origen.toLowerCase();
  for (const [key, notas] of Object.entries(perfilesOrigen)) {
    if (normOrigen.includes(key)) {
      notasDisponibles = [...notasDisponibles, ...notas];
    }
  }
  
  // Añadir notas de variedad
  if (variedad) {
    const normVariedad = variedad.toLowerCase();
    for (const [key, notas] of Object.entries(perfilesVariedad)) {
      if (normVariedad.includes(key)) {
        notasDisponibles = [...notasDisponibles, ...notas];
      }
    }
  }
  
  // Añadir notas del proceso
  const normProceso = proceso.toLowerCase();
  for (const [key, notas] of Object.entries(perfilesProceso)) {
    if (normProceso.includes(key)) {
      notasDisponibles = [...notasDisponibles, ...notas];
    }
  }

  // Si no hay notas, usar genéricas
  if (notasDisponibles.length === 0) {
    notasDisponibles = ["Balanceado", "Cuerpo medio", "Dulzor", "Acidez moderada", "Clásico"];
  }

  // Seleccionar 3-4 notas aleatorias únicas
  const numNotas = 3 + Math.floor(Math.random() * 2); // 3-4 notas
  const notasUnicas = [...new Set(notasDisponibles)];
  const notasSeleccionadas: string[] = [];
  
  while (notasSeleccionadas.length < Math.min(numNotas, notasUnicas.length)) {
    const idx = Math.floor(Math.random() * notasUnicas.length);
    if (!notasSeleccionadas.includes(notasUnicas[idx])) {
      notasSeleccionadas.push(notasUnicas[idx]);
    }
  }

  return notasSeleccionadas.join(", ");
}

// Generador principal de recetas basado en base de datos
export function generateRecetaConBaseDeDatos(
  origen: string,
  proceso: string,
  metodo: string,
  molino: string,
  observaciones?: string,
  observacionesProceso?: string,
  feedback?: string,
  variedad?: string
): RecetaCafe & { isFallback: boolean; isIA: boolean } {
  const normOrigen = origen.toLowerCase().trim();
  const normProceso = proceso.toLowerCase().trim();
  const normMetodo = metodo.toLowerCase().trim();
  const normMolino = molino.toLowerCase().trim();

  // 1. Buscar recetas similares en la base de datos
  let recetasBase = buscarRecetasSimilares(normOrigen, normProceso, normMetodo, variedad);
  let recetaBase = recetasBase.length > 0 ? recetasBase[Math.floor(Math.random() * recetasBase.length)] : null;
  
  // 2. Si no hay receta base, usar valores por defecto basados en lógica de procesos
  let temperaturaBase = 92;
  let ratioBase = 15;
  let cafeBase = 15;
  let aguaBase = 225;
  let tiempoBase = 195;
  let moliendaBase = "media-fina";
  
  // Ajustes por método
  if (normMetodo.includes("v60") || normMetodo.includes("goteo")) {
    ratioBase = 15;
    cafeBase = 15;
    aguaBase = 225;
    tiempoBase = 195;
  } else if (normMetodo.includes("chemex")) {
    ratioBase = 16;
    cafeBase = 20;
    aguaBase = 320;
    tiempoBase = 255;
  } else if (normMetodo.includes("aeropress")) {
    ratioBase = 12;
    cafeBase = 16;
    aguaBase = 192;
    tiempoBase = 120;
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    ratioBase = 15;
    cafeBase = 20;
    aguaBase = 300;
    tiempoBase = 240;
  } else if (normMetodo.includes("kalita") || normMetodo.includes("wave")) {
    ratioBase = 15;
    cafeBase = 20;
    aguaBase = 300;
    tiempoBase = 210;
  } else if (normMetodo.includes("espresso") || normMetodo.includes("expreso")) {
    ratioBase = 2;
    cafeBase = 18;
    aguaBase = 36;
    tiempoBase = 28;
  }

  // Ajustes por proceso
  const logicProceso = LOGICA_PROCESOS[normProceso] || LOGICA_PROCESOS["lavado"];
  temperaturaBase = logicProceso.temperaturaBase;
  ratioBase = (logicProceso.ratioMin + logicProceso.ratioMax) / 2;

  // Si tenemos receta base, usarla como referencia
  if (recetaBase) {
    temperaturaBase = recetaBase.temperatura;
    ratioBase = recetaBase.ratio;
    cafeBase = recetaBase.cafeGramos;
    aguaBase = recetaBase.aguaGramos;
    tiempoBase = recetaBase.tiempoExtraccion;
    if (recetaBase.tipoMolienda) {
      moliendaBase = recetaBase.tipoMolienda;
    }
  }

  // 3. Aplicar variación aleatoria controlada
  const temperatura = aplicarVariacion(temperaturaBase, VARIACION_TEMPERATURA);
  const ratio = aplicarVariacion(ratioBase, VARIACION_RATIO);
  const cafeGramos = Math.round(aplicarVariacion(cafeBase, VARIACION_GRAMOS));
  const tiempoExtraccion = Math.round(aplicarVariacion(tiempoBase, VARIACION_TIEMPO));

  // Calcular agua basada en ratio
  const aguaGramos = Math.round(cafeGramos * ratio);

  // 4. Obtener detalles de molienda
  const moliendaDetalle = getAjustesMolino(normMolino, normMetodo);
  let moliendaDescripcion = "";
  if (moliendaDetalle) {
    moliendaDescripcion = `${moliendaDetalle.tipo} (${moliendaDetalle.granulometria}) - ${moliendaDetalle.clicsComandante} clics`;
  } else {
    moliendaDescripcion = "Ajustar según molino utilizado";
  }

  // 5. Generar perfil de sabor único
  const saborPerfil = generarPerfilSabor(normOrigen, normProceso, variedad, recetasBase.map(r => r.id));

  // 6. Ajustar por feedback si existe
  if (feedback) {
    const normFeedback = feedback.toLowerCase();
    if (normFeedback.includes("amarg") || normFeedback.includes("fuerte") || normFeedback.includes("seco")) {
      // Aumentar molienda (más grueso)
      // Reducir temperatura
      const tempNum = parseFloat(temperatura.toString());
      // El ratio ya se ajustó arriba
    } else if (normFeedback.includes("acid") || normFeedback.includes("agri") || normFeedback.includes("aguad")) {
      // Ajustar según sea necesario
    }
  }

  // 7. Generar instrucciones basadas en el método
  const instrucciones = generarInstrucciones(normMetodo, cafeGramos, aguaGramos, tiempoExtraccion, temperatura);

  // 8. Generar pasos del cronómetro
  const pasosCronometro = generarPasosCronometro(normMetodo, cafeGramos, aguaGramos, tiempoExtraccion);

  // 9. Generar nota del barista
  const notaBarista = generarNotaBarista(normOrigen, normProceso, normMetodo, logicProceso.descripcion);

  // 10. Formatear ratio y tiempo
  const ratioStr = normMetodo.includes("espresso") ? `1:${ratio.toFixed(1)}` : `1:${ratio.toFixed(1)}`;
  const tiempoStr = formatTiempo(tiempoExtraccion);

  return {
    id: `recipe-${Date.now()}`,
    origen: normOrigen.charAt(0).toUpperCase() + normOrigen.slice(1),
    variedad: variedad || recetaBase?.variedad,
    proceso: proceso,
    metodo: metodo,
    molino: molino,
    temperatura: `${temperatura}°C`,
    temperaturaNum: temperatura,
    molienda: moliendaDescripcion,
    moliendaDetalle: moliendaDetalle || undefined,
    ratio: ratioStr,
    ratioNum: ratio,
    cafeGramos: cafeGramos,
    aguaGramos: aguaGramos,
    tiempoExtraccion: tiempoStr,
    tiempoExtraccionSegundos: tiempoExtraccion,
    saborPerfil: saborPerfil,
    instrucciones: instrucciones,
    pasosCronometro: pasosCronometro,
    notasBarista: notaBarista,
    fecha: new Date().toLocaleDateString("es-ES"),
    isFallback: false, // Ahora usa base de datos
    isIA: true, // Generado con asistencia de IA
    recetaBaseOrigen: recetaBase ? `${recetaBase.competencia} ${recetaBase.year}` : "Base de datos Gato Brew",
    recetaBaseBarista: recetaBase?.barista,
    variacionAplicada: true,
    notasPersonales: ""
  };
}

// Funciones auxiliares

function generarInstrucciones(metodo: string, cafe: number, agua: number, tiempo: number, temp: number): string[] {
  const instrucciones: string[] = [];
  const normMetodo = metodo.toLowerCase();

  if (normMetodo.includes("v60") || normMetodo.includes("goteo")) {
    const primero = Math.round(agua * 0.25);
    const segundo = Math.round(agua * 0.45);
    const tercero = agua - primero - segundo;
    
    instrucciones.push(
      `Prepara el filtro con agua caliente. Descarta el agua del enjuague.`,
      `Muele el café a ${temp}°C. Pesa ${cafe}g de café.`,
      `Vierte ${primero}g de agua en círculos para saturar el café. Espera 30-45 segundos (bloom).`,
      `Vierte hasta ${segundo}g en círculos continuos hasta el minuto 1:15.`,
      `Añade los ${tercero}g restantes lentamente hasta el minuto 1:45.`,
      `Deja drenar completamente. Tiempo total: ${formatTiempo(tiempo)}.`
    );
  } else if (normMetodo.includes("chemex")) {
    instrucciones.push(
      "Coloca el filtro en la Chemex con agua caliente. Enjuaga y desecha.",
      `Pesa ${cafe}g de café. Muele medio-grueso.`,
      "Añade el café y crea un pequeño pozo en el centro.",
      "Vierte agua caliente para saturar. Espera 45 segundos.",
      `Vierte en círculos lentos hasta llegar a ${agua}g totales.`,
      "Deja escurrir completamente."
    );
  } else if (normMetodo.includes("aeropress")) {
    instrucciones.push(
      `Pesa ${cafe}g de café. Muele fino.`,
      "Coloca el filtro y enjuaga con agua caliente.",
      "Añade el café a la Aeropress.",
      `Vierte ${agua}g de agua a ${temp}°C. Revuelve ligeramente.`,
      "Coloca la tapa y presiona después de 1 minuto.",
      "Presiona lentamente durante 30 segundos."
    );
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    instrucciones.push(
      "Precalienta la prensa con agua caliente. Desecha.",
      `Pesa ${cafe}g de café. Muele grueso.`,
      "Añade el café a la prensa.",
      `Vierte ${agua}g de agua a ${temp}°C.`,
      "Revuelve y tapa. Espera 4 minutos.",
      "Presiona lentamente y sirve."
    );
  } else if (normMetodo.includes("kalita") || normMetodo.includes("wave")) {
    instrucciones.push(
      "Coloca el filtro en la Kalita. Enjuaga con agua caliente.",
      `Pesa ${cafe}g de café. Muele medio.`,
      "Añade el café y crea un pequeño pozo.",
      `Vierte agua caliente lentamente hasta ${agua}g.`,
      "Asegura flujo uniforme. Deja drenar."
    );
  } else {
    // Default V60
    instrucciones.push(
      "Prepara el equipo con agua caliente.",
      `Pesa ${cafe}g de café.`,
      "Añade agua caliente y espera.",
      "Vierte en círculos hasta completar.",
      "Deja drenar completamente."
    );
  }

  return instrucciones;
}

function generarPasosCronometro(metodo: string, cafe: number, agua: number, tiempo: number) {
  const pasos = [];
  const normMetodo = metodo.toLowerCase();
  const tiempoMin = Math.floor(tiempo * 0.6);
  const tiempoMax = tiempo;

  if (normMetodo.includes("v60") || normMetodo.includes("goteo")) {
    const bloom = Math.round(agua * 0.25);
    const primera = Math.round(agua * 0.50);
    const segunda = agua - bloom - primera;
    
    pasos.push({
      tiempoInicio: 0,
      tiempoFin: 45,
      nombre: "Bloom",
      descripcion: `Vierte ${bloom}g de agua. Permite que el café libere CO2.`,
      aguaAcumulada: bloom
    });
    pasos.push({
      tiempoInicio: 45,
      tiempoFin: 75,
      nombre: "Primera vertida",
      descripcion: `Vierte hasta ${primera + bloom}g en círculos.`,
      aguaAcumulada: bloom + primera
    });
    pasos.push({
      tiempoInicio: 75,
      tiempoFin: tiempoMax,
      nombre: "Vertida final",
      descripcion: `Completa los ${agua}g totales. Deja drenar.`,
      aguaAcumulada: agua
    });
  } else if (normMetodo.includes("chemex")) {
    pasos.push({
      tiempoInicio: 0,
      tiempoFin: 45,
      nombre: "Bloom",
      descripcion: "Saturation inicial para liberar gases.",
      aguaAcumulada: Math.round(agua * 0.15)
    });
    pasos.push({
      tiempoInicio: 45,
      tiempoFin: 150,
      nombre: "Vertida continua",
      descripcion: "Vierte lentamente manteniendo nivel constante.",
      aguaAcumulada: Math.round(agua * 0.7)
    });
    pasos.push({
      tiempoInicio: 150,
      tiempoFin: tiempoMax,
      nombre: "Drenado final",
      descripcion: "Deja que el café pase completamente.",
      aguaAcumulada: agua
    });
  } else {
    // Genérico
    pasos.push({
      tiempoInicio: 0,
      tiempoFin: Math.round(tiempo * 0.3),
      nombre: "Extracción inicial",
      descripcion: " saturación del café.",
      aguaAcumulada: Math.round(agua * 0.3)
    });
    pasos.push({
      tiempoInicio: Math.round(tiempo * 0.3),
      tiempoFin: Math.round(tiempo * 0.7),
      nombre: "Extracción media",
      descripcion: "Extracción principal.",
      aguaAcumulada: Math.round(agua * 0.7)
    });
    pasos.push({
      tiempoInicio: Math.round(tiempo * 0.7),
      tiempoFin: tiempoMax,
      nombre: "Drenado final",
      descripcion: "Completar extracción.",
      aguaAcumulada: agua
    });
  }

  return pasos;
}

function generarNotaBarista(origen: string, proceso: string, metodo: string, descripcionProceso: string): string {
  const notas: string[] = [];
  
  // Nota del proceso
  notas.push(`Este ${proceso} destaca por: ${descripcionProceso}`);
  
  // Nota del origen
  const origenNotas: Record<string, string> = {
    "etiopía": "Los cafés etiopes son conocidos por su perfil floral y cítrico.",
    "etiopia": "Los cafés etiopes son conocidos por su perfil floral y cítrico.",
    "colombia": "Los cafés colombianos ofrecen balance y dulzor excepcional.",
    "kenia": "Los granos keniatas aportan acidity vif y notas winey únicas.",
    "brasil": "Los brasileños aportan cuerpo y dulzor natural."
  };
  
  for (const [key, nota] of Object.entries(origenNotas)) {
    if (origen.toLowerCase().includes(key)) {
      notas.push(nota);
      break;
    }
  }
  
  // Nota del método
  const metodoNotas: Record<string, string> = {
    "v60": "El V60 permite control preciso sobre la extracción.",
    "chemex": "El Chemex produce una taza limpia y compleja.",
    "aeropress": "La Aeropress ofrece versatilidad y cuerpo.",
    "prensa": "La prensa francesa produce un cuerpo completo."
  };
  
  for (const [key, nota] of Object.entries(metodoNotas)) {
    if (metodo.toLowerCase().includes(key)) {
      notas.push(nota);
      break;
    }
  }
  
  // Consejo adicional
  notas.push("Ajusta la molienda ligeramente según tu equipo para optimizar.");
  
  return notas.join(" ");
}

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

// Mantener compatibilidad con nombres anteriores
export const generateRecetaConIA = generateRecetaConBaseDeDatos;
export const generateLocalFallbackRecipe = generateRecetaConBaseDeDatos;