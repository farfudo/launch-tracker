# Descobertas — primeira preview editorial

**Estado atual:** a galeria e os cartões descritos no histórico abaixo pertencem a versões anteriores. O rascunho de reformulação de 25/10/2026 retira a galeria, compacta o hook e acrescenta laboratório visual e guia Artemis. Ver `DISCOVERIES_REDESIGN.md` para estudo, fontes, limites e opções da nova preview. Sem push/publicação.

## Âmbito

Rota `/discoveries` com três entradas temáticas: reutilização, Artemis/Lua e Starship. Navegação no cabeçalho liga calendário e nova secção. Filtros URL `topic` sem duplicar fontes com vários temas; valor desconhecido regressa à seleção completa. PT/EN/ES, claro/escuro e layout móvel. Conteúdo introdutório original, seis recursos oficiais, sem copiar artigos, logos ou fotografias externas. Arte em CSS e ícones existentes.

Esta entrega é uma seleção de guias/fontes, não um feed cronológico de notícias, rastreador de estatísticas ou cronologia atualizada de marcos. Não há recolha automática, scraper, novo cron, API externa em runtime nem IA. A data 25/10/2026 identifica revisão editorial, nunca publicação do artigo ou última atualização do programa. Não são atribuídos selos de operação/demonstração sem investigação específica do acontecimento.

## Fontes investigadas

- NASA Artemis: https://www.nasa.gov/humans-in-space/artemis/
- RSS oficial com tema Artemis: https://www.nasa.gov/rss-feeds/
- Regras NASA de media: https://www.nasa.gov/nasa-brand-center/images-and-media/
- SpaceX: https://www.spacex.com/vehicles/falcon-9/ e https://www.spacex.com/vehicles/starship/
- Comunicados SpaceX: https://www.spacex.com/updates/ e página pesquisável https://www.spacex.com/updates/reusability
- Blue Origin New Glenn: https://www.blueorigin.com/new-glenn
- ESA Themis: https://www.esa.int/Enabling_Support/Space_Transportation/Themis

Consulta em 25/10/2026. Páginas SpaceX dependentes de JavaScript não disponibilizaram corpo textual ao leitor web; conteúdo descritivo conservador, apoiado também pela página de atualizações pesquisável. URLs não equivalem a verificação permanente de todos os links.

Não se assumiu licença irrestrita de assets: NASA tem regras, exceções para terceiros, identidade e aparência de endosso. Nenhum media externo reutilizado nesta fase. Recolher RSS não significa licença para republicar artigos completos ou todas as imagens. Revisão asset-a-asset necessária antes de integrar fotografias. Não constitui parecer jurídico.

## Próximo incremento proposto

1. Validar esta hierarquia/nomes e distinguir guias de atualizações datadas.
2. Integrar RSS Artemis no servidor com limites de tamanho/tempo, sanitização de texto, URLs HTTPS permitidas, cache e fallback de indisponibilidade. Guardar publicação e consulta separadamente.
3. Publicar apenas resumos curtos próprios com fonte, não HTML/arbitrário de feed. Verificar permissões por imagem ou manter arte própria.
4. Acrescentar notícias SpaceX/Blue Origin/ESA apenas após definir fonte sustentável, sem prometer API/RSS que não foi confirmado.
5. Mais tarde, relacionar notícias e lançamentos por entidade/tema, sem inferir capacidades demonstradas de objetivos comerciais.

## Verificação e limites

95 testes web, build e 14 E2E passaram (dois casos desktop omitidos no móvel). Cobertos temas, seis fontes únicas, hosts HTTPS permitidos, idiomas PT/EN, tema escuro/claro, contagens por filtro e ausência de overflow no cenário móvel. Testes externos bloqueados; não se acionaram links para publishers. Capturas desktop/móvel revistas.

Primeira suite encontrou dois problemas distintos: asserção antiga proibia qualquer nav no cabeçalho (atualizada para as duas secções pedidas) e cache de fixtures com mais de seis horas gerava Saved response expired. Cache gerada movida de forma recuperável para `/private/tmp/launch-preview-cache.c533hi`; regras de produção mantidas. Repetição completa passou. Sem testes backend repetidos, pois não houve alteração de API/BD.

Rascunho local; sem commit/push/deploy. Confirmar preview e autorização separada de push. Roadmap/exportações mantêm-se locais.

## Revisão seguinte: entrada para iniciantes

Base inicial aprovada e guardada em `f6b4c06`, sem push. Novo rascunho acrescenta hook sobre voltar a voar, relevância em linguagem simples, pergunta colapsada que distingue recuperar/reutilizar e CTA para recursos. Analogia com avião é explicitamente introdutória; não promete custos/fiabilidade iguais. Alternativa «Prefiro explorar os temas» permite contornar o texto. Três temas ganham perguntas convidativas. PT/EN/ES; mesma curadoria e fontes da base, sem novos marcos ou dados temporais.

95 testes web, build e suite com 14 E2E passaram; pergunta por teclado e navegação de CTA cobertas. Novo rascunho não incluído no commit da base e requer aprovação própria.
# Excertos de recuperação — revisão de 25/10/2026

Revisão dos controlos autorizada: hook com controls=0, mantendo botão próprio acessível para reproduzir/pausar e origem permanente. O parâmetro desativa os controlos nativos, não todos os elementos de interface/marca do fornecedor. Teste valida configuração sem afetar os quatro leitores da galeria.

Atualização posterior a pedido do utilizador: hook com captura Super Heavy em 02:05–02:25, até 2×, silenciosa e contínua. Usa [IFrame API oficial](https://developers.google.com/youtube/iframe_api_reference), incluindo setPlaybackRate, mute, eventos e loadVideoById com startSeconds/endSeconds para repetir apenas o intervalo. Repetição pode ter transição de carregamento; não é GIF local nem garantia de autoplay. Respeita prefers-reduced-motion, pausa manual, visibilidade do documento e do elemento; origem acessível em caso de bloqueio/erro. O hook contacta YouTube automaticamente em modo normal — a regra de carregamento só por clique abaixo refere-se exclusivamente à galeria, não à página inteira. Sem download de media.

Galeria local de quatro vídeos dos próprios publicadores, com intervalo no leitor original e ligação permanente para a versão completa. Sem download, GIF, transcodificação ou republicação. O iframe YouTube em modo de privacidade reforçada só é criado depois de clicar; não significa ausência de comunicação com a Google após abrir. Sem reprodução automática, thumbnails remotas ou scripts externos antes do clique. Um leitor de cada vez; fechar remove-o e interrompe reprodução. Não há garantia de disponibilidade futura nem de ausência de anúncios/bloqueios do fornecedor.

| Exemplo / evento | Origem | Intervalo selecionado |
| --- | --- | --- |
| Falcon 9, CRS-10, 19/02/2017 | [SpaceX — First Stage Landing](https://www.youtube.com/watch?v=glEvogjdEVY) | 00:00–00:35 |
| Falcon Heavy, demonstração, 06/02/2018 | [SpaceX — Test Flight](https://www.youtube.com/watch?v=wbSwFU6tY1c) | 29:45–30:20 |
| New Glenn, NG-2, 13/11/2025 | [Blue Origin — NG-2](https://www.youtube.com/watch?v=ecfxcTEl-1I) | 1:51:50–1:52:55 |
| Super Heavy, voo 5, 13/10/2024 | [SpaceX — Fifth Flight Test](https://www.youtube.com/watch?v=hI9HQfCAw64) | 01:55–02:30 |

Publicadores verificados na interface YouTube; navegação e imagens dos momentos revistos no navegador. Falcon Heavy mostra os dois propulsores laterais (não núcleo central); Super Heavy é captura pela torre, não aterragem da nave superior. NG-2 tem perda de sinal/fumo junto ao contacto, limitação indicada no cartão; contexto confirmado na [página oficial da missão](https://www.blueorigin.com/missions/ng-2). Esta seleção histórica não se apresenta como os acontecimentos mais recentes.

[LandSpace](https://www.landspace.com/) referenciada com Zhuque-3 e ligação oficial, sem vídeo nem afirmação não verificada sobre o último marco. A página oficial consultada já lista recuperação em 19/08/2026; não se mantém a suposição anterior de que só existia teste suborbital de 2024.

Parâmetros start/end/autoplay conforme [documentação oficial YouTube](https://developers.google.com/youtube/player_parameters); tempos absolutos, não duração relativa. Recorte é uma janela de reprodução do original, não ficheiro novo; fornecedor pode aproximar o início a um keyframe. Leitor mínimo de 200px de altura. Os testes de interação isolam o fornecedor e não provam disponibilidade real dos quatro embeds em todos os dispositivos/regiões.
