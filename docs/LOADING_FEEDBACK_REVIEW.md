# Rascunho — feedback de carregamento

Estado: visual do foguetão aprovado e commit/push autorizados explicitamente pelo utilizador em 23 de outubro de 2026. As menções a rascunho abaixo registam a preparação local; a publicação pelos alojamentos é uma etapa posterior a verificar.

Revisão visual posterior: a pedido do utilizador, a rodinha foi substituída por um foguetão SVG com chama laranja e oscilação vertical suave. O mesmo elemento é usado nos filtros de agência e restantes estados de espera. O SVG é decorativo, sem leitura duplicada por tecnologias de apoio; o texto de carregamento mantém-se. `prefers-reduced-motion` desativa as duas animações. Sem imagens externas, bibliotecas novas ou espera artificial. Preview e aprovação permanecem separadas de commit/push.

Verificação desta revisão: 54 testes web e compilação de produção passaram. O teste de submissão confirma SVG/chama, ícone decorativo, bloqueio de repetição e fim do indicador. Preview visual confirmada em `/preview/loading` na porta 3300. Não foram repetidos os percursos E2E nesta revisão exclusivamente visual; o comportamento de movimento reduzido foi revisto no CSS, não ensaiado num dispositivo físico.

Na preparação inicial, sem commit/push/deploy. Preview isolada em http://127.0.0.1:3300/preview/loading; só neste servidor DESIGN_PREVIEW=true. É uma simulação explícita, sem chamadas à API. Em produção a rota de preview continua dependente dessa variável.

Spinner partilhado em pesquisa/submissão, idioma, nova tentativa, carregamento da página, carregamento do painel de missão e ligações de período/favoritos/limpar/detalhes/destaques. Os chips de agência já tinham feedback próprio. Usamos estado real de transição e useLinkStatus, não um atraso artificial. Operações instantâneas, downloads locais e ligações a serviços externos não ganham falsos indicadores; não conseguimos confirmar quando um site externo terminou de carregar.

Pesquisa preserva formulário GET e parâmetros, usa navegação Next.js quando há JavaScript e impede reenvio enquanto pendente. O indicador de link reserva espaço; texto de carregamento acessível. Movimento reduzido desativa o movimento do foguetão e da chama. Uma rota já em cache pode não precisar de indicar espera; o fallback de página cobre a navegação após a mudança de URL. A animação não acelera o serviço.

Validação: 54 testes web, build e quatro percursos E2E desktop/móvel passaram. Teste novo verifica indicador, parâmetros, bloqueio de segunda submissão e recuperação do botão. O cancelamento do painel de detalhe conserva os testes existentes. A preview visual foi confirmada no browser.

Opções revistas: foguetão com chama e texto (aprovado), foguetão mais pequeno ou animação mais suave. Skeletons para cartões continuam uma possível etapa futura. Não apresentar todas as features do roadmap como implementadas.
