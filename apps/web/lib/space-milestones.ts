import type { Locale } from "./i18n";

export type MilestoneCategory = "satellite" | "human-flight" | "lunar-landing" | "reusability";
export type MilestoneContentLink = { href: string; label: Record<Locale, string> };
export type SpaceMilestone = {
  id: string;
  date: string;
  year: number;
  category: MilestoneCategory;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  whyItMatters: Record<Locale, string>;
  source: { publisher: string; label: Record<Locale, string>; url: string };
  image: {
    src: string;
    width: number;
    height: number;
    alt: Record<Locale, string>;
    credit: Record<Locale, string>;
    url: string;
  };
  related?: MilestoneContentLink;
};

/** A small editorial timeline. Dates are historical civil dates, not launch-time instants. */
export const spaceMilestones: readonly SpaceMilestone[] = [
  {
    id: "sputnik-1",
    date: "1957-10-04",
    year: 1957,
    category: "satellite",
    title: {
      "pt-PT": "Sputnik 1 entra em órbita",
      "en-GB": "Sputnik 1 reaches orbit",
      "es-ES": "Sputnik 1 llega a la órbita"
    },
    description: {
      "pt-PT": "A União Soviética colocou em órbita o primeiro satélite artificial da Terra. O seu sinal de rádio podia ser acompanhado a partir do solo.",
      "en-GB": "The Soviet Union placed the first artificial satellite of Earth in orbit. Its radio signal could be followed from the ground.",
      "es-ES": "La Unión Soviética puso en órbita el primer satélite artificial de la Tierra. Su señal de radio podía seguirse desde el suelo."
    },
    whyItMatters: {
      "pt-PT": "O Sputnik marcou o início da Era Espacial e mostrou que era possível colocar objetos em órbita.",
      "en-GB": "Sputnik marked the beginning of the Space Age and showed that objects could be placed in orbit.",
      "es-ES": "Sputnik marcó el comienzo de la Era Espacial y demostró que era posible poner objetos en órbita."
    },
    source: { publisher: "NASA", label: { "pt-PT": "História da NASA", "en-GB": "NASA history", "es-ES": "Historia de la NASA" }, url: "https://www.nasa.gov/history/dawn-of-the-space-age/" },
    image: {
      src: "/images/milestones/sputnik-1.jpg", width: 960, height: 1291,
      alt: {
        "pt-PT": "Réplica do Sputnik 1 em exposição no Museu Nacional da Força Aérea dos Estados Unidos.",
        "en-GB": "A Sputnik 1 replica on display at the National Museum of the United States Air Force.",
        "es-ES": "Réplica del Sputnik 1 expuesta en el Museo Nacional de la Fuerza Aérea de Estados Unidos."
      },
      credit: {
        "pt-PT": "Réplica em exposição · Foto da Força Aérea dos EUA · Domínio público nos EUA",
        "en-GB": "Museum replica · U.S. Air Force photo · Public domain in the U.S.",
        "es-ES": "Réplica de museo · Foto de la Fuerza Aérea de EE. UU. · Dominio público en EE. UU."
      },
      url: "https://commons.wikimedia.org/wiki/File:Sputnik_1.jpg"
    }
  },
  {
    id: "vostok-1",
    date: "1961-04-12",
    year: 1961,
    category: "human-flight",
    title: {
      "pt-PT": "Vostok 1 leva o primeiro humano ao espaço",
      "en-GB": "Vostok 1 carries the first human into space",
      "es-ES": "Vostok 1 lleva al primer ser humano al espacio"
    },
    description: {
      "pt-PT": "Yuri Gagarin completou uma órbita da Terra a bordo da Vostok 1, no primeiro voo espacial humano.",
      "en-GB": "Yuri Gagarin completed one orbit of Earth aboard Vostok 1, the first human spaceflight.",
      "es-ES": "Yuri Gagarin completó una órbita terrestre a bordo de Vostok 1, el primer vuelo espacial humano."
    },
    whyItMatters: {
      "pt-PT": "A missão demonstrou que uma pessoa podia viajar ao espaço e regressar em segurança.",
      "en-GB": "The mission demonstrated that a person could travel to space and return safely.",
      "es-ES": "La misión demostró que una persona podía viajar al espacio y regresar con seguridad."
    },
    source: { publisher: "NASA", label: { "pt-PT": "Registo de voos espaciais", "en-GB": "Human spaceflight record", "es-ES": "Registro de vuelos espaciales" }, url: "https://www.nasa.gov/wp-content/uploads/2023/10/presrep1994.pdf" },
    image: {
      src: "/images/milestones/vostok-1-gagarin.jpg", width: 550, height: 370,
      alt: {
        "pt-PT": "Yuri Gagarin equipado para o voo da Vostok 1, em 12 de abril de 1961.",
        "en-GB": "Yuri Gagarin preparing for the Vostok 1 flight on 12 April 1961.",
        "es-ES": "Yuri Gagarin preparándose para el vuelo de Vostok 1 el 12 de abril de 1961."
      },
      credit: {
        "pt-PT": "Ministério da Defesa da Federação Russa / Mil.ru · CC BY 4.0",
        "en-GB": "Ministry of Defence of the Russian Federation / Mil.ru · CC BY 4.0",
        "es-ES": "Ministerio de Defensa de la Federación Rusa / Mil.ru · CC BY 4.0"
      },
      url: "https://commons.wikimedia.org/wiki/File:%D0%93%D0%B0%D0%B3%D0%B0%D1%80%D0%B8%D0%BD_%D0%B2_%D0%BA%D0%BE%D1%80%D0%B0%D0%B1%D0%BB%D0%B5.jpg"
    }
  },
  {
    id: "apollo-11",
    date: "1969-07-20",
    year: 1969,
    category: "lunar-landing",
    title: {
      "pt-PT": "Apollo 11 aterra na Lua",
      "en-GB": "Apollo 11 lands on the Moon",
      "es-ES": "Apollo 11 aluniza"
    },
    description: {
      "pt-PT": "O módulo lunar Eagle pousou no Mar da Tranquilidade. Neil Armstrong e Buzz Aldrin exploraram a superfície enquanto Michael Collins permanecia em órbita lunar.",
      "en-GB": "The lunar module Eagle landed in the Sea of Tranquillity. Neil Armstrong and Buzz Aldrin explored the surface while Michael Collins remained in lunar orbit.",
      "es-ES": "El módulo lunar Eagle aterrizó en el Mar de la Tranquilidad. Neil Armstrong y Buzz Aldrin exploraron la superficie mientras Michael Collins permanecía en órbita lunar."
    },
    whyItMatters: {
      "pt-PT": "Foi a primeira aterragem tripulada na Lua e um marco para a exploração humana de outros mundos.",
      "en-GB": "It was the first crewed lunar landing and a milestone in human exploration of other worlds.",
      "es-ES": "Fue el primer alunizaje tripulado y un hito en la exploración humana de otros mundos."
    },
    source: { publisher: "NASA", label: { "pt-PT": "Visão geral da missão", "en-GB": "Mission overview", "es-ES": "Resumen de la misión" }, url: "https://www.nasa.gov/mission/apollo-11/" },
    image: {
      src: "/images/milestones/apollo-11.jpg", width: 960, height: 965,
      alt: {
        "pt-PT": "Buzz Aldrin junto do módulo lunar Eagle durante a atividade na superfície da Lua.",
        "en-GB": "Buzz Aldrin beside the Lunar Module Eagle during activity on the Moon.",
        "es-ES": "Buzz Aldrin junto al módulo lunar Eagle durante la actividad en la superficie lunar."
      },
      credit: {
        "pt-PT": "NASA · Domínio público nos EUA",
        "en-GB": "NASA · Public domain in the U.S.",
        "es-ES": "NASA · Dominio público en EE. UU."
      },
      url: "https://commons.wikimedia.org/wiki/File:Apollo_11_Lunar_Lander_-_5927_NASA.jpg"
    },
    related: { href: "/discoveries/artemis", label: { "pt-PT": "Explorar o guia Artemis", "en-GB": "Explore the Artemis guide", "es-ES": "Explorar la guía Artemis" } }
  },
  {
    id: "falcon-9-landing",
    date: "2015-12-21",
    year: 2015,
    category: "reusability",
    title: {
      "pt-PT": "Falcon 9 faz uma aterragem orbital pioneira",
      "en-GB": "Falcon 9 makes a landmark orbital-class landing",
      "es-ES": "Falcon 9 logra un aterrizaje orbital histórico"
    },
    description: {
      "pt-PT": "Depois de colocar 11 satélites em órbita, o primeiro estágio do Falcon 9 regressou e aterrou na Landing Zone 1.",
      "en-GB": "After delivering 11 satellites to orbit, the Falcon 9 first stage returned and landed at Landing Zone 1.",
      "es-ES": "Tras colocar 11 satélites en órbita, la primera etapa del Falcon 9 regresó y aterrizó en Landing Zone 1."
    },
    whyItMatters: {
      "pt-PT": "Foi a primeira aterragem de um foguetão de classe orbital após um voo orbital, um passo importante para recuperar estágios para reutilização.",
      "en-GB": "It was the first-ever orbital-class rocket landing, an important step towards recovering stages for reuse.",
      "es-ES": "Fue el primer aterrizaje de un cohete de clase orbital, un paso importante para recuperar etapas y reutilizarlas."
    },
    source: { publisher: "SpaceX", label: { "pt-PT": "Marcos da SpaceX", "en-GB": "SpaceX milestones", "es-ES": "Hitos de SpaceX" }, url: "https://www.spacex.com/mission/" },
    image: {
      src: "/images/milestones/falcon-9-landing-2015.jpg", width: 960, height: 640,
      alt: {
        "pt-PT": "Primeiro estágio do Falcon 9 em pé na Landing Zone 1 após a aterragem de 21 de dezembro de 2015.",
        "en-GB": "The Falcon 9 first stage standing at Landing Zone 1 after its landing on 21 December 2015.",
        "es-ES": "La primera etapa del Falcon 9 en posición vertical en Landing Zone 1 tras aterrizar el 21 de diciembre de 2015."
      },
      credit: {
        "pt-PT": "SpaceX Photos · CC0 1.0",
        "en-GB": "SpaceX Photos · CC0 1.0",
        "es-ES": "SpaceX Photos · CC0 1.0"
      },
      url: "https://commons.wikimedia.org/wiki/File:Falcon_9_first_stage_at_LZ-1_(23827554109).jpg"
    },
    related: { href: "/discoveries#technology-lab", label: { "pt-PT": "Ver como funciona a reutilização", "en-GB": "See how rocket reuse works", "es-ES": "Ver cómo funciona la reutilización" } }
  }
];

export const milestonesCopy: Record<Locale, {
  title: string; eyebrow: string; intro: string; back: string; timeline: string;
  categories: Record<MilestoneCategory, string>; why: string; source: string; related: string; newTab: string;
  openImage: string; closeImage: string; imageHint: string;
}> = {
  "pt-PT": {
    title: "Marcos da exploração espacial", eyebrow: "Uma história de grandes primeiros passos",
    intro: "Quatro momentos verificados ajudam a perceber como chegámos mais longe — de um sinal de rádio em órbita a foguetões que regressam à Terra.",
    back: "Voltar a Explorar o espaço", timeline: "Cronologia histórica", why: "Porque importa",
    categories: { satellite: "Satélites", "human-flight": "Voo espacial humano", "lunar-landing": "Exploração lunar", reusability: "Reutilização" },
    source: "Fonte", related: "Continua a explorar", newTab: "abre num novo separador",
    openImage: "Ampliar imagem", closeImage: "Fechar imagem", imageHint: "Seleciona para ampliar"
  },
  "en-GB": {
    title: "Space exploration milestones", eyebrow: "A story of important first steps",
    intro: "Four verified moments show how far we have travelled — from a radio signal in orbit to rockets returning to Earth.",
    back: "Back to Explore Space", timeline: "Historical timeline", why: "Why it matters",
    categories: { satellite: "Satellites", "human-flight": "Human spaceflight", "lunar-landing": "Lunar exploration", reusability: "Reusability" },
    source: "Source", related: "Keep exploring", newTab: "opens in a new tab",
    openImage: "Enlarge image", closeImage: "Close image", imageHint: "Select to enlarge"
  },
  "es-ES": {
    title: "Hitos de la exploración espacial", eyebrow: "Una historia de primeros pasos importantes",
    intro: "Cuatro momentos verificados muestran cuánto hemos avanzado: desde una señal de radio en órbita hasta cohetes que regresan a la Tierra.",
    back: "Volver a Explorar el espacio", timeline: "Cronología histórica", why: "Por qué importa",
    categories: { satellite: "Satélites", "human-flight": "Vuelo espacial humano", "lunar-landing": "Exploración lunar", reusability: "Reutilización" },
    source: "Fuente", related: "Sigue explorando", newTab: "se abre en una pestaña nueva",
    openImage: "Ampliar imagen", closeImage: "Cerrar imagen", imageHint: "Selecciona para ampliar"
  }
};
