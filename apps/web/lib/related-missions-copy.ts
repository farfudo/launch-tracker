import type { Locale } from "./i18n";
import type { EducationLaunchTopic } from "./related-missions";

type RelatedLaunchCopy = {
  heading: string;
  loading: string;
  error: string;
  detail: string;
  education: string;
  topic: Record<EducationLaunchTopic, string>;
  learning: Record<EducationLaunchTopic, string>;
};

export const relatedLaunchCopy = {
  "pt-PT": {
    heading: "Lançamentos relacionados", loading: "A procurar missões relacionadas…", error: "Não foi possível confirmar lançamentos relacionados neste momento.",
    topic: { artemis: "Programa Artemis", starship: "Starship", reuse: "Foguetões reutilizáveis" },
    detail: "Ver detalhes da missão", education: "Conteúdos relacionados", learning: { artemis: "Explorar o guia Artemis", starship: "Explorar Starship", reuse: "Explorar reutilização" },
  },
  "en-GB": {
    heading: "Related launches", loading: "Looking for related missions…", error: "Related launches could not be confirmed right now.",
    topic: { artemis: "Artemis programme", starship: "Starship", reuse: "Reusable rockets" },
    detail: "View mission details", education: "Related learning", learning: { artemis: "Explore the Artemis guide", starship: "Explore Starship", reuse: "Explore reuse" },
  },
  "es-ES": {
    heading: "Lanzamientos relacionados", loading: "Buscando misiones relacionadas…", error: "No se pudieron confirmar lanzamientos relacionados ahora.",
    topic: { artemis: "Programa Artemis", starship: "Starship", reuse: "Cohetes reutilizables" },
    detail: "Ver detalles de la misión", education: "Contenido relacionado", learning: { artemis: "Explorar la guía Artemis", starship: "Explorar Starship", reuse: "Explorar reutilización" },
  },
} satisfies Record<Locale, RelatedLaunchCopy>;
