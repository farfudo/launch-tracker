import type { Locale } from "./i18n";

export const exploreSpaceNavCopy: Record<Locale, string> = {
  "pt-PT": "Explorar o espaço",
  "en-GB": "Explore Space",
  "es-ES": "Explorar el espacio"
};

export const exploreSpaceCopy = {
  "pt-PT": {
    title: "Explora o espaço",
    eyebrow: "Uma viagem para perceber o que acontece lá fora",
    intro: "Começa por uma pergunta. Descobre como os foguetões funcionam, que programas estão em curso e que missões se aproximam.",
    cards: [
      ["Descobertas e avanços", "Tecnologias e ideias que estão a mudar a exploração espacial.", "Explorar descobertas", "/discoveries"],
      ["Programas espaciais", "Explora o programa Artemis e as peças necessárias para regressar à Lua.", "Conhecer o Artemis", "/discoveries/artemis"],
      ["Como funcionam os foguetões", "Vê, passo a passo, como motores, materiais e reabastecimento ajudam a chegar ao espaço.", "Explorar a tecnologia", "/discoveries#technology-lab"],
      ["Marcos das missões", "Consulta os lançamentos previstos e acompanha as próximas etapas espaciais.", "Ver o calendário", "/#launch-calendar"]
    ],
    numbers: ["01", "02", "03", "04"],
    note: "Escolhe um caminho para começar. Cada ligação abre conteúdo existente no NextRocketLaunch."
  },
  "en-GB": {
    title: "Explore Space",
    eyebrow: "A journey to understand what happens out there",
    intro: "Start with a question. Discover how rockets work, which programmes are underway and which missions are coming up.",
    cards: [
      ["Discoveries & Advances", "Technologies and ideas changing space exploration.", "Explore discoveries", "/discoveries"],
      ["Space Programs", "Explore the Artemis programme and the pieces needed to return to the Moon.", "Explore Artemis", "/discoveries/artemis"],
      ["How Rockets Work", "See how engines, materials and refuelling help rockets reach space.", "Explore the technology", "/discoveries#technology-lab"],
      ["Space Milestones", "Browse scheduled launches and follow the next steps in spaceflight.", "View the launch calendar", "/#launch-calendar"]
    ],
    numbers: ["01", "02", "03", "04"],
    note: "Choose a path to begin. Each link opens existing content in NextRocketLaunch."
  },
  "es-ES": {
    title: "Explora el espacio",
    eyebrow: "Un viaje para entender qué ocurre ahí fuera",
    intro: "Empieza con una pregunta. Descubre cómo funcionan los cohetes, qué programas están en marcha y qué misiones se acercan.",
    cards: [
      ["Descubrimientos y avances", "Tecnologías e ideas que están cambiando la exploración espacial.", "Explorar descubrimientos", "/discoveries"],
      ["Programas espaciales", "Explora el programa Artemis y las piezas necesarias para volver a la Luna.", "Conocer Artemis", "/discoveries/artemis"],
      ["Cómo funcionan los cohetes", "Descubre cómo motores, materiales y repostaje ayudan a llegar al espacio.", "Explorar la tecnología", "/discoveries#technology-lab"],
      ["Hitos espaciales", "Consulta los lanzamientos previstos y sigue los próximos pasos espaciales.", "Ver el calendario", "/#launch-calendar"]
    ],
    numbers: ["01", "02", "03", "04"],
    note: "Elige un camino para empezar. Cada enlace abre contenido existente en NextRocketLaunch."
  }
} satisfies Record<Locale, {
  title: string; eyebrow: string; intro: string;
  cards: [string, string, string, string][]; numbers: string[]; note: string;
}>;
