// Base de datos de recetas de campeones de competitions de café
import { MoliendaDetalle } from "../types";

export interface RecetaCampeon {
  id: string;
  competencia: string;
  year: number;
  barista: string;
  pais: string;
  // Datos del café
  origen: string;
  variedad?: string;
  proceso: string;
  altura?: string;
  notaCata?: string;
  // Método de extracción
  metodo: string;
  // Parámetros
  temperatura: number;
  ratio: number;
  cafeGramos: number;
  aguaGramos: number;
  tiempoExtraccion: number; // en segundos
  // Molienda
  molino: string;
  clics?: string;
  tipoMolienda?: string;
  // Descripción
  descripcion?: string;
  origenReceta?: string;
}

export const RECETAS_CAMPEONES: RecetaCampeon[] = [
  // ===== WORLD BREWERS CUP 2024 =====
  {
    id: "wbrc2024-01",
    competencia: "World Brewers Cup",
    year: 2024,
    barista: "Egor Vasiliev",
    pais: "Rusia",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Jazmín, durazno blanco, lima",
    metodo: "V60",
    temperatura: 93,
    ratio: 16,
    cafeGramos: 15,
    aguaGramos: 240,
    tiempoExtraccion: 195,
    molino: "Comandante C40",
    clics: "22",
    tipoMolienda: "media-fina"
  },
  {
    id: "wbrc2024-02",
    competencia: "World Brewers Cup",
    year: 2024,
    barista: "Egor Vasiliev",
    pais: "Rusia",
    origen: "Colombia",
    variedad: "Pink Bourbon",
    proceso: "Lavado",
    notaCata: "Frutos rojos, chocolate",
    metodo: "V60",
    temperatura: 94,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "21",
    tipoMolienda: "media-fina"
  },
  // ===== WORLD BREWERS CUP 2023 =====
  {
    id: "wbrc2023-01",
    competencia: "World Brewers Cup",
    year: 2023,
    barista: "Nick Hatch",
    pais: "USA",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Jazmín, bergamota, té negro",
    metodo: "V60",
    temperatura: 95,
    ratio: 16,
    cafeGramos: 20,
    aguaGramos: 320,
    tiempoExtraccion: 210,
    molino: "Comandante C40",
    clics: "23",
    tipoMolienda: "media-fina"
  },
  {
    id: "wbrc2023-02",
    competencia: "World Brewers Cup",
    year: 2023,
    barista: "Melanie Klassen",
    pais: "Canadá",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Flores blancas, limón, miel",
    metodo: "V60",
    temperatura: 93,
    ratio: 15.5,
    cafeGramos: 20,
    aguaGramos: 310,
    tiempoExtraccion: 200,
    molino: "Comandante C40",
    clics: "22",
    tipoMolienda: "media-fina"
  },
  // ===== WORLD BREWERS CUP 2022 =====
  {
    id: "wbrc2022-01",
    competencia: "World Brewers Cup",
    year: 2022,
    barista: "Dylan Siemen",
    pais: "USA",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Jazmín, jazmín, jazmín",
    metodo: "V60",
    temperatura: 93,
    ratio: 16,
    cafeGramos: 25,
    aguaGramos: 400,
    tiempoExtraccion: 240,
    molino: "Comandante C40",
    clics: "24",
    tipoMolienda: "media"
  },
  // ===== WORLD BREWERS CUP 2021 (Virtual) =====
  {
    id: "wbrc2021-01",
    competencia: "World Brewers Cup",
    year: 2021,
    barista: "Michele Di Corato",
    pais: "Italia",
    origen: "Etiopía",
    variedad: "Wolisho",
    proceso: "Lavado",
    notaCata: "Floral, frutal, complejo",
    metodo: "V60",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "20",
    tipoMolienda: "media-fina"
  },
  // ===== WORLD BREWERS CUP 2019 =====
  {
    id: "wbrc2019-01",
    competencia: "World Brewers Cup",
    year: 2019,
    barista: "Johannes Franz",
    pais: "Alemania",
    origen: "Etiopía",
    variedad: "Kumie",
    proceso: "Lavado",
    notaCata: "Floral, limpia, compleja",
    metodo: "V60",
    temperatura: 93,
    ratio: 16,
    cafeGramos: 18,
    aguaGramos: 288,
    tiempoExtraccion: 200,
    molino: "Comandante C40",
    clics: "21",
    tipoMolienda: "media-fina"
  },
  {
    id: "wbrc2019-02",
    competencia: "World Brewers Cup",
    year: 2019,
    barista: "Simon Hsieh",
    pais: "Taiwán",
    origen: "Colombia",
    variedad: "Castillo",
    proceso: "Lavado",
    notaCata: "Chocolate, caramelo, nueces",
    metodo: "V60",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 20,
    aguaGramos: 300,
    tiempoExtraccion: 195,
    molino: "Baratza Forte",
    clics: "5",
    tipoMolienda: "media"
  },
  // ===== WORLD BREWERS CUP 2018 =====
  {
    id: "wbrc2018-01",
    competencia: "World Brewers Cup",
    year: 2018,
    barista: "Tomasz Warda",
    pais: "Polonia",
    origen: "Kenia",
    variedad: "SL28",
    proceso: "Lavado",
    notaCata: "Grosella negra, tomate, astringente",
    metodo: "V60",
    temperatura: 94,
    ratio: 15,
    cafeGramos: 20,
    aguaGramos: 300,
    tiempoExtraccion: 195,
    molino: "Comandante C40",
    clics: "19",
    tipoMolienda: "media-fina"
  },
  // ===== WORLD BREWERS CUP 2017 =====
  {
    id: "wbrc2017-01",
    competencia: "World Brewers Cup",
    year: 2017,
    barista: "James Hoffmann",
    pais: "Reino Unido",
    origen: "Etiopía",
    variedad: "Heirloom",
    proceso: "Lavado",
    notaCata: "Flores, thé negro, astringente",
    metodo: "V60",
    temperatura: 92,
    ratio: 16.5,
    cafeGramos: 15,
    aguaGramos: 248,
    tiempoExtraccion: 210,
    molino: "Comandante C40",
    clics: "25",
    tipoMolienda: "media"
  },
  // ===== REGIONAL ASIA PACIFIC 2023 =====
  {
    id: "apac2023-01",
    competencia: "Asia Pacific Brewers Cup",
    year: 2023,
    barista: "Shao Lan Hsu",
    pais: "Taiwán",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Bergamota, jazmín, durazno",
    metodo: "V60",
    temperatura: 93,
    ratio: 16,
    cafeGramos: 15,
    aguaGramos: 240,
    tiempoExtraccion: 195,
    molino: "Comandante C40",
    clics: "22",
    tipoMolienda: "media-fina"
  },
  // ===== REGIONAL EUROPE 2023 =====
  {
    id: "euro2023-01",
    competencia: "Europe Brewers Cup",
    year: 2023,
    barista: "Michele Di Corato",
    pais: "Italia",
    origen: "Etiopía",
    variedad: "74-158",
    proceso: "Lavado",
    notaCata: "Frutos tropicales, floral",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 18,
    aguaGramos: 270,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "20",
    tipoMolienda: "media-fina"
  },
  // ===== REGIONAL US 2023 =====
  {
    id: "us2023-01",
    competencia: "US Brewers Cup",
    year: 2023,
    barista: "Sam Low",
    pais: "USA",
    origen: "Kenia",
    variedad: "SL28",
    proceso: "Lavado",
    notaCata: "Cítrico, berry, winey",
    metodo: "V60",
    temperatura: 94,
    ratio: 15,
    cafeGramos: 20,
    aguaGramos: 300,
    tiempoExtraccion: 185,
    molino: "Comandante C40",
    clics: "18",
    tipoMolienda: "media-fina"
  },
  // ===== WORLD BARISTA CHAMPIONSHIP 2024 =====
  {
    id: "wbc2024-01",
    competencia: "World Barista Championship",
    year: 2024,
    barista: "Mikaela Wallin",
    pais: "Suecia",
    origen: "Brasil",
    variedad: "Yellow Bourbon",
    proceso: "Natural",
    notaCata: "Chocolate, caramelo, frutos secos",
    metodo: "Espresso",
    temperatura: 93,
    ratio: 2,
    cafeGramos: 18,
    aguaGramos: 36,
    tiempoExtraccion: 28,
    molino: "Comandante C40",
    clics: "8",
    tipoMolienda: "extra-fina"
  },
  {
    id: "wbc2024-02",
    competencia: "World Barista Championship",
    year: 2024,
    barista: "Mikaela Wallin",
    pais: "Suecia",
    origen: "Colombia",
    variedad: "Pink Bourbon",
    proceso: "Anaeróbico",
    notaCata: "Frutos rojos, fermento",
    metodo: "Espresso",
    temperatura: 92,
    ratio: 2.2,
    cafeGramos: 18,
    aguaGramos: 40,
    tiempoExtraccion: 30,
    molino: "Comandante C40",
    clics: "9",
    tipoMolienda: "extra-fina"
  },
  // ===== WORLD BARISTA CHAMPIONSHIP 2023 =====
  {
    id: "wbc2023-01",
    competencia: "World Barista Championship",
    year: 2023,
    barista: "Amanda Waesterberg",
    pais: "Suecia",
    origen: "Kenia",
    variedad: "SL28",
    proceso: "Lavado",
    notaCata: "Winey, frutal, complejo",
    metodo: "Espresso",
    temperatura: 94,
    ratio: 2,
    cafeGramos: 20,
    aguaGramos: 40,
    tiempoExtraccion: 28,
    molino: "Comandante C40",
    clics: "10",
    tipoMolienda: "extra-fina"
  },
  // ===== WORLD BARISTA CHAMPIONSHIP 2022 =====
  {
    id: "wbc2022-01",
    competencia: "World Barista Championship",
    year: 2022,
    barista: "Anthony Buehl",
    pais: "USA",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    notaCata: "Jazmín, bergamota, limpio",
    metodo: "Espresso",
    temperatura: 93,
    ratio: 2.1,
    cafeGramos: 19,
    aguaGramos: 40,
    tiempoExtraccion: 27,
    molino: "Comandante C40",
    clics: "11",
    tipoMolienda: "extra-fina"
  },
  // ===== RECETAS ADICIONALES POR ORIGEN =====
  // Etiopía - Variados procesos
  {
    id: "etiopia-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Etiopía",
    variedad: "Heirloom",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 195,
    molino: "Comandante C40",
    clics: "22",
    tipoMolienda: "media-fina"
  },
  {
    id: "etiopia-natural-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Etiopía",
    variedad: "Heirloom",
    proceso: "Natural",
    metodo: "V60",
    temperatura: 91,
    ratio: 14.5,
    cafeGramos: 15,
    aguaGramos: 218,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "20",
    tipoMolienda: "media-fina"
  },
  {
    id: "etiopia-honey-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Etiopía",
    variedad: "Heirloom",
    proceso: "Honey",
    metodo: "V60",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 190,
    molino: "Comandante C40",
    clics: "21",
    tipoMolienda: "media-fina"
  },
  // Colombia - Variados procesos
  {
    id: "colombia-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Caturra",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "21",
    tipoMolienda: "media-fina"
  },
  {
    id: "colombia-natural-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Bourbon",
    proceso: "Natural",
    metodo: "V60",
    temperatura: 91,
    ratio: 14,
    cafeGramos: 15,
    aguaGramos: 210,
    tiempoExtraccion: 175,
    molino: "Comandante C40",
    clics: "19",
    tipoMolienda: "media-fina"
  },
  {
    id: "colombia-anaerobico-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Pink Bourbon",
    proceso: "Anaeróbico",
    metodo: "V60",
    temperatura: 90,
    ratio: 14,
    cafeGramos: 15,
    aguaGramos: 210,
    tiempoExtraccion: 170,
    molino: "Comandante C40",
    clics: "18",
    tipoMolienda: "media-fina"
  },
  // Kenia
  {
    id: "kenia-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Kenia",
    variedad: "SL28",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 94,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 185,
    molino: "Comandante C40",
    clics: "19",
    tipoMolienda: "media-fina"
  },
  // Guatemala
  {
    id: "guatemala-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Guatemala",
    variedad: "Bourbon",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 180,
    molino: "Comandante C40",
    clics: "21",
    tipoMolienda: "media-fina"
  },
  // Costa Rica
  {
    id: "costarica-honey-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Costa Rica",
    variedad: "Caturra",
    proceso: "Honey",
    metodo: "V60",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 185,
    molino: "Comandante C40",
    clics: "20",
    tipoMolienda: "media-fina"
  },
  // Brasil
  {
    id: "brasil-natural-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Brasil",
    variedad: "Yellow Bourbon",
    proceso: "Natural",
    metodo: "V60",
    temperatura: 91,
    ratio: 14,
    cafeGramos: 18,
    aguaGramos: 252,
    tiempoExtraccion: 175,
    molino: "Comandante C40",
    clics: "23",
    tipoMolienda: "media"
  },
  // ===== RECETAS PARA CHEMEX =====
  {
    id: "chemex-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Etiopía",
    variedad: "Geisha",
    proceso: "Lavado",
    metodo: "Chemex",
    temperatura: 94,
    ratio: 16,
    cafeGramos: 20,
    aguaGramos: 320,
    tiempoExtraccion: 255,
    molino: "Comandante C40",
    clics: "28",
    tipoMolienda: "media-gruesa"
  },
  // ===== RECETAS PARA AEROPRESS =====
  {
    id: "aeropress-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Caturra",
    proceso: "Lavado",
    metodo: "Aeropress",
    temperatura: 85,
    ratio: 12,
    cafeGramos: 16,
    aguaGramos: 192,
    tiempoExtraccion: 120,
    molino: "Comandante C40",
    clics: "16",
    tipoMolienda: "fina"
  },
  // ===== RECETAS PARA PRENSA FRANCESA =====
  {
    id: "prensa-natural-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Brasil",
    variedad: "Yellow Bourbon",
    proceso: "Natural",
    metodo: "Prensa Francesa",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 20,
    aguaGramos: 300,
    tiempoExtraccion: 240,
    molino: "Comandante C40",
    clics: "30",
    tipoMolienda: "gruesa"
  },
  // ===== RECETAS PARA KALITA WAVE =====
  {
    id: "kalita-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Guatemala",
    variedad: "Bourbon",
    proceso: "Lavado",
    metodo: "Kalita Wave",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 20,
    aguaGramos: 300,
    tiempoExtraccion: 210,
    molino: "Comandante C40",
    clics: "24",
    tipoMolienda: "media"
  },
  // ===== RECETAS CON OTROS MOLINOS =====
  {
    id: "encore-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Etiopía",
    variedad: "Heirloom",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 195,
    molino: "Baratza Encore",
    clics: "14",
    tipoMolienda: "media-fina"
  },
  {
    id: "eureka-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Caturra",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 180,
    molino: "Eureka Mignon",
    clics: "2.5",
    tipoMolienda: "media-fina"
  },
  {
    id: "df64-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Costa Rica",
    variedad: "Caturra",
    proceso: "Honey",
    metodo: "V60",
    temperatura: 92,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 185,
    molino: "DF64",
    clics: "0.40",
    tipoMolienda: "media-fina"
  },
  {
    id: "timemore-washed-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Perú",
    variedad: "Typica",
    proceso: "Lavado",
    metodo: "V60",
    temperatura: 93,
    ratio: 15,
    cafeGramos: 15,
    aguaGramos: 225,
    tiempoExtraccion: 190,
    molino: "Timemore C2",
    clics: "26",
    tipoMolienda: "media-fina"
  },
  // ===== RECETAS ESPECIALES - Proceso Anaeróbico =====
  {
    id: "anaerobico-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Pink Bourbon",
    proceso: "Anaeróbico",
    metodo: "V60",
    temperatura: 89,
    ratio: 14,
    cafeGramos: 15,
    aguaGramos: 210,
    tiempoExtraccion: 165,
    molino: "Comandante C40",
    clics: "17",
    tipoMolienda: "media-fina"
  },
  // ===== RECETAS ESPECIALES - Maceración Carbónica =====
  {
    id: "carbonic-01",
    competencia: "Receta Base",
    year: 2024,
    barista: "Gato Brew",
    pais: "App",
    origen: "Colombia",
    variedad: "Geisha",
    proceso: "Maceración Carbónica",
    metodo: "V60",
    temperatura: 88,
    ratio: 13,
    cafeGramos: 15,
    aguaGramos: 195,
    tiempoExtraccion: 160,
    molino: "Comandante C40",
    clics: "16",
    tipoMolienda: "media-fina"
  }
];

// Función para buscar recetas similares
export function buscarRecetasSimilares(
  origen: string,
  proceso: string,
  metodo: string,
  variedad?: string
): RecetaCampeon[] {
  const normOrigen = origen.toLowerCase().trim();
  const normProceso = proceso.toLowerCase().trim();
  const normMetodo = metodo.toLowerCase().trim();
  const normVariedad = variedad ? variedad.toLowerCase().trim() : "";

  // Filtrar por criterios
  let similares = RECETAS_CAMPEONES.filter(receta => {
    const matchOrigen = normOrigen && receta.origen.toLowerCase().includes(normOrigen);
    const matchProceso = normProceso && receta.proceso.toLowerCase().includes(normProceso);
    const matchMetodo = normMetodo && receta.metodo.toLowerCase().includes(normMetodo);
    const matchVariedad = normVariedad && receta.variedad && 
      receta.variedad.toLowerCase().includes(normVariedad);

    // Si hay variedad, Priorizar match exacto
    if (normVariedad && matchVariedad) {
      return matchOrigen && matchProceso && matchMetodo;
    }
    
    // Si no hay variedad, permitir match parcial
    return matchOrigen && matchProceso && matchMetodo;
  });

  // Si no encuentra suficientes, relajar filtros
  if (similares.length < 2) {
    similares = RECETAS_CAMPEONES.filter(receta => {
      const matchOrigen = normOrigen && receta.origen.toLowerCase().includes(normOrigen);
      const matchProceso = normProceso && receta.proceso.toLowerCase().includes(normProceso);
      const matchMetodo = normMetodo && receta.metodo.toLowerCase().includes(normMetodo);
      
      return matchOrigen && (matchProceso || matchMetodo);
    });
  }

  // Si sigue sin encontrar, buscar solo por origen y método
  if (similares.length < 2) {
    similares = RECETAS_CAMPEONES.filter(receta => {
      const matchOrigen = normOrigen && receta.origen.toLowerCase().includes(normOrigen);
      const matchMetodo = normMetodo && receta.metodo.toLowerCase().includes(normMetodo);
      return matchOrigen && matchMetodo;
    });
  }

  // Limitar a máximo 5 recetas similares
  return similares.slice(0, 5);
}

// Función para obtener una receta aleatoria de la base
export function getRecetaAleatoria(
  origen: string,
  proceso: string,
  metodo: string
): RecetaCampeon | null {
  const similares = buscarRecetasSimilares(origen, proceso, metodo);
  
  if (similares.length === 0) {
    return null;
  }

  // Seleccionar aleatoriamente una de las similares
  const indiceAleatorio = Math.floor(Math.random() * similares.length);
  return similares[indiceAleatorio];
}