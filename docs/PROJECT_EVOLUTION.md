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
### PostgreSQL real na CI — rascunho local

Implementado job separado `PostgreSQL migrations and synchronization`, com PostgreSQL 17 descartável, health check e sem segredos de produção. Mantêm-se os testes rápidos SQLite. Nova bateria aplica migrações Alembic reais por schema isolado, verifica repetição/retrocesso da última migração sem perda da missão, advisory lock entre sessões, reserva persistida durante pedido simulado e preservação de dados/Retry-After após falha observável numa sessão nova.

Dificuldade: testes anteriores simulavam o lock e criavam tabelas com o ORM, não demonstrando a cadeia de migrações ou a coordenação real PostgreSQL. Solução: duas ligações reais e teste com thread/eventos durante a espera da fonte simulada. Dificuldade de segurança: impedir que um ambiente herdado aponte os testes para Neon. Solução: variável própria obrigatória, utilizador/base loopback dedicados, rejeição de parâmetros adicionais, schemas aleatórios e limpeza apenas desses schemas. Não há fallback para DATABASE_URL como destino de integração.

Verificação local: Python 3.12.15, Ruff 0.17.2 e PostgreSQL 17, 65 testes passaram (54 existentes, quatro integrações e sete proteções de destino), análise de estilo passou. Confirmados zero schemas de ensaio após execução; removido apenas o contentor temporário criado para esta ronda, sem dados do utilizador. YAML lido com sucesso; CI remota ainda não executada porque o rascunho não foi enviado. Aviso conhecido do TestClient permanece. Não é ensaio de carga, crash ou de todas as condições concorrentes possíveis. Sem API externa, migração ou sincronização de produção; web não alterada e testes web não repetidos.

Atualizados README, tarefas e catálogo funcional local, retirando estados desatualizados sobre cache, partilha, fontes e carregamento. `FEATURES_ROADMAP` e exportações mantêm-se excluídos de futuros envios conforme pedido. O resumo lateral `c7774bc` continua apenas local. Ver `docs/POSTGRES_CI_REVIEW.md`; aprovação e autorização separada de commit/push pendentes.

Após revisão, o utilizador aprovou a estrutura e autorizou o push, informado de que inclui o resumo lateral `c7774bc`. A autorização abrange o commit deste incremento e envio do conjunto. Resultado remoto e CI serão confirmados separadamente; não foi feita migração/sincronização de produção. Catálogo e exportações continuam excluídos.

Confirmação posterior: commit `ecb412b` enviado para `main`, incluindo o resumo `c7774bc`. CI `40128103871` terminou com sucesso: novo job PostgreSQL migrations and synchronization, API, Worker e Web/build/percursos passaram. Os contentores de integração foram encerrados pela CI. Isto valida os ensaios isolados, não o deploy público ou uma sincronização real. Resultado registado localmente após o envio, para o próximo commit autorizado.
### Continuidade laranja nas transmissões expandidas — rascunho local

A pedido do utilizador, a área expandida de «Watch here» passa a fundo laranja claro/pêssego e cartões num tom laranja ligeiramente mais forte, preservando o botão e dimensões existentes. Texto e links usam castanho escuro, com sublinhado, para não depender só da cor. O modo escuro usa tons quentes escurecidos com texto claro, evitando uma grande superfície muito luminosa. Aplica-se ao resumo e à página completa, sem alterar o comportamento colapsado, os destinos ou o estado live.

Alteração apenas de apresentação, sem operação de produção. Preview e aprovação pendentes; sem commit/push. O resultado confirmado da CI PostgreSQL `40128103871`, já registado localmente, permanece para o próximo commit autorizado.

Verificação: 78 testes web e build passaram; área expandida revista visualmente nos temas claro e escuro com dados fictícios. E2E não repetidos nesta alteração exclusivamente CSS; testes não constituem auditoria completa de contraste. A preview permanece local, com botão e conteúdo sem alteração funcional.

O utilizador aprovou o tom apresentado e autorizou apenas commit local. O envio para GitHub permanece sem autorização; a aplicação pública não foi alterada por este incremento.
### Validação pública de deploys e cache — 24 de outubro de 2026

Confirmado por leitura: Vercel Ready/Production e Render Live no commit `ecb412b`, resumo simplificado no HTML e categoria de fonte no detalhe público. O incremento laranja `38d8569` continua apenas local. A última execução agendada `40125999826` terminou com sucesso e importou 100 lançamentos; API apresentava 110 registos, atualização `19:36:11.164595Z` e stale false.

Interface respondeu em 1,487 s e depois 0,455/0,624 s; API data-status em 1,921 s. Não se confirmou API previamente suspensa: não apresentar como medição controlada de cold start. Dificuldade encontrada: checkedAt da interface permaneceu por volta de 20:06 UTC nas leituras feitas depois de 20:21 UTC, excedendo a revalidação de cinco minutos. Investigação dos Runtime Logs do Vercel confirmou timeouts nas entradas de lista, filtros e estado. A preservação da resposta guardada foi observada, mas a recuperação pública não foi validada.

Não foi aplicada uma solução especulativa. Próximo passo recomendado: investigar o percurso Vercel → Render e a revalidação antes dos novos filtros; os logs não isolam a causa entre rede, alojamento e execução de fundo. Evidência e limites em `docs/PUBLIC_DEPLOY_REVIEW.md`. Apenas leituras e documentação local: sem sync manual, alteração de configuração, deploy, commit ou push; testes de código não repetidos nesta validação sem alteração funcional.
### Correção proposta para revalidação pública — rascunho local

Após autorização para tratar a falha, comparou-se uma pesquisa pública sem cache persistente da lista (HTTP 200 em 1,224 s) com os timeouts observados no trabalho de revalidação. Isso não prova causa única: origem, rede e ciclo de vida podem diferir entre pedidos. A documentação instalada e o código do framework foram consultados; Next já acompanha revalidação internamente, pelo que a falta de `after` não é declarada causa comprovada.

Preparada proteção explícita com `after` acompanhando a mesma promise de leitura/validação, sem segundo GET. Leituras da cache passam a orçamento de 55 segundos, páginas/endpoint a maxDuration de 60; leituras diretas continuam limitadas a 20. Dificuldade: equilibrar resposta rápida com recuperação da origem lenta. Solução: manter stale-while-revalidate, falhas sem substituir dados válidos, limite de idade de seis horas e nenhum keep-alive/sync adicional. Uma cache vazia pode agora esperar até 55 segundos; limite do painel no navegador continua independente. Novos logs seguros registam resultado/categoria/duração sem mensagem bruta ou credenciais.

Testes e ensaio compilado locais em preparação para atraso de 35 segundos, prazo excedido, 503, payload inválido e recuperação. Documentação em `docs/CACHE_REVALIDATION_REVIEW.md`. Sem alteração de produção, commit ou push; resultado real no Vercel permanece por confirmar após revisão/autorização. Exportações anteriores não regeneradas.

Resultado final local: 80 testes web, build e quatro percursos E2E passaram. Next compilado preservou calendário/detalhe em 24/20 ms durante atraso de 35 segundos e apresentou dados novos após esse atraso. Cenário de 65 segundos excedeu o orçamento de 55 mantendo a cópia válida; 503 e JSON inválido também não apagaram os dados; recuperação posterior confirmada. O `after` real foi executado no Next local, não no Vercel. Portanto, é uma correção proposta e testada localmente, ainda não confirmação de resolução pública. Preview reposta com API fictícia, TTL acelerado de cinco segundos; backend/DB não alterados nem testes PostgreSQL repetidos.

O utilizador aprovou a correção e autorizou push, informado de que inclui o visual laranja local `38d8569`. O envio inclui diagnóstico público, revisão, código, testes e tarefas; roadmap e exportações continuam excluídos. A confirmação da CI, publicação e renovação real da cache deve ser feita após o envio, sem a inferir da aprovação.

Confirmação posterior: commit `a91dc50` enviado para `main`, incluindo `38d8569`; CI `40130910748` passou API, PostgreSQL, Worker e Web/build/E2E. Vercel confirmou Ready/Production do commit, deployment `dpl_AUfwMtXuzw61g9uG3bXoXun4eUaU`. Primeira leitura pública HTTP 200 em 0,929 s, checkedAt entre 20:41:40 e 20:41:41 UTC. Sem alterar TTL ou invalidar cache, aguardou-se o prazo real de cinco minutos: pedido às 20:46:46 devolveu cópia anterior em 792 ms e iniciou a revalidação; consulta 57 segundos depois devolveu checkedAt novos entre 20:46:47.538Z e 20:46:47.938Z em 669 ms. Renovação pública das três entradas observada num ciclo, ao contrário da validação anterior.

Este resultado comprova renovação na condição observada, não todos os arranques a frio, falhas ou disponibilidade futura. Os logs iniciais do novo deploy mostravam leituras bem-sucedidas e zero erros naquele intervalo. Sem sync manual ou migração de produção. Confirmação registada localmente após o envio, para o próximo commit autorizado; nenhum segundo push automático de documentação.
### Revisão estética antes do próximo incremento

Inspecionadas páginas públicas inicial/resumo/detalhe, desktop 1280×720 e ecrã estreito 390×844, em português e tema claro. Não se alterou código ou produção. Encontrados: destaque longo no móvel, várias camadas de filtros, contagens e agências longas a competir com títulos, título genérico «Unknown Payload» sem veículo no resumo/detalhe, CTA «Ver aqui 0», fontes com três cartões vazios, data principal abaixo das ações e texto de carregamento de calendário ao abrir missão.

Recomendação documentada em `docs/UI_REVIEW.md`: priorizar hierarquia/compactação e remover ações sem conteúdo antes de novas features. Conservar identidade e informação de confiança; não esconder avisos reais de antiguidade. Tamanho temporário do browser reposto no fim. Revisão responsiva simulada, não auditoria completa de acessibilidade nem teste físico. Sem testes de código repetidos, commit ou push; propostas ainda não implementadas. Exportações anteriores não regeneradas.
### Clareza UI e aviso de desenvolvimento — rascunho de 25 de outubro de 2026

O utilizador autorizou implementar os pontos 1–4 da revisão e pediu indicação de desenvolvimento no cabeçalho. Acrescentada etiqueta PT/EN/ES junto à marca, com posicionamento próprio em móvel. Hero/pesquisa/filtros móveis mais compactos, sem retirar opções; agências em linha com deslocação horizontal. CTA de vídeo sem opções substituído por mensagem neutra. Título genérico passa a conservar o nome completo do lançamento; data local do visitante antecede ações secundárias. Fontes sem links deixam de criar cartões, com ausências explicadas numa única nota.

Dificuldades: manter o aviso visível sem apertar marca/tema/idioma no telemóvel, e reduzir informação vazia sem esconder ausência de dados. Solução: cabeçalho em duas linhas apenas no móvel, etiqueta discreta não animada, mensagem neutra de vídeo e lista compacta de categorias sem website. Nome genérico detetado por uma lista limitada, sem alterar nomes genuínos; UTC é fallback antes de detetar o fuso do visitante. Não se implementaram as restantes sugestões da revisão fora dos pontos pedidos.

Verificação: 90 testes web e build passaram; seis percursos E2E desktop/móvel passaram, incluindo novo cenário sem vídeo/fontes. Preview manual em português a 1280×720 e 390×844, com tamanho temporário reposto. Fonte fictícia local; sem backend, migração, sync, commit ou push. Novos testes e limites documentados em `docs/UI_POLISH_REVIEW.md`. Aprovação visual pendente; catálogo e exportações anteriores mantêm-se locais, não regeneradas.

O utilizador aprovou este lote e autorizou apenas commit local, sem push. Autorizou preparar depois os pontos 5–6 como novo rascunho sujeito a revisão, sem confundir essa preparação com aprovação visual/publicação.
### Cartões e controlos — rascunho dos pontos 5–6

Após aprovação do lote anterior, commit local `01ed45b` criado, sem push. A pedido do utilizador, preparado depois um segundo rascunho: contagem completa no primeiro lançamento da vista/selecionado e indicação aproximada nos restantes, com intervalo de atualização de um minuto em vez de segundos. Estados incertos e histórico mantêm os limites existentes. Favoritos ganham dimensões/foco consistentes; agência e título com apresentação limitada, sem perder texto acessível ou inventar siglas.

Dificuldade: reduzir ruído sem sugerir precisão falsa e simplificar partilha sem retirar alternativas/cancelamento. Solução: indicador «≈» localizado com data exata separada; divulgação nativa única com ações existentes, bloqueio de duplicados e Escape/foco. Ensaios usam dados fictícios, sem envio de mensagens. Nova missão fictícia acrescentada para exercitar contagem secundária elegível; não representa dado real nem alteração de contratos do backend. Revisão em `docs/UI_CONTROLS_REVIEW.md`; testes/preview em preparação e aprovação separada pendente.

Verificação final: 92 testes web, build e seis E2E desktop/móvel passaram. Confirmados temporizador compacto/limpeza, fecho Escape/foco e presença de indicador compacto na lista; mantidos testes anteriores de partilha/cancelamento. Preview manual em português, 1280×900 e 390×844, tamanho temporário reposto. API/DB não alterados, testes backend não repetidos, nenhuma mensagem real enviada. Apenas o lote anterior foi guardado em `01ed45b`; segundo lote continua sem commit/push, aguardando aprovação.
### Expansões uniformes e superfícies mais distintas — rascunho local

O utilizador considerou boa a proposta 5–6 e pediu uniformizar todas as expansões, salientando calendário e partilha, e reduzir o branco do background. Preparado padrão transversal para details/summary: seta/rotação, estado aberto, fundo/borda ligados, foco visível, altura mínima e movimento reduzido. Watch here conserva o laranja; restantes painéis recebem tom verde-acinzentado. Corrigida moldura duplicada do conteúdo da partilha.

Dificuldade: manter consistência sem tornar todos os controlos igualmente chamativos ou alterar a semântica de teclado. Solução: estilo comum nativo com exceção cromática explícita das transmissões e estados desativados preservados. Fundo proposto cinzento quente e cartões marfim claro, bordas e sombras subtis; modo escuro mantém a sua paleta. Ver `docs/DISCLOSURE_SURFACES_REVIEW.md`. Sem backend, produção, novo commit ou push; testes/preview em preparação. O commit anterior `01ed45b` continua local.

Verificação concluída: 92 testes web, build e oito percursos E2E desktop/móvel passaram. Expansão de calendário/partilha por teclado e filtros verificados; revisão manual a 1280×900 e 390×844, claro/escuro, com tema claro e viewport original repostos. Não foi realizada auditoria formal de contraste/acessibilidade nem repetidos testes backend. Preview local com dados fictícios, sem mensagens enviadas ou alterações públicas. Aguardam-se aprovação visual e autorização separada para eventual push.

O utilizador aprovou as expansões/superfícies e autorizou commit local, sem push. Pediu depois um novo rascunho para destacar a contagem decrescente na página completa do lançamento.

### Contagem destacada na página do lançamento — rascunho

Lote anterior guardado em `dc9eef7`, sem push. Acrescentado o componente existente de contagem à página completa, junto à data prevista, com painel verde-acinzentado e quatro blocos maiores. Mantém traduções, atualização por segundo, sem anúncios contínuos ao leitor de ecrã, e mensagens existentes para hora incerta/instante passado. Dificuldade: dar destaque sem sugerir telemetria ou confirmação do horário; solução: manter indicação de previsão e reutilizar as regras de elegibilidade, sem nova lógica de estado.

Passaram 92 testes web, build e quatro percursos E2E desktop/móvel da revisão UI, incluindo presença dos quatro blocos. Primeira tentativa E2E encontrou a porta da API fictícia ocupada; foi parado apenas esse servidor local e repetido o ensaio com sucesso. Preview manual desktop com dados fictícios, viewport reposto; captura `/tmp/mission-countdown-preview.png`. Backend e produção não alterados. Novo rascunho sem commit, aprovação visual pendente; nenhum push realizado.

O utilizador aprovou a preview do countdown e autorizou commit e push deste lote, incluindo os commits locais anteriores `01ed45b` e `dc9eef7`. Exportações e `FEATURES_ROADMAP.md` mantêm-se locais. A autorização/envio não substitui a confirmação posterior de CI e publicação.

### Legibilidade em smartphone — rascunho local

Push anterior concluído em `748bba0`. A pedido do utilizador, preparado ajuste apenas até 600 px: texto principal de 16 px, datas/notas de 14 px, etiquetas de 13 px, controlos de cerca de 15 px e campos de 16 px. Aumentados espaçamento entre linhas e títulos dos cartões; removidos truncamentos de agência/título em smartphone. Filtros passam a uma coluna e ações empilham quando necessário. Desktop mantém os tamanhos anteriores.

Dificuldade: letras maiores reduzem o espaço útil e podem cortar datas/títulos. Solução: permitir mais linhas, adaptar grelhas e quebrar fusos longos sem esconder conteúdo. Mantida hierarquia: etiquetas secundárias menores que o texto principal, não um aumento global que desproporcionasse títulos e cabeçalho.

Verificação: 92 testes web, build e quatro E2E desktop/móvel passaram. Adicionadas verificações de 16 px nas notas da missão, 14 px nas datas dos cartões e ausência de scroll horizontal nos cenários testados. Capturas geradas pelos E2E revistas visualmente (home/detalhe móvel). A revisão interativa adicional foi bloqueada pela política de acesso do browser; não foi contornada. Não constitui auditoria formal de acessibilidade nem teste de todos os idiomas/zoom/dispositivos. Preview local em http://127.0.0.1:3300/; dados fictícios. Sem backend, commit, push ou alteração pública deste rascunho; aprovação visual pendente.

### Fusos e transmissões no resumo esquerdo — rascunho local

Pedido: reunir Watch here e time zones no painel esquerdo e retirar fusos dos cartões à direita. Watch here já existia no resumo quando há transmissões válidas; foi preservado e testado. Fusos passam para uma expansão única no resumo, baseada na missão selecionada, disponível mesmo enquanto carrega o detalhe. Ao trocar de missão, a expansão reinicia fechada e usa o fuso da nova missão, sem mostrar horários da seleção anterior. Removida a expansão repetida em cada cartão da lista. Atualizada a nota de orientação em português/inglês/espanhol.

Dificuldade: distinguir layout desktop do móvel, que não mostra painel lateral e abre diretamente a página completa. Mantido esse fluxo: smartphone conserva fusos/transmissões na página completa; não se duplicou o painel escondido nem se mudou a navegação sem pedido. Ausência de streams continua sem botão enganador. Sem alteração de API/BD.

Verificação: 92 testes web, build e oito E2E passaram, incluindo abertura de fusos e stream no resumo desktop, ausência de fusos na lista e percurso móvel completo. Captura E2E do resumo revista visualmente; revisão interativa continua indisponível pelo bloqueio previamente registado. Rascunho inclui as alterações mobile anteriores ainda por aprovar; sem commit/push ou alteração pública.

### Watch here visível sem transmissão — rascunho local

A pedido do utilizador, o estado sem ligações válidas passa a manter o botão Watch here/Ver aqui/Ver aquí visível, desativado, em laranja suave, acompanhado do aviso localizado já existente: sem ligação de vídeo nos últimos dados em cache. Aplica-se ao resumo e à página completa. Não se mostra seta de expansão ou contador zero, nem se inventa uma transmissão. Ligações inválidas também resultam no estado indisponível. Com transmissões válidas mantém-se o expansível laranja existente.

Dificuldade: aparência esbatida não pode tornar o aviso ilegível nem prometer que a fonte não tem qualquer live em tempo real. Usadas cores próprias claras/escuras, sem reduzir opacidade do texto; aviso refere os dados em cache, não uma verificação em direto. Botão nativamente disabled não abre uma lista vazia. Passaram 92 testes web, build e oito E2E desktop/móvel; testes atualizados verificam botão visível/desativado e ausência de expansão fictícia. Captura E2E desktop revista. Sem backend, commit/push ou alteração pública; inclui rascunhos mobile/resumo ainda pendentes de aprovação.

### Painéis alinhados e scroll independente — rascunho local

Pedido: alinhar painel esquerdo/direito e permitir scroll da lista sem deslocar o documento. Apresentação inicial e indicadores passam a ocupar a linha acima; resumo e calendário ficam na segunda linha da mesma grelha desktop, alinhados pelo topo. Calendário limitado à altura disponível (`100dvh - 2rem`), com overflow vertical próprio e overscroll contain para não transferir o gesto à página ao chegar ao limite. Região focável por teclado com foco visível. Até 800 px conserva-se scroll normal do documento e navegação direta para detalhe.

Dificuldade: o resumo estava dentro da coluna da apresentação, abaixo do hero, impedindo alinhamento com a lista. Extraído como irmão na grelha, sem duplicar conteúdo; apresentação ocupa largura completa apenas no desktop. Não se bloqueia o scroll global da página, necessário para chegar à apresentação/rodapé; apenas os gestos dentro da lista são contidos.

Verificação: 92 testes web, build e nove E2E passaram, com um teste exclusivamente desktop omitido intencionalmente no móvel. Verificados alinhamento dos topos, overflow/overscroll e gesto real de roda sobre lista: scrollTop aumenta sem mudar scrollY do documento, incluindo novo gesto no limite. Captura `independent-scroll.png` revista visualmente. Sem auditoria de todos os browsers/gestos; revisão interativa adicional indisponível conforme bloqueio anterior. Sem backend, commit/push ou alteração pública; aprovação do lote local pendente.

Correção após clarificação do utilizador: não pretendia alinhamento do resumo pelo topo nem apresentação a toda a largura; pretendia preservar a estrutura anterior e alinhar apenas a base. Reposto hero/indicadores/resumo na coluna esquerda. Calendário direito estica até à base da coluna esquerda; contenção de tamanho evita que o conteúdo da lista imponha a altura da linha e overflow/overscroll mantêm scroll independente quando necessário. Sem bloqueio global do documento. Estrutura móvel preservada.

Verificação da correção: build e nove E2E passaram (um cenário desktop omitido no móvel). Primeira execução revelou medição durante animação e fixture curta sem overflow; corrigido teste para aguardar geometria estável e criada lista longa exclusivamente fictícia para ensaiar scroll real. Confirmados limites inferiores alinhados e scroll da lista sem alterar scrollY. Captura final com movimento reduzido para não registar animação a meio. Os 92 testes unitários passaram antes desta correção de layout, não foram repetidos; sem alteração de lógica backend. Rascunho continua sem commit/push.

### Scroll apenas dos resultados e indicador temático — rascunho local

Nova clarificação: cabeçalho, tabs e filtros do calendário não devem deslizar; scroll começa no primeiro lançamento. Criado contentor próprio para resultados/favoritos/carregar mais, abaixo dos filtros. Painel externo mantém alinhamento inferior com coluna esquerda; só a área de resultados tem overflow e contenção de gestos. Mobile conserva documento normal.

Dificuldade: barras nativas podem ficar ocultas pelo sistema, mesmo com estilos. Mantida barra nativa e acrescentado trilho decorativo sempre visível no desktop com ícone de foguetão que acompanha a proporção real de scroll. Ícone sem interação, sem anúncios e sem animação automática; não substitui a barra nativa por um controlo de acessibilidade incompleto. ResizeObserver atualiza o indicador quando área/conteúdo muda (incluindo carregar mais), com limpeza de observadores/eventos. Sem temporizador ou chamadas de rede novas.

Verificação: 92 testes web, build e nove E2E passaram; um cenário exclusivamente desktop omitido no móvel. Confirmados scroll dos resultados, filtros imóveis, documento imóvel e avanço do indicador; captura E2E revista. Em browsers com scrollbar WebKit há decoração adicional; outros conservam estilo nativo e trilho temático. Arrastar o foguetão não é suportado: é indicador decorativo; navegação mantém rato/trackpad/teclado e barra nativa. Preview local com fixture longa para demonstrar, sem commit/push/produção. Aprovação pendente do lote.

O utilizador aprovou a preview final e autorizou commit e push de todo o lote: legibilidade smartphone, fusos/transmissões no resumo esquerdo, Watch here indisponível visível, alinhamento inferior preservando estrutura superior e scroll só dos resultados com indicador temático. Roadmap e exportações continuam excluídos conforme preferência anterior. Envio autorizado não equivale a confirmação de CI/deploy; essa validação é posterior.

### Detalhe compacto, transmissão prioritária e barra única — rascunho local

Lote anterior enviado em `8d25ef1`. Novo pedido: Watch here no início da página de lançamento (principalmente smartphone), mais informação visível no desktop e apenas a barra nativa verde com foguetão, sem trilho decorativo extra. Movida a única instância de MissionStreams para o hero, após a contagem e antes das ações secundárias. Mantidos estado indisponível e expansão normal; sem duplicar links ou jogadores. Reduzidos margem superior, título, espaços e altura da imagem apenas na página de detalhe; favoritos/calendário/partilha agrupados numa linha quando cabe. Mantida escala legível móvel e ordem do conteúdo.

Dificuldade: destacar a transmissão sem aumentar novamente o primeiro ecrã. Solução: compactar espaços e hierarquia, não esconder conteúdo principal; imagem segue depois das ações no móvel. Títulos muito longos, zoom e ecrãs baixos ainda podem exigir scroll; não se promete visibilidade universal.

Removido trilho extra e respetivo estado/eventos/ResizeObserver; LaunchResultsScroll torna-se componente simples sem JavaScript próprio. Mantida barra nativa decorada nos motores que suportam scrollbar WebKit, com fallback nativo noutros; filtros fixos e contenção de scroll preservados. Não se alteram definições do sistema para forçar barras sempre visíveis.

Verificação: 92 testes web, build e nove E2E passaram (um caso desktop omitido no móvel). Confirmados Watch here único e completamente visível no primeiro ecrã das fixtures desktop/Pixel 7, filtros imóveis, scroll isolado e ausência de trilho extra. Capturas desktop/móvel revistas visualmente, incluindo primeiros cartões visíveis no desktop. Não representa todos os idiomas/títulos/tamanhos de ecrã nem teste Safari real. Sem backend, commit/push ou alteração pública; preview sujeita a aprovação.

O utilizador aprovou este lote e autorizou commit e push. Inclui documentação e testes, mantendo roadmap/exportações locais. CI e publicação requerem confirmação posterior ao envio.

### Countdown azul com maior destaque — rascunho local

Lote anterior enviado em `f67ed15`. Pedido: destacar contagem na lista e página completa. Proposta azul aceite para preparação: lista com fundo azul suave, borda própria e números maiores; detalhe com painel azul-escuro e números claros. Laranja reservado às transmissões e verde aos estados/interface. Paleta da lista adaptada ao tema escuro. Informação de previsão permanece explícita, sem mudar lógica/intervalos/elegibilidade; horário incerto ou ultrapassado não recebe destaque azul de timer.

Dificuldade: aumentar números sem comprimir excessivamente títulos ou provocar overflow. Coluna de ações no desktop largo passa de 115 para 160 px, mantendo disposição empilhada nos breakpoints existentes. Destaque aplicado apenas aos grupos de contagem na lista e ao painel de detalhe que contém timer, sem pintar mensagens neutras ou histórico. Sem pulsação/flash novo.

Verificação: 92 testes web, build e nove E2E passaram (um caso desktop omitido no móvel), incluindo cores computadas da lista/detalhe, ausência de overflow horizontal nos cenários móveis e Watch here ainda visível no primeiro ecrã testado. Capturas desktop da lista e detalhe revistas visualmente. Não constitui auditoria formal de contraste nem cobertura de todos os títulos/idiomas/browsers. Sem alteração backend, commit/push ou publicação; preview local com dados fictícios aguarda aprovação.

O utilizador aprovou o destaque azul e autorizou apenas commit local, sem push. Pediu uma proposta de reorganização do resumo esquerdo; essa reorganização ainda não foi implementada nem aprovada.

### Resumo esquerdo centrado na missão — rascunho local

Countdown azul guardado no commit local `2616cc5`, sem push. Utilizador clarificou que pretende descrição do lançamento no painel esquerdo, identificação da missão, Watch here e countdown bem presentes, conservando View full details. Reorganizado resumo: nome/agência/veículo/estado/data, contagem azul grande, transmissão, descrição original e ações. Fusos colapsados, local numa linha e cache/nota ficam numa zona secundária no fim. Eliminado cartão grande dedicado só ao local; não duplicadas fontes/calendário/partilha da página completa.

Dificuldade: descrições podem ser longas ou não existir e não devem esconder a transmissão ou aparentar tradução automática. Watch here fica antes da descrição; texto original preservado com atribuição, mensagem localizada quando indisponível, quebra de linhas/palavras sem truncamento arbitrário. Contagem reutiliza elegibilidade e neutralidade de horários incertos/decorridos. Durante troca de seleção, descrição anterior não é reutilizada; loading/erro e acesso à página completa preservados.

Verificação: 92 testes web, build e nove E2E passaram (um cenário desktop omitido no móvel). Testes atualizados confirmam descrição e timer no resumo, ausência de fontes/calendário/partilha, fusos e navegação completa existentes. Captura do resumo revista visualmente. Sem alteração de API/BD, sem commit/push deste rascunho; lote azul anterior continua apenas local. Preview sujeita a aprovação, sem publicação.

Refinamento pedido: retirar fusos do resumo esquerdo; ficam exclusivamente na página completa. Removida expansão e importação do resumo; data na hora do visitante preservada. Verificados 92 testes web, build e dois percursos E2E desktop/móvel com ausência de fusos no resumo e presença na página de detalhe. Captura atualizada revista. Sem commit/push; rascunho do resumo continua pendente de aprovação.

Refinamento seguinte: local de lançamento também fica apenas na página completa. Removida linha do resumo e estilo sem uso; informação mantida nos cartões da página de detalhe. Passaram 92 testes web, build e dois E2E desktop/móvel, incluindo ausência do local no resumo e presença no detalhe. Sem mudança de dados/API nem commit/push; preview local atualizada.

Utilizador aprovou o resumo final e autorizou commit e push, incluindo o commit local anterior `2616cc5` do countdown azul. Resumo final contém identificação da missão, data local, contagem, Watch here, descrição e View full details; fusos e local reservados à página completa. Roadmap/exportações permanecem locais; CI e publicação ainda carecem de confirmação posterior.

### Evitar saltos de scroll nas vistas do calendário — rascunho local

Lote anterior enviado em `25372e4`. Utilizador reportou salto para cima ao abrir Favoritos e pediu correção de problemas semelhantes. Encontrados links de Favoritos/Todos, próximos/histórico e limpar filtros sem desativação explícita do scroll de navegação Next. Acrescentado `scroll={false}` nesses links e também na declaração dos chips de agência (cujo router.push já tinha scroll:false). Pesquisa já preservava scroll e foi mantida. Consultada documentação instalada de Link para comportamento de scroll/hash.

Dificuldade: distinguir navegação dentro da mesma vista de deslocações intencionais. Não se desativou scroll globalmente: entrada numa página de lançamento, CTA do hero e revelação de missão selecionada continuam com comportamento existente. Não foram criados timers de reposição de posição. Quando o conteúdo encolhe abaixo da posição atual, o browser ainda pode limitar o scroll ao novo fim da página; não é possível preservar coordenada fora do documento.

Verificação: 92 testes web, build e dez E2E passaram; dois testes específicos desktop omitidos no móvel. Novo ensaio desktop mede scrollY antes/depois de Favoritos, Todos, Histórico, Próximos, agência e limpar filtros, confirmando posição estável. Percursos móveis existentes também passaram, mas teste geométrico novo está limitado ao desktop. Sem backend, alteração pública, commit ou push; preview local pronta para revisão.

Utilizador aprovou a correção de scroll e autorizou apenas commit local, sem push. Pedido seguinte: filtros/esquema de cores por estado e indicação explícita de datas incertas; preparação sujeita a nova preview.

### Estados filtráveis e datas provisórias — rascunho local

Correção de scroll guardada em `cc2a7e4`, sem push. A pedido do utilizador, acrescentado seletor de estado: pronto, a confirmar, data por definir, sucesso, espera, falha, falha parcial e em voo. Mantida paleta semântica existente: verde positivo, amarelo pendente, azul em voo, vermelho negativo e neutro para desconhecidos. Query `status` conservada ao trocar agência/favoritos/período e limpa pelo controlo limpar filtros.

Filtro implementado na API antes da ordenação/limite, com grupos de aliases do fornecedor e validação de valores; não se aproxima uma pesquisa global sobre apenas 100 resultados do frontend. Pesquisa de estado segue caminho autoritativo existente da cache. Sem migração de BD. Contrato aditivo exige API atualizada antes de considerar filtro validado publicamente; nenhum deploy realizado neste rascunho.

Dificuldade: TBD não significa necessariamente ausência de qualquer estimativa: a fonte pode guardar um instante provisório. Conservada a estimativa, com fundo/borda amarelos, ícone e texto «Data provisória» em PT/EN/ES nos cartões, resumo, hero, destaque e detalhe. TBC/TBD/Hold considerados incertos; sem countdown numérico nesses estados conforme regra existente. Não inventada opção «sem data» para timestamps nulos, que o contrato atual não suporta. Horários Go continuam previsões, não garantia de execução. Estilos claros/escuros próprios sem depender só de cor.

Verificação: 93 testes web, build, 55 testes API SQLite isolada e Ruff passaram. Python do sistema não tinha pytest; reutilizado ambiente temporário de testes existente sem instalar dependências nem tocar na BD pública. Um aviso de depreciação Starlette/httpx no ambiente. Doze E2E passaram, dois cenários desktop omitidos no móvel, incluindo filtro TBC composto com favoritos, data provisória visível e ausência de timer incerto. Captura desktop revista visualmente. Não repetidos testes PostgreSQL nem auditoria formal de contraste. Preview usa API fictícia equivalente; API real coberta pelos testes isolados. Sem commit/push do incremento; aprovação visual pendente.

Utilizador aprovou o incremento de estados/datas provisórias e autorizou apenas commit local, sem push. Pediu depois compactar/colapsar informação de fonte e cache; nova alteração sujeita a preview.

### Informação de fonte/cache compacta — rascunho local

Estados e datas guardados em `5e70f54`, sem push. Substituídos os parágrafos permanentes no cabeçalho do calendário por uma única divulgação nativa «ⓘ Sobre estes dados», fechada por defeito. Inclui fonte, atualização da fonte, verificação da cópia da interface e explicação do período, preservando distinção entre timestamps. Integra a explicação anteriormente separada para não duplicar controlos. Rótulo localizado existente, ícone decorativo e alvo de pelo menos 44 px.

Dificuldade: compactar informação rotineira sem esconder falhas/obsolescência. CacheNotice mantém polling/revalidação montados mesmo com details fechado; estados de atualização/erro e botão de retry ficam fora da divulgação. Aviso de dados antigos da API permanece visível e badge existente preservado. Não alterados intervalos ou regras de cache.

Verificação: 94 testes web, build e doze E2E passaram (dois casos desktop omitidos no móvel). Novo teste confirma aviso/retry fora da área colapsada; E2E confirma timestamps ocultos inicialmente e abertura/fecho por Enter em desktop/móvel. Captura desktop revista visualmente. Sem mudança backend ou repetição dos respetivos testes, sem commit/push/publicação deste rascunho. Aprovação visual pendente.

Utilizador aprovou a compactação e autorizou commit e push dos lotes locais, incluindo `cc2a7e4` (scroll) e `5e70f54` (estados/datas). Roadmap e exportações continuam excluídos. API e frontend têm alterações aditivas de filtro de estado; confirmação posterior de CI e publicação é necessária antes de afirmar funcionamento público.

### Continuação de scroll nos limites da lista — rascunho local

Lote anterior enviado em `a85b38f`. Utilizador pediu que, ao chegar ao fim/início da lista e continuar o gesto, a página possa seguir para baixo/cima. Alterado apenas overscroll-behavior-y de contain para auto na área dos resultados desktop. Mantidos scroll próprio, filtros fora da zona deslizante, barra e alinhamento inferior; sem handlers de roda ou scroll artificial.

Dificuldade: distinguir scroll interno de encadeamento ao documento. Teste atualizado confirma gesto intermédio altera lista sem mover página/filtros, gesto no limite inferior move documento para baixo e no superior move para cima. Build e doze E2E passaram, dois casos desktop omitidos no móvel; fluxo móvel normal preservado. Unitários/backend não repetidos para esta alteração CSS; não é ensaio de todos os trackpads/browsers. Sem commit/push/publicação; preview local com lista longa pronta para revisão.

Utilizador não conseguia experimentar por estar na URL com status=tbc, que mostra só uma fixture. Ampliada a lista dedicada `q=scroll-fixture` para 30 missões explicitamente fictícias, com IDs de detalhe resolúveis. No modo DESIGN_PREVIEW e apenas nessa pesquisa, os 30 cartões são apresentados de início; produção mantém seis com carregar mais. Preview reiniciada com flag própria e aberta sem filtro de estado/favoritos. Build passou e leitura HTTP confirmou exatamente 30 cartões renderizados. Sem sync, BD pública, commit/push ou alteração de dados reais. Lista criada exclusivamente para testar scroll; não representa calendário real.

Utilizador experimentou e aprovou o comportamento, autorizando commit e push deste lote. Exportações e roadmap continuam locais. Confirmação de envio não implica CI/publicação confirmadas; nenhuma sincronização ou migração de produção foi executada.

### Descobertas: reutilização, Artemis e Starship — rascunho local

Lote anterior enviado em `4e870da`. Utilizador aprovou avançar com nova secção focada em foguetões reutilizáveis, Artemis e Starship. Preparada rota `/discoveries`, navegação entre duas secções, três cartões temáticos e seis guias/fontes oficiais com resumos introdutórios próprios PT/EN/ES. Temas cruzados não duplicam a mesma fonte. Sem imagens/logos externos; cores e ícones coerentes com a app.

Decisão de âmbito: primeira preview editorial explicitamente identificada, não feed automático de notícias. Investigados NASA RSS/Artemis/media, SpaceX, Blue Origin e ESA Themis. Diferenciados objetivos de projeto, testes e operação; sem inventar datas de notícias, estatísticas de reutilização ou marcos. Data exibida corresponde à consulta editorial. Investigação, permissões e caminho para RSS futuro em `docs/DISCOVERIES_REVIEW.md`.

Dificuldades: integrar nova navegação sem apertar cabeçalho móvel; adicionada linha própria no smartphone e estado atual visível. Teste antigo que exigia ausência de nav atualizado para o novo requisito. Suite revelou também cache de fixtures expirada; movida cache gerada para pasta temporária recuperável, sem alterar regras de dados públicos. Nova execução completa passou.

Verificação: 95 testes web, build e 14 E2E passaram, dois casos desktop omitidos no móvel. Temas, URLs seguras únicas, claro/escuro, idioma, contagens e largura móvel cobertos; capturas revistas. Sem backend, custos externos, conta, cron, sync, commit/push ou publicação. Preview aguarda aprovação; próxima fase é ingestão segura de notícias, não incluída nesta entrega.

Utilizador aprovou a estrutura inicial de Descobertas e autorizou apenas commit local, sem push, antes de preparar um novo rascunho de introdução para leitores iniciantes. O novo hook não faz parte desta aprovação inicial.

### Hook de entrada para iniciantes — rascunho local

Estrutura inicial guardada em `f6b4c06`, sem push. Pedido: tornar a página acolhedora para quem não conhece o tema e dar motivo para começar a ler. Acrescentada pergunta «E se um foguetão pudesse voar outra vez?», analogia curta com avião de uso único, explicação de relevância e divulgação «Aterrar já significa ser reutilizável?». Distinção explícita entre recuperação e reutilização, sem prometer poupanças, equivalência técnica com aviões ou capacidades não demonstradas.

CTA conduz aos recursos de reutilização; alternativa permite saltar para os temas sem obrigar a ler a introdução. Cartões temáticos passam a usar perguntas curiosas sobre regresso, Lua e testes. Conteúdo original localizado PT/EN/ES, sem novos assets externos, temporizadores, conta, analytics ou IA. Divulgação nativa por teclado, respeitando padrão de expansões existente.

Dificuldade: aumentar curiosidade sem clickbait nem transformar explicação em afirmação comercial. Mantidos contexto editorial e acesso direto a fontes; exemplo conceptual, sem estatísticas de custo/voos não verificadas. Verificação: 95 testes web, build e 14 E2E passaram (dois casos desktop omitidos no móvel), incluindo pergunta acessível por Enter, resposta, CTA para filtro e layout sem overflow móvel. Captura de tema ajustada para aguardar fim da transição de cor antes de fotografar. Rascunho sem commit/push, sujeito a aprovação; base anterior apenas local.
# Galeria de regressos — rascunho local, 25/10/2026

Utilizador aprovou a preview final e autorizou apenas commit local deste lote: hook introdutório, galeria de quatro excertos oficiais, referência LandSpace e captura Super Heavy acelerada em repetição com controlos nativos desativados. Sem autorização de push; produção preservada. Roadmap e exportações partilháveis ficam excluídos do commit.

Revisão adicional autorizada: desativados os controlos nativos do excerto do hook com parâmetro oficial controls=0, preservando intervalo, velocidade, mute e repetição. Mantido botão próprio de pausa por hover/foco (visível no toque) e ligação à origem. Esta opção não elimina título, marca, anúncios ou mensagens do YouTube; não há máscaras sobre o leitor. Aprovação para preparar preview, não para commit/push.

Verificação: build e seis E2E de Descobertas passaram; simulador confirma controls=0 além de pausa, repetição e movimento reduzido. Preview local atualizada, sem alteração dos leitores da galeria inferior ou da produção.

Utilizador gostou da revisão e pediu controlos apenas com cursor em cima. Botão suplementar de pausa passa a surgir por hover/foco apenas em equipamentos com cursor preciso; teclado e toque mantêm acesso, atribuição/origem nunca ocultadas. Limitação explicada: controlos internos YouTube são geridos pelo fornecedor, que pode mostrá-los no arranque/reinício; não se sobrepõe máscara ao iframe nem se promete controlo cross-origin não suportado. Sem commit/push autorizado.

Verificação do ajuste de controlos: build e seis E2E de Descobertas passaram. Teste desktop confirma opacidade zero fora da figura e um em hover; móvel mantém controlo visível. Sem repetir backend/unitários por ser mudança CSS. Preview local reiniciada; publicação preservada.

Revisão pedida: removidos os três cartões temáticos grandes; mantidos filtros discretos junto às fontes. À direita do hook, substituído painel «Porque importa?» por vídeo oficial da captura do Super Heavy (voo 5), intervalo 02:05–02:25 do resumo SpaceX. Janela de 20s a 2× quando disponível (~10s), silenciosa e em repetição; não se criou GIF nem ficheiro copiado. A pergunta sobre recuperação/reutilização fica junto ao texto à esquerda.

Utilizador pediu explicitamente reprodução contínua ou por hover. Escolhida contínua sem som para servir também smartphone. Exceções: preferência por movimento reduzido exige clique; pausa explícita disponível; pausa fora do enquadramento e quando o separador fica oculto. Bloqueio de autoplay mantém botão manual; falha do fornecedor oferece origem permanente. O hook passa a carregar YouTube/API automaticamente na preferência normal, ao contrário dos quatro leitores da galeria inferior, que continuam por clique; avisos atualizados para não prometer ausência global de pedidos externos. Leitor com controlos originais, sem ocultar marca/anúncios do fornecedor. Recorte/repetição via API oficial, não loop do vídeo inteiro.

Verificação desta revisão: 96 testes unitários e build passaram; seis E2E de Descobertas passaram em desktop/smartphone, com simulador controlado para mute, velocidade 2×, repetição limitada 125–145s, pausa e preferência por movimento reduzido. Corrigida tipagem do simulador detetada pelo build. No navegador real, confirmado arranque sem clique, sem som, vídeo à direita do texto e reinício no intervalo selecionado. Não se garante autoplay em todos os browsers nem ausência de anúncios. Sem commit/push; nova aprovação visual pendente.

A pedido do utilizador, adicionados excertos de Falcon 9, Falcon Heavy, New Glenn e Super Heavy/Starship em Descobertas, mantendo a introdução para iniciantes ainda em revisão. Referência adicional à LandSpace, sem vídeo, conforme pedido. Fontes, intervalos e distinções em `DISCOVERIES_REVIEW.md`. Não houve commit/push deste rascunho nem alteração pública; a base Descobertas permanece no commit local `f6b4c06`.

Dificuldades: encontrar o momento de aterragem em transmissões longas e distinguir recuperação de reutilização. Confirmados publicadores e posições no navegador; datas identificam eventos históricos. Falcon Heavy mostra apenas laterais; Super Heavy é captura do propulsor. A transmissão NG-2 tem interrupções/fumo, explicitados em vez de ocultados. LandSpace tem referência oficial, sem repetir informação desatualizada sobre os seus marcos.

Decisão de desempenho/direitos: não produzir GIFs pesados ou copiar vídeos. Janela de reprodução no leitor original com início/fim, sem autoplay, só carregada por ação explícita; versão completa sempre ligada à origem. Cartões com ilustração própria, crédito, contexto e data PT/EN/ES. Um leitor de cada vez, fechar interrompe-o; aviso de terceiros e alternativa externa para falhas. Sem chave/API paga, conta ou notícias automáticas.

Verificação da primeira versão da galeria, antes do hook automático: 96 testes unitários web, build e 16 E2E passaram (dois cenários exclusivos de desktop omitidos no móvel). Após revisão visual, reduzido espaço herdado do header e restaurado foco ao botão ao fechar, sem mover scroll; build e quatro E2E de Descobertas repetidos com sucesso. Testes isolados confirmaram ausência de pedidos ao YouTube antes do clique nessa versão, intervalo correto, apenas um iframe, fecho, fontes e largura móvel. No navegador real, leitor Falcon 9 carregou e mostrou reprodução de imagens da aterragem dentro da app; restantes origens e intervalos revistos nas páginas originais, sem afirmar ensaio de todos os embeds/regiões. Sem backend, sync, produção, commit ou push.

Dificuldade adicional na revisão automática: conflito ENOTEMPTY nos ficheiros gerados de build após reinício local. Preservada pasta .next anterior em /private/tmp/launch-catch-build.7XTC4B/previous-next, sem apagar fontes/dados; regeneração limpa passou, tal como seis E2E, incluindo mudança de movimento reduzido com a página já aberta. Lint dos novos ficheiros sem avisos. Não é alteração às regras de cache públicas.

### Descobertas como hub visual de aprendizagem — novo rascunho

Base aprovada guardada no commit local `c961731`, sem push. Utilizador pediu menos scroll e investigação editorial, depois retirou explicitamente a galeria de vídeos do âmbito pretendido. Preservados pergunta e Super Heavy, reduzidos título, espaços e dimensões do hook. Galeria, módulo de dados e teste específico removidos do novo rascunho; a versão anterior continua recuperável pelo commit.

Escolhida abordagem «experimentar uma ideia aqui; aprofundar um programa noutra página»: laboratório de motores, materiais e gestão criogénica com SVG/CSS originais, ação reversível e estado textual; uma tecnologia de cada vez. Materiais usa Cassandra/ESA, identificado como demonstrador e não capacidade operacional. Motores distingue Raptor de BE-4 sem comparar números não equivalentes. Reabastecimento usa depósitos simbólicos sem simular volumes/eficiência. Não se apresentam desenhos como engenharia exata ou simulação física. Sem imagens descarregadas nem novos serviços pagos.

Artemis passa a ter destaque e rota `/discoveries/artemis`, com funções de SLS, Orion, HLS e módulo de serviço europeu; mapa conceptual de relações, missões realizadas/previstas, desafios e ligações primárias em cada secção. PT/EN/ES; navegação ativa mantém Descobertas nas subrotas. Biblioteca de fontes fica recolhida inicialmente, preservando filtros URL e abrindo quando há tema explícito.

Dificuldade editorial: fontes antigas descrevem Artemis III/Gateway de forma incompatível com a atualização NASA de 23/10/2026. Priorizadas página atual da missão e atualização recente: III como demonstração orbital prevista, 2028 como objetivo de alunagens, não promessa. Esquema não impõe Gateway nem trajetória de missão específica. Pesquisa/decisões e opções em `DISCOVERIES_REDESIGN.md`.

Primeira verificação: 96 testes unitários web, build e 18 E2E passaram (dois cenários exclusivos de desktop omitidos no móvel); lint dos novos módulos sem avisos. Testes cobrem alternância/reposição das três ilustrações, teclado, movimento reduzido, biblioteca, guia, fonte/estado de missões, idiomas e largura móvel. Capturas revistas em desktop/smartphone; captura escura ajustada para aguardar transição antes de avaliar contraste. Sem backend, sync, migração, commit, push ou publicação. Aprovação visual pendente.

Revisão visual no navegador real detetou conflito entre hover global de button e a cor do novo botão da ilustração: texto e fundo aproximavam-se até desaparecer. Corrigida regra específica sem alterar botões do resto da app e adicionado teste de cores em hover. Navegação real confirmou mudança para Materiais e ação reversível. Removido CSS sem uso da galeria; README e tarefas atualizados. Limite de altura do hub desktop e fim do hook antes de 720px passaram em teste de viewport de referência, não significando ajuste idêntico em todos os ecrãs.

Após os ajustes finais, build e os seis E2E de Descobertas foram repetidos com sucesso. A galeria removida pode ser recuperada através de c961731; não foi apagado qualquer vídeo alojado, dado externo ou conteúdo de produção. O estudo e as opções de revisão estão em DISCOVERIES_REDESIGN.md; nenhum commit/push deste rascunho.

Utilizador aprovou a reformulação e autorizou commit local. Guardado este lote antes de preparar, separadamente, a indicação de Artemis como subpágina de Descobertas no cabeçalho. Sem autorização de push; roadmap e exportações excluídos.

### Hierarquia Descobertas → Artemis — rascunho separado

Reformulação guardada em `1e1111f`, sem push. Preparada indicação «↳ Artemis» numa segunda linha sob a ligação Descobertas do cabeçalho, apenas na rota do guia. Secção principal mantém ligação de regresso e destaque; aria-current=location identifica o pai e aria-current=page o filho. Linha do pai compactada para evitar crescimento desnecessário do cabeçalho; não é novo separador de primeiro nível. Rótulo Artemis igual em PT/EN/ES. Ajuste novo ainda sujeito a revisão visual, sem commit/push.

Verificação: build e seis E2E de Descobertas passaram em desktop/smartphone. Testes confirmam rótulo filho só no guia, semântica pai/filho, permanência após mudança de idioma e remoção após regressar a Descobertas. Sem repetir backend/unitários para esta mudança de navegação/apresentação.

Utilizador aprovou a hierarquia e autorizou commit e push dos lotes locais aprovados (`f6b4c06`, `c961731`, `1e1111f` e ajuste do cabeçalho). Roadmap e exportações continuam excluídos. A confirmação do envio será verificada no GitHub; não se confunde push com sucesso de CI/publicação.

### Direção editorial acordada

Prioridade a partir deste incremento: uma experiência amigável, visual e intuitiva para quem não acompanha exploração espacial. Explicar primeiro o que está a acontecer e porque importa; introduzir termos técnicos com contexto; usar ilustrações e interações simples para ensinar uma ideia de cada vez; reservar o aprofundamento para guias próprios e divulgações. Não confundir simplicidade com promessas: distinguir planos, testes e resultados, manter fontes e revisão datada. Esta orientação guia os próximos incrementos; novas funcionalidades e alterações públicas continuam sujeitas ao fluxo de preview, aprovação e autorização de push.

### Cabeçalho com revelação por direção do scroll — rascunho local

Pedido: cabeçalho global reaparece suavemente ao subir e recolhe ao descer. Introduzido wrapper cliente ScrollHeader no layout, preservando conteúdo/navegação existentes e espaço no fluxo. Position sticky e transform movem só o cabeçalho, sem retirar/reinserir altura no documento. Sombra discreta fora do topo. Animação de 220ms; prefers-reduced-motion remove-a. Sem JavaScript, o cabeçalho permanece acessível/fixo ao topo por sticky.

Dificuldades previstas: microinversões de trackpad, altura móvel e acesso a controlos fora de vista. Tolerância acumulada de 10px evita oscilações; topo mostra sempre. Foco dentro do cabeçalho revela-o imediatamente e impede recolha durante interação; não se usa aria-hidden/inert para remover ligações do teclado. ResizeObserver mede a altura para compensar âncoras; navegação entre rotas repõe estado visível. Listener passivo no scroll do documento, limitado por requestAnimationFrame, sem intervir no scroll próprio da lista de lançamentos. Efeito/listeners/observer limpos ao mudar rota.

Sem novo backend, dependência, sincronização ou alteração pública. Preview e testes antes da aprovação; não existe autorização de commit/push deste ajuste.

Verificação: 96 testes unitários web, build e 20 E2E passaram (dois casos exclusivos desktop omitidos no móvel); lint do componente/layout sem avisos. Novo E2E em desktop/smartphone verifica ocultação ao descer, revelação ao subir longe do topo, ausência de salto no conteúdo, foco acessível, estado após navegação e movimento reduzido. Suites existentes de filtros, favoritos, scroll interno e guias mantiveram sucesso. Não é validação de todos os browsers/trackpads; preview local pronta para revisão.

### Correção de modalidade de foco e rodapé comum — continuação do rascunho

Utilizador gostou do scroll, mas verificou que clicar no cabeçalho o mantinha visível até clicar fora. Causa: proteção de foco usava qualquer activeElement dentro da barra e CSS focus-within incondicional. Corrigido com distinção de modalidade: teclado protege/revela o cabeçalho; pointerdown e roda libertam essa proteção sem forçar blur nem retirar ligações do teclado. A proteção CSS aplica-se apenas à modalidade de teclado. O mesmo listener/ciclo de limpeza mantém-se por rota.

Pedido adicional: assinatura «NextRocketLaunch · tagline», autoria farfudo e código-fonte em todas as páginas. Criado SiteFooter partilhado no layout, localizado PT/EN/ES, com ligações externas seguras. Retirada cópia da autoria da home para não duplicar; texto de origem/datas da home preservado. Rodapé normal no fim do documento, não barra fixa que reduza área útil. Não acrescenta scripts, tracking ou pedidos externos automáticos. Preparado rascunho, sem commit/push.

Verificação: 96 testes unitários, build e 22 E2E passaram (dois cenários exclusivamente desktop omitidos no móvel); lint dos componentes/layout sem avisos. Regressão específica clica no botão do cabeçalho antes de descer e confirma ocultação real; teclado volta a revelar. Rodapé verificado sem autoria duplicada em home, Descobertas, Artemis, detalhe e preview/loading, incluindo mudança PT. Sem backend ou produção alterados.

### Aprovação do rodapé e correção do fundo lateral em telemóvel

Cabeçalho e rodapé em duas linhas aprovados e guardados no commit `cc68e0a`, sem push. Utilizador reportou uma barra escura ao arrastar lateralmente no telemóvel. Diagnóstico a 390 px: home, Descobertas, Artemis e detalhe tinham largura documental igual ao viewport, mas o elemento raiz ainda usava `rgb(8,17,31)` do estilo inicial, enquanto o body claro usava `rgb(234,233,228)`. O ressalto lateral podia expor esse fundo antigo. A especificidade de `:root` preservava a cor antiga apesar da regra posterior `html`.

Rascunho de correção: raiz passa a usar `var(--surface)` como o body, acompanhando ambos os temas; `overflow-x: clip` limita o canvas lateral sem criar um contentor de scroll que prejudique o cabeçalho sticky, e `overscroll-behavior-x: none` impede encadeamento/ressalto lateral nos navegadores compatíveis. Não se bloqueia o eixo vertical nem o scroll próprio dos filtros. Teste de regressão cobre larguras 320/390/430, quatro páginas e ambos os temas. Não implica alteração de produção; validação física em Safari/iPhone continua recomendada para o gesto elástico nativo.

Primeira execução dos novos testes encontrou ainda um transbordo real a 320 px em Descobertas: `min-height: 200px` combinado com `aspect-ratio: 16/9` fazia a área do vídeo crescer até cerca de 356 px dentro de um cartão mais estreito. Em mobile, a área passa a ter largura explícita de 100% e deixa de impor essa altura mínima, preservando a proporção e sem cortar conteúdo. Cabeçalho e rodapé continuaram a passar nos quatro testes existentes durante este diagnóstico.

Verificação final do rascunho: build e seis testes E2E passaram, cobrindo limites laterais em 320/390/430 px nos dois temas, quatro rotas, e regressões de cabeçalho/rodapé. `git diff --check` sem erros. Correção mobile ainda sem commit/push, para revisão visual.

Utilizador aprovou posteriormente o commit e push desta correção mobile, juntamente com o cabeçalho/rodapé já guardados em `cc68e0a`. Documentos locais de partilha e `FEATURES_ROADMAP.md` continuam excluídos do envio.
