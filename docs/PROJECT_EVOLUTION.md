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

Recomendação ainda não implementada: acrescentar ao rodapé «Desenvolvido por farfudo», ligado a https://github.com/farfudo, e uma ligação separada «Código-fonte», para https://github.com/farfudo/launch-tracker. O perfil apresenta o autor; o repositório permite inspecionar este projeto. Preferir texto discreto e acessível, traduzido nos três idiomas, sem competir com “Watch here” ou com a navegação de missões.

Não é necessário mostrar email, carregar widgets externos ou acrescentar rastreio para criar estas ligações. A identidade visual e a publicação da alteração ficam sujeitas à preview e aprovação.
