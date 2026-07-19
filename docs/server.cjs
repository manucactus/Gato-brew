var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3001;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient(customApiKey) {
  if (customApiKey && customApiKey.trim() !== "") {
    return new import_genai.GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
function generateLocalFallbackRecipe(origen, proceso, metodo, molino, observaciones, observacionesProceso, feedback, variedad) {
  const normOrigen = origen.toLowerCase().trim();
  const normProceso = proceso.toLowerCase().trim();
  const normMetodo = metodo.toLowerCase().trim();
  const normMolino = molino.toLowerCase().trim();
  const normObservaciones = observaciones ? observaciones.toLowerCase().trim() : "";
  const normObsProceso = observacionesProceso ? observacionesProceso.toLowerCase().trim() : "";
  let ratio = "1:15";
  let cafeGramos = 15;
  let aguaGramos = 225;
  let tiempoExtraccion = "2:30 - 3:00 min";
  let temperatura = "92\xB0C";
  if (normProceso.includes("natural") || normProceso.includes("anaer")) {
    temperatura = "91\xB0C";
  } else if (normProceso.includes("lavado") || normProceso.includes("washed")) {
    temperatura = "93\xB0C";
  } else if (normProceso.includes("honey")) {
    temperatura = "92\xB0C";
  }
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
  if (feedback) {
    const normFeedback = feedback.toLowerCase();
    if (normFeedback.includes("amarg") || normFeedback.includes("fuerte") || normFeedback.includes("seco")) {
      temperatura = parseInt(temperatura) - 2 + "\xB0C";
      if (ratio === "1:15") ratio = "1:16";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    } else if (normFeedback.includes("acid") || normFeedback.includes("agri") || normFeedback.includes("suave") || normFeedback.includes("aguad")) {
      temperatura = Math.min(95, parseInt(temperatura) + 1) + "\xB0C";
      if (ratio === "1:15") ratio = "1:14.5";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    }
  }
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
  } else if (normMolino.includes("mahlk\xF6nig") || normMolino.includes("x54")) {
    if (normMetodo.includes("v60")) molienda = "Paso 10 en Mahlk\xF6nig X54";
    else if (normMetodo.includes("chemex")) molienda = "Paso 13 en Mahlk\xF6nig X54";
    else if (normMetodo.includes("aeropress")) molienda = "Paso 8 en Mahlk\xF6nig X54";
    else if (normMetodo.includes("prensa")) molienda = "Paso 16 en Mahlk\xF6nig X54";
    else if (normMetodo.includes("espresso")) molienda = "Paso 4 en Mahlk\xF6nig X54";
    else molienda = "Paso 10 en Mahlk\xF6nig X54";
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
      molienda = `~18 - 22 clics (configuraci\xF3n media est\xE1ndar) en tu molino '${grinderName}'`;
    }
  }
  let saborPerfil = `Resalta un perfil sumamente equilibrado con sutil dulzor a caramelo, acidez balanceada de frutas maduras y notas achocolatadas de fondo.`;
  if (normOrigen.includes("etiop") || normOrigen.includes("ethiop")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Explosi\xF3n frutal intensa y ex\xF3tica. Notas dominantes de ar\xE1ndanos frescos, mermelada de frambuesas silvestres, t\xE9 de jazm\xEDn y una dulzura almibarada con un toque de chocolate con leche.";
    } else {
      saborPerfil = "Perfil sumamente elegante, floral y cristalino. Notas limpias a t\xE9 de jazm\xEDn blanco, bergamota fresca, lim\xF3n amarillo dulce y un cuerpo sedoso de acidez c\xEDtrica brillante.";
    }
  } else if (normOrigen.includes("colomb")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Complejo y audaz. Notas fermentadas de maracuy\xE1, cereza negra madura, licor de cacao, acidez l\xE1ctica/m\xE1lica vibrante y cuerpo untuoso muy estructurado.";
    } else {
      saborPerfil = "El cl\xE1sico balance del barista colombiano. Notas exquisitas de caramelo tostado, vainilla, manzana roja fresca, con un cuerpo cremoso y una dulzura persistente y limpia.";
    }
  } else if (normOrigen.includes("brasil") || normOrigen.includes("brazil")) {
    saborPerfil = "Cuerpo denso, untuoso y reconfortante. Notas de cacao oscuro, avellanas tostadas, almendras, baja acidez c\xEDtrica y una dulzura pesada que recuerda al az\xFAcar de ca\xF1a.";
  } else if (normOrigen.includes("ken") || normOrigen.includes("quenia")) {
    saborPerfil = "Acidez jugosa, intensa y brillante. Notas distintivas de grosellas negras, moras de zarza, t\xE9 de hibisco y un retrogusto sumamente limpio y dulce a toronja rosa.";
  } else if (normOrigen.includes("costa") || normOrigen.includes("guate") || normOrigen.includes("hondur") || normOrigen.includes("salvador")) {
    saborPerfil = "Perfil balanceado, noble y dulce. Notas florales sutiles, acidez limpia de durazno o manzana verde, y un final largo a miel de ca\xF1a y chocolate con leche.";
  } else {
    const origName = origen.charAt(0).toUpperCase() + origen.slice(1);
    saborPerfil = `Perfil enfocado en resaltar la identidad del terroir de ${origName}. Notas limpias y equilibradas con dulzor de fruta, cuerpo balanceado y acidez refinada caracter\xEDstica del grano.`;
  }
  let instrucciones = [];
  let pasosCronometro = [];
  let notasBarista = "";
  if (normMetodo.includes("v60") || normMetodo.includes("goteo") || !normMetodo.includes("aeropress") && !normMetodo.includes("prensa") && !normMetodo.includes("espresso") && !normMetodo.includes("chemex")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer") || normObsProceso.includes("ferment") || normObservaciones.includes("kasuya") || normObservaciones.includes("4:6")) {
      const bloom = Math.round(aguaGramos * 0.22);
      const p2 = Math.round(aguaGramos * 0.18);
      const p3 = Math.round(aguaGramos * 0.2);
      const p4 = Math.round(aguaGramos * 0.2);
      const p5 = aguaGramos - (bloom + p2 + p3 + p4);
      instrucciones = [
        `M\xE9todo 4:6 de Tetsu Kasuya: Divide los vertidos para ajustar dulzura y cuerpo. Vierte ${bloom}g de agua en espiral lenta para el blooming. Espera 45 segundos.`,
        `Realiza el segundo vertido de ${p2}g de agua (acumulado: ${bloom + p2}g). Este vertido define el dulzor \xF3ptimo para procesos de fermentaci\xF3n larga o naturales.`,
        `Tercer vertido de ${p3}g (acumulado: ${bloom + p2 + p3}g) a los 1:30 minutos para empezar a estructurar la fuerza y balance del cuerpo.`,
        `Cuarto vertido de ${p4}g (acumulado: ${bloom + p2 + p3 + p4}g) a los 2:15 minutos para consolidar el cuerpo untuoso.`,
        `Realiza el \xFAltimo vertido de ${p5}g para completar los ${aguaGramos}g totales. Deja escurrir hasta el final.`
      ];
      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 45,
          nombre: "1er Vertido: Pre-infusi\xF3n (4:6 Kasuya)",
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
          descripcion: `Vierte suavemente en c\xEDrculos conc\xE9ntricos ${p3}g de agua adicionales (total: ${bloom + p2 + p3}g).`,
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
          nombre: "5to Vertido: Extracci\xF3n Final",
          descripcion: `Vierte el remanente de ${p5}g de agua (total: ${aguaGramos}g). Deja filtrar por completo.`,
          aguaAcumulada: aguaGramos
        }
      ];
      notasBarista = `El M\xE9todo 4:6 de Tetsu Kasuya es perfecto para resaltar la inmensa dulzura y notas ex\xF3ticas de este caf\xE9 de proceso ${proceso}. Mant\xE9n los vertidos separados de forma estricta cada 45 segundos para controlar perfectamente la extracci\xF3n.`;
    } else {
      const bloom = Math.round(aguaGramos * 0.2);
      const firstPour = Math.round((aguaGramos - bloom) * 0.5) + bloom;
      const finalPour = aguaGramos;
      instrucciones = [
        `M\xE9todo James Hoffmann V60: Vierte ${bloom}g de agua de forma agresiva para mojar toda la cama de caf\xE9 uniformemente. Realiza un leve giro ('swirl') a la jarra y espera 45 segundos.`,
        `Vierte en espiral continua y r\xE1pida hasta alcanzar los ${firstPour}g de agua a los 1:15 min. Este vertido r\xE1pido crea agitaci\xF3n id\xF3nea para maximizar acidez y claridad.`,
        `Vierte lentamente en c\xEDrculos peque\xF1os en el centro hasta completar los ${finalPour}g totales a los 1:45 min.`,
        `Remueve suavemente con una cuchara en c\xEDrculos una vez, realiza un giro ('swirl') suave al cono y deja escurrir por completo hasta los 3 minutos.`
      ];
      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 45,
          nombre: "Pre-infusi\xF3n y Agitaci\xF3n (Blooming)",
          descripcion: `Vierte ${bloom}g de agua r\xE1pidamente. Realiza un suave giro de cono para asegurar una humectaci\xF3n completa de la cama de caf\xE9.`,
          aguaAcumulada: bloom
        },
        {
          tiempoInicio: 45,
          tiempoFin: 75,
          nombre: "Vertido Principal R\xE1pido",
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
          nombre: "Filtraci\xF3n y Swirl de Cama Plana",
          descripcion: "Da un giro suave ('swirl') al portafiltros completo. Deja escurrir. Esto alinea las part\xEDculas de caf\xE9 para una cama perfectamente plana.",
          aguaAcumulada: finalPour
        }
      ];
      notasBarista = `El m\xE9todo de James Hoffmann maximiza la claridad y el balance de acidez y dulzor del caf\xE9 de proceso ${proceso}. El swirl al inicio y al final evita que el caf\xE9 se adhiera a las paredes del papel de filtro.`;
    }
  } else if (normMetodo.includes("chemex")) {
    const bloom = Math.round(aguaGramos * 0.18);
    const pour1 = Math.round((aguaGramos - bloom) * 0.5) + bloom;
    const pour2 = aguaGramos;
    instrucciones = [
      `Enjuaga bien el filtro grueso de Chemex con agua caliente. A\xF1ade el caf\xE9 y vierte ${bloom}g de agua lenta y uniformemente. Deja pre-infundir por 45 segundos completos para abrir la estructura arom\xE1tica.`,
      `Primer vertido lento en espiral: Vierte suavemente de manera conc\xE9ntrica evitando tocar las paredes del papel, elevando el nivel de agua hasta los ${pour1}g.`,
      `Segundo vertido final: Espera a que baje el nivel a la mitad, luego vierte despacio en el centro hasta los ${pour2}g de agua totales.`,
      `Realiza un movimiento circular suave de la Chemex entera para asentar la cama y espera a que filtre en su totalidad.`
    ];
    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 45,
        nombre: "Blooming Prolongado en Chemex",
        descripcion: `Vierte ${bloom}g de agua caliente y haz movimientos circulares suaves. Deja que el caf\xE9 libere los gases atrapados por completo.`,
        aguaAcumulada: bloom
      },
      {
        tiempoInicio: 45,
        tiempoFin: 110,
        nombre: "Primer Vertido de Cuerpo",
        descripcion: `Vierte en c\xEDrculos lentos y elegantes ${pour1 - bloom}g de agua (total: ${pour1}g). Mant\xE9n el flujo suspendido pero constante.`,
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
        descripcion: "Sost\xE9n la Chemex por el cuello de madera, dale un sutil giro circular para decantar finos y deja colar. Ver\xE1s una extracci\xF3n cristalina.",
        aguaAcumulada: pour2
      }
    ];
    notasBarista = `El filtro grueso patentado de Chemex atrapa todos los sedimentos y aceites pesados. Este vertido lento te dar\xE1 una taza s\xFAper limpia, con brillo de acidez similar al t\xE9 y una dulzura impecable.`;
  } else if (normMetodo.includes("aeropress")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer") || normObsProceso.includes("ferment")) {
      instrucciones = [
        `Posici\xF3n Invertida: Prepara la Aeropress de forma invertida para evitar goteos prematuros. A\xF1ade los ${cafeGramos}g de caf\xE9.`,
        `Pre-infusi\xF3n explosiva: Vierte ${Math.round(aguaGramos * 0.3)}g de agua caliente a ${temperatura}, agita en\xE9rgicamente con la esp\xE1tula durante 10 segundos y deja reposar por 30 segundos.`,
        `Segundo vertido de infusi\xF3n: A\xF1ade el agua restante hasta completar los ${aguaGramos}g totales. Coloca el portafiltros enroscado firmemente con papel filtro doble previamente purgado.`,
        `Giro y Presi\xF3n: A los 1:20 minutos, gira la cafetera con cuidado sobre la taza. Presiona el \xE9mbolo con la fuerza de tu antebrazo de forma constante por exactamente 30 segundos.`
      ];
      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 30,
          nombre: "Blooming Explosivo (Invertido)",
          descripcion: `Vierte ${Math.round(aguaGramos * 0.3)}g de agua, remueve vigorosamente por 10 segundos enteros con la esp\xE1tula.`,
          aguaAcumulada: Math.round(aguaGramos * 0.3)
        },
        {
          tiempoInicio: 30,
          tiempoFin: 75,
          nombre: "Vertido de Infusi\xF3n Completa",
          descripcion: `Completa los ${aguaGramos}g totales de agua. Coloca y enrosca el portafiltros con papel filtro humedecido.`,
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 75,
          tiempoFin: 105,
          nombre: "Volteo y Presi\xF3n Constant",
          descripcion: "Gira la Aeropress con agilidad sobre tu taza y presiona el \xE9mbolo de forma lenta y firme. Hazlo durar exactamente 30 segundos.",
          aguaAcumulada: aguaGramos
        }
      ];
      notasBarista = `La posici\xF3n invertida y el uso de filtro de papel de alta densidad resalta al m\xE1ximo las notas a frutas ex\xF3ticas de tu caf\xE9 sin dejar pasar sedimentos. No presiones hasta el fondo absoluto para evitar amargor no deseado.`;
    } else {
      instrucciones = [
        `Posici\xF3n Est\xE1ndar: Coloca el filtro enjuagado, a\xF1ade los ${cafeGramos}g de caf\xE9 y col\xF3calo sobre tu taza.`,
        `Vierte agua r\xE1pidamente a ${temperatura} hasta alcanzar los ${aguaGramos}g de agua en total.`,
        `Remueve suave y continuamente con la paleta de agitaci\xF3n durante 15 segundos para acelerar la extracci\xF3n balanceada de az\xFAcares.`,
        `Coloca el \xE9mbolo un cent\xEDmetro para hacer un sello de vac\xEDo herm\xE9tico, espera 20 segundos y presiona lentamente durante 30 segundos.`
      ];
      pasosCronometro = [
        {
          tiempoInicio: 0,
          tiempoFin: 25,
          nombre: "Vertido R\xE1pido y Agitaci\xF3n",
          descripcion: `Vierte la totalidad de los ${aguaGramos}g de agua caliente y agita suavemente para homogeneizar la mezcla.`,
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 25,
          tiempoFin: 65,
          nombre: "Vac\xEDo e Infusi\xF3n Corta",
          descripcion: "Coloca el \xE9mbolo ligeramente para retener el agua en la c\xE1mara. Deja reposar de forma est\xE1tica.",
          aguaAcumulada: aguaGramos
        },
        {
          tiempoInicio: 65,
          tiempoFin: 95,
          nombre: "Presi\xF3n Controlada",
          descripcion: "Empuja el \xE9mbolo con calma y suavidad hasta el fondo. Det\xE9n la extracci\xF3n en cuanto escuches el silbido de aire.",
          aguaAcumulada: aguaGramos
        }
      ];
      notasBarista = `La receta de Alan Adler utiliza temperaturas moderadas para garantizar una taza libre de amargor. Al remover activamente compensamos la temperatura logrando una dulzura similar a la miel de ca\xF1a.`;
    }
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    instrucciones = [
      `M\xE9todo James Hoffmann de Prensa: Coloca los ${cafeGramos}g de caf\xE9 en grano grueso. Vierte r\xE1pidamente la totalidad de los ${aguaGramos}g de agua hirviendo cubriendo todo el caf\xE9. No coloques la tapa. Dejar reposar 4 minutos enteros.`,
      `Al minuto 4:00, notar\xE1s una costra de caf\xE9 flotando en la superficie. Usa una cuchara para romperla y agitarla una vez. El caf\xE9 caer\xE1 al fondo.`,
      `Usa una o dos cucharas para retirar la espuma marr\xF3n y las part\xEDculas de caf\xE9 flotantes de la superficie. Esto purifica el perfil de sabor de la taza.`,
      `Coloca la tapa con el \xE9mbolo, pero NO lo presiones hasta abajo. Espera 3 minutos m\xE1s (minuto 7:00 en total) para que los finos decanten de forma natural por gravedad.`,
      `Sirve el caf\xE9 lentamente por decantaci\xF3n a trav\xE9s del filtro de metal, sin revolver ni perturbar el sedimento del fondo.`
    ];
    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 240,
        nombre: "Infusi\xF3n Est\xE1tica y Costra",
        descripcion: `Vierte los ${aguaGramos}g de agua de un solo golpe. Deja reposar por 4 minutos sin tocar la cafetera. Se formar\xE1 una costra arom\xE1tica en la parte superior.`,
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 240,
        tiempoFin: 300,
        nombre: "Romper Costra y Limpieza",
        descripcion: "Rompe la costra superficial con una cuchara. Remueve la espuma clara y las part\xEDculas que flotan para obtener un sabor limpio.",
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 300,
        tiempoFin: 420,
        nombre: "Decantaci\xF3n de Finos",
        descripcion: "Coloca la tapa con el filtro tocando apenas el nivel de l\xEDquido. \xA1NO PRESIONES! Deja reposar por 2 minutos adicionales para decantar el sedimento.",
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 420,
        tiempoFin: 450,
        nombre: "Servido Lento por Decantaci\xF3n",
        descripcion: "Vierte lentamente el caf\xE9 en tu taza o servidor sin perturbar el fondo de la prensa. Disfruta un cuerpo denso pero libre de lodos.",
        aguaAcumulada: aguaGramos
      }
    ];
    notasBarista = `El m\xE9todo de James Hoffmann para prensa francesa revoluciona el sabor al evitar presionar f\xEDsicamente el caf\xE9. Esto disminuye la turbidez, d\xE1ndote un cuerpo voluptuoso espectacularmente limpio y arom\xE1tico.`;
  } else if (normMetodo.includes("espresso") || normMetodo.includes("expreso")) {
    instrucciones = [
      `Prepara y distribuye con precisi\xF3n los ${cafeGramos}g de caf\xE9 finamente molido en tu portafiltro doble. Realiza una nivelaci\xF3n y prensado perfectamente plano.`,
      `Purga la cabeza del grupo de la m\xE1quina de espresso para limpiar residuos de agua estancada caliente.`,
      `Inserta el portafiltro y activa inmediatamente la bomba. Inicia el cron\xF3metro.`,
      `Extrae un total de ${aguaGramos}g de espresso l\xEDquido concentrado en taza en un lapso \xF3ptimo de 25 a 30 segundos.`
    ];
    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 7,
        nombre: "Pre-infusi\xF3n a Baja Presi\xF3n",
        descripcion: "Activaci\xF3n inicial. El agua moja suavemente la pastilla de caf\xE9 a baja presi\xF3n.",
        aguaAcumulada: 5
      },
      {
        tiempoInicio: 7,
        tiempoFin: 28,
        nombre: "Erogaci\xF3n a Alta Presi\xF3n (9 Bares)",
        descripcion: "Flujo continuo de color avellana y crema espesa. La bomba opera a presi\xF3n plena de extracci\xF3n.",
        aguaAcumulada: aguaGramos
      }
    ];
    notasBarista = `Para esta extracci\xF3n de espresso con proceso ${proceso}, mant\xE9n la presi\xF3n del tampeado estable. Si el flujo es muy r\xE1pido y el sabor es agrio, muele un clic m\xE1s fino. Si gotea lento y se amarga, abre un clic de molienda.`;
  } else {
    const bloom = Math.round(aguaGramos * 0.2);
    const p1 = Math.round((aguaGramos - bloom) * 0.5) + bloom;
    instrucciones = [
      `Vierte lenta y uniformemente ${bloom}g de agua sobre la cama de caf\xE9 molido. Deja reposar por 35 segundos para una pre-infusi\xF3n ideal.`,
      `Primer vertido principal: Vierte en c\xEDrculos continuos de adentro hacia afuera hasta alcanzar los ${p1}g en total.`,
      `Segundo vertido final: Sube suavemente el nivel de agua vertiendo en el centro hasta los ${aguaGramos}g de agua totales de la receta.`,
      `Realiza un movimiento circular suave al cono de goteo y deja filtrar en su totalidad.`
    ];
    pasosCronometro = [
      {
        tiempoInicio: 0,
        tiempoFin: 35,
        nombre: "Pre-infusi\xF3n de Balance",
        descripcion: `Pre-infunde con ${bloom}g de agua de forma homog\xE9nea para liberar compuestos arom\xE1ticos primarios.`,
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
        descripcion: `Completa los ${aguaGramos}g de agua totales vertiendo suavemente en c\xEDrculos conc\xE9ntricos.`,
        aguaAcumulada: aguaGramos
      },
      {
        tiempoInicio: 135,
        tiempoFin: 180,
        nombre: "Filtraci\xF3n Final",
        descripcion: "Deja escurrir el agua de filtraci\xF3n. Remueve suavemente el cono.",
        aguaAcumulada: aguaGramos
      }
    ];
    notasBarista = `Esta receta cl\xE1sica local est\xE1 ajustada para balancear la dulzura y el cuerpo del origen ${origen} con proceso ${proceso}. Mant\xE9n un flujo de agua pausado y constante.`;
  }
  let finalNotasBarista = notasBarista;
  if (observaciones) {
    finalNotasBarista += `

[Nota del Barista sobre tus observaciones]: Hemos adaptado las recomendaciones locales considerando tus indicaciones adicionales: "${observaciones}".`;
  }
  if (observacionesProceso) {
    finalNotasBarista += `

[Nota del Barista sobre el proceso]: Tomamos en cuenta los detalles de fermentaci\xF3n/proceso: "${observacionesProceso}".`;
  }
  if (feedback) {
    finalNotasBarista += `

[Nota del Barista sobre calibraci\xF3n]: Tomamos en cuenta tu cata anterior ("${feedback}"). Ajustamos sutilmente el ratio/temperatura para solucionar inconvenientes de extracci\xF3n. Si sentiste amargor, reduce la temperatura o aumenta un clic de molienda. Si sentiste acidez agria, aumenta la temperatura o reduce un clic.`;
  }
  return {
    metodo,
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
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const userApiKey = req.headers["x-gemini-api-key"];
    const { origen, variedad, proceso, metodo, molino, observaciones, observacionesProceso, feedback } = req.body;
    if (!origen || !proceso || !metodo || !molino) {
      res.status(400).json({ error: "Faltan par\xE1metros obligatorios (origen, proceso, metodo, molino)" });
      return;
    }
    try {
      const ai = getGeminiClient(userApiKey);
      const systemInstruction = `Eres un barista experto en caf\xE9 de especialidad y catador certificado (Q Grader). Tu objetivo es calcular la receta de extracci\xF3n ideal basada en los par\xE1metros que proporcione el usuario: origen del caf\xE9, tipo de proceso, m\xE9todo de extracci\xF3n, modelo de molino (grinder), observaciones o equipamiento especial, y feedback de una preparaci\xF3n anterior. 

Si el usuario ingresa un modelo de molino personalizado o poco com\xFAn (que no est\xE9 en el grupo t\xEDpico), tu tarea prioritaria es buscar en internet o calcular con precisi\xF3n las recomendaciones de molienda equivalentes, especificando siempre el N\xDAMERO DE CLICS, paso, o ajuste num\xE9rico del dial recomendado para ese molino espec\xEDfico y ese m\xE9todo de extracci\xF3n.

Debes responder estrictamente en formato JSON utilizando el esquema proporcionado. El idioma de las respuestas debe ser espa\xF1ol. Asegura que todos los textos est\xE9n redactados de forma clara, amigable y profesional.`;
      const prompt = `Calcula la receta de caf\xE9 ideal para el siguiente caf\xE9:
- Origen: ${origen}
${variedad ? `- Variedad: ${variedad}
` : ""}
- Proceso: ${proceso} ${observacionesProceso ? `(Detalles del proceso: ${observacionesProceso})` : ""}
- M\xE9todo de extracci\xF3n: ${metodo}
${observaciones ? `- Observaciones / Equipamiento / Variantes: ${observaciones}
` : ""}
${feedback ? `- Comentarios/Feedback de una extracci\xF3n anterior para calibrar y corregir: "${feedback}". Por favor, ajusta los par\xE1metros de esta receta (temperatura, clics de molienda, ratio o vertidos) para solucionar el problema descrito por el usuario.
` : ""}
- Molino de caf\xE9 del usuario: ${molino}

Utiliza la herramienta de b\xFAsqueda de Google para:
1. Identificar el perfil de sabor caracter\xEDstico y notas de cata comunes de un caf\xE9 de origen '${origen}'${variedad ? ` de variedad '${variedad}'` : ""} con proceso '${proceso}'${observacionesProceso ? ` y detalles de proceso '${observacionesProceso}'` : ""}.
2. Determinar con m\xE1xima precisi\xF3n el tama\xF1o de molienda recomendado, EXPRESADO EN CLICS o ajuste del dial espec\xEDfico (ej: "24 clics", "Ajuste 6.5", "Paso 12"), para el molino '${molino}' con el m\xE9todo '${metodo}'${observaciones ? ` teniendo en cuenta las observaciones '${observaciones}'` : ""}${feedback ? ` ajustado seg\xFAn el feedback sensorial anterior '${feedback}'` : ""}. Es crucial que si es un molino poco com\xFAn o personalizado, investigues su correspondencia de clics/marcas num\xE9ricas oficiales para filtrados.
3. Determinar el ratio \xF3ptimo (por ejemplo, 1:15 o 1:16) y la temperatura ideal del agua (entre 88\xB0C y 95\xB0C) para maximizar la dulzura y acidez limpia de este caf\xE9${observaciones ? ` (ej: adaptando la receta si indica el uso de cono de cer\xE1mica, pl\xE1stico, variante UFO, o sistema switch / inmersi\xF3n)` : ""}${feedback ? ` y calibrando seg\xFAn el feedback '${feedback}'` : ""}.
4. Crear una gu\xEDa de vertidos interactiva detallada paso a paso para el cron\xF3metro de preparaci\xF3n (m\xEDnimo 3 pasos, m\xE1ximo 5 pasos, cubriendo pre-infusi\xF3n/blooming y vertidos subsiguientes), que sume el total del agua recomendada (t\xEDpicamente entre 200g y 300g para unos 15g de caf\xE9). El blooming/pre-infusi\xF3n debe durar entre 30 y 45 segundos.

Devuelve la informaci\xF3n estrictamente en el formato JSON requerido.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              metodo: { type: import_genai.Type.STRING, description: "M\xE9todo de extracci\xF3n (ej: V60, Chemex, Aeropress)" },
              temperatura: { type: import_genai.Type.STRING, description: "Temperatura recomendada en grados Celsius (ej: 92\xB0C)" },
              molienda: { type: import_genai.Type.STRING, description: "Recomendaci\xF3n espec\xEDfica de molienda para el molino del usuario (ej: '22 clics en Comandante C40' o 'Paso 14 en Baratza Encore')" },
              ratio: { type: import_genai.Type.STRING, description: "Ratio de extracci\xF3n ideal (ej: 1:15)" },
              cafeGramos: { type: import_genai.Type.NUMBER, description: "Gramos de caf\xE9 recomendados (ej: 15)" },
              aguaGramos: { type: import_genai.Type.NUMBER, description: "Gramos de agua totales recomendados (ej: 225)" },
              tiempoExtraccion: { type: import_genai.Type.STRING, description: "Tiempo total aproximado de extracci\xF3n (ej: '2:30 - 3:00 min')" },
              saborPerfil: { type: import_genai.Type.STRING, description: "Descripci\xF3n del perfil de sabor que se busca resaltar (ej: 'Resalta notas florales a jazm\xEDn y acidez c\xEDtrica brillante de lima')" },
              instrucciones: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Instrucciones de preparaci\xF3n paso a paso resumidas"
              },
              pasosCronometro: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    tiempoInicio: { type: import_genai.Type.INTEGER, description: "Segundo exacto en que inicia este paso (desde 0)" },
                    tiempoFin: { type: import_genai.Type.INTEGER, description: "Segundo exacto en que finaliza este paso" },
                    nombre: { type: import_genai.Type.STRING, description: "T\xEDtulo breve del paso (ej: Pre-infusi\xF3n, Primer vertido, Segundo vertido, Filtrado final)" },
                    descripcion: { type: import_genai.Type.STRING, description: "Qu\xE9 hacer en este paso detalladamente" },
                    aguaAcumulada: { type: import_genai.Type.INTEGER, description: "Cantidad total de agua acumulada vertida hasta el final de este paso en gramos" }
                  },
                  required: ["tiempoInicio", "tiempoFin", "nombre", "descripcion", "aguaAcumulada"]
                },
                description: "Pasos ordenados para alimentar el cron\xF3metro interactivo"
              },
              notasBarista: { type: import_genai.Type.STRING, description: "Consejo especial de barista para esta preparaci\xF3n espec\xEDfica" }
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
      res.json({ ...parsedData, variedad });
    } catch (apiError) {
      console.warn("API Error encountered, falling back to smart local recipe generator:", apiError.message || apiError);
      const fallbackRecipe = generateLocalFallbackRecipe(origen, proceso, metodo, molino, observaciones, observacionesProceso, feedback, variedad);
      res.json(fallbackRecipe);
    }
  } catch (error) {
    console.error("General error generating recipe:", error);
    res.status(500).json({ error: error.message || "Error al procesar la solicitud de receta" });
  }
});
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer();
//# sourceMappingURL=server.cjs.map
