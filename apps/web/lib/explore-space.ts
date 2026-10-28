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
      ["Programas espaciais", "Explora o programa Artemis e as peças necessárias para regressar à Lua.", "Explorar programas", "/explore-space/programs"],
      ["Como funcionam os foguetões", "Vê, passo a passo, como motores, materiais e reabastecimento ajudam a chegar ao espaço.", "Explorar a tecnologia", "/explore-space/how-rockets-work"],
      ["Marcos espaciais", "Descobre quatro momentos que mudaram a exploração espacial.", "Explorar a cronologia", "/explore-space/milestones"]
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
      ["Space Programs", "Explore the Artemis programme and the pieces needed to return to the Moon.", "Explore programs", "/explore-space/programs"],
      ["How Rockets Work", "See how engines, materials and refuelling help rockets reach space.", "Explore the technology", "/explore-space/how-rockets-work"],
      ["Space Milestones", "Explore four moments that changed space exploration.", "Explore the timeline", "/explore-space/milestones"]
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
      ["Programas espaciales", "Explora el programa Artemis y las piezas necesarias para volver a la Luna.", "Explorar programas", "/explore-space/programs"],
      ["Cómo funcionan los cohetes", "Descubre cómo motores, materiales y repostaje ayudan a llegar al espacio.", "Explorar la tecnología", "/explore-space/how-rockets-work"],
      ["Hitos espaciales", "Descubre cuatro momentos que cambiaron la exploración espacial.", "Explorar la cronología", "/explore-space/milestones"]
    ],
    numbers: ["01", "02", "03", "04"],
    note: "Elige un camino para empezar. Cada enlace abre contenido existente en NextRocketLaunch."
  }
} satisfies Record<Locale, {
  title: string; eyebrow: string; intro: string;
  cards: [string, string, string, string][]; numbers: string[]; note: string;
}>;
