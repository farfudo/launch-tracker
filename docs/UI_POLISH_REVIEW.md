# Clareza da interface e indicação de desenvolvimento — 25 de outubro de 2026

Rascunho local dos pontos 1–4 da revisão UI, acrescido do aviso pedido pelo utilizador. Sem push ou alteração da aplicação pública.

## Alterações

- Etiqueta permanente e não animada «Em desenvolvimento» junto à marca; PT/EN/ES. Âmbar suave em claro e tom quente escuro em dark, sem aparência de erro. Em ecrãs estreitos passa para baixo da marca, conservando tema/idioma à direita.
- Hero móvel com título, texto, margens e próximo lançamento mais compactos. Pesquisa aproveita a largura; filtros por agência ocupam uma linha com deslocação horizontal, sem remover opções. Mantêm-se contagem, atribuição e acesso ao calendário. Não foi reestruturado todo o sistema de filtros neste lote.
- Sem vídeo válido: mensagem neutra no detalhe, sem botão laranja de contagem zero. Resumo compacto continua sem bloco de vídeo quando não há links.
- Nome de missão genérico conhecido (Unknown Payload, Unknown, TBD, To Be Determined) usa o título completo do lançamento como fallback; nomes reais preservados. Sem tradução ou invenção de informação externa.
- Data no fuso do visitante antes dos botões secundários no detalhe; UTC continua como fallback antes da deteção e as três referências permanecem na secção de horários.
- Fontes: apenas cartões com links HTTPS válidos; ausências reunidas numa nota com categorias, sem perder transparência. Continuam a indicação de proveniência e a ausência de garantia de oficialidade.

## Verificação

90 testes web, build e seis percursos E2E desktop/móvel passaram. Novos testes cobrem etiqueta nos três idiomas, fallback de título, ausência de CTA de vídeo vazio, eliminação de cartões de fontes sem links e presença da hora do visitante. Preview manual em PT, 1280×720 e 390×844; tamanho temporário reposto no fim. Dados e links fictícios, não sincronização de produção. Backend não alterado, testes API/PostgreSQL não repetidos. Não constitui auditoria completa de acessibilidade ou ensaio em dispositivo físico.

## Revisão

Preview em `http://127.0.0.1:3300/`, detalhe com vídeo em `/launches/e2e-falcon` e sem vídeo/fontes em `/launches/e2e-electron`. Etiqueta discreta aprovada; foi apresentada alternativa de faixa curta sob o cabeçalho. O utilizador autorizou apenas commit local; push não autorizado. Pontos 5–6 serão preparados num novo rascunho.
