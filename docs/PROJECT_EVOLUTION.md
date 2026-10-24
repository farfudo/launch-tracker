# NextRocketLaunch — evolução técnica e histórico explicado

Documento de apoio à apresentação do projeto final. Atualizado em 23 de outubro de 2026 a partir do histórico Git, do código e dos registos de trabalho disponíveis. Abrange os 31 commits até `77dac29` e descreve a revisão de sincronização entregue com este documento. Não é uma certificação de disponibilidade, segurança ou cumprimento de requisitos comerciais. Atualizar este ficheiro em cada incremento, incluindo dificuldades, solução, evidência e pendências; não declarar um push ou deploy antes de o confirmar.

## 1. Objetivo e âmbito

Criar uma aplicação web para descobrir e acompanhar lançamentos espaciais, com qualidade de portefólio e possibilidade de evolução comercial. O MVP inclui calendário/lista global, pesquisa, filtros, detalhe e identificação das fontes. Foram acrescentados idiomas, fusos horários, favoritos locais, transmissões e exportação para calendário.

O projeto começou com o nome Launch Tracker, passou por LaunchSkyline e usa atualmente a marca pública NextRocketLaunch. O repositório mantém `launch-tracker`. Algumas referências internas antigas não constituem produtos distintos.

Não estão implementados alertas automáticos, contas de utilizador, pagamentos nem telemetria em tempo real. Uma contagem decrescente não é acompanhamento do voo. Uma ligação de vídeo não garante que exista uma transmissão em direto disponível.

## 2. Como interpretar commit, push e publicação

- **Commit:** registo versionado de alterações, com identificador e mensagem. Permite inspecionar o que mudou e a sua evolução.
- **Push:** envio de commits para o repositório remoto. Pode enviar vários commits numa única operação.
- **CI:** execução automática de verificações e testes; não é sinónimo de publicação.
- **Publicação/deploy:** colocação de uma versão num serviço, como Vercel ou Render.
- **Migração:** mudança versionada da estrutura da base de dados.
- **Sincronização:** consulta da fonte externa e atualização dos dados guardados.

Estas operações são independentes. Publicar um campo novo não preenche automaticamente os registos antigos. É necessário aplicar a migração e obter dados numa sincronização bem-sucedida.

Na primeira redação, uma consulta confirmou `main` no GitHub em `8c5f96af59eb6d38be1f8c815f3a599c36b66dfe`. Posteriormente foram confirmados os pushes de `7dd1e27` e `77dac29`, descritos adiante. O Git não permite reconstruir, por si só, a hora e o agrupamento de todos os pushes. Por isso, não atribuímos um push individual nem um deploy bem-sucedido a cada linha. O resultado do push deste incremento deve ser consultado no histórico remoto; a redação de um documento não prova publicação.

## 3. Arquitetura adotada

```text
Visitante → Next.js / TypeScript na Vercel → FastAPI / Python no Render
                                                ↓
                                          PostgreSQL no Neon
                                                ↑
                           Importação normalizada da Launch Library 2
                           (CLI agendada no GitHub Actions)

Cloudflare Worker → endpoint protegido da FastAPI
                    [integração em validação, não operação horária validada]
```

A interface apresenta os dados; a API define os contratos; o cliente externo interpreta a Launch Library; os repositórios tratam da persistência. PostgreSQL guarda uma cópia normalizada para não consultar a fonte em cada visita. Alembic versiona alterações de esquema. Docker permite ensaiar o arranque num ambiente isolado. GitHub Actions verifica o código e executa a importação agendada.

São componentes separados, mas não uma arquitetura de microserviços complexa. Esta organização é suficiente para o âmbito atual e reduz o custo de manutenção.

## 4. Histórico completo dos commits

Todos os identificadores ligam à alteração correspondente no GitHub. As datas são as registadas pelo histórico Git, não datas de publicação.

### Fase A — Fundação, dados e qualidade (21 de outubro)

| Commit | Alteração e motivo |
| --- | --- |
| [9dbbf61](https://github.com/farfudo/launch-tracker/commit/9dbbf61) | **MVP inicial.** Criou SPEC, estrutura da interface/API, cliente da fonte, modelo de lançamentos, persistência, configuração local e primeiros testes. Estabeleceu a separação de responsabilidades. |
| [6cabc44](https://github.com/farfudo/launch-tracker/commit/6cabc44) | **Migrações Alembic.** Substituiu a criação pontual da base por mudanças versionadas e reproduzíveis. Permite acompanhar a evolução do esquema sem recriar os dados. |
| [ec2976c](https://github.com/farfudo/launch-tracker/commit/ec2976c) | **Pesquisa, filtros e detalhe.** Acrescentou parâmetros na URL, filtragem na base e páginas por identificador. Uma pesquisa passa a poder ser partilhada por ligação. |
| [e6e64ea](https://github.com/farfudo/launch-tracker/commit/e6e64ea) | **Origem dos dados e estados de interface.** Guardou a ligação da fonte e acrescentou apresentações de carregamento/erro. Identifica a proveniência sem inventar ligações oficiais. |
| [fb5f9a1](https://github.com/farfudo/launch-tracker/commit/fb5f9a1) | **Integração contínua.** Configurou verificações da API e interface no GitHub Actions. Objetivo: detetar regressões antes de considerar uma alteração pronta. |

### Fase B — Alojamento e atualização (22 de outubro)

| Commit | Alteração e motivo |
| --- | --- |
| [b652bb4](https://github.com/farfudo/launch-tracker/commit/b652bb4) | **Demonstração Docker.** Preparou imagens da interface/API, Compose isolado, configuração de ligação e CLI de importação. O ensaio encontrou uma dependência de execução classificada incorretamente como desenvolvimento. |
| [721a323](https://github.com/farfudo/launch-tracker/commit/721a323) | **Correção do arranque Render.** Introduziu um script de arranque para evitar interpretação incorreta de um comando composto com aspas. Mostra a diferença entre configuração local e execução no alojamento. |
| [298031f](https://github.com/farfudo/launch-tracker/commit/298031f) | **Arranque sem depender do sucesso da fonte.** Permitiu iniciar a API quando a importação externa não estava disponível. Evitou que um limite da fonte impedisse servir dados já guardados. |
| [142077b](https://github.com/farfudo/launch-tracker/commit/142077b) | **Marca LaunchSkyline.** Atualizou identidade pública e documentação de nome. Foi uma etapa intermédia, posteriormente substituída por NextRocketLaunch. |
| [8d61812](https://github.com/farfudo/launch-tracker/commit/8d61812) | **Sincronização independente e idade da cache.** Retirou a importação do arranque, preparou workflow horário, endpoint protegido e indicador de atualização. Tratou explicitamente limites HTTP 429. |
| [8cc33c7](https://github.com/farfudo/launch-tracker/commit/8cc33c7) | **Registo operacional.** Documentou uma sincronização de produção bem-sucedida e a ativação da configuração. Uma execução manual não prova funcionamento do agendamento automático. |

### Fase C — Contexto, idiomas e experiência (22 de outubro)

| Commit | Alteração e motivo |
| --- | --- |
| [f1f53e0](https://github.com/farfudo/launch-tracker/commit/f1f53e0) | **Missão, local e janela.** Enriqueceu o detalhe com descrição, plataforma e horários. Campos opcionais permitem lidar com informação ainda não disponibilizada pela fonte. |
| [3fb1a14](https://github.com/farfudo/launch-tracker/commit/3fb1a14) | **Idiomas e fusos horários.** Introduziu PT/EN/ES, preferência persistida e conversão entre UTC, local do lançamento e visitante. Usa identificadores IANA e considera horário de verão; não requer geolocalização. |
| [ee2102c](https://github.com/farfudo/launch-tracker/commit/ee2102c) | **Adaptação a ecrãs estreitos.** Corrigiu encaixe de títulos traduzidos e filtros. Tradução também altera as necessidades de espaço da interface. |
| [55e4adf](https://github.com/farfudo/launch-tracker/commit/55e4adf) | **Detalhe “controlo de missão”.** Aplicou o desenho aprovado, cartões informativos e apresentação de imagens com créditos/licença e recurso visual quando ausentes. |
| [898c67b](https://github.com/farfudo/launch-tracker/commit/898c67b) | **Esperas limitadas.** Aplicou timeout de 20 segundos e explicação de carregamento lento. Evita espera indefinida, mas não elimina o arranque lento do alojamento gratuito. |
| [41f6762](https://github.com/farfudo/launch-tracker/commit/41f6762) | **Favoritos locais.** Permitiu guardar missões neste navegador. Não introduziu contas nem sincronização entre dispositivos; essas limitações são comunicadas. |
| [e0c2f1c](https://github.com/farfudo/launch-tracker/commit/e0c2f1c) | **NextRocketLaunch e temas.** Aplicou a marca atual e modos claro/escuro com preferência persistida. |
| [5acfb53](https://github.com/farfudo/launch-tracker/commit/5acfb53) | **Dashboard de lançamentos.** Reorganizou a página inicial com destaque para a próxima missão, calendário e informação visual. |
| [3fb0cd9](https://github.com/farfudo/launch-tracker/commit/3fb0cd9) | **Detalhe interativo no dashboard.** Refinou a navegação e apresentação da missão selecionada, reduzindo a necessidade de abandonar o calendário. |
| [369a040](https://github.com/farfudo/launch-tracker/commit/369a040) | **Feedback dos filtros e ação principal.** Melhorou o comportamento dos filtros por agência e a adaptação da ação do destaque ao espaço disponível. |
| [865e78c](https://github.com/farfudo/launch-tracker/commit/865e78c) | **Transmissões e ligações.** Guardou e apresentou ligações fornecidas pela fonte, identificando canais e sem garantir caráter oficial ou estado em direto. |
| [b470cea](https://github.com/farfudo/launch-tracker/commit/b470cea) | **Exportação para calendário.** Permitiu levar o horário previsto da missão para um calendário pessoal. Exportar um evento não equivale a um serviço de alertas atualizado automaticamente. |
| [bddefcf](https://github.com/farfudo/launch-tracker/commit/bddefcf) | **Transmissões colapsadas e estados claros.** Reuniu opções no botão “Watch here”, usou destaque laranja e cores/texto para estados; retirou cartões redundantes. Resultado de revisão visual com o utilizador. |
| [7557dc3](https://github.com/farfudo/launch-tracker/commit/7557dc3) | **Modo claro predefinido.** Alterou a escolha inicial sem substituir uma preferência já guardada pelo visitante. |

### Fase D — Verificação e robustez (22–23 de outubro)

| Data | Commit | Alteração e motivo |
| --- | --- | --- |
| 22/10 | [9eda5ce](https://github.com/farfudo/launch-tracker/commit/9eda5ce) | **Percursos no browser e README.** Criou testes E2E desktop/móvel com API fictícia e dados estáveis, integrados no CI. Evita depender da fonte ou da base pública nos testes. |
| 22/10 | [aa28f70](https://github.com/farfudo/launch-tracker/commit/aa28f70) | **Atualização do Vitest.** Atualizou a ferramenta de testes e documentou os restantes resultados da auditoria. Não significa que todas as dependências estejam livres de vulnerabilidades futuras. |
| 23/10 | [f3571d1](https://github.com/farfudo/launch-tracker/commit/f3571d1) | **Proteção partilhada da sincronização.** Acrescentou lock transacional PostgreSQL e intervalo mínimo de 45 minutos. CLI e HTTP usam a mesma regra para evitar importações simultâneas; falhas fazem rollback. Não implementa sozinho um recurso por idade de 90 minutos. |
| 23/10 | [8c5f96a](https://github.com/farfudo/launch-tracker/commit/8c5f96a) | **Falhas parciais.** Separou o resultado dos lançamentos das opções de filtro, preservou seleções e distinguiu 404 de indisponibilidade no detalhe/proxy. Verificado com 52 testes da interface, build e preview isolada; push confirmado. |

## 5. Alterações operacionais fora da história Git

### Incrementos posteriores à primeira redação

| Commit | Alteração e dificuldade resolvida |
| --- | --- |
| [7dd1e27](https://github.com/farfudo/launch-tracker/commit/7dd1e27) | Separou Próximos/Histórico por data prevista UTC, preservando filtros e favoritos; retirou Watch here do destaque inicial. A base retinha missões passadas que ocupavam o início da lista. O histórico ficou explicitamente limitado à cache, sem confundir data ultrapassada com descolagem confirmada. Verificação: 28 testes API, 53 web, quatro percursos browser e build. Push confirmado. |
| [77dac29](https://github.com/farfudo/launch-tracker/commit/77dac29) | Simplificou cabeçalho, compactou idioma, diferenciou separadores e filtros, reduziu repetição no detalhe e acrescentou perfil/código GitHub no rodapé. Resolveu navegação redundante e texto de idioma cortado. Verificação: 53 testes web, quatro percursos e build. Push confirmado; não inferir estado de publicação a partir desse push. |

### Revisão de sincronização de 15 minutos — este incremento

O intervalo passa a ser configurável, com mínimo de 900 segundos, conservando 2700 por defeito. Antes de uma chamada externa, uma reserva é guardada em `sync_control`; falhas e reinícios não permitem repetir imediatamente. `Retry-After` numérico ou HTTP-date prolonga a espera. O workflow GitHub recebe espera de 5400 segundos como recurso. Esta configuração não ativa um cron Cloudflare regular nem define o intervalo da API pública a 900 segundos.

Dificuldade: o lock anterior protegia apenas a transação, e o intervalo era baseado em sucesso; erros podiam originar tentativas repetidas. Solução: reservar a próxima tentativa sob lock e confirmar a reserva antes da rede. Outra ligação encontra a reserva mesmo após libertar o lock. Não se garante exatamente-uma-vez nem ausência de sobreposição se uma tarefa exceder extraordinariamente o prazo de reserva.

Evidência: 32 testes API, Ruff e 26 testes Node passaram. Migração aplicada/revertida em SQLite temporário e PostgreSQL 16 isolado. Ensaio PostgreSQL com duas ligações confirmou lock, bloqueio da consulta duplicada durante o fornecedor simulado e persistência de Retry-After após falha. Não houve chamadas reais à fonte. O ensaio PostgreSQL foi pontual, ainda não integrado no CI.

Ativação pendente: Worker deve reconhecer `retry_wait` antes do backend que pode devolvê-lo; validar teste real e aprovar cron/configuração regular separadamente. O endpoint público continua protegido. Um push pode disparar os deploys existentes e a migração de arranque; não significa que a frequência de 15 minutos esteja ativa.

Foram configurados alojamento da interface na Vercel, API Docker no Render e PostgreSQL no Neon. Segredos foram introduzidos diretamente nas plataformas, não neste documento. A configuração de uma conta, uma variável ou um agendamento não aparece necessariamente num commit.

### Cloudflare: investigação ainda em curso

O Worker `nextrocketlaunch-sync` foi preparado para chamar o endpoint protegido da API. O endereço público responde 405 e não inicia sincronizações. As revisões publicadas no editor foram:

| Versão | Âmbito e evidência |
| --- | --- |
| `c32d5571` | Substituição do Hello World por um handler agendado, sem cron inicial. O teste no editor não deu resultado explícito. Uma atualização pública coincidente foi atribuída ao GitHub após leitura do seu registo, não ao Worker. |
| `192a45a0` | Registos estruturados de início/resultado com identificador. O cron temporário das 11:50 de Lisboa executou e falhou com `sync_failed`; foi removido e o acompanhamento terminado. |
| `c10d43fc` | Categorias seguras para distinguir configuração, preparação, transporte, HTTP e resposta inválida. 20 testes locais simulados passaram. Foi autorizado novo teste temporário às 15:20 de Lisboa de 23/10, com acompanhamento e remoção posterior. O resultado desse teste não estava confirmado no momento desta redação. |
| `62974619` | Correção de compatibilidade: `redirect: manual` e rejeição explícita de 3xx. Publicação confirmada, GET público 405. Teste temporário autorizado para 21:00 de Lisboa; resultado ainda pendente nesta atualização. |

Os ficheiros em `infra/cloudflare/` permaneciam locais e não versionados no momento desta redação, apesar de versões do Worker terem sido publicadas na plataforma com autorização. Não afirmar que estão no GitHub. Os testes Node não comprovam autenticação com os segredos reais nem execução bem-sucedida no runtime Cloudflare.

Atualização: neste incremento os ficheiros do Worker passam a integrar o commit, após autorização de commit/push. A revisão local inclui ainda reconhecimento de `retry_wait`; essa adição não foi automaticamente publicada no Worker ao ser guardada em Git.

### Dificuldades da integração Cloudflare e resolução

1. **Coincidência entre teste e GitHub:** uma atualização pública às 11:16 foi inicialmente observada após um teste no editor. O registo GitHub `39937872392` confirmou importação de 100 missões; não era prova do Worker. Solução: correlacionar origem, identificador de execução e resultado, não apenas datas.
2. **Erro genérico:** o teste real das 11:50 falhou em 2 ms com `sync_failed`, insuficiente para localizar a causa. Solução: categorias controladas de erro, sem imprimir tokens, exceções arbitrárias ou corpos de resposta.
3. **Falha de transporte:** o teste das 15:20 confirmou `transport_failed`, versão `c10d43fc`, run_id `d52af566-c8ee-456b-a689-ecffc6d9c4dd`. Não atualizou a cache; cron e acompanhamento foram removidos. A causa específica continuou em investigação nessa etapa.
4. **Diferença Node/Workers:** Miniflare/workerd `1.20260730.1` reproduziu um TypeError ao construir Request com `redirect: error`, antes da rede. Mocks Node não construíam pedidos nesse runtime. Solução: modo `manual` e rejeição explícita de respostas 301/302/303/307/308, sem seguir Location ou reenviar credenciais. 25 testes Node passaram; código completo exercitado no runtime local com sucesso 200 e rejeição 302 simulados. Isto confirma a correção desse defeito; não garante autenticação/conectividade reais.
5. **Editor sem foco:** a substituição automática selecionava a página em vez do código. O utilizador focou o editor; o texto “pronto” introduzido no rascunho foi substituído pelo ficheiro correto. Ausência de erros e nova versão ativa foram confirmadas antes de declarar a publicação.

As dificuldades ainda abertas não são apresentadas como resolvidas: pontualidade do GitHub, operação regular Cloudflare, cache de interface perante indisponibilidade da API e arquivo histórico completo.

## 6. Qualidade, decisões e limitações

### Verificações usadas

- Testes unitários de datas, estados, idiomas, preferências e operações de interface.
- Testes da API, transformação da fonte e persistência; a suite habitual usa SQLite.
- Verificação isolada de concorrência em PostgreSQL durante a proteção de sincronização; ainda não substitui uma suite PostgreSQL integrada no CI.
- Build de produção e percursos E2E com API fictícia. Não provam disponibilidade da infraestrutura pública.
- Previews locais e aprovação visual antes de alterações públicas; confirmação separada para push.

As contagens de testes descrevem etapas concretas, não devem ser somadas entre versões. Não foi novamente executada toda a bateria de testes apenas para escrever este documento.

### Lições para apresentar

1. **Desacoplar disponibilidade de atualização:** uma falha da fonte não deve impedir consultar dados já guardados.
2. **Não confundir correlação com causa:** uma data recente não provou que o Worker importou; o GitHub executara à mesma hora.
3. **Preservar utilidade em falhas parciais:** falhar o filtro não deve apagar uma lista válida.
4. **Observar sem expor segredos:** categorias controladas de erro são mais úteis que um erro genérico e mais seguras que imprimir exceções arbitrárias.
5. **Testar no ambiente apropriado:** SQLite e mocks não validam locks PostgreSQL ou comportamento do alojamento.
6. **Adotar complexidade proporcional:** conservar a arquitetura atual antes de acrescentar filas, Redis ou microserviços.

### Próximas melhorias propostas, ainda não entregues

- Confirmar a sincronização Cloudflare e definir principal/recurso sem duplicar importações.
- Separar próximos lançamentos e histórico; a consulta atual não exclui automaticamente missões passadas.
- Criar estratégia de cache para a interface sobreviver a indisponibilidade da API.
- Registar execuções de importação e tratar espera após limites da fonte.
- Acrescentar testes PostgreSQL no CI, verificação de prontidão e ensaio de recuperação da base.

## 7. Apoio à apresentação final

Uma apresentação pode seguir: problema → âmbito → arquitetura → demonstração → testes → incidente real e diagnóstico → limitações → evolução futura. Selecionar commits pequenos como prova de evolução, em vez de apresentar apenas o produto final.

O desenvolvimento foi realizado com assistência de IA, revisão e decisões do utilizador. Distinguir o trabalho efetivamente compreendido e validado das sugestões ainda não implementadas; respeitar as regras da instituição para declarar ferramentas de IA.

Documentos complementares: [especificação](../SPEC.md), [diário de aprendizagem](LEARNING_LOG.md), [publicação](DEPLOYMENT.md), [testes E2E](E2E_REVIEW.md), [proteção da sincronização](SYNC_GUARD_REVIEW.md) e [falhas parciais](PARTIAL_FAILURE_REVIEW.md).

## 8. Proposta de autoria e GitHub na interface

## Incremento local — feedback de carregamento e catálogo funcional

Rascunho posterior a `606005e`, sem commit/push nesta etapa. Criado `FEATURES_ROADMAP.md` com etapas, funcionalidades existentes, limitações, ideias do utilizador e sugestões adicionais, prioridades e critérios de conclusão. A autoria GitHub inicialmente proposta já foi implementada em `77dac29`; o texto histórico abaixo documenta a proposta original.

Na interface, spinner reutilizável para pesquisa, idioma, pedidos de detalhe, nova tentativa e ligações de navegação; carregamento de página mantém explicação de demora após oito segundos. Ações locais instantâneas não ganham atrasos artificiais. Movimento reduzido desativa rotação. Pesquisa passa a navegação Next.js com preservação de parâmetros e bloqueio de submissão repetida; HTML GET continua como ação base. Verificação concluída: 54 testes web, build e quatro percursos E2E passaram; preview local observada no browser. Ver [revisão de carregamento](LOADING_FEEDBACK_REVIEW.md).

Dificuldade: uma animação global por clique daria falsas esperas em operações instantâneas ou ligações externas. Solução: usar o estado real de transição e `useLinkStatus` dentro de Link, conservando espaço para o indicador. O painel de missão conserva cancelamento e proteção contra respostas fora de ordem. Verificações finais deste incremento são registadas no documento de revisão próprio; não assumir resultado por este texto.

Recomendação ainda não implementada: acrescentar ao rodapé «Desenvolvido por farfudo», ligado a https://github.com/farfudo, e uma ligação separada «Código-fonte», para https://github.com/farfudo/launch-tracker. O perfil apresenta o autor; o repositório permite inspecionar este projeto. Preferir texto discreto e acessível, traduzido nos três idiomas, sem competir com “Watch here” ou com a navegação de missões.

Não é necessário mostrar email, carregar widgets externos ou acrescentar rastreio para criar estas ligações. A identidade visual e a publicação da alteração ficam sujeitas à preview e aprovação.

## Incremento local — documentos para partilha em texto simples

A pedido do utilizador, os documentos Markdown mantêm-se como originais e passam a ter cópias `.txt` em `docs/partilha/`, incluindo README, SPEC, documentação funcional e técnica e README do Worker. Os ficheiros de instruções `AGENTS.md` não fazem parte da exportação. As cópias preservam integralmente o conteúdo (incluindo a notação Markdown), com estrutura de pastas igual à origem, para evitar colisões de nomes. São uma fotografia da documentação local, que inclui rascunhos ainda não publicados; não constituem prova de commit, push ou publicação.

Dificuldade: duplicar documentação pode gerar versões desatualizadas. Solução: manter `.md` como fonte de referência e regenerar as cópias ao preparar nova partilha, em vez de editar os `.txt` separadamente. Verificação: comparação byte a byte de cada cópia com o original. Sem alterações à aplicação ou à versão pública nesta etapa.

### Versões Word para partilha

O utilizador considerou insuficiente a apresentação das cópias de texto e pediu versões Word geradas apenas a partir dos originais `.md`. Foram preparadas 22 versões `.docx` em `docs/partilha/word/`, preservando os originais. Títulos, listas, tabelas e hiperligações são convertidos para elementos editáveis do Word, em vez de mostrar a notação Markdown. Os estados e limitações dos documentos históricos são preservados; a conversão não representa atualização funcional ou publicação da aplicação.

Dificuldade: a cópia literal conservava os símbolos de Markdown e o estilo base do Word acrescentava uma linha decorativa ao título. Solução: conversão estrutural e remoção dessa linha, com renderização para revisão visual. O catálogo `FEATURES_ROADMAP` e as respetivas cópias mantêm-se locais e excluídos do próximo envio para GitHub, conforme pedido. Não foi feito commit ou push nesta etapa.

### Preview local do carregamento com foguetão

O utilizador pediu um indicador ligado ao tema espacial em vez da rodinha. O componente reutilizável passa a desenhar um foguetão SVG, com movimento vertical suave e chama laranja animada. Pesquisa, idioma, navegação, página, detalhe, nova tentativa e filtros de agência partilham o desenho. Mantêm-se os textos acessíveis, o controlo real de espera e a desativação de animações quando o visitante prefere movimento reduzido. Dificuldade: manter o ícone legível em botões pequenos sem alargar excessivamente os controlos; solução: dimensões relativas ao texto e espaço reservado. Alteração apenas local, sujeita a revisão da preview e autorização separada de push. As cópias Word anteriores são uma fotografia anterior a este incremento.

Verificação do foguetão: 54 testes web e build passaram; preview observada no browser. E2E não repetidos nesta revisão visual. A primeira tentativa de reiniciar o servidor local foi bloqueada pela permissão de abertura de porta; o reinício autorizado na mesma porta 3300 resolveu o acesso, sem alterar os serviços públicos.

O utilizador aprovou explicitamente o visual e autorizou commit e push em 23 de outubro de 2026. O incremento inclui o feedback de carregamento, os testes e os documentos de revisão/evolução/tarefas. O catálogo funcional e todas as exportações de partilha permanecem locais; foi retirada a ligação nova ao catálogo no README para não publicar uma ligação para um ficheiro ausente. Resultado do envio a confirmar no GitHub; aprovação não comprova deploy.

### Rascunho posterior ao commit 747649f

O commit `747649f` foi enviado com sucesso para `main` no GitHub. Depois, o utilizador pediu cobertura dos restantes estados de espera e uma variante mais reconhecível em tamanhos pequenos. A revisão local acrescenta feedback à preparação dos favoritos, deteção de fuso, carregamento de fotografias e navegação de regresso/início. Fotografias retiram o indicador ao carregar ou ao falhar; ações locais instantâneas continuam sem esperas artificiais.

Dificuldade: o foguetão com movimento vertical subtil podia parecer um simples ícone num botão. Solução em preview: foguetão percorre uma órbita circular nos controlos, enquanto a página conserva a subida suave. A órbita completa uma volta em 1,8 segundos; movimento reduzido desativa as animações. A página de preview mostra exemplos explícitos, não pedidos reais. Esta variante e a cobertura adicional permanecem sem aprovação e sem novo commit/push. As exportações Word anteriores não foram regeneradas nesta revisão da aplicação.

Verificação desta proposta: 56 testes web e compilação de produção passaram; comparação visual aberta no browser. Testes novos confirmam as variantes e remoção do indicador após load/error da fotografia. E2E não repetidos nesta ronda.

### Rascunho de partilha de missão

Antes do próximo push, o utilizador aceitou acrescentar Partilhar missão. Implementados dois controlos no painel e no detalhe: menu nativo quando suportado e cópia explícita da ligação. PT/EN/ES, feedback de cópia/erro, seleção manual em falha e foguetão durante espera real. Não exige contas, base de dados ou serviços externos novos; a ligação usa a origem atual e o identificador da missão, sem filtros da visita. Em preview a ligação é local, não um endereço público para terceiros.

Dificuldade: cancelamento nativo foi inicialmente classificado como erro porque `DOMException` pode vir de outro contexto e não satisfazer `instanceof Error`. O teste detetou o problema; a solução verifica `AbortError` pelo nome com validação do objeto. Cancelar não copia nada nem inicia outra partilha. A seleção da missão usa uma chave para reiniciar as confirmações e impedir feedback referente à missão anterior. Preview e autorização separada de commit/push continuam pendentes. Ver `docs/SHARING_REVIEW.md`.

Verificação da partilha: 63 testes web passaram, incluindo sete novos testes com APIs simuladas; build e quatro percursos E2E de regressão desktop/móvel passaram. Cópia manual na preview apresentou confirmação no browser. Não foram enviadas mensagens reais nem testado o menu nativo num dispositivo físico. A preview usa missões fictícias e deixa claro que o site público permanece inalterado.

Após a revisão da preview, o utilizador aprovou a partilha e os indicadores orbitais e autorizou explicitamente o commit e push deste conjunto. As referências a rascunho acima descrevem a preparação, não o estado de aprovação atual. O envio inclui código, testes e revisões de carregamento/partilha; exclui `FEATURES_ROADMAP` e todas as exportações em `docs/partilha/`. O resultado do push e dos deploys deve ser confirmado separadamente, sem o deduzir da aprovação.

### Investigação do arranque após inatividade em 24 de outubro de 2026

O push `8211038` foi confirmado para `main`. A pedido do utilizador, o incremento seguinte começou por diagnóstico de desempenho, sem alterações de produção. Três leituras sequenciais mediram API data-status em 34,866 segundos, página pública em 3,430 segundos totais (primeiro byte 1,255) e segunda leitura da API em 0,776 segundos. A API foi consultada antes da página; por isso, não se apresenta a medição da página como um ensaio de API adormecida.

Dificuldade identificada: PostgreSQL guarda os lançamentos, mas a interface usa no-store e espera no máximo 20 segundos pela API. A primeira resposta observada ultrapassou esse limite. O comportamento é compatível com o arranque da instância gratuita Render, documentado pelo fornecedor; os tempos não permitem atribuir separadamente atrasos ao Render, rede ou Neon. Solução proposta, ainda não implementada: cache de dados públicos no Next.js, revalidação em segundo plano, preservação da última resposta válida, idade visível e limite de recurso. Cache de página personalizada, keep-alive artificial e acesso direto ao Neon não fazem parte da proposta. Critérios e alternativas em `docs/COLD_START_REVIEW.md`. Sem novo commit, push ou deploy nesta investigação; testes não repetidos por não existir mudança de código.
### Cache pública para reduzir a espera após inatividade — rascunho local

Após aceitação da proposta, foi preparada cache no servidor da interface: vistas comuns de próximos/histórico, opções de filtro, estado dos dados e detalhes. A revalidação proposta é de cinco minutos, mantendo a última resposta válida enquanto a API responde. A página inicial deixa de depender do detalhe completo para apresentar o calendário. Idioma e favoritos não são incluídos nas entradas públicas. Pesquisas/filtros aplicados mantêm consulta direta para não limitar silenciosamente os resultados aos 100 lançamentos guardados.

Dificuldades e soluções: uma resposta JSON inválida poderia substituir dados bons; acrescentou-se validação antes de guardar. Um booleano de antiguidade guardado envelheceria incorretamente; a idade da fonte é recalculada e separada da hora de consulta da interface. Atualizações da página poderiam repor a missão inicial; uma referência preserva a seleção manual. Ensaios repetidos poderiam reutilizar a cache anterior; a API fictícia do teste recebe uma origem nova em cada execução. O painel usa atualização manual, evitando que a atualização de fundo reinicie a seleção.

A cópia tem limite de seis horas desde a última consulta válida numa nova leitura, não uma garantia de frescura da fonte. Cache vazia, pesquisas e cache removida pelo alojamento ainda podem esperar pela API. Um 404 legítimo pode ficar guardado cinco minutos. O aviso faz até seis novas consultas espaçadas, apenas com página visível e ligação disponível; depois oferece nova tentativa. Não há keep-alive artificial nem alteração da sincronização externa.

Verificação: 75 testes passaram, build de produção e quatro percursos E2E desktop/móvel passaram. Ensaio com Next.js compilado: API fictícia com atraso de 35 segundos, calendário guardado em 25 ms e detalhe em 20 ms; preservação perante 503 e payload inválido; recuperação com dados novos confirmada. Tempos locais não comprovam desempenho no Vercel. Preview em `/preview/cache`, com dados fictícios e intervalo acelerado de cinco segundos. Sem novo commit/push/deploy ou operação de produção; aprovação e autorização de envio pendentes. Exportações Word anteriores não regeneradas.
Aprovação posterior: o utilizador aprovou a preview e autorizou apenas o commit local deste incremento. O intervalo padrão mantém-se em cinco minutos. Push e publicação não estão autorizados; a aplicação pública permanece inalterada. O identificador do commit será confirmado depois da gravação no histórico Git.
### Diagnóstico seguro e repetição limitada da sincronização — rascunho

Após falha da execução agendada `40112971248`, verificou-se que a mensagem antiga ocultava a distinção entre timeout, rede, HTTP e payload inválido. A duração de cerca de 33 segundos é compatível com timeout, sem o comprovar. Os dados anteriores continuavam disponíveis. O push `d0d8a98` da cache da interface foi confirmado; a execução falhada usava o commit anterior `8211038`, pelo que não é atribuída à nova cache.

Preparada classificação segura de erros e uma única repetição após cinco segundos para falhas temporárias selecionadas. Dificuldade: reiniciar o workflow ou repetir um POST após timeout pode duplicar trabalho e contornar o orçamento partilhado. Solução: repetir apenas o GET ao fornecedor dentro da reserva existente, no máximo duas tentativas. 429 e qualquer `Retry-After` não repetem imediatamente; preservam a espera persistida. Payload inválido não é confundido com lista vazia nem guardado como resposta válida. Corpos de erro, mensagens brutas e cabeçalhos não são impressos nos registos.

Testes locais simulam recuperação, esgotamento, HTTP não transitório, payload inválido, preservação dos dados e bloqueio de nova sincronização durante a espera. Não houve chamada real ao fornecedor nem alteração da aplicação pública. Ver `docs/SYNC_RETRY_REVIEW.md`. Aprovação e autorização separada de commit/push pendentes; exportações Word não regeneradas.

Verificação final: 52 testes da API e análise de estilo passaram, com Python 3.13 e SQLite em memória; CI usa Python 3.12. O teste inicial da CLI precisava de um simulador com suporte a gestor de contexto; corrigido para `MagicMock`, sem mudança funcional por causa desse erro de teste. Aviso de descontinuação do TestClient observado, sem alteração de dependências. Concorrência PostgreSQL real e operação de produção não foram testadas; testes web não repetidos por não haver alteração visual.

O utilizador aprovou a regra de repetição limitada e autorizou apenas o commit local. O incremento permanece sem autorização de push/publicação; a regra ainda não está ativa em produção. As referências anteriores a aprovação pendente descrevem a preparação do rascunho.
### Websites das entidades e fontes da missão — rascunho local

O commit local `123b47d` guardou diagnóstico e repetição limitada; não foi enviado. O incremento seguinte acrescenta «Explorar fontes» ao detalhe completo e ao painel, separado de transmissões. Importa websites explicitamente indicados pela LL2 para agência, configuração do foguetão e plataforma, e links da missão/lançamento. Exibe domínio, indicação de nova aba e estado sem ligação em PT/EN/ES.

Dificuldade: os campos de informação não certificam oficialidade, e a fonte pode não fornecer um website. Solução: atribuição explícita à Launch Library 2, sem badge «oficial», endereços inventados, substituição por Wikipédia ou consultas adicionais por entidade. Dificuldade de compatibilidade: aproveitar registos existentes sem migração. Solução: categoria opcional no JSON `mission_links`; links antigos continuam como fontes da missão, dados novos chegam numa futura sincronização normal, não por operação manual de produção.

Preview usa missões e links fictícios, com três categorias preenchidas e local sem website. Ver `docs/MISSION_SOURCES_REVIEW.md`. Sem commit, push, migração ou sincronização real neste incremento; aprovação pendente. Exportações de partilha anteriores permanecem locais e não foram regeneradas.

Verificação: 77 testes web, build, 54 testes da API e análise de estilo passaram; quatro percursos E2E desktop/móvel passaram com verificações das ligações e da categoria sem endereço. Testado armazenamento/resposta HTTP da categoria e compatibilidade com JSON antigo. Preview observada no browser; destinos externos não abertos. Testes API com Python 3.13/SQLite isolado, não em produção. O aviso já conhecido do TestClient mantém-se, sem falhas. A preview anterior com atraso de 35 segundos foi encerrada e reposta uma API fictícia normal para esta revisão visual.

Após revisão da preview, o utilizador autorizou commit e push. O envio inclui este incremento de fontes e o commit local anterior `123b47d` de diagnóstico/repetição limitada. A aprovação substitui os estados pendentes anteriores, mas não comprova o resultado do envio ou dos deploys. `FEATURES_ROADMAP` e exportações de partilha continuam excluídos. Não foi executada sincronização manual de produção.
### Correção da CI após o envio 5879ab8 — rascunho local

A execução `40124939003` falhou na análise de estilo da API: dois blocos de imports desordenados (`I001`) e `ValueError` usado para um tipo de payload inválido (`TRY004`). Web/build e testes Worker passaram; os testes da API não chegaram a correr nessa execução. Não se confunde esta falha de qualidade com falha de sincronização ou deploy.

Dificuldade: a validação local anterior usava Ruff 0.12.0, enquanto a dependência aberta permitiu à CI instalar 0.17.2, com regras predefinidas diferentes. Solução: corrigir imports, usar `TypeError` (já convertido para a mesma categoria segura `invalid_payload`), fixar Ruff em 0.17.2 e declarar explicitamente as famílias de regras E4/E7/E9/F/I e TRY004. Não foram desativadas as regras que detetaram o problema.

Preparado ambiente temporário isolado com Python 3.12.15 e Ruff 0.17.2, versões observadas na CI. Análise de estilo e 54 testes da API passaram com SQLite em memória; sem chamadas à fonte ou base de produção. O aviso já conhecido de descontinuação do TestClient permanece. Web/E2E não repetidos nesta correção sem alteração visual. Não comprova aprovação remota: é necessário novo commit/push autorizado e conclusão da CI. Sem commit, push, nova execução remota ou alteração da app pública nesta etapa.

Após apresentação dos resultados locais, o utilizador autorizou commit e push da correção. O envio inclui README, configuração, correções e registo de evolução; exclui roadmap e exportações locais. A confirmação da CI será feita após o envio, sem deduzir sucesso remoto dos testes locais.

Confirmação posterior: commit `1672e87` enviado para `main`; execução CI `40125277157` terminou com sucesso. Passaram API quality and tests, Worker synchronization tests e Web tests and build, incluindo os percursos de navegação. Permanecem avisos não bloqueantes sobre versões de actions/Node e imagem Ubuntu. Sucesso da CI não comprova deploy ou sincronização real. Esta confirmação foi registada localmente após o envio, para incluir no próximo commit autorizado.
### Distinção entre resumo lateral e página completa — rascunho local

A pedido do utilizador, o painel de seleção do calendário foi reduzido ao essencial: nome, agência/veículo, estado, hora local, local, transmissão colapsada quando disponível, favorito e ligação aos detalhes completos. Descrição, plataforma, janela, fusos horários, fontes, calendário e partilha ficam na página completa. O painel recebe título e explicação de resumo em PT/EN/ES, preservando carregamento/erro e aviso da idade dos dados.

Dificuldade: simplificar sem perder o caminho de recuperação nem esconder dados antigos. Solução: manter estados de falha, nova tentativa e cache, e destacar a ligação para a página completa. Não se alterou o contrato de dados: o painel ainda consulta o detalhe para local/transmissões, pelo que isto não comprova redução de tráfego. Em móvel, os cartões continuam a abrir diretamente o detalhe. Testes de seleção foram atualizados para verificar a missão pelo título e não pela descrição retirada; acrescentada regressão que exige informação avançada ausente do painel e presente no detalhe completo. Ver `docs/MISSION_SUMMARY_REVIEW.md`.

Sem commit, push, deploy ou sincronização real; preview e aprovação pendentes. Exportações de partilha anteriores não regeneradas.

Verificação do resumo: 78 testes web, build e quatro percursos E2E desktop/móvel passaram. Captura desktop revista visualmente; preview local reaberta com dados fictícios. API não alterada/testes backend não repetidos nesta ronda.

Após revisão, o utilizador aprovou a separação entre resumo e detalhe e autorizou apenas commit local. Incluem-se os testes, revisão e confirmação anterior da CI `40125277157` já registada localmente. Sem autorização de push deste incremento; a versão pública permanece inalterada.
