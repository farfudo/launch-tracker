# Descobertas — primeira preview editorial

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
