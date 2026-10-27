export const pageBackgrounds = {
  launches: {
    src:'/images/backgrounds/launch-artemis-i.webp',
    position:'50% 40%', credit:'NASA / Joel Kowsky',
    title:'Artemis I liftoff · 16 Nov 2022',
    source:'https://www.nasa.gov/image-article/two-years-ago-artemis-i-liftoff/',
  },
  discoveries: {
    src:'/images/backgrounds/discovery-orbital-lab.webp',
    position:'48% 50%', credit:'NASA',
    title:'International Space Station, solar arrays and Earth · 2 Jul 2023',
    source:'https://www.nasa.gov/image-article/the-falkland-islands-the-russian-segment-of-the-space-station-and-a-pair-of-solar-arrays/',
  },
  artemis: {
    src:'/images/backgrounds/artemis-orion.webp',
    position:'45% 50%', credit:'NASA / JSC',
    title:'Artemis I · Orion, Earth and Moon · 28 Nov 2022',
    source:'https://www.nasa.gov/image-detail/amf-art001e000673/',
  },
} as const;

export function getBackgroundSection(pathname:string) {
  if(pathname==='/explore-space'||pathname.startsWith('/explore-space/')) return 'discoveries';
  if(pathname==='/discoveries/artemis'||pathname.startsWith('/discoveries/artemis/')) return 'artemis';
  if(pathname==='/discoveries'||pathname.startsWith('/discoveries/')) return 'discoveries';
  return 'launches';
}
