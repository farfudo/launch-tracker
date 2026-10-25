import type { Locale } from "./i18n";

export const discoveryTopics = ["reuse", "artemis", "starship"] as const;
export type DiscoveryTopic = typeof discoveryTopics[number];
export function resolveTopic(value?: string): DiscoveryTopic | "all" {
  return discoveryTopics.includes(value as DiscoveryTopic) ? value as DiscoveryTopic : "all";
}
export const discoveriesCopy = {
  "pt-PT": {
    nav:"Descobertas", launches:"Lançamentos", title:"Descobertas e avanços espaciais", eyebrow:"Para além da contagem decrescente",
    intro:"Explora as tecnologias e os programas que estão a moldar o próximo capítulo da exploração espacial.",
    notice:"Seleção editorial inicial de guias e fontes oficiais. Não é um feed automático de notícias nem uma confirmação de datas ou capacidades anunciadas.",
    all:"Todos os temas", source:"Explorar na fonte", checked:"Fontes consultadas", checkedNote:"Data da revisão editorial, não da publicação original. As páginas podem mudar.",
    heading:"Explorar os programas", official:"Fonte oficial", language:"A fonte pode estar noutro idioma.",
    distinctions:"Anunciado não significa demonstrado", distinctionBody:"Um objetivo de projeto, um resultado de teste e uma capacidade operacional são coisas diferentes. Consulta a fonte para conhecer o contexto e o estado de cada programa.",
    topics:{reuse:["Foguetões reutilizáveis","Recuperar, voltar a voar e aprender com cada teste."],artemis:["Artemis e a Lua","Missões, veículos e ciência da exploração lunar."],starship:["Starship","O desenvolvimento do sistema e as campanhas de testes."]},
    kinds:["Tecnologia", "Programa", "Demonstrador"],
    summaries:["Explora a família Falcon e o papel da recuperação do primeiro estágio na reutilização.","Conhece a abordagem da Blue Origin ao primeiro estágio reutilizável do New Glenn. Objetivos de projeto não equivalem a reutilizações demonstradas.","Conhece o demonstrador europeu Themis e as tecnologias de recuperação e reutilização em desenvolvimento.","Explora o programa lunar da NASA, as suas missões e os recursos oficiais. Consulta a fonte para os planos e marcos atualizados.","Conhece Starship e Super Heavy e o objetivo de desenvolver um sistema totalmente reutilizável. Separa objetivos anunciados de resultados demonstrados.","Consulta os comunicados da SpaceX para acompanhar resultados de testes, alterações de projeto e próximos objetivos, no contexto dado pela empresa."],
  },
  "en-GB": {
    nav:"Discoveries", launches:"Launches", title:"Space discoveries and advances", eyebrow:"Beyond the countdown",
    intro:"Explore the technologies and programmes shaping the next chapter of space exploration.",
    notice:"An initial editorial selection of guides and official sources. Not an automated news feed or confirmation of announced dates or capabilities.",
    all:"All topics", source:"Explore the source", checked:"Sources reviewed", checkedNote:"Editorial review date, not the original publication date. Pages may change.",
    heading:"Explore the programmes", official:"Official source", language:"The source may be in another language.",
    distinctions:"Announced does not mean demonstrated", distinctionBody:"A design objective, a test result and an operational capability are different things. Check each source for context and programme status.",
    topics:{reuse:["Reusable rockets","Recover, fly again and learn from each test."],artemis:["Artemis and the Moon","Missions, vehicles and lunar exploration science."],starship:["Starship","System development and flight-test campaigns."]},
    kinds:["Technology", "Programme", "Demonstrator"],
    summaries:["Explore the Falcon family and the role of first-stage recovery in reuse.","Explore Blue Origin’s approach to New Glenn’s reusable first stage. Design goals are not demonstrated reuses.","Discover Europe’s Themis demonstrator and the recovery and reuse technologies under development.","Explore NASA’s lunar programme, its missions and official resources. Check the source for updated plans and milestones.","Explore Starship and Super Heavy and the goal of a fully reusable system. Separate announced objectives from demonstrated results.","Read SpaceX’s statements on test results, design changes and upcoming objectives, in the context provided by the company."],
  },
  "es-ES": {
    nav:"Descubrimientos", launches:"Lanzamientos", title:"Descubrimientos y avances espaciales", eyebrow:"Más allá de la cuenta atrás",
    intro:"Explora las tecnologías y programas que están dando forma al próximo capítulo de la exploración espacial.",
    notice:"Selección editorial inicial de guías y fuentes oficiales. No es un feed automático de noticias ni una confirmación de fechas o capacidades anunciadas.",
    all:"Todos los temas", source:"Explorar la fuente", checked:"Fuentes consultadas", checkedNote:"Fecha de revisión editorial, no de publicación original. Las páginas pueden cambiar.",
    heading:"Explorar los programas", official:"Fuente oficial", language:"La fuente puede estar en otro idioma.",
    distinctions:"Anunciado no significa demostrado", distinctionBody:"Un objetivo de diseño, un resultado de prueba y una capacidad operativa son cosas distintas. Consulta cada fuente para conocer el contexto y estado del programa.",
    topics:{reuse:["Cohetes reutilizables","Recuperar, volver a volar y aprender de cada prueba."],artemis:["Artemis y la Luna","Misiones, vehículos y ciencia de la exploración lunar."],starship:["Starship","Desarrollo del sistema y campañas de pruebas."]},
    kinds:["Tecnología", "Programa", "Demostrador"],
    summaries:["Explora la familia Falcon y el papel de la recuperación de la primera etapa en la reutilización.","Conoce el enfoque de Blue Origin para la primera etapa reutilizable de New Glenn. Los objetivos no equivalen a reutilizaciones demostradas.","Conoce el demostrador europeo Themis y las tecnologías de recuperación y reutilización en desarrollo.","Explora el programa lunar de la NASA, sus misiones y recursos oficiales. Consulta la fuente para planes e hitos actualizados.","Conoce Starship y Super Heavy y el objetivo de un sistema totalmente reutilizable. Distingue objetivos anunciados de resultados demostrados.","Consulta los comunicados de SpaceX sobre resultados de pruebas, cambios de diseño y próximos objetivos, en el contexto de la empresa."],
  },
} satisfies Record<Locale, unknown>;

export const discoverySources: {id:string; title:string; publisher:string; url:string; topics:DiscoveryTopic[]; kind:number}[] = [
  {id:"falcon",title:"Falcon 9",publisher:"SpaceX",url:"https://www.spacex.com/vehicles/falcon-9/",topics:["reuse"],kind:0},
  {id:"new-glenn",title:"New Glenn",publisher:"Blue Origin",url:"https://www.blueorigin.com/new-glenn",topics:["reuse"],kind:0},
  {id:"themis",title:"Themis",publisher:"ESA",url:"https://www.esa.int/Enabling_Support/Space_Transportation/Themis",topics:["reuse"],kind:2},
  {id:"artemis",title:"Artemis",publisher:"NASA",url:"https://www.nasa.gov/humans-in-space/artemis/",topics:["artemis"],kind:1},
  {id:"starship",title:"Starship & Super Heavy",publisher:"SpaceX",url:"https://www.spacex.com/vehicles/starship/",topics:["starship","reuse"],kind:1},
  {id:"updates",title:"SpaceX — Updates",publisher:"SpaceX",url:"https://www.spacex.com/updates/",topics:["starship","reuse"],kind:1},
];
