# Descobertas — estudo e reformulação editorial (25/10/2026)

## Objetivo e decisão

O utilizador pediu menos scroll e uma experiência que convide iniciantes a explorar motores, materiais e avanços, retirando a galeria de vídeos anteriormente aprovada. A base está no commit local `c961731`; não houve push. A nova versão é um rascunho.

Escolha editorial: **experimentar uma ideia aqui; aprofundar um programa noutra página**. Não tentar competir com um feed de notícias nem listar dezenas de empresas sem explicar a sua relevância.

1. Cabeçalho e hook mais compactos, preservando vídeo Super Heavy e pergunta de entrada.
2. Laboratório de três temas com uma ilustração conceptual interativa de cada vez, evitando três artigos longos empilhados. Botões mudam o tema e uma ação mostra o princípio; resposta textual acompanha a imagem. Não são simulações quantitativas nem previsões.
3. Destaque Artemis com ligação para guia próprio: veículos, funções, missões realizadas/previstas, desafios e fontes.
4. Biblioteca de fontes recolhida inicialmente, mantendo filtros existentes por URL; tema explícito abre-a. Sem galeria nem leitores adicionais.

## Pesquisa: temas escolhidos

### Motores: o que os diferencia, para além de uma chama

- [SpaceX — Starship/Raptor](https://www.spacex.com/vehicles/starship/design): motor a metano e oxigénio, combustão faseada. Evitadas contagens de motores, modelos e valores de impulso sujeitos a versão.
- [Blue Origin — BE-4](https://www.blueorigin.com/es-MX/engines/be-4): gás natural liquefeito/oxigénio e combustão faseada rica em oxigénio. Não são equiparados os ciclos/projetos Raptor e BE-4. A página inglesa antiga redireciona para catálogo; a fonte localizada conserva explicação específica.
- Ilustração mostra apenas entradas, motor/bocal e gases. Não representa circuito de pré-queimadores, proporções de mistura, desempenho ou comparação de eficiência. A reutilização não é atribuída apenas ao combustível.

### Materiais: uma história concreta, não «metal milagroso»

- [ESA — Cassandra, 03/03/2026](https://www.esa.int/Enabling_Support/Space_Transportation/Future_space_transportation/Self-repairing_spacecraft_could_change_future_missions): sensores e aquecimento num compósito, testados em amostras/demonstradores.
- Preferido a tabelas arbitrárias «aço vs carbono» sem condições equivalentes. A interação esconde uma fissura desenhada para explicar a intenção, não medir/garantir reparação real nem afirmar utilização operacional numa nave.

### Reabastecimento: ponte entre tecnologia e exploração lunar

- [NASA — Cryogenic Fluid Management](https://www.nasa.gov/space-technology-mission-directorate/tdm/cryogenic-fluid-management-cfm/): armazenar, transferir e medir fluidos muito frios; temperatura e comportamento em microgravidade são parte do desafio.
- Depósitos e fluxo são simbólicos. Não se afirma que toda a transferência de combustível no espaço é inédita; o assunto é a gestão criogénica para estas arquiteturas. Sem litros, desempenho ou número de lançamentos inventados.

## Artemis: profundidade útil, separada do hub

Fontes prioritárias:

- [Visão geral NASA](https://www.nasa.gov/humans-in-space/artemis/).
- [Artemis I](https://www.nasa.gov/mission/artemis-i/), [resultado Artemis II/escudo térmico — 15/10/2026](https://www.nasa.gov/missions/artemis/artemis-2/rigorous-analysis-confirms-nasas-artemis-ii-heat-shield-performance/), [Artemis III](https://www.nasa.gov/mission/artemis-iii/).
- [Atualização HLS — 23/10/2026](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/).
- [NASA SLS](https://www.nasa.gov/humans-in-space/space-launch-system/), [Orion/módulo tripulado](https://www.nasa.gov/reference/crew-module/), [ESA Orion/módulo de serviço](https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion/Orion_spacecraft).

Dificuldade editorial real: páginas antigas e novas descrevem arquiteturas diferentes. A atualização de 23/10/2026 e a página atual de Artemis III têm prioridade sobre cronologias antigas. III é apresentada como demonstração orbital prevista, não alunagem já realizada; objetivo 2028 não recebe countdown nem selo de confirmação. Não se desenha Gateway como passagem obrigatória. O esquema é um mapa de funções e não uma trajetória específica. Starship, Super Heavy e Starship HLS são distinguidos.

## Experiência, acessibilidade e manutenção

- SVG/CSS próprios, sem imagens externas, licenças de terceiros ou downloads. Legendas, estados textuais e controlos nativos de teclado; cor não é a única indicação de estado.
- Um tema visível de cada vez; «O desafio» em divulgação nativa. Movimento reduzido desativa animações/transições das ilustrações. A ação pode ser reposta.
- Conteúdo PT/EN/ES e revisão editorial datada; não se apresenta como notícias atualizadas automaticamente.
- Vídeo do hook mantém as regras aprovadas de som, pausa, movimento reduzido e fornecedor. A nova página de guia não adiciona leitores nem pedidos de media externos.
- Sem IA/API paga, cron, sincronização, migração ou alteração pública.

## Opções para revisão

Recomendado: laboratório primeiro, Artemis a seguir. Alternativas: inverter a ordem para dar maior destaque a Artemis; ou simplificar a biblioteca para apenas ligações. Futuro: novos guias bem pesquisados (proteção térmica, aterragem autónoma, propulsão elétrica) e só depois um feed com cache, datas editoriais e regras de atualização explícitas.

## Referências concretas para as ilustrações — Raptor e Starship

Pedido do utilizador: trocar o motor genérico por inspiração no Raptor e depósitos isolados por duas Starships em órbita. Verificação em 25/10/2026:

- SpaceX, https://www.spacex.com/updates/reusability : identifica o Raptor como motor reutilizável de metano/oxigénio de combustão faseada de fluxo total. O desenho usa referências visuais dessa família, sem afirmar reproduzir todas as tubagens/peças ou uma versão específica.
- NASA, 23/10/2026, https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/ : arquitetura planeada com Starships-cisterna a fornecer propelente a uma Starship-depósito, que abastece o veículo HLS. É um conceito de operações sujeito a demonstração, não garantia de datas/configuração.
- NASA TechPort, https://techport.nasa.gov/projects/116764 : projeto concluído de transferência de oxigénio líquido entre depósitos de uma única Starship. Não equivale a demonstração entre duas naves.

Decisão visual: duas silhuetas Starship com cortes de depósitos separados para O₂ e CH₄, sem chamas durante a transferência. Percursos tracejados representam fluxos; posição, ligação, volumes e variantes são simbólicos. Legenda visível «conceito planeado» e detalhe explicam limites. O estado do projeto nunca é inferido apenas a partir da animação.

## Destaque fotográfico Artemis — 26/10/2026

Fotografia escolhida: NASA/JSC, Artemis I Flight Day 13: Orion, Earth, and Moon, 28/11/2022, identificador art001e000673. Página original https://www.nasa.gov/image-detail/amf-art001e000673/ . Mostra hardware real e o contexto Terra–Lua numa só imagem; preservada inteira (contain) para não perder os dois astros em recortes mobile. Identificação histórica/data/crédito visíveis, ligação à fonte e sem sugerir apoio institucional. Uso informativo segundo https://www.nasa.gov/nasa-brand-center/images-and-media/ . Carregamento lazy, área reservada e fallback em erro. Substitui desenho lunar decorativo e lista de tópicos redundantes no cartão, mantendo título, explicação e acesso ao guia.

## Funcionamento por fases, não movimento decorativo — 26/10/2026

Nova investigação para corrigir a limitação do desenho anterior:

- SpaceX, «Introducing Starship V3», https://www.spacex.com/updates/reusability : quatro docking drogues na face leeward (oposta ao escudo térmico), sondas na configuração cisterna, interfaces de propelente e navegação DragonEye. O mesmo artigo descreve integração/proteção de sensores e controladores no Raptor 3. Evitar apresentar tubagem ilustrada como corte exato do hardware, ou distância/cronologia animada como dados de voo.
- NASA, Rocket Propulsion Fundamentals, full-flow staged combustion (Two TPAs / Two PBs), https://ntrs.nasa.gov/api/citations/20140002716/downloads/20140002716.pdf : base didática para separar bombas, dois pré-queimadores/turbinas, combustão principal e expansão no bocal. O percurso da explicação não é a sequência de arranque/ignição do Raptor 3.

Decisão: quatro fases com reprodução/pausa, avanço manual e reposição, sem recuperar os cartões de passos rejeitados. Raptor: alimentação → pré-queimadores/turbinas → câmara → bocal/impulso. Starships: encontro → alinhamento dorsal → captura/ligação → transferência. Escudos orientados para fora, quatro pontos de união e fluxo apenas após ligação, com líquidos separados. Ilustração continua conceptual e não resolve detalhes não publicados. Preferência de movimento reduzido usa avanço manual e estados estáticos.
