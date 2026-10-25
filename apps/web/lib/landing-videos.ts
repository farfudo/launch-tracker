import type { Locale } from "./i18n";

// Editorial intervals in the original publishers' videos, checked 25 October 2026.
export const landingVideos = [
  {id:"falcon-9", name:"Falcon 9", publisher:"SpaceX", videoId:"glEvogjdEVY", date:"2017-02-19", start:0, end:35},
  {id:"falcon-heavy", name:"Falcon Heavy", publisher:"SpaceX", videoId:"wbSwFU6tY1c", date:"2018-02-06", start:1785, end:1820},
  {id:"new-glenn", name:"New Glenn", publisher:"Blue Origin", videoId:"ecfxcTEl-1I", date:"2025-11-13", start:6710, end:6775},
  {id:"super-heavy", name:"Super Heavy · Starship", publisher:"SpaceX", videoId:"hI9HQfCAw64", date:"2024-10-13", start:115, end:150},
] as const;

export function landingEmbedUrl(video: typeof landingVideos[number]) {
  return `https://www.youtube-nocookie.com/embed/${video.videoId}?start=${video.start}&end=${video.end}&autoplay=0&rel=0`;
}
export const landingCopy = {
  "pt-PT": {
    eyebrow:"O regresso também faz história", title:"Do espaço, de volta à Terra", intro:"Quatro momentos para perceber a recuperação de um propulsor. Escolhe um excerto e vê como termina a viagem.",
    load:"Ver excerto", close:"Fechar excerto", full:"Vídeo completo na origem", loading:"A carregar o leitor…", privacy:"Os leitores desta galeria só são carregados quando abres um excerto. Depois, usa ▶ no leitor. O YouTube pode apresentar anúncios; se não funcionar, abre a origem.",
    context:["CRS-10: regresso do primeiro estágio a terra.","Voo de demonstração: aterragem dos dois propulsores laterais, não do núcleo central.","NG-2: primeiro estágio na plataforma Jacklyn. O sinal original tem interrupções e fumo no contacto.","Voo 5: captura do Super Heavy pela torre. Não é a aterragem da nave Starship."],
    landspace:"Também a acompanhar: LandSpace e o Zhuque-3", landspaceBody:"A reutilização não se limita a estas empresas. Explora também o programa da LandSpace na fonte oficial; sem vídeo nesta seleção.",
    note:"Seleção histórica, não os voos mais recentes. Recuperar um estágio não prova que voltou a voar. Datas referem-se ao evento, não à publicação do vídeo.",
  },
  "en-GB": {
    eyebrow:"The return makes history too", title:"From space, back to Earth", intro:"Four moments that bring booster recovery to life. Choose an excerpt and see how the journey ends.",
    load:"Watch excerpt", close:"Close excerpt", full:"Full video at source", loading:"Loading the player…", privacy:"Players in this gallery load only when you open an excerpt. Then press ▶ in the player. YouTube may show ads; if playback fails, open the source.",
    context:["CRS-10: first-stage return to land.","Demonstration flight: both side boosters land, not the centre core.","NG-2: first stage on Jacklyn. The original signal has interruptions and smoke at touchdown.","Flight 5: the tower catches Super Heavy. This is not the Starship spacecraft landing."],
    landspace:"Also worth exploring: LandSpace and Zhuque-3", landspaceBody:"Reuse is not limited to these companies. Explore LandSpace’s programme at its official source; no video in this selection.",
    note:"A historical selection, not the latest flights. Recovering a stage does not prove it flew again. Dates identify the event, not the video publication.",
  },
  "es-ES": {
    eyebrow:"El regreso también hace historia", title:"Del espacio, de vuelta a la Tierra", intro:"Cuatro momentos para entender la recuperación de un propulsor. Elige un fragmento y descubre cómo termina el viaje.",
    load:"Ver fragmento", close:"Cerrar fragmento", full:"Vídeo completo en origen", loading:"Cargando el reproductor…", privacy:"Los reproductores de esta galería solo se cargan al abrir un fragmento. Después pulsa ▶ en el reproductor. YouTube puede mostrar anuncios; si falla, abre el origen.",
    context:["CRS-10: regreso de la primera etapa a tierra.","Vuelo de demostración: aterrizaje de los dos propulsores laterales, no del núcleo central.","NG-2: primera etapa en Jacklyn. La señal original tiene interrupciones y humo en el contacto.","Vuelo 5: la torre captura Super Heavy. No es el aterrizaje de la nave Starship."],
    landspace:"También a seguir: LandSpace y Zhuque-3", landspaceBody:"La reutilización no se limita a estas empresas. Explora el programa de LandSpace en su fuente oficial; sin vídeo en esta selección.",
    note:"Selección histórica, no los vuelos más recientes. Recuperar una etapa no demuestra que haya vuelto a volar. Las fechas son del evento, no de la publicación del vídeo.",
  },
} satisfies Record<Locale, unknown>;
