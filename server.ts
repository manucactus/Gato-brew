import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  if (customApiKey && customApiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper function to generate an exceptionally detailed, customized fallback recipe
// when the Gemini API has quota issues, rate limits, or is unavailable.
function generateLocalFallbackRecipe(
  origen: string, 
  proceso: string, 
  metodo: string, 
  molino: string, 
  observaciones?: string,
  observacionesProceso?: string,
  feedback?: string,
  variedad?: string
) {
  const normOrigen = origen.toLowerCase().trim();
  const normProceso = proceso.toLowerCase().trim();
  const normMetodo = metodo.toLowerCase().trim();
  const normMolino = molino.toLowerCase().trim();
  const normObservaciones = observaciones ? observaciones.toLowerCase().trim() : "";
  const normObsProceso = observacionesProceso ? observacionesProceso.toLowerCase().trim() : "";

  // 1. Core ratio & parameters based on method and feedback calibration
  let ratio = "1:15";
  let cafeGramos = 15;
  let aguaGramos = 225;
  let tiempoExtraccion = "2:30 - 3:00 min";
  let temperatura = "92°C";

  // Calibrating base temperature based on process
  if (normProceso.includes("natural") || normProceso.includes("anaer")) {
    temperatura = "91°C"; // Naturales se benefician de temperaturas ligeramente menores para no sobre-extraer amargor
  } else if (normProceso.includes("lavado") || normProceso.includes("washed")) {
    temperatura = "93°C"; // Lavados toleran y brillan con mayor temperatura para extraer acidez limpia
  } else if (normProceso.includes("honey")) {
    temperatura = "92°C";
  }

  // Adjusting base parameters per extraction method
  if (normMetodo.includes("v60") || normMetodo.includes("goteo")) {
    ratio = "1:15";
    cafeGramos = 15;
    aguaGramos = 225;
    tiempoExtraccion = "2:30 - 3:15 min";
  } else if (normMetodo.includes("chemex")) {
    ratio = "1:16";
    cafeGramos = 20;
    aguaGramos = 320;
    tiempoExtraccion = "3:30 - 4:15 min";
  } else if (normMetodo.includes("aeropress")) {
    ratio = "1:12";
    cafeGramos = 16;
    aguaGramos = 192;
    tiempoExtraccion = "1:45 - 2:15 min";
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    ratio = "1:15";
    cafeGramos = 20;
    aguaGramos = 300;
    tiempoExtraccion = "4:00 - 7:00 min";
  } else if (normMetodo.includes("espresso") || normMetodo.includes("expreso")) {
    ratio = "1:2";
    cafeGramos = 18;
    aguaGramos = 36;
    tiempoExtraccion = "25 - 30 seg";
  } else {
    ratio = "1:15";
    cafeGramos = 15;
    aguaGramos = 225;
    tiempoExtraccion = "2:30 - 3:00 min";
  }

  // Handle feedback adjustments dynamically! (Barista Calibration Logic)
  if (feedback) {
    const normFeedback = feedback.toLowerCase();
    if (normFeedback.includes("amarg") || normFeedback.includes("fuerte") || normFeedback.includes("seco")) {
      // If bitter, reduce temp, coarsen ratio slightly
      temperatura = (parseInt(temperatura) - 2) + "°C";
      if (ratio === "1:15") ratio = "1:16";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    } else if (normFeedback.includes("acid") || normFeedback.includes("agri") || normFeedback.includes("suave") || normFeedback.includes("aguad")) {
      // If sour or weak, increase temp, tighten ratio slightly
      temperatura = Math.min(95, parseInt(temperatura) + 1) + "°C";
      if (ratio === "1:15") ratio = "1:14.5";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    }
  }

  // 2. Grinder settings with custom model clicks
  let molienda = "Molienda media-fina";
  if (normMolino.includes("comandante") || normMolino.includes("c40")) {
    if (normMetodo.includes("v60")) molienda = "22 clics en Comandante C40";
    else if (normMetodo.includes("chemex")) molienda = "26 clics en Comandante C40";
    else if (normMetodo.includes("aeropress")) molienda = "16 clics en Comandante C40";
    else if (normMetodo.includes("prensa")) molienda = "28 clics en Comandante C40";
    else if (normMetodo.includes("espresso")) molienda = "12 clics en Comandante C40";
    else molienda = "22 clics en Comandante C40";
  } else if (normMolino.includes("encore") || normMolino.includes("baratza")) {
    if (normMetodo.includes("v60")) molienda = "Paso 14 en Baratza Encore";
    else if (normMetodo.includes("chemex")) molienda = "Paso 20 en Baratza Encore";
    else if (normMetodo.includes("aeropress")) molienda = "Paso 12 en Baratza Encore";
    else if (normMetodo.includes("prensa")) molienda = "Paso 28 en Baratza Encore";
    else if (normMetodo.includes("espresso")) molienda = "Paso 6 en Baratza Encore";
    else molienda = "Paso 15 en Baratza Encore";
  } else if (normMolino.includes("ode") || normMolino.includes("fellow")) {
    if (normMetodo.includes("v60")) molienda = "Paso 4 en Fellow Ode";
    else if (normMetodo.includes("chemex")) molienda = "Paso 6 en Fellow Ode";
    else if (normMetodo.includes("aeropress")) molienda = "Paso 3 en Fellow Ode";
    else if (normMetodo.includes("prensa")) molienda = "Paso 8 en Fellow Ode";
    else molienda = "Paso 5 en Fellow Ode";
  } else if (normMolino.includes("wilfa") || normMolino.includes("svart")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 'Filter' (medio-fino) en Wilfa Svart";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 'Steep' o 'Coarse' (medio-grueso) en Wilfa Svart";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 'Aeropress' (fino-medio) en Wilfa Svart";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 'French Press' (grueso) en Wilfa Svart";
    else molienda = "Ajuste 'Filter' en Wilfa Svart";
  } else if (normMolino.includes("timemore") || normMolino.includes("c2") || normMolino.includes("c3")) {
    if (normMetodo.includes("v60")) molienda = "18 clics en Timemore C2/C3";
    else if (normMetodo.includes("chemex")) molienda = "22 clics en Timemore C2/C3";
    else if (normMetodo.includes("aeropress")) molienda = "15 clics en Timemore C2/C3";
    else if (normMetodo.includes("prensa")) molienda = "24 clics en Timemore C2/C3";
    else if (normMetodo.includes("espresso")) molienda = "11 clics en Timemore C2/C3";
    else molienda = "18 clics en Timemore C2/C3";
  } else if (normMolino.includes("1zpresso") || normMolino.includes("k-ultra")) {
    if (normMetodo.includes("v60")) molienda = "Paso 7.0 (70 clics) en 1Zpresso K-Ultra";
    else if (normMetodo.includes("chemex")) molienda = "Paso 8.0 (80 clics) en 1Zpresso K-Ultra";
    else if (normMetodo.includes("aeropress")) molienda = "Paso 6.0 (60 clics) en 1Zpresso K-Ultra";
    else if (normMetodo.includes("prensa")) molienda = "Paso 8.5 (85 clics) en 1Zpresso K-Ultra";
    else if (normMetodo.includes("espresso")) molienda = "Paso 3.5 (35 clics) en 1Zpresso K-Ultra";
    else molienda = "Paso 7.0 (70 clics) en 1Zpresso K-Ultra";
  } else if (normMolino.includes("kingrinder") || normMolino.includes("k6")) {
    if (normMetodo.includes("v60")) molienda = "90 clics en Kingrinder K6";
    else if (normMetodo.includes("chemex")) molienda = "110 clics en Kingrinder K6";
    else if (normMetodo.includes("aeropress")) molienda = "75 clics en Kingrinder K6";
    else if (normMetodo.includes("prensa")) molienda = "120 clics en Kingrinder K6";
    else if (normMetodo.includes("espresso")) molienda = "40 clics en Kingrinder K6";
    else molienda = "90 clics en Kingrinder K6";
  } else if (normMolino.includes("eureka") || normMolino.includes("mignon")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 3.5 en Eureka Mignon";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 4.5 en Eureka Mignon";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 3.0 en Eureka Mignon";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 5.5 en Eureka Mignon";
    else if (normMetodo.includes("espresso")) molienda = "Ajuste 1.5 en Eureka Mignon";
    else molienda = "Ajuste 3.5 en Eureka Mignon";
  } else if (normMolino.includes("mahlkönig") || normMolino.includes("x54")) {
    if (normMetodo.includes("v60")) molienda = "Paso 10 en Mahlkönig X54";
    else if (normMetodo.includes("chemex")) molienda = "Paso 13 en Mahlkönig X54";
    else if (normMetodo.includes("aeropress")) molienda = "Paso 8 en Mahlkönig X54";
    else if (normMetodo.includes("prensa")) molienda = "Paso 16 en Mahlkönig X54";
    else if (normMetodo.includes("espresso")) molienda = "Paso 4 en Mahlkönig X54";
    else molienda = "Paso 10 en Mahlkönig X54";
  } else if (normMolino.includes("sette")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 15 en Baratza Sette";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 20 en Baratza Sette";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 11 en Baratza Sette";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 25 en Baratza Sette";
    else if (normMetodo.includes("espresso")) molienda = "Ajuste 7 en Baratza Sette";
    else molienda = "Ajuste 15 en Baratza Sette";
  } else if (normMolino.includes("varia") || normMolino.includes("vs3")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 10.5 en Varia VS3";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 12.5 en Varia VS3";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 9.0 en Varia VS3";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 14.0 en Varia VS3";
    else if (normMetodo.includes("espresso")) molienda = "Ajuste 3.5 en Varia VS3";
    else molienda = "Ajuste 10.5 en Varia VS3";
  } else if (normMolino.includes("mazzer") || normMolino.includes("mini")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 6 (desde cero) en Mazzer Mini";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 8 en Mazzer Mini";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 5 en Mazzer Mini";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 10 en Mazzer Mini";
    else if (normMetodo.includes("espresso")) molienda = "Ajuste 2 en Mazzer Mini";
    else molienda = "Ajuste 6 en Mazzer Mini";
  } else if (normMolino.includes("df64")) {
    if (normMetodo.includes("v60")) molienda = "Ajuste 55 en DF64";
    else if (normMetodo.includes("chemex")) molienda = "Ajuste 70 en DF64";
    else if (normMetodo.includes("aeropress")) molienda = "Ajuste 45 en DF64";
    else if (normMetodo.includes("prensa")) molienda = "Ajuste 80 en DF64";
    else if (normMetodo.includes("espresso")) molienda = "Ajuste 18 en DF64";
    else molienda = "Ajuste 55 en DF64";
  } else {
    // Dynamic estimation for custom/unlisted grinders:
    const grinderName = molino.trim();
    if (normMetodo.includes("v60")) {
      molienda = `~18 - 22 clics (molienda media-fina) en tu molino '${grinderName}'`;
    } else if (normMetodo.includes("chemex")) {
      molienda = `~24 - 28 clics (molienda media-gruesa) en tu molino '${grinderName}'`;
    } else if (normMetodo.includes("aeropress")) {
      molienda = `~14 - 16 clics (molienda fina-media) en tu molino '${grinderName}'`;
    } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
      molienda = `~28 - 32 clics (molienda gruesa) en tu molino '${grinderName}'`;
    } else if (normMetodo.includes("espresso") || normMetodo.includes("expreso")) {
      molienda = `~8 - 12 clics (molienda de espresso muy fina) en tu molino '${grinderName}'`;
    } else {
      molienda = `~18 - 22 clics (configuración media estándar) en tu molino '${grinderName}'`;
    }
  }

  // 3. Dynamic taste profiles based on combination of origin and process
  let saborPerfil = `Resalta un perfil sumamente equilibrado con sutil dulzor a caramelo, acidez balanceada de frutas maduras y notas achocolatadas de fondo.`;
  if (normOrigen.includes("etiop") || normOrigen.includes("ethiop")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Explosión frutal intensa y exótica. Notas dominantes de arándanos frescos, mermelada de frambuesas silvestres, té de jazmín y una dulzura almibarada con un toque de chocolate con leche.";
    } else {
      saborPerfil = "Perfil sumamente elegante, floral y cristalino. Notas limpias a té de jazmín blanco, bergamota fresca, limón amarillo dulce y un cuerpo sedoso de acidez cítrica brillante.";
    }
  } else if (normOrigen.includes("colomb")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Complejo y audaz. Notas fermentadas de maracuyá, cereza negra madura, licor de cacao, acidez láctica/málica vibrante y cuerpo untuoso muy estructurado.";
    } else {
      saborPerfil = "El clásico balance del barista colombiano. Notas exquisitas de caramelo tostado, vainilla, manzana roja fresca, con un cuerpo cremoso y una dulzura persistente y limpia.";
    }
  } else if (normOrigen.includes("brasil") || normOrigen.includes("brazil")) {
    saborPerfil = "Cuerpo denso, untuoso y reconfortante. Notas de cacao oscuro, avellanas tostadas, almendras, baja acidez cítrica y una dulzura pesada que recuerda al azúcar de caña.";
  } else if (normOrigen.includes("ken") || normOrigen.includes("quenia")) {
    saborPerfil = "Acidez jugosa, intensa y brillante. Notas distintivas de grosellas negras, moras de zarza, té de hibisco y un retrogusto sumamente limpio y dulce a toronja rosa.";
  } else if (normOrigen.includes("costa") || normOrigen.includes("guate") || normOrigen.includes("hondur") || normOrigen.includes("salvador")) {
    saborPerfil = "Perfil balanceado, noble y dulce. Notas florales sutiles, acidez limpia de durazno o manzana verde, y un final largo a miel de caña y chocolate con leche.";
  } else {
    // Custom origin template
    const origName = origen.charAt(0).toUpperCase() + origen.slice(1);
    saborPerfil = `Perfil enfocado en resaltar la identidad del terroir de ${origName}. Notas limpias y equilibradas con dulzor de fruta, cuerpo balanceado y acidez refinada característica del grano.`;
  }

  // 4. Barista-Champion Recipe Engine based on Method & Process combinations
  let instrucciones: string[] = [];
  let pasosCronometro: any[] = [];
  let notasBarista = "";

  if (normMetodo.includes("v60") || normMetodo.includes("goteo") || (!normMetodo.includes("aeropress") && !normMetodo.includes("prensa") && !normMetodo.includes("espresso") && !normMetodo.includes("chemex"))) {
    // If Natural or Anaerobic, use the legendary Tetsu Kasuya 4:6 Method
    if (normProceso.includes("natural") || normProceso.includes("anaer") || normObsProceso.includes("ferment") || normObservaciones.includes("kasuya") || normObservaciones.includes("4:6")) {
      const bloom = Math.round(aguaGramos * 0.22); // ~50g for 225g
      const p2 = Math.round(aguaGramos * 0.18);    // ~40g for 225g (total 90g)
      const p3 = Math.round(aguaGramos * 0.20);    // ~45g (total 135g)
      const p4 = Math.round(aguaGramos * 0.20);    // ~45g (total 180g)
      const p5 = aguaGramos - (bloom + p2 + p3 + p4); // remaining ~45g (total 225g)

      instrucciones = [
        `Método 4:6 de Tetsu Kasuya: Divide los vertidos para ajustar dulzura y cuerpo. Vierte ${bloom}g de agua en espiral lenta para el blooming. Espera 45 segundos.`,
        `Realiza el segundo vertido de ${p2}g de agua (acumulado: ${bloom + p2}g). Este vertido define el dulzor óptimo para procesos de fermentación larga o naturales.`,
        `Tercer vertido de ${p3}g (acumulado: ${bloom + p2 + p3}g) a los 1:30 minutos para empezar a estructurar la fuerza y balance del cuerpo.`,
        `Cuarto vertido de ${p4}g (acumulado: ${bloom + p2 + p3 + p4}g) a los 2:15 minutos para consolidar el cuerpo untuoso.`,
        `Realiza el último vertido de ${p5}g para completar los ${aguaGramos}g totales. Deja escurrir hasta el final.`
      ];

      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 45,
          nombre: "1er Vertido: Pre-infusión (4:6 Kasuya)",
          descripcion: `Vierte lentamente en espiral ${bloom}g de agua. Libera la dulzura natural del grano.`,
          aguaAcumulada: bloom
        },
        {
          tiempoInicio: 45,
          tiempoFin: 90,
          nombre: "2do Vertido (Dulzura)",
          descripcion: `Vierte en espiral media ${p2}g de agua adicionales hasta llegar a ${bloom + p2}g totales.`,
          aguaAcumulada: bloom + p2
        },
        {
          tiempoInicio: 90,
          tiempoFin: 135,
          nombre: "3er Vertido (Cuerpo y Estructura)",
          descripcion: `Vierte suavemente en círculos concéntricos ${p3}g de agua adicionales (total: ${bloom + p2 + p3}g).`,
          aguaAcumulada: bloom + p2 + p3
        },
        {
          tiempoInicio: 135,
          tiempoFin: 180,
          nombre: "4to Vertido (Balance)",
          descripcion: `Vierte de forma constante ${p4}g de agua adicionales (total: ${bloom + p2 + p3 + p4}g).`,
          aguaAcumulada: bloom + p2 + p3 + p4
        },
        {
          tiempoInicio: 180,
          tiempoFin: 220,
          nombre: "5to Vertido: Extracción Final",
          descripcion: `Vierte el remanente de ${p5}g de agua (total: ${aguaGramos}g). Deja filtrar por completo.`,
          aguaAcumulada: aguaGramos
        }
      ];

      notasBarista = `El Método 4:6 de Tetsu Kasuya es perfecto para resaltar la inmensa dulzura y notas exóticas de este café de proceso ${proceso}. Mantén los vertidos separados de forma estricta cada 45 segundos para controlar perfectamente la extracción.`;

    } else {
      // Otherwise, use James Hoffmann's Ultimate V60 Method
      const bloom = Math.round(aguaGramos * 0.20); // ~45-50g
      const firstPour = Math.round((aguaGramos - bloom) * 0.5) + bloom; // ~135-150g
      const finalPour = aguaGramos;

      instrucciones = [
        `Método James Hoffmann V60: Vierte ${bloom}g de agua de forma agresiva para mojar toda la cama de café uniformemente. Realiza un leve giro ('swirl') a la jarra y espera 45 segundos.`,
        `Vierte en espiral continua y rápida hasta alcanzar los ${firstPour}g de agua a los 1:15 min. Este vertido rápido crea agitación idónea para maximizar acidez y claridad.`,
        `Vierte lentamente en círculos pequeños en el centro hasta completar los ${finalPour}g totales a los 1:45 min.`,
        `Remueve suavemente con una cuchara en círculos una vez, realiza un giro ('swirl') suave al cono y deja escurrir por completo hasta los 3 minutos.`
      ];

      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 45,
          nombre: "Pre-infusión y Agitación (Blooming)",
          descripcion: `Vierte ${bloom}g de agua rápidamente. Realiza un suave giro de cono para asegurar una humectación completa de la cama de café.`,
          aguaAcumulada: bloom
        },
        {
          tiempoInicio: 45,
          tiempoFin: 75,
          nombre: "Vertido Principal Rápido",
          descripcion: `Vierte con flujo alegre y constante en espirales de adentro hacia afuera hasta alcanzar los ${firstPour}g totales.`,
          aguaAcumulada: firstPour
        },
        {
          tiempoInicio: 75,
          tiempoFin: 105,
          nombre: "Vertido Central Lento",
          descripcion: `Reduce el flujo y vierte despacio en el centro del cono hasta completar los ${finalPour}g totales de agua.`,
          aguaAcumulada: finalPour
        },
        {
          tiempoInicio: 105,
          tiempoFin: 180,
          nombre: "Filtración y Swirl de Cama Plana",
          descripcion: "Da un giro suave ('swirl') al portafiltros completo. Deja escurrir. Esto alinea las partículas de café para una cama perfectamente plana.",
          aguaAcumulada: finalPour
        }
      ];

      notasBarista = `El método de James Hoffmann maximiza la claridad y el balance de acidez y dulzor del café de proceso ${proceso}. El swirl al inicio y al final evita que el café se adhiera a las paredes del papel de filtro.`;
    }

  } else if (normMetodo.includes("chemex")) {
    // Chemex Classic Slow Extraction Technique
    const bloom = Math.round(aguaGramos * 0.18); // ~60g
    const pour1 = Math.round((aguaGramos - bloom) * 0.5) + bloom; // ~190g
    const pour2 = aguaGramos;

    instrucciones = [
      `Enjuaga bien el filtro grueso de Chemex con agua caliente. Añade el café y vierte ${bloom}g de agua lenta y uniformemente. Deja pre-infundir por 45 segundos completos para abrir la estructura aromática.`,
      `Primer vertido lento en espiral: Vierte suavemente de manera concéntrica evitando tocar las paredes del papel, elevando el nivel de agua hasta los ${pour1}g.`,
      `Segundo vertido final: Espera a que baje el nivel a la mitad, luego vierte despacio en el centro hasta los ${pour2}g de agua totales.`,
      `Realiza un movimiento circular suave de la Chemex entera para asentar la cama y espera a que filtre en su totalidad.`
    ];

    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 45,
        nombre: "Blooming Prolongado en Chemex",
        descripcion: `Vierte ${bloom}g de agua caliente y haz movimientos circulares suaves. Deja que el café libere los gases atrapados por completo.`,
        aguaAcumulada: bloom
      },
      {
        tiempoInicio: 45,
        tiempoFin: 110,
        nombre: "Primer Vertido de Cuerpo",
        descripcion: `Vierte en círculos lentos y elegantes ${pour1 - bloom}g de agua (total: ${pour1}g). Mantén el flujo suspendido pero constante.`,
        aguaAcumulada: pour1
      },
      {
        tiempoInicio: 110,
        tiempoFin: 170,
        nombre: "Segundo Vertido Central",
        descripcion: `Sube lentamente el agua remanente hasta los ${pour2}g totales. Hazlo de manera suave en el centro exacto de la Chemex.`,
        aguaAcumulada: pour2
      },
      {
        tiempoInicio: 170,
        tiempoFin: 245,
        nombre: "Swirl y Filtrado Final Slow",
        descripcion: "Sostén la Chemex por el cuello de madera, dale un sutil giro circular para decantar finos y deja colar. Verás una extracción cristalina.",
        aguaAcumulada: pour2
      }
    ];

    notasBarista = `El filtro grueso patentado de Chemex atrapa todos los sedimentos y aceites pesados. Este vertido lento te dará una taza súper limpia, con brillo de acidez similar al té y una dulzura impecable.`;

  } else if (normMetodo.includes("aeropress")) {
    // If Natural or Anaerobic, use the World Aeropress Championship Inverted Recipe
    if (normProceso.includes("natural") || normProceso.includes("anaer") || normObsProceso.includes("ferment")) {
      instrucciones = [
        `Posición Invertida: Prepara la Aeropress de forma invertida para evitar goteos prematuros. Añade los ${cafeGramos}g de café.`,
        `Pre-infusión explosiva: Vierte ${Math.round(aguaGramos * 0.3)}g de agua caliente a ${temperatura}, agita enérgicamente con la espátula durante 10 segundos y deja reposar por 30 segundos.`,
        `Segundo vertido de infusión: Añade el agua restante hasta completar los ${aguaGramos}g totales. Coloca el portafiltros enroscado firmemente con papel filtro doble previamente purgado.`,
        `Giro y Presión: A los 1:20 minutos, gira la cafetera con cuidado sobre la taza. Presiona el émbolo con la fuerza de tu antebrazo de forma constante por exactamente 30 segundos.`
      ];

      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 30,
          nombre: "Blooming Explosivo (Invertido)",
          descripcion: `Vierte ${Math.round(aguaGramos * 0.3)}g de agua, remueve vigorosamente por 10 segundos enteros con la espátula.`,
          aguaAcumulada: Math.round(aguaGramos * 0.3)
        },
        {
          tiempoInicio: 30,
          tiempoFin: 75,
          nombre: "Vertido de Infusión Completa",
          descripcion: `Completa los ${aguaGramos}g totales de agua. Coloca y enrosca el portafiltros con papel filtro humedecido.`,
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 75,
          tiempoFin: 105,
          nombre: "Volteo y Presión Constant",
          descripcion: "Gira la Aeropress con agilidad sobre tu taza y presiona el émbolo de forma lenta y firme. Hazlo durar exactamente 30 segundos.",
          aguaAcumulada: aguaGramos
        }
      ];

      notasBarista = `La posición invertida y el uso de filtro de papel de alta densidad resalta al máximo las notas a frutas exóticas de tu café sin dejar pasar sedimentos. No presiones hasta el fondo absoluto para evitar amargor no deseado.`;

    } else {
      // Alan Adler low-temp recipe
      instrucciones = [
        `Posición Estándar: Coloca el filtro enjuagado, añade los ${cafeGramos}g de café y colócalo sobre tu taza.`,
        `Vierte agua rápidamente a ${temperatura} hasta alcanzar los ${aguaGramos}g de agua en total.`,
        `Remueve suave y continuamente con la paleta de agitación durante 15 segundos para acelerar la extracción balanceada de azúcares.`,
        `Coloca el émbolo un centímetro para hacer un sello de vacío hermético, espera 20 segundos y presiona lentamente durante 30 segundos.`
      ];

      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 25,
          nombre: "Vertido Rápido y Agitación",
          descripcion: `Vierte la totalidad de los ${aguaGramos}g de agua caliente y agita suavemente para homogeneizar la mezcla.`,
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 25,
          tiempoFin: 65,
          nombre: "Vacío e Infusión Corta",
          descripcion: "Coloca el émbolo ligeramente para retener el agua en la cámara. Deja reposar de forma estática.",
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 65,
          tiempoFin: 95,
          nombre: "Presión Controlada",
          descripcion: "Empuja el émbolo con calma y suavidad hasta el fondo. Detén la extracción en cuanto escuches el silbido de aire.",
          aguaAcumulada: aguaGramos
        }
      ];

      notasBarista = `La receta de Alan Adler utiliza temperaturas moderadas para garantizar una taza libre de amargor. Al remover activamente compensamos la temperatura logrando una dulzura similar a la miel de caña.`;
    }

  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    // James Hoffmann's Ultimate French Press Technique
    instrucciones = [
      `Método James Hoffmann de Prensa: Coloca los ${cafeGramos}g de café en grano grueso. Vierte rápidamente la totalidad de los ${aguaGramos}g de agua hirviendo cubriendo todo el café. No coloques la tapa. Dejar reposar 4 minutos enteros.`,
      `Al minuto 4:00, notarás una costra de café flotando en la superficie. Usa una cuchara para romperla y agitarla una vez. El café caerá al fondo.`,
      `Usa una o dos cucharas para retirar la espuma marrón y las partículas de café flotantes de la superficie. Esto purifica el perfil de sabor de la taza.`,
      `Coloca la tapa con el émbolo, pero NO lo presiones hasta abajo. Espera 3 minutos más (minuto 7:00 en total) para que los finos decanten de forma natural por gravedad.`,
      `Sirve el café lentamente por decantación a través del filtro de metal, sin revolver ni perturbar el sedimento del fondo.`
    ];

    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 240,
        nombre: "Infusión Estática y Costra",
        descripcion: `Vierte los ${aguaGramos}g de agua de un solo golpe. Deja reposar por 4 minutos sin tocar la cafetera. Se formará una costra aromática en la parte superior.`,
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 240,
        tiempoFin: 300,
        nombre: "Romper Costra y Limpieza",
        descripcion: "Rompe la costra superficial con una cuchara. Remueve la espuma clara y las partículas que flotan para obtener un sabor limpio.",
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 300,
        tiempoFin: 420,
        nombre: "Decantación de Finos",
        descripcion: "Coloca la tapa con el filtro tocando apenas el nivel de líquido. ¡NO PRESIONES! Deja reposar por 2 minutos adicionales para decantar el sedimento.",
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 420,
        tiempoFin: 450,
        nombre: "Servido Lento por Decantación",
        descripcion: "Vierte lentamente el café en tu taza o servidor sin perturbar el fondo de la prensa. Disfruta un cuerpo denso pero libre de lodos.",
        aguaAcumulada: aguaGramos
      }
    ];

    notasBarista = `El método de James Hoffmann para prensa francesa revoluciona el sabor al evitar presionar físicamente el café. Esto disminuye la turbidez, dándote un cuerpo voluptuoso espectacularmente limpio y aromático.`;

  } else if (normMetodo.includes("espresso") || normMetodo.includes("expreso")) {
    instrucciones = [
      `Prepara y distribuye con precisión los ${cafeGramos}g de café finamente molido en tu portafiltro doble. Realiza una nivelación y prensado perfectamente plano.`,
      `Purga la cabeza del grupo de la máquina de espresso para limpiar residuos de agua estancada caliente.`,
      `Inserta el portafiltro y activa inmediatamente la bomba. Inicia el cronómetro.`,
      `Extrae un total de ${aguaGramos}g de espresso líquido concentrado en taza en un lapso óptimo de 25 a 30 segundos.`
    ];

    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 7,
        nombre: "Pre-infusión a Baja Presión",
        descripcion: "Activación inicial. El agua moja suavemente la pastilla de café a baja presión.",
        aguaAcumulada: 5
      },
      {
        tiempoInicio: 7,
        tiempoFin: 28,
        nombre: "Erogación a Alta Presión (9 Bares)",
        descripcion: "Flujo continuo de color avellana y crema espesa. La bomba opera a presión plena de extracción.",
        aguaAcumulada: aguaGramos
      }
    ];

    notasBarista = `Para esta extracción de espresso con proceso ${proceso}, mantén la presión del tampeado estable. Si el flujo es muy rápido y el sabor es agrio, muele un clic más fino. Si gotea lento y se amarga, abre un clic de molienda.`;

  } else {
    // Default 3-pour recipe
    const bloom = Math.round(aguaGramos * 0.20);
    const p1 = Math.round((aguaGramos - bloom) * 0.5) + bloom;

    instrucciones = [
      `Vierte lenta y uniformemente ${bloom}g de agua sobre la cama de café molido. Deja reposar por 35 segundos para una pre-infusión ideal.`,
      `Primer vertido principal: Vierte en círculos continuos de adentro hacia afuera hasta alcanzar los ${p1}g en total.`,
      `Segundo vertido final: Sube suavemente el nivel de agua vertiendo en el centro hasta los ${aguaGramos}g de agua totales de la receta.`,
      `Realiza un movimiento circular suave al cono de goteo y deja filtrar en su totalidad.`
    ];

    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 35,
        nombre: "Pre-infusión de Balance",
        descripcion: `Pre-infunde con ${bloom}g de agua de forma homogénea para liberar compuestos aromáticos primarios.`,
        aguaAcumulada: bloom
      },
      {
        tiempoInicio: 35,
        tiempoFin: 80,
        nombre: "Vertido de Dulzura",
        descripcion: `Vierte de forma continua ${p1 - bloom}g de agua en espiral constante (total: ${p1}g).`,
        aguaAcumulada: p1
      },
      {
        tiempoInicio: 80,
        tiempoFin: 135,
        nombre: "Vertido de Cuerpo",
        descripcion: `Completa los ${aguaGramos}g de agua totales vertiendo suavemente en círculos concéntricos.`,
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 135,
        tiempoFin: 180,
        nombre: "Filtración Final",
        descripcion: "Deja escurrir el agua de filtración. Remueve suavemente el cono.",
        aguaAcumulada: aguaGramos
      }
    ];

    notasBarista = `Esta receta clásica local está ajustada para balancear la dulzura y el cuerpo del origen ${origen} con proceso ${proceso}. Mantén un flujo de agua pausado y constante.`;
  }

  let finalNotasBarista = notasBarista;
  if (observaciones) {
    finalNotasBarista += `\n\n[Nota del Barista sobre tus observaciones]: Hemos adaptado las recomendaciones locales considerando tus indicaciones adicionales: "${observaciones}".`;
  }
  if (observacionesProceso) {
    finalNotasBarista += `\n\n[Nota del Barista sobre el proceso]: Tomamos en cuenta los detalles de fermentación/proceso: "${observacionesProceso}".`;
  }
  if (feedback) {
    finalNotasBarista += `\n\n[Nota del Barista sobre calibración]: Tomamos en cuenta tu cata anterior ("${feedback}"). Ajustamos sutilmente el ratio/temperatura para solucionar inconvenientes de extracción. Si sentiste amargor, reduce la temperatura o aumenta un clic de molienda. Si sentiste acidez agria, aumenta la temperatura o reduce un clic.`;
  }

  return {
    metodo: metodo,
    temperatura,
    molienda,
    ratio,
    cafeGramos,
    aguaGramos,
    tiempoExtraccion,
    saborPerfil,
    instrucciones,
    pasosCronometro,
    notasBarista: finalNotasBarista,
    isFallback: true,
    variedad: variedad || ""
  };
}

// API endpoint for coffee recipe generation
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const userApiKey = req.headers["x-gemini-api-key"] as string | undefined;
    const { origen, variedad, proceso, metodo, molino, observaciones, observacionesProceso, feedback } = req.body;

    if (!origen || !proceso || !metodo || !molino) {
      res.status(400).json({ error: "Faltan parámetros obligatorios (origen, proceso, metodo, molino)" });
      return;
    }

    try {
      const ai = getGeminiClient(userApiKey);

      const systemInstruction = `Eres un barista experto en café de especialidad y catador certificado (Q Grader). Tu objetivo es calcular la receta de extracción ideal basada en los parámetros que proporcione el usuario: origen del café, tipo de proceso, método de extracción, modelo de molino (grinder), observaciones o equipamiento especial, y feedback de una preparación anterior. 

Si el usuario ingresa un modelo de molino personalizado o poco común (que no esté en el grupo típico), tu tarea prioritaria es buscar en internet o calcular con precisión las recomendaciones de molienda equivalentes, especificando siempre el NÚMERO DE CLICS, paso, o ajuste numérico del dial recomendado para ese molino específico y ese método de extracción.

Debes responder estrictamente en formato JSON utilizando el esquema proporcionado. El idioma de las respuestas debe ser español. Asegura que todos los textos estén redactados de forma clara, amigable y profesional.`;

      const prompt = `Calcula la receta de café ideal para el siguiente café:
- Origen: ${origen}
${variedad ? `- Variedad: ${variedad}\n` : ""}
- Proceso: ${proceso} ${observacionesProceso ? `(Detalles del proceso: ${observacionesProceso})` : ""}
- Método de extracción: ${metodo}
${observaciones ? `- Observaciones / Equipamiento / Variantes: ${observaciones}\n` : ""}
${feedback ? `- Comentarios/Feedback de una extracción anterior para calibrar y corregir: "${feedback}". Por favor, ajusta los parámetros de esta receta (temperatura, clics de molienda, ratio o vertidos) para solucionar el problema descrito por el usuario.\n` : ""}
- Molino de café del usuario: ${molino}

Utiliza la herramienta de búsqueda de Google para:
1. Identificar el perfil de sabor característico y notas de cata comunes de un café de origen '${origen}'${variedad ? ` de variedad '${variedad}'` : ""} con proceso '${proceso}'${observacionesProceso ? ` y detalles de proceso '${observacionesProceso}'` : ""}.
2. Determinar con máxima precisión el tamaño de molienda recomendado, EXPRESADO EN CLICS o ajuste del dial específico (ej: "24 clics", "Ajuste 6.5", "Paso 12"), para el molino '${molino}' con el método '${metodo}'${observaciones ? ` teniendo en cuenta las observaciones '${observaciones}'` : ""}${feedback ? ` ajustado según el feedback sensorial anterior '${feedback}'` : ""}. Es crucial que si es un molino poco común o personalizado, investigues su correspondencia de clics/marcas numéricas oficiales para filtrados.
3. Determinar el ratio óptimo (por ejemplo, 1:15 o 1:16) y la temperatura ideal del agua (entre 88°C y 95°C) para maximizar la dulzura y acidez limpia de este café${observaciones ? ` (ej: adaptando la receta si indica el uso de cono de cerámica, plástico, variante UFO, o sistema switch / inmersión)` : ""}${feedback ? ` y calibrando según el feedback '${feedback}'` : ""}.
4. Crear una guía de vertidos interactiva detallada paso a paso para el cronómetro de preparación (mínimo 3 pasos, máximo 5 pasos, cubriendo pre-infusión/blooming y vertidos subsiguientes), que sume el total del agua recomendada (típicamente entre 200g y 300g para unos 15g de café). El blooming/pre-infusión debe durar entre 30 y 45 segundos.

Devuelve la información estrictamente en el formato JSON requerido.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metodo: { type: Type.STRING, description: "Método de extracción (ej: V60, Chemex, Aeropress)" },
              temperatura: { type: Type.STRING, description: "Temperatura recomendada en grados Celsius (ej: 92°C)" },
              molienda: { type: Type.STRING, description: "Recomendación específica de molienda para el molino del usuario (ej: '22 clics en Comandante C40' o 'Paso 14 en Baratza Encore')" },
              ratio: { type: Type.STRING, description: "Ratio de extracción ideal (ej: 1:15)" },
              cafeGramos: { type: Type.NUMBER, description: "Gramos de café recomendados (ej: 15)" },
              aguaGramos: { type: Type.NUMBER, description: "Gramos de agua totales recomendados (ej: 225)" },
              tiempoExtraccion: { type: Type.STRING, description: "Tiempo total aproximado de extracción (ej: '2:30 - 3:00 min')" },
              saborPerfil: { type: Type.STRING, description: "Descripción del perfil de sabor que se busca resaltar (ej: 'Resalta notas florales a jazmín y acidez cítrica brillante de lima')" },
              instrucciones: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Instrucciones de preparación paso a paso resumidas"
              },
              pasosCronometro: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tiempoInicio: { type: Type.INTEGER, description: "Segundo exacto en que inicia este paso (desde 0)" },
                    tiempoFin: { type: Type.INTEGER, description: "Segundo exacto en que finaliza este paso" },
                    nombre: { type: Type.STRING, description: "Título breve del paso (ej: Pre-infusión, Primer vertido, Segundo vertido, Filtrado final)" },
                    descripcion: { type: Type.STRING, description: "Qué hacer en este paso detalladamente" },
                    aguaAcumulada: { type: Type.INTEGER, description: "Cantidad total de agua acumulada vertida hasta el final de este paso en gramos" }
                  },
                  required: ["tiempoInicio", "tiempoFin", "nombre", "descripcion", "aguaAcumulada"]
                },
                description: "Pasos ordenados para alimentar el cronómetro interactivo"
              },
              notasBarista: { type: Type.STRING, description: "Consejo especial de barista para esta preparación específica" }
            },
            required: [
              "metodo",
              "temperatura",
              "molienda",
              "ratio",
              "cafeGramos",
              "aguaGramos",
              "tiempoExtraccion",
              "saborPerfil",
              "instrucciones",
              "pasosCronometro",
              "notasBarista"
            ]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No se obtuvo respuesta del modelo");
      }

      const parsedData = JSON.parse(resultText.trim());
      // Return variety inside parsedData so frontend has it
      res.json({ ...parsedData, variedad });
    } catch (apiError: any) {
      console.warn("API Error encountered, falling back to smart local recipe generator:", apiError.message || apiError);
      const fallbackRecipe = generateLocalFallbackRecipe(origen, proceso, metodo, molino, observaciones, observacionesProceso, feedback, variedad);
      res.json(fallbackRecipe);
    }
  } catch (error: any) {
    console.error("General error generating recipe:", error);
    res.status(500).json({ error: error.message || "Error al procesar la solicitud de receta" });
  }
});

// Setup Vite development server or static production asset serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
