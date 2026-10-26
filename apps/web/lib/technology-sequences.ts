import type { Locale } from './i18n';

export const sequenceCopy = {
  'pt-PT': {
    engineTitle:'Como funciona o Raptor 3?',version3:'No Raptor 3, sensores e controladores estão integrados e protegidos no motor. O desenho abre o conjunto para explicar o ciclo; não mostra o aspeto exterior completo nem todas as passagens reais.',
    play:'Reproduzir explicação',pause:'Pausar',replay:'Repetir explicação',reset:'Repor',next:'Etapa seguinte',
    engineNote:'Raptor 3 · ciclo simplificado, não uma sequência de ignição.',
    dockingNote:'Starship V3 · conceito de acoplagem dorsal. Geometria, distâncias e tempos ilustrativos.',
    engine:[
      {title:'Alimentação e bombas',body:'Metano líquido e oxigénio líquido entram por circuitos separados. As bombas elevam a pressão dos propelentes.'},
      {title:'Pré-queimadores e turbinas',body:'Um pré-queimador produz gás rico em metano; o outro, gás rico em oxigénio. Estes gases acionam as turbinas ligadas às bombas.'},
      {title:'Combustão principal',body:'Os dois fluxos gasosos chegam à câmara principal e misturam-se. Aqui ocorre a combustão que produz os gases quentes.'},
      {title:'Bocal e impulso',body:'Os gases expandem-se e aceleram pelo bocal. Ao expulsá-los para baixo, o motor produz impulso no sentido oposto.'},
    ],
    docking:[
      {title:'Encontro em órbita',body:'A cisterna ajusta a sua trajetória e velocidade em relação à nave recetora. A aproximação usa sensores de navegação, incluindo DragonEye.'},
      {title:'Alinhar as interfaces dorsais',body:'As faces opostas aos escudos térmicos ficam frente a frente. A Starship V3 tem quatro pontos de acoplagem; a cisterna pode levar sondas de ligação.'},
      {title:'Acoplar e preparar as ligações',body:'As sondas encontram os pontos recetores e as naves ficam mecanicamente ligadas. As interfaces de propelente têm de ser preparadas antes de transferir líquido.'},
      {title:'Transferir propelente',body:'Só após a ligação, metano e oxigénio seguem circuitos próprios. Preparação térmica, pressão e armazenamento fazem parte do desafio; níveis e duração aqui são simbólicos.'},
    ],
    parts:['Bombas','Pré-queimadores','Câmara','Bocal'],
  },
  'en-GB': {
    engineTitle:'How does Raptor 3 work?',version3:'Raptor 3 integrates and protects sensors and controllers within the engine. This drawing opens the assembly to explain the cycle; it is not the complete exterior or all its real internal passages.',
    play:'Play explanation',pause:'Pause',replay:'Replay explanation',reset:'Reset',next:'Next stage',
    engineNote:'Raptor 3 · simplified cycle, not an ignition sequence.',
    dockingNote:'Starship V3 · dorsal docking concept. Illustrative geometry, distances and timing.',
    engine:[
      {title:'Feed and pumps',body:'Liquid methane and liquid oxygen enter separate circuits. Pumps raise the pressure of the propellants.'},
      {title:'Preburners and turbines',body:'One preburner produces methane-rich gas; the other produces oxygen-rich gas. These gases drive turbines connected to the pumps.'},
      {title:'Main combustion',body:'Both gas streams reach the main chamber and mix. Combustion here produces hot exhaust gases.'},
      {title:'Nozzle and thrust',body:'The gases expand and accelerate through the nozzle. Expelling them downwards produces thrust in the opposite direction.'},
    ],
    docking:[
      {title:'Orbital rendezvous',body:'The tanker adjusts its trajectory and speed relative to the receiving ship. Navigation sensors, including DragonEye, guide the approach.'},
      {title:'Align the dorsal interfaces',body:'The sides opposite the heat shields face each other. Starship V3 has four docking drogues; the tanker can carry docking probes.'},
      {title:'Dock and prepare connections',body:'The probes meet the receiving points and the ships become mechanically connected. Propellant interfaces must be prepared before transferring liquid.'},
      {title:'Transfer propellant',body:'Only after connection do methane and oxygen use their separate circuits. Thermal preparation, pressure and storage remain challenges; levels and duration here are symbolic.'},
    ],
    parts:['Pumps','Preburners','Chamber','Nozzle'],
  },
  'es-ES': {
    engineTitle:'¿Cómo funciona Raptor 3?',version3:'Raptor 3 integra y protege sensores y controladores en el motor. El dibujo abre el conjunto para explicar el ciclo; no muestra todo el exterior ni todos los conductos reales.',
    play:'Reproducir explicación',pause:'Pausar',replay:'Repetir explicación',reset:'Restablecer',next:'Etapa siguiente',
    engineNote:'Raptor 3 · ciclo simplificado, no una secuencia de encendido.',
    dockingNote:'Starship V3 · concepto de acoplamiento dorsal. Geometría, distancias y tiempos ilustrativos.',
    engine:[
      {title:'Alimentación y bombas',body:'El metano líquido y el oxígeno líquido entran en circuitos separados. Las bombas aumentan la presión de los propelentes.'},
      {title:'Prequemadores y turbinas',body:'Un prequemador produce gas rico en metano; el otro, rico en oxígeno. Estos gases accionan las turbinas conectadas a las bombas.'},
      {title:'Combustión principal',body:'Ambos flujos gaseosos llegan a la cámara principal y se mezclan. La combustión produce los gases calientes.'},
      {title:'Tobera y empuje',body:'Los gases se expanden y aceleran por la tobera. Al expulsarlos hacia abajo, el motor produce empuje en sentido contrario.'},
    ],
    docking:[
      {title:'Encuentro orbital',body:'La cisterna ajusta su trayectoria y velocidad respecto a la nave receptora. Sensores de navegación, incluidos DragonEye, guían la aproximación.'},
      {title:'Alinear las interfaces dorsales',body:'Las caras opuestas a los escudos térmicos quedan enfrentadas. Starship V3 tiene cuatro puntos receptores; la cisterna puede llevar sondas de acoplamiento.'},
      {title:'Acoplar y preparar conexiones',body:'Las sondas encuentran los puntos receptores y las naves quedan unidas mecánicamente. Las interfaces de propelente deben prepararse antes de transferir líquido.'},
      {title:'Transferir propelente',body:'Solo tras la conexión, metano y oxígeno usan circuitos separados. Preparación térmica, presión y almacenamiento siguen siendo retos; niveles y duración son simbólicos.'},
    ],
    parts:['Bombas','Prequemadores','Cámara','Tobera'],
  },
} satisfies Record<Locale,unknown>;
