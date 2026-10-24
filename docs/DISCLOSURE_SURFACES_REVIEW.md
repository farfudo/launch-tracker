# Expansões e separação de superfícies — rascunho local

Pedido do utilizador: uniformizar todas as expansões e distinguir cartões/background. A apresentação anterior dos pontos 5–6 foi considerada boa; este refinamento adicional continua sujeito a preview e aprovação antes de commit/push.

## Padrão proposto

Todos os `details/summary` existentes (calendário, partilha, filtros avançados, fusos, privacidade, explicação de dados e janela) passam a ter seta, altura mínima de 44 px, foco visível e estado aberto com botão e painel em tons coerentes. A seta roda e o painel recebe borda/fundo próprio. Mantém-se a semântica nativa e abertura por teclado; não se imita um menu ARIA com comportamento incompleto. Movimento reduzido remove a transição.

Watch here conserva laranja e painel pêssego; os restantes usam verde-acinzentado suave para distinguir contexto sem transformar todas as ações em alertas laranja. A partilha não ganha duas molduras sobrepostas. Calendário indisponível continua desativado e não sugere uma expansão que não existe.

## Superfícies

Proposta recomendada: fundo cinzento quente `#eae9e4`, cartões marfim quase branco `#fffefa`, bordas mais definidas e sombra discreta. Mantêm-se variáveis próprias do modo escuro, com painel expandido verde-escuro e sem clarear toda a página. Alternativa para revisão: fundo mais bege, preservando o mesmo contraste de superfícies; não foi acrescentado um seletor de temas extra.

Sem alteração de dados, URLs, sincronização ou contratos. Cópias da partilha continuam sob ação explícita do visitante; ensaios não enviam mensagens. Este lote inclui o rascunho anterior de contagens/controlos, ainda sem commit. O lote 1–4 permanece em `01ed45b`, local, sem push.

## Verificação

Passaram 92 testes web, build de produção e oito percursos E2E desktop/móvel, incluindo expansão por teclado de calendário/partilha e abertura dos filtros. Preview manual a 1280×900 e 390×844, nos temas claro e escuro; tema claro e tamanho original repostos no final. Captura de revisão: `/tmp/unified-expansions-desktop.png`. Não constitui auditoria formal de acessibilidade/contraste. Backend não alterado nem novamente testado. Aprovação visual pendente; sem commit ou push deste lote.
