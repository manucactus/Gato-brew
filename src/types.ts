export interface PasoCronometro {
  tiempoInicio: number; // in seconds
  tiempoFin: number; // in seconds
  nombre: string;
  descripcion: string;
  aguaAcumulada: number; // cumulative water poured in grams
}

export interface RecetaCafe {
  id: string;
  origen: string;
  variedad?: string;
  proceso: string;
  metodo: string;
  molino: string;
  temperatura: string;
  molienda: string;
  ratio: string;
  cafeGramos: number;
  aguaGramos: number;
  tiempoExtraccion: string;
  saborPerfil: string;
  instrucciones: string[];
  pasosCronometro: PasoCronometro[];
  notasBarista: string;
  notasPersonales?: string; // Personal notes edited by the user
  fecha: string;
  isFallback?: boolean;
  originalCataId?: string; // Link to the original cata from which this was calibrated
}

export interface RegistroCata {
  id: string;
  recetaId: string;
  fecha: string;
  puntuacion: number; // 1-5 stars
  acidez: number; // 1-5 scale
  cuerpo: number; // 1-5 scale
  dulzor: number; // 1-5 scale
  amargor: number; // 1-5 scale
  balance: number; // 1-5 scale
  saborNotas: string; // e.g., "Notas cítricas, florales, chocolate"
  ajustesFuturos: string; // adjustments for next time
  // Cached for display in history without fetching full recipe
  origenCafe: string;
  metodoCafe: string;
  moliendaCafe: string;
  procesoCafe?: string;
  variedadCafe?: string;
  titulo?: string; // Custom preparation title entered by the user
  modificadaPorIA?: boolean; // Flag to show if it has been optimized/calibrated by IA
  recetaCalibrada?: RecetaCafe; // Store the resulting calibrated recipe
  originalCataId?: string; // If this cata is a child of another cata
}
