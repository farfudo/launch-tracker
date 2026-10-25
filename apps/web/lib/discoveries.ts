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
    hookLabel:"Não precisas de saber de foguetões para começar", hookTitle:"E se um foguetão pudesse voar outra vez?",
    hookBody:"Imagina usar um avião numa única viagem. A comparação ajuda a perceber a ideia da reutilização: recuperar componentes para os poder usar de novo. Mas num foguetão, regressar é apenas parte do desafio.",
    hookAction:"Descobrir como funciona", hookSkip:"Prefiro explorar os temas", hookQuestion:"Aterrar já significa ser reutilizável?",
    hookAnswer:"Não basta aterrar. Recuperar é trazer o veículo de volta; reutilizar implica voltar a voar com ele. Entre as duas etapas há avaliação, inspeções e preparação. Por isso, uma aterragem de teste e uma nova missão com o mesmo veículo são marcos diferentes.",
    hookWhy:"Porque importa?", hookWhyBody:"O objetivo é aproveitar mais do veículo, em vez de construir tudo de novo para cada missão. O resultado depende do que se recupera e do trabalho necessário para voltar a voar.",
    heading:"Explorar os programas", official:"Fonte oficial", language:"A fonte pode estar noutro idioma.",
    distinctions:"Anunciado não significa demonstrado", distinctionBody:"Um objetivo de projeto, um resultado de teste e uma capacidade operacional são coisas diferentes. Consulta a fonte para conhecer o contexto e o estado de cada programa.",
    topics:{reuse:["Foguetões reutilizáveis","Como regressa um foguetão — e o que falta até voltar a voar?"],artemis:["Artemis e a Lua","O que é preciso para levar pessoas de volta à Lua?"],starship:["Starship","Porque são os testes tão importantes para desenvolver um novo veículo?"]},
    kinds:["Tecnologia", "Programa", "Demonstrador"],
    summaries:["Explora a família Falcon e o papel da recuperação do primeiro estágio na reutilização.","Conhece a abordagem da Blue Origin ao primeiro estágio reutilizável do New Glenn. Objetivos de projeto não equivalem a reutilizações demonstradas.","Conhece o demonstrador europeu Themis e as tecnologias de recuperação e reutilização em desenvolvimento.","Explora o programa lunar da NASA, as suas missões e os recursos oficiais. Consulta a fonte para os planos e marcos atualizados.","Conhece Starship e Super Heavy e o objetivo de desenvolver um sistema totalmente reutilizável. Separa objetivos anunciados de resultados demonstrados.","Consulta os comunicados da SpaceX para acompanhar resultados de testes, alterações de projeto e próximos objetivos, no contexto dado pela empresa."],
  },
  "en-GB": {
    nav:"Discoveries", launches:"Launches", title:"Space discoveries and advances", eyebrow:"Beyond the countdown",
    intro:"Explore the technologies and programmes shaping the next chapter of space exploration.",
    notice:"An initial editorial selection of guides and official sources. Not an automated news feed or confirmation of announced dates or capabilities.",
    all:"All topics", source:"Explore the source", checked:"Sources reviewed", checkedNote:"Editorial review date, not the original publication date. Pages may change.",
    hookLabel:"No rocket knowledge required", hookTitle:"What if a rocket could fly again?",
    hookBody:"Imagine using an aircraft for a single journey. The comparison helps explain reuse: recovering components so they can be used again. But for a rocket, coming back is only part of the challenge.",
    hookAction:"Discover how it works", hookSkip:"I would rather explore the topics", hookQuestion:"Does landing already mean reusable?",
    hookAnswer:"Landing is not enough. Recovery means bringing the vehicle back; reuse means flying it again. Assessment, inspections and preparation sit between those steps. A test landing and a new mission with the same vehicle are different milestones.",
    hookWhy:"Why does it matter?", hookWhyBody:"The goal is to use more of the vehicle again instead of building everything anew for each mission. The outcome depends on what is recovered and the work needed to fly again.",
    heading:"Explore the programmes", official:"Official source", language:"The source may be in another language.",
    distinctions:"Announced does not mean demonstrated", distinctionBody:"A design objective, a test result and an operational capability are different things. Check each source for context and programme status.",
    topics:{reuse:["Reusable rockets","How does a rocket return — and what happens before it flies again?"],artemis:["Artemis and the Moon","What does it take to bring people back to the Moon?"],starship:["Starship","Why are tests so important when developing a new vehicle?"]},
    kinds:["Technology", "Programme", "Demonstrator"],
    summaries:["Explore the Falcon family and the role of first-stage recovery in reuse.","Explore Blue Origin’s approach to New Glenn’s reusable first stage. Design goals are not demonstrated reuses.","Discover Europe’s Themis demonstrator and the recovery and reuse technologies under development.","Explore NASA’s lunar programme, its missions and official resources. Check the source for updated plans and milestones.","Explore Starship and Super Heavy and the goal of a fully reusable system. Separate announced objectives from demonstrated results.","Read SpaceX’s statements on test results, design changes and upcoming objectives, in the context provided by the company."],
  },
  "es-ES": {
    nav:"Descubrimientos", launches:"Lanzamientos", title:"Descubrimientos y avances espaciales", eyebrow:"Más allá de la cuenta atrás",
    intro:"Explora las tecnologías y programas que están dando forma al próximo capítulo de la exploración espacial.",
    notice:"Selección editorial inicial de guías y fuentes oficiales. No es un feed automático de noticias ni una confirmación de fechas o capacidades anunciadas.",
    all:"Todos los temas", source:"Explorar la fuente", checked:"Fuentes consultadas", checkedNote:"Fecha de revisión editorial, no de publicación original. Las páginas pueden cambiar.",
    hookLabel:"No necesitas saber de cohetes para empezar", hookTitle:"¿Y si un cohete pudiera volar otra vez?",
    hookBody:"Imagina usar un avión para un solo viaje. La comparación ayuda a entender la reutilización: recuperar componentes para usarlos de nuevo. Pero en un cohete, regresar es solo parte del reto.",
    hookAction:"Descubrir cómo funciona", hookSkip:"Prefiero explorar los temas", hookQuestion:"¿Aterrizar ya significa ser reutilizable?",
    hookAnswer:"Aterrizar no basta. Recuperar es traer el vehículo de vuelta; reutilizar significa volver a volar con él. Entre ambos pasos hay evaluación, inspecciones y preparación. Un aterrizaje de prueba y una nueva misión con el mismo vehículo son hitos distintos.",
    hookWhy:"¿Por qué importa?", hookWhyBody:"El objetivo es aprovechar más del vehículo en vez de construirlo todo de nuevo para cada misión. El resultado depende de lo que se recupera y del trabajo necesario para volver a volar.",
    heading:"Explorar los programas", official:"Fuente oficial", language:"La fuente puede estar en otro idioma.",
    distinctions:"Anunciado no significa demostrado", distinctionBody:"Un objetivo de diseño, un resultado de prueba y una capacidad operativa son cosas distintas. Consulta cada fuente para conocer el contexto y estado del programa.",
    topics:{reuse:["Cohetes reutilizables","¿Cómo regresa un cohete y qué falta para volver a volar?"],artemis:["Artemis y la Luna","¿Qué hace falta para llevar personas de nuevo a la Luna?"],starship:["Starship","¿Por qué son tan importantes las pruebas al desarrollar un nuevo vehículo?"]},
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
