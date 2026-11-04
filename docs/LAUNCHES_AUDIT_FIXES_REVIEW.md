# Ajustes da auditoria Launches — rascunho 4/11/2026

Branch codex/launches-audit-fixes. Pontos 1, 3, 4 e 5 autorizados; countdown/precisão (ponto 2) intocados. Sem commit/push/deploy.

- Detalhe: API pública USSF-432 respondeu 200 e payload passou validação. Renderização local também 200. Não foi reproduzida a causa histórica da falha publicada; não se declara resolvida por completo. Nova boundary específica de missão com texto PT/EN/ES, refresh RSC + reset e regresso ao calendário, testada localmente. Sem dados falsos em fallback ou relançamento automático de requests.
- Mobile: reduzida altura mínima/padding/tipografia do destaque e ritmo da atividade, preservando créditos, targets e contagens. Desktop mantém proporções. Nenhuma lógica de countdown alterada.
- Cabeçalho: (i) junto do título; avisos de cache com linha própria abaixo em vez de coluna estreita. Avisos não ocultados.
- Calendário rápido: destinos Google/.ics imediatamente visíveis no dialog, aviso estático/provisório visível e detalhe da precisão no (i). Export/ICS/origem/NET não alterados. Mission Details conserva disclosure existente.
- Imagens: títulos que identificam explicitamente uma ilustração recebem contain apenas nas miniaturas da lista. Fotografia mantém cover e heros existentes. Ceres-2 tem desenho pequeno na fonte: não foi criada resolução inexistente nem trocada imagem sem fonte/licença. Melhoria adicional depende de asset oficial adequado.

Validação: 26 testes direcionados (calendário, imagens, cache e erro de missão), TypeScript; ESLint dos componentes alterados passou antes do último ajuste de CSS/texto. Visual 390/1440, claro/escuro, modal calendário e detalhe USSF-432 locais com API pública apenas de leitura. Não foi medido WCAG formalmente, nem testado envio a serviços de calendário externos. Sem CI/build completo neste rascunho; check:push obrigatório antes de eventual push.

Revisão: compactação moderada implementada; alternativa futura seria recolher estatísticas no mobile, mas não foi feita para preservar a informação visível. A causa da falha Vercel continua por fechar; sem acesso aos logs dessa requisição não prometer correção causal.
