export interface PasoCronometro {
  tiempoInicio: number; // in seconds
  tiempoFin: number; // in seconds
  nombre: string;
  descripcion: string;
  aguaAcumulada: number; // cumulative water poured in grams
}

export interface MoliendaDetalle {
  tipo: "extra-gruesa" | "gruesa" | "media-gruesa" | "media" | "media-fina" | "fina" | "extra-fina" | "polvo";
  granulometria: string; // e.g., "350-450 μm"
  clicsComandante: string; // e.g., "20-24"
  clicsEquivalent: string; // range for equivalent setting
  descripcion: string; // e.g., "Similar a sal de mar"
}

export interface RecetaCafe {
  id: string;
  origen: string;
  variedad?: string;
  proceso: string;
  metodo: string;
  molino: string;
  temperatura: string;
  temperaturaNum: number; // temperatura numérica para cálculos
  molienda: string;
  moliendaDetalle?: MoliendaDetalle;
  ratio: string;
  ratioNum: number; // ratio numérico para cálculos
  cafeGramos: number;
  aguaGramos: number;
  tiempoExtraccion: string;
  tiempoExtraccionSegundos: number; // tiempo en segundos para cálculos
  saborPerfil: string;
  instrucciones: string[];
  pasosCronometro: PasoCronometro[];
  notasBarista: string;
  notasPersonales?: string;
  fecha: string;
  isFallback?: boolean;
  isIA?: boolean; // Indica si fue generada por IA
  originalCataId?: string;
  // Metadatos de la receta base (de dónde vino)
  recetaBaseOrigen?: string; // ej: "WBrC 2023"
  recetaBaseBarista?: string;
  variacionAplicada?: boolean;
}

export interface RegistroCata {
  id: string;
  recetaId: string;
  fecha: string;
  puntuacion: number;
  acidez: number;
  cuerpo: number;
  dulzor: number;
  amargor: number;
  balance: number;
  saborNotas: string;
  ajustesFuturos: string;
  origenCafe: string;
  metodoCafe: string;
  moliendaCafe: string;
  procesoCafe?: string;
  variedadCafe?: string;
  titulo?: string;
  modificadaPorIA?: boolean;
  recetaCalibrada?: RecetaCafe;
  originalCataId?: string;
}