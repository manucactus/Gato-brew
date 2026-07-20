// Base de datos de molinos con equivalentes de molienda
import { MoliendaDetalle } from "../types";

export interface Molino {
  nombre: string; // Nombre comercial
  ajustes: Record<string, MoliendaDetalle>; // ключ - метод экстракции
}

export const MOLINOS_DATA: Molino[] = [
  // ===== COMANDANTE =====
  {
    nombre: "Comandante C40",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        granulometria: "300-400 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "Paso 14-16 (Baratza), 2.5-3.0 (Eureka)",
        descripcion: "Textura similar a sal de mesa. Flujo de agua controlado."
      },
      "chemex": {
        tipo: "media-gruesa",
        granulometria: "500-600 μm",
        clicsComandante: "26-30",
        clicsEquivalent: "Paso 18-22 (Baratza), 4.0-5.0 (Eureka)",
        descripcion: "Similar a sal gruesa de mar. Extracción lenta y limpia."
      },
      "aeropress": {
        tipo: "fina",
        granulometria: "200-300 μm",
        clicsComandante: "14-18",
        clicsEquivalent: "Paso 10-12 (Baratza), 1.5-2.0 (Eureka)",
        descripcion: "Más fino que sal de mesa. Extracción rápida."
      },
      "prensa": {
        tipo: "gruesa",
        granulometria: "700-900 μm",
        clicsComandante: "30-35",
        clicsEquivalent: "Paso 26-30 (Baratza), 6.0-7.0 (Eureka)",
        descripcion: "Similar a cacao en polvo. Sin partículas finas visibles."
      },
      "kalita": {
        tipo: "media",
        granulometria: "400-500 μm",
        clicsComandante: "22-26",
        clicsEquivalent: "Paso 15-18 (Baratza), 3.0-4.0 (Eureka)",
        descripcion: "Entre sal de mesa y gruesa. Balanceado."
      },
      "espresso": {
        tipo: "extra-fina",
        granulometria: "100-200 μm",
        clicsComandante: "8-12",
        clicsEquivalent: "Paso 4-8 (Baratza), 0.5-1.0 (Eureka)",
        descripcion: "Como harina textura polvo. Alta extracción."
      },
      "default": {
        tipo: "media",
        granulometria: "350-450 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "Paso 14-16 (Baratza), 2.5-3.0 (Eureka)",
        descripcion: "Ajuste medio. Punto de partida seguro."
      }
    }
  },
  // ===== BARATZA ENCORE =====
  {
    nombre: "Baratza Encore",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        granulometria: "300-400 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "Paso 14-16",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        granulometria: "500-600 μm",
        clicsComandante: "26-30",
        clicsEquivalent: "Paso 18-22",
        descripcion: "Similar a sal gruesa de mar."
      },
      "aeropress": {
        tipo: "fina",
        granulometria: "200-300 μm",
        clicsComandante: "14-18",
        clicsEquivalent: "Paso 10-12",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        granulometria: "700-900 μm",
        clicsComandante: "30-35",
        clicsEquivalent: "Paso 26-30",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        granulometria: "400-500 μm",
        clicsComandante: "22-26",
        clicsEquivalent: "Paso 15-18",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        granulometria: "100-200 μm",
        clicsComandante: "8-12",
        clicsEquivalent: "Paso 4-8",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        granulometria: "350-450 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "Paso 14-16",
        descripcion: "Ajuste medio推荐."
      }
    }
  },
  // ===== EUREKA MIGNON =====
  {
    nombre: "Eureka Mignon",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        granulometria: "300-400 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "2.5-3.0",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        granulometria: "500-600 μm",
        clicsComandante: "26-30",
        clicsEquivalent: "4.0-5.0",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        granulometria: "200-300 μm",
        clicsComandante: "14-18",
        clicsEquivalent: "1.5-2.0",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        granulometria: "700-900 μm",
        clicsComandante: "30-35",
        clicsEquivalent: "6.0-7.0",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        granulometria: "400-500 μm",
        clicsComandante: "22-26",
        clicsEquivalent: "3.0-4.0",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        granulometria: "100-200 μm",
        clicsComandante: "8-12",
        clicsEquivalent: "0.5-1.0",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        granulometria: "350-450 μm",
        clicsComandante: "20-24",
        clicsEquivalent: "2.5-3.0",
        descripcion: "Ajuste medio推荐."
      }
    }
  },
  // ===== DF64 =====
  {
    nombre: "DF64",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        granulometria: "300-400 μm",
        clicsEquivalent: "0.35-0.45 (escala DF64)",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        granulometria: "500-600 μm",
        clicsEquivalent: "0.55-0.65",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        granulometria: "200-300 μm",
        clicsEquivalent: "0.20-0.30",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        granulometria: "700-900 μm",
        clicsEquivalent: "0.70-0.85",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        granulometria: "400-500 μm",
        clicsEquivalent: "0.45-0.55",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        granulometria: "100-200 μm",
        clicsEquivalent: "0.08-0.15",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        granulometria: "350-450 μm",
        clicsEquivalent: "0.35-0.45",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== TIMEMORE C2/C3 =====
  {
    nombre: "Timemore C2",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        granulometria: "300-400 μm",
        clicsEquivalent: "24-28 clics (Click C2)",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        granulometria: "500-600 μm",
        clicsEquivalent: "34-40 clics",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        granulometria: "200-300 μm",
        clicsEquivalent: "16-20 clics",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        granulometria: "700-900 μm",
        clicsEquivalent: "40-48 clics",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        granulometria: "400-500 μm",
        clicsEquivalent: "28-34 clics",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        granulometria: "100-200 μm",
        clicsEquivalent: "8-14 clics",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        granulometria: "350-450 μm",
        clicsEquivalent: "24-28 clics",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== FELLO ODE =====
  {
    nombre: "Fellow Ode",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "4.5-5.5 (Gen 2)",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "7.0-8.0",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "2.5-3.5",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "8.5-10.0",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "5.5-7.0",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "1.0-2.0",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "4.5-5.5",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== WILFA SVART =====
  {
    nombre: "Wilfa Svart",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "D7-F5 (escala Wilfa)",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "D5-E5",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "F7-G5",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "D3-D4",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "D6-E4",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "F8-G7",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "D7-F5",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== MAHLKÖNIG X54 =====
  {
    nombre: "Mahlkönig X54",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "1.5-2.0 (escala X54)",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "3.0-4.0",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "0.5-1.0",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "5.0-6.0",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "2.0-3.0",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "0.1-0.3",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "1.5-2.0",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== 1ZPRESSO JX-PRO =====
  {
    nombre: "1Zpresso JX-Pro",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "4.0-5.0 clics (escala JX-Pro)",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "6.0-7.0",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "2.5-3.5",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "7.5-9.0",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "5.0-6.0",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "1.0-2.0",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "4.0-5.0",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== KINGRINDER K6 =====
  {
    nombre: "Kingrinder K6",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "60-70 clics internos",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "85-100",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "40-55",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "100-120",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "70-85",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "20-35",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "60-70",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== VARIA VS3 =====
  {
    nombre: "Varia VS3",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "3.5-4.5 (escala VS3)",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "5.5-6.5",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "2.0-3.0",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "7.0-8.0",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "4.5-5.5",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "0.5-1.5",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "3.5-4.5",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  },
  // ===== HANDMILL GENERICO =====
  {
    nombre: "Handmill Genérico",
    ajustes: {
      "v60": {
        tipo: "media-fina",
        clicsComandante: "20-24",
        clicsEquivalent: "Ajustar a ojo: textura sal mesa",
        granulometria: "300-400 μm",
        descripcion: "Textura similar a sal de mesa."
      },
      "chemex": {
        tipo: "media-gruesa",
        clicsComandante: "26-30",
        clicsEquivalent: "Similar a sal gruesa",
        granulometria: "500-600 μm",
        descripcion: "Similar a sal gruesa."
      },
      "aeropress": {
        tipo: "fina",
        clicsComandante: "14-18",
        clicsEquivalent: "Más fino que sal de mesa",
        granulometria: "200-300 μm",
        descripcion: "Más fino que sal de mesa."
      },
      "prensa": {
        tipo: "gruesa",
        clicsComandante: "30-35",
        clicsEquivalent: "Como cacao en polvo",
        granulometria: "700-900 μm",
        descripcion: "Como cacao en polvo."
      },
      "kalita": {
        tipo: "media",
        clicsComandante: "22-26",
        clicsEquivalent: "Entre sal mesa y gruesa",
        granulometria: "400-500 μm",
        descripcion: "Entre sal de mesa y gruesa."
      },
      "espresso": {
        tipo: "extra-fina",
        clicsComandante: "8-12",
        clicsEquivalent: "Como harina",
        granulometria: "100-200 μm",
        descripcion: "Como harina."
      },
      "default": {
        tipo: "media",
        clicsComandante: "20-24",
        clicsEquivalent: "Ajustar a ojo",
        granulometria: "350-450 μm",
        descripcion: "Ajuste medio."
      }
    }
  }
];

// Función para encontrar ajustes de molino
export function getAjustesMolino(nombreMolino: string, metodo: string): MoliendaDetalle | null {
  const normMolino = nombreMolino.toLowerCase();
  
  // Buscar molino exacto o parcial
  let molinoEncontrado = MOLINOS_DATA.find(m => 
    normMolino.includes(m.nombre.toLowerCase()) ||
    m.nombre.toLowerCase().includes(normMolino)
  );
  
  // Si no encuentra, buscar por palabras clave
  if (!molinoEncontrado) {
    if (normMolino.includes("comandante") || normMolino.includes("c40")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Comandante"));
    } else if (normMolino.includes("baratza") || normMolino.includes("encore")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Baratza"));
    } else if (normMolino.includes("eureka") || normMolino.includes("mignon")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Eureka"));
    } else if (normMolino.includes("df64")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("DF64"));
    } else if (normMolino.includes("timemore") || normMolino.includes("c2") || normMolino.includes("c3")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Timemore"));
    } else if (normMolino.includes("fellow") || normMolino.includes("ode")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Fellow"));
    } else if (normMolino.includes("wilfa")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Wilfa"));
    } else if (normMolino.includes("mahlk") || normMolino.includes("x54")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Mahlk"));
    } else if (normMolino.includes("1zpresso") || normMolino.includes("jx")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("1Zpresso"));
    } else if (normMolino.includes("kingrinder") || normMolino.includes("k6")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Kingrinder"));
    } else if (normMolino.includes("varia") || normMolino.includes("vs3")) {
      molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Varia"));
    }
  }
  
  // Si sigue sin encontrar, usar genérico
  if (!molinoEncontrado) {
    molinoEncontrado = MOLINOS_DATA.find(m => m.nombre.includes("Handmill"));
  }
  
  if (!molinoEncontrado) {
    return null;
  }
  
  // Buscar método
  const normMetodo = metodo.toLowerCase();
  let metodoKey = "default";
  
  if (normMetodo.includes("v60") || normMetodo.includes("goteo") || normMetodo.includes("conic")) {
    metodoKey = "v60";
  } else if (normMetodo.includes("chemex")) {
    metodoKey = "chemex";
  } else if (normMetodo.includes("aeropress") || normMetodo.includes("aero")) {
    metodoKey = "aeropress";
  } else if (normMetodo.includes("prensa") || normMetodo.includes("french")) {
    metodoKey = "prensa";
  } else if (normMetodo.includes("kalita") || normMetodo.includes("wave")) {
    metodoKey = "kalita";
  } else if (normMolino.includes("espresso") || normMolino.includes("expreso")) {
    metodoKey = "espresso";
  }
  
  return molinoEncontrado.ajustes[metodoKey] || molinoEncontrado.ajustes["default"];
}