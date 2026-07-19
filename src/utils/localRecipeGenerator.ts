// Motor de generación de recetas de café local para ejecución estática sin servidor (ej: GitHub Pages)
import { RecetaCafe } from "../types";

export function generateLocalFallbackRecipe(
  origen: string, 
  proceso: string, 
  metodo: string, 
  molino: string, 
  observaciones?: string,
  observacionesProceso?: string,
  feedback?: string,
  variedad?: string
): Omit<RecetaCafe, "id" | "fecha" | "notasPersonales"> & { isFallback: boolean } {
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
      temperatura = (parseInt(temperatura) - 2) + "°C";
      if (ratio === "1:15") ratio = "1:16";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    } else if (normFeedback.includes("acid") || normFeedback.includes("agri") || normFeedback.includes("suave") || normFeedback.includes("aguad")) {
      temperatura = Math.min(95, parseInt(temperatura) + 1) + "°C";
      if (ratio === "1:15") ratio = "1:14.5";
      aguaGramos = Math.round(cafeGramos * (parseFloat(ratio.split(":")[1]) || 15));
    }
  }

  // 2. Grinder settings
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
  } else {
    const grinderName = molino.trim();
    if (normMetodo.includes("v60")) molienda = `~18 - 22 clics (molienda media-fina) en tu molino '${grinderName}'`;
    else if (normMetodo.includes("chemex")) molienda = `~24 - 28 clics (molienda media-gruesa) en tu molino '${grinderName}'`;
    else if (normMetodo.includes("aeropress")) molienda = `~14 - 16 clics (molienda fina-media) en tu molino '${grinderName}'`;
    else if (normMetodo.includes("prensa")) molienda = `~28 - 32 clics (molienda gruesa) en tu molino '${grinderName}'`;
    else if (normMetodo.includes("espresso")) molienda = `~8 - 12 clics (molienda fina de espresso) en tu molino '${grinderName}'`;
    else molienda = `~18 - 22 clics (molienda media) en tu molino '${grinderName}'`;
  }

  // 3. Taste profiles
  let saborPerfil = `Resalta un perfil sumamente equilibrado con sutil dulzor a caramelo, acidez balanceada de frutas maduras y notas achocolatadas de fondo.`;
  if (normOrigen.includes("etiop") || normOrigen.includes("ethiop")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Explosión frutal intensa y exótica. Notas dominantes de arándanos frescos, mermelada de frambuesas silvestres, té de jazmín y una dulzura almibarada con un toque de chocolate con leche.";
    } else {
      saborPerfil = "Perfil sumamente elegante, floral y cristalino. Notas limpias a té de jazmín blanco, bergamota fresca, limón amarillo dulce y un cuerpo sedoso de acidez cítrica brillante.";
    }
  } else if (normOrigen.includes("colomb")) {
    if (normProceso.includes("natural") || normProceso.includes("anaer")) {
      saborPerfil = "Complejo y audaz. Notas fermentadas de maracuyá, cereza negra madura, licor de cacao, acidez láctica/málica vibrante y cuerpo untuoso muy structured.";
    } else {
      saborPerfil = "El clásico balance del barista colombiano. Notas exquisitas de caramelo tostado, vainilla, manzana roja fresca, con un cuerpo cremoso y una dulzura persistente y limpia.";
    }
  } else if (normOrigen.includes("brasil") || normOrigen.includes("brazil")) {
    saborPerfil = "Cuerpo denso, untuoso y reconfortante. Notas de cacao oscuro, avellanas tostadas, almendras, baja acidez cítrica y una dulzura pesada que recuerda al azúcar de caña.";
  } else if (normOrigen.includes("ken") || normOrigen.includes("quenia")) {
    saborPerfil = "Acidez jugosa, intensa y brillante. Notas distintivas de grosellas negras, moras de zarza, té de hibisco y un retrogusto sumamente limpio y dulce a toronja rosa.";
  } else {
    const origName = origen.charAt(0).toUpperCase() + origen.slice(1);
    saborPerfil = `Perfil enfocado en resaltar la identidad del terroir de ${origName}. Notas limpias y equilibradas con dulzor de fruta, cuerpo balanceado y acidez refinada característica del grano.`;
  }

  // 4. Instructions and timer
  let instrucciones: string[] = [];
  let pasosCronometro: any[] = [];
  let notasBarista = "";

  if (normMetodo.includes("v60") || normMetodo.includes("goteo") || (!normMetodo.includes("aeropress") && !normMetodo.includes("prensa") && !normMetodo.includes("espresso") && !normMetodo.includes("chemex"))) {
    if (normProceso.includes("natural") || normProceso.includes("anaer") || normObservaciones.includes("kasuya")) {
      const bloom = Math.round(aguaGramos * 0.22);
      const p2 = Math.round(aguaGramos * 0.18);
      const p3 = Math.round(aguaGramos * 0.20);
      const p4 = Math.round(aguaGramos * 0.20);
      const p5 = aguaGramos - (bloom + p2 + p3 + p4);

      instrucciones = [
        `Método 4:6 de Tetsu Kasuya: Vierte ${bloom}g de agua en espiral lenta para el blooming. Espera 45 segundos.`,
        `Realiza el segundo vertido de ${p2}g de agua (acumulado: ${bloom + p2}g). Este vertido define el dulzor ideal.`,
        `Tercer vertido de ${p3}g (acumulado: ${bloom + p2 + p3}g) a los 1:30 minutos para estructurar el cuerpo.`,
        `Cuarto vertido de ${p4}g (acumulado: ${bloom + p2 + p3 + p4}g) a los 2:15 minutos.`,
        `Realiza el último vertido de ${p5}g para completar los ${aguaGramos}g totales. Deja filtrar.`
      ];

      pasosCronometro = [
        { tiempoInicio: 0, tiempoFin: 45, nombre: "1er Vertido: Pre-infusión", descripcion: `Vierte lentamente ${bloom}g de agua.`, aguaAcumulada: bloom },
        { tiempoInicio: 45, tiempoFin: 90, nombre: "2do Vertido (Dulzura)", descripcion: `Vierte en espiral hasta llegar a ${bloom + p2}g.`, aguaAcumulada: bloom + p2 },
        { tiempoInicio: 90, tiempoFin: 135, nombre: "3er Vertido (Cuerpo)", descripcion: `Vierte suavemente en círculos concéntricos ${p3}g más.`, aguaAcumulada: bloom + p2 + p3 },
        { tiempoInicio: 135, tiempoFin: 180, nombre: "4to Vertido (Balance)", descripcion: `Vierte ${p4}g de forma constante.`, aguaAcumulada: bloom + p2 + p3 + p4 },
        { tiempoInicio: 180, tiempoFin: 220, nombre: "5to Vertido: Extracción Final", descripcion: `Vierte el remanente de ${p5}g de agua (total: ${aguaGramos}g).`, aguaAcumulada: aguaGramos }
      ];

      notasBarista = `El Método 4:6 es perfecto para resaltar la dulzura de los cafés naturales de origen ${origen}. Separa los vertidos estrictamente cada 45s.`;
    } else {
      const bloom = Math.round(aguaGramos * 0.20);
      const firstPour = Math.round((aguaGramos - bloom) * 0.5) + bloom;
      const finalPour = aguaGramos;

      instrucciones = [
        `Método James Hoffmann V60: Vierte ${bloom}g de agua de forma alegre. Realiza un leve giro ('swirl') y espera 45 segundos.`,
        `Vierte en espiral continua y rápida hasta alcanzar los ${firstPour}g de agua a los 1:15 min.`,
        `Vierte lentamente en círculos pequeños en el centro hasta completar los ${finalPour}g totales a los 1:45 min.`,
        `Remueve suavemente una vez, realiza un giro ('swirl') suave al cono y deja escurrir.`
      ];

      pasosCronometro = [
        { tiempoInicio: 0, tiempoFin: 45, nombre: "Pre-infusión (Blooming)", descripcion: `Vierte ${bloom}g. Dale un suave giro para humectar todo de forma uniforme.`, aguaAcumulada: bloom },
        { tiempoInicio: 45, tiempoFin: 75, nombre: "Vertido Principal Rápido", descripcion: `Vierte con flujo alegre hasta llegar a ${firstPour}g.`, aguaAcumulada: firstPour },
        { tiempoInicio: 75, tiempoFin: 105, nombre: "Vertido Central Lento", descripcion: `Reduce el flujo y vierte despacio en el centro hasta completar los ${finalPour}g.`, aguaAcumulada: finalPour },
        { tiempoInicio: 105, tiempoFin: 180, nombre: "Filtración Final y Swirl", descripcion: "Da un giro suave ('swirl') al portafiltros completo y deja escurrir.", aguaAcumulada: finalPour }
      ];

      notasBarista = `El método de James Hoffmann maximiza la claridad y el balance de acidez en cafés lavados de proceso ${proceso}.`;
    }
  } else if (normMetodo.includes("chemex")) {
    const bloom = Math.round(aguaGramos * 0.18);
    const pour1 = Math.round((aguaGramos - bloom) * 0.5) + bloom;
    const pour2 = aguaGramos;

    instrucciones = [
      `Vierte ${bloom}g de agua lenta y uniformemente. Deja pre-infundir por 45 segundos completos.`,
      `Primer vertido lento: Vierte suavemente de manera concéntrica sin tocar las paredes del papel hasta llegar a ${pour1}g.`,
      `Segundo vertido final: Espera a que baje a la mitad, luego vierte despacio en el centro hasta los ${pour2}g totales.`,
      `Realiza un movimiento circular suave de la Chemex y deja escurrir.`
    ];

    pasosCronometro = [
      { tiempoInicio: 0, tiempoFin: 45, nombre: "Blooming en Chemex", descripcion: `Vierte ${bloom}g de agua caliente y haz movimientos circulares suaves.`, aguaAcumulada: bloom },
      { tiempoInicio: 45, tiempoFin: 110, nombre: "Primer Vertido", descripcion: `Vierte de manera concéntrica ${pour1 - bloom}g más (total: ${pour1}g).`, aguaAcumulada: pour1 },
      { tiempoInicio: 110, tiempoFin: 170, nombre: "Segundo Vertido", descripcion: `Vierte el agua remanente en el centro exacto hasta completar los ${pour2}g.`, aguaAcumulada: pour2 },
      { tiempoInicio: 170, tiempoFin: 245, nombre: "Swirl y Filtrado Final", descripcion: "Dale un sutil giro circular a la jarra y deja colar.", aguaAcumulada: pour2 }
    ];

    notasBarista = `El filtro grueso patentado de Chemex atrapa todos los sedimentos brindándote una taza sumamente limpia y brillante.`;
  } else if (normMetodo.includes("aeropress")) {
    instrucciones = [
      `Añade los ${cafeGramos}g de café a la Aeropress.`,
      `Vierte agua rápidamente a ${temperatura} hasta alcanzar los ${aguaGramos}g totales.`,
      `Remueve suavemente durante 15 segundos enteros.`,
      `Coloca el émbolo ligeramente para sellar, espera 20 segundos y presiona de forma constante durante 30 segundos.`
    ];

    pasosCronometro = [
      { tiempoInicio: 0, tiempoFin: 25, nombre: "Vertido Rápido y Agitación", descripcion: `Vierte los ${aguaGramos}g de agua y remueve suavemente con la espátula.`, aguaAcumulada: aguaGramos },
      { tiempoInicio: 25, tiempoFin: 65, nombre: "Infusión Estática", descripcion: "Coloca el émbolo para retener el agua en la cámara. Deja reposar.", aguaAcumulada: aguaGramos },
      { tiempoInicio: 65, tiempoFin: 95, nombre: "Presión Controlada", descripcion: "Presiona el émbolo con calma y suavidad. Detén en cuanto escuches el aire silbando.", aguaAcumulada: aguaGramos }
    ];

    notasBarista = `La Aeropress es genial para acentuar el dulzor. Intenta usar un papel de filtro doble pre-humedecido.`;
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    instrucciones = [
      `Método de Prensa Francesa: Vierte rápidamente la totalidad de los ${aguaGramos}g de agua hirviendo. Deja reposar 4 minutos sin tapar.`,
      `Al minuto 4:00, rompe la costra superficial con una cuchara. El café caerá al fondo.`,
      `Retira la espuma y partículas que floten con una cuchara para mayor claridad.`,
      `Coloca la tapa con el émbolo sin presionarlo. Espera 3 minutos más (total 7:00) para decantar finos de forma natural.`,
      `Sirve muy despacio por decantación.`
    ];

    pasosCronometro = [
      { tiempoInicio: 0, tiempoFin: 240, nombre: "Infusión Estática", descripcion: `Vierte los ${aguaGramos}g de agua de un solo golpe y no toques la prensa.`, aguaAcumulada: aguaGramos },
      { tiempoInicio: 240, tiempoFin: 300, nombre: "Romper Costra y Limpieza", descripcion: "Rompe la costra y retira la espuma del tope.", aguaAcumulada: aguaGramos },
      { tiempoInicio: 300, tiempoFin: 420, nombre: "Decantación de Partículas", descripcion: "Deja reposar 2 minutos extras con la tapa puesta pero sin bajar el émbolo.", aguaAcumulada: aguaGramos },
      { tiempoInicio: 420, tiempoFin: 450, nombre: "Servido Decantado Lento", descripcion: "Sirve lentamente el café en tu taza cuidando no agitar el fondo.", aguaAcumulada: aguaGramos }
    ];

    notasBarista = `Al no presionar físicamente el café con el émbolo, logramos una taza sumamente limpia de sedimentos con todo el cuerpo sedoso de la prensa francesa.`;
  } else {
    // Default
    const bloom = Math.round(aguaGramos * 0.20);
    instrucciones = [
      `Vierte lenta y uniformemente ${bloom}g de agua. Deja pre-infundir por 35 segundos.`,
      `Primer vertido principal: Vierte en círculos de adentro hacia afuera hasta la mitad del agua remanente.`,
      `Segundo vertido final: Completa los ${aguaGramos}g totales vertiendo suavemente en el centro.`,
      `Dale un giro circular y deja filtrar.`
    ];

    pasosCronometro = [
      { tiempoInicio: 0, tiempoFin: 35, nombre: "Pre-infusión", descripcion: `Vierte ${bloom}g de agua de forma uniforme.`, aguaAcumulada: bloom },
      { tiempoInicio: 35, tiempoFin: 80, nombre: "Primer Vertido", descripcion: `Sube el agua de forma constante.`, aguaAcumulada: Math.round(aguaGramos * 0.6) },
      { tiempoInicio: 80, tiempoFin: 135, nombre: "Vertido Final", descripcion: `Completa los ${aguaGramos}g de agua totales.`, aguaAcumulada: aguaGramos },
      { tiempoInicio: 135, tiempoFin: 180, nombre: "Filtración", descripcion: "Deja escurrir el agua de filtración.", aguaAcumulada: aguaGramos }
    ];

    notasBarista = `Asegura un flujo de agua pausado y constante.`;
  }

  let finalNotasBarista = notasBarista;
  if (observaciones) {
    finalNotasBarista += `\n\n[Nota del Barista local]: Adaptamos la receta considerando: "${observaciones}".`;
  }
  if (feedback) {
    finalNotasBarista += `\n\n[Nota de Calibración]: Tomamos en cuenta tu feedback anterior ("${feedback}") ajustando sutilmente la temperatura y el ratio para optimizar la taza.`;
  }

  return {
    origen,
    proceso,
    molino,
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
