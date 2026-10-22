# Aperfeiçoamento do dashboard — revisão local

## Alterações

- Pesquisa visível, filtros avançados recolhidos e reabertos quando há um filtro ativo.
- Seis lançamentos iniciais e mais seis por clique; uma única área de deslocamento da página.
- Remoção do segundo destaque da mesma missão e do acesso duplicado Calendar.
- Destaque em fluxo normal, sem posicionamento sticky: acompanha o scroll e não invade os cartões inferiores, mesmo com o título português mais alto.
- Painel de missão abaixo do destaque: seleção de cartões em desktop atualiza descrição, local, plataforma, estado e janela sem sair do calendário. Começa com a próxima missão e preserva a ligação à página completa. Em ecrãs até 800 px, os cartões continuam a abrir diretamente a página de detalhe.
- O painel trata carregamento, erro, nova tentativa e respostas fora de ordem; usa um endpoint Next.js na mesma origem, que consulta apenas o detalhe já existente da API.
- Cartão e painel partilham a faixa turquesa de seleção. Uma seleção realça brevemente a borda do painel e apresenta o conteúdo com fade e deslocação de 6 px em 200 ms. A página só se desloca quando o cabeçalho do painel não está visível; com redução de movimento, a atualização e a deslocação são imediatas.
- Botão do destaque adaptado ao ecrã: em desktop, «Explorar próxima missão» seleciona a próxima missão no painel; até 800 px, «Ver próximos lançamentos» mantém o scroll até à lista. Sem dados da próxima missão, o acesso à lista continua disponível em todos os ecrãs.
- Filtros rápidos de agência com indicador imediato, anúncio de atualização e resultados anteriores esbatidos enquanto a navegação termina. Preservam pesquisa, veículo e favoritos; os pedidos independentes do calendário e da próxima missão passam a começar em paralelo.
- Featured launch reposto com a missão seguinte, diferente da próxima missão do destaque principal. É uma seleção automática de dados reais, não uma escolha editorial manual.
- Datas no fuso do visitante, identificado no cartão; UTC durante a deteção inicial.
- Contagens apenas para estados Go / Go for Launch, identificadas como estimativas. Outros estados mostram hora por confirmar; ao atingir a hora, o cartão pede consulta do estado e não anuncia lançamento ou transmissão.
- Inter Variable servida localmente pelo pacote Fontsource; traduções PT/EN/ES para os novos blocos.
- Tema resistente a armazenamento bloqueado, alterações do sistema e mudanças entre separadores. A escolha manual prevalece; uma falha de gravação mantém a escolha apenas na visita e apresenta um aviso.
- Miniaturas e respetivos metadados de atribuição na resposta da lista da API. A interface deixa de consultar os primeiros seis detalhes e usa carregamento diferido das imagens dos cartões. Continua a existir um pedido de detalhe para o destaque.
- O link de salto para o conteúdo também funciona nas páginas de detalhe, erro e carregamento.

## Compatibilidade e publicação

Os novos campos de imagem na API são aditivos e usam as colunas existentes; não há migração nem sincronização de dados. Publicar primeiro a API permite disponibilizar as miniaturas ao novo frontend. Com a API antiga, o frontend continua funcional e usa a ilustração quando os campos estão ausentes.

Preview isolada: http://localhost:3200/ — cache local de dados reais, independente do site público. A atualização da preview não atualiza a idade dos dados. Não foi feito commit, push ou deploy público desta ronda.

## Verificação

- 38 testes da interface e 19 testes da API passaram.
- Lint global, build de produção e verificação de whitespace passaram.
- Novos testes: preferência do sistema, escolha manual, armazenamento bloqueado, alteração de tema entre separadores e carregamento progressivo preservando favoritos.
- Navegador: pesquisa Starlink, filtro SpaceX operado por teclado, guardar/remover favorito, vista de favoritos, carregamento de 6 para 12 cartões e tradução para espanhol.
- Desktop 1440 px e móvel 390 px, incluindo tema escuro; sem overflow horizontal. Fonte Inter Variable confirmada. Sem erros na consola durante os fluxos verificados.
- Auditoria das dependências de produção: zero vulnerabilidades reportadas. A instalação também reportou oito avisos nas dependências de desenvolvimento; não foram aplicadas atualizações forçadas nesta ronda.

## Opções para a revisão visual

1. Proposta implementada: seis cartões, pesquisa aberta e filtros avançados recolhidos.
2. Lista inicial de três cartões: página mais curta, mais cliques para explorar.
3. Lista inicial de nove cartões: mais missões visíveis, página mais longa.
