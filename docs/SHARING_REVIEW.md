# Partilha de missões

Estado atualizado: preview aprovada pelo utilizador e commit/push autorizados separadamente. As notas de rascunho seguintes registam a preparação. Deploy público ainda sujeito a verificação após o envio.

Rascunho local solicitado pelo utilizador, sem commit/push ou publicação. Botões no painel do calendário e na página completa. PT/EN/ES, alvos de pelo menos 44 px e feedback acessível.

## Comportamento

- Partilhar missão chama o menu nativo quando `navigator.share` está disponível, sempre após clique. O visitante escolhe o destino; a aplicação não envia mensagens por iniciativa própria.
- Sem menu nativo, o mesmo botão tenta copiar a ligação. Copiar ligação está também disponível como ação explícita independente.
- A ligação contém apenas a origem atual e `/launches/{id}`, sem filtros, parâmetros de preview ou identificadores do visitante. Em localhost, a ligação permanece local: não serve como demonstração pública para terceiros.
- A espera real mostra o foguetão orbital e bloqueia cliques duplicados. A confirmação de cópia só aparece após sucesso.
- Cancelar o menu nativo não copia a ligação, não tenta outro canal e não mostra erro.
- Em falha, apresenta explicação e campo só de leitura para seleção manual. Não usa APIs antigas de cópia, serviços de partilha, rastreio ou permissões prévias.
- O estado é reiniciado ao mudar de missão para não apresentar a confirmação da missão anterior.

## Dificuldade encontrada

O primeiro teste de cancelamento revelou que `DOMException` não passava sempre no teste `instanceof Error` entre contextos. A deteção foi alterada para verificar o nome `AbortError` de forma segura, sem depender da cadeia de protótipos. Cancelamento continua distinto de rejeição ou falha do navegador.

## Validação e revisão

Testes simulam partilha nativa, cópia, cancelamento, acesso recusado, URL e bloqueio de repetição. O teste não envia mensagens reais nem substitui validação manual nos sistemas móveis. Preview usa dados fictícios da API local, sem sincronização pública.

Opções para aprovação: manter dois botões explícitos (atual), recolher Copiar ligação num menu, ou apresentar a partilha apenas na página completa. Push continua dependente de autorização separada.

Verificação concluída: 63 testes web, build de produção e quatro percursos E2E de regressão desktop/móvel passaram. Os sete testes novos cobrem a lógica de partilha com APIs simuladas; os E2E existentes verificam a regressão dos percursos, não envio real de mensagens. No browser da preview, Copiar ligação apresentou Link copied. O menu nativo e a entrega a destinatários não foram exercitados em dispositivo físico.
