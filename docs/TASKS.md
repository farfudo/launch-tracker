# Próximas tarefas

## Tarefa recorrente — documentação da evolução

- [ ] Em cada incremento, atualizar `docs/PROJECT_EVOLUTION.md` com o que mudou, a decisão e o motivo, as verificações realizadas e as limitações ainda existentes.
- [ ] Registar as dificuldades encontradas, como foram investigadas, a solução aplicada e a evidência de resolução; manter explícito quando a causa ou solução ainda não foi confirmada.
- [ ] Acrescentar os commits e ligações conhecidos; distinguir commit, push, deploy, migração e sincronização, sem declarar sucesso antes da confirmação.
- [ ] Rever esta documentação antes de pedir aprovação de commit/push. A tarefa mantém-se recorrente, não fica concluída definitivamente após uma atualização.

## Incremento 1 — Fundamentos

- [x] Criar estrutura do repositório e especificação do MVP.
- [x] Criar API FastAPI com health check, contrato inicial e testes.
- [x] Criar interface Next.js com ecrã inicial do calendário.
- [ ] Configurar instalação e execução local das dependências.

## Incremento 2 — Dados de lançamentos

- [x] Definir o modelo inicial de dados PostgreSQL para lançamentos.
- [x] Substituir o inicializador local por migrações versionadas.
- [x] Criar cliente Launch Library 2 com tratamento de falhas e limites.
- [x] Implementar sincronização manual e cache PostgreSQL.
- [x] Substituir dados de demonstração por dados persistidos.

## Incremento 3 — Experiência do MVP

- [x] Criar lista/calendário de próximos lançamentos.
- [x] Adicionar pesquisa e filtros por agência e veículo.
- [x] Criar página de detalhe com os dados normalizados disponíveis.
- [x] Acrescentar descrição e nome da missão, local, plataforma e janela prevista.
- [x] Permitir escolher português, inglês e espanhol e guardar a preferência no browser.
- [x] Apresentar UTC, hora do local de lançamento e hora do visitante, incluindo horário de verão.
- [x] Apresentar uma ligação transparente para a fonte de dados na página de detalhe.
- [x] Adicionar estados de carregamento, vazio e erro.
- [ ] Guardar e apresentar fontes oficiais, quando a fonte externa as disponibilizar.

## Incremento 4 — Confiança e lançamento

- [x] Adicionar testes de interface e percursos de integração desktop/móvel; PostgreSQL real em revisão separada.
- [x] Configurar CI no GitHub Actions.
- [x] Preparar imagens Docker e ambiente isolado de demonstração.
- [x] Publicar demonstração online com alojamento gratuito.
- [x] Preparar sincronização horária e apresentar a idade dos dados.
- [x] Configurar o segredo Neon no GitHub, validar a primeira sincronização manual e ativar o agendamento horário.

## Depois do MVP

- [ ] Rever uniformização de expansões e contraste entre cartões/background, junto com rascunho 5–6, antes de commit/push (`docs/DISCLOSURE_SURFACES_REVIEW.md`).

- [x] Rever prioridades UI e preparar lote local dos pontos 1–4, com indicação de desenvolvimento; 90 testes/build/seis E2E passaram (`docs/UI_POLISH_REVIEW.md`).
- [x] Aprovar lote UI 1–4 e etiqueta; commit local `01ed45b`, sem push.
- [ ] Rever preview dos pontos 5–6 (cartões/contagens/controlos/partilha), aprovar e autorizar envio separadamente (`docs/UI_CONTROLS_REVIEW.md`).

- [x] Aprovar correção local de revalidação e autorizar push, incluindo o visual laranja `38d8569` (`docs/CACHE_REVALIDATION_REVIEW.md`).
- [x] Confirmar CI `40130910748`, publicação Vercel de `a91dc50` e renovação pública da cache após cinco minutos reais, sem invalidar dados.

- [x] Rever e aprovar fundo laranja claro das transmissões expandidas; autorizado apenas commit local.
- [x] Obter autorização de push do fundo laranja, incluído no envio da correção de revalidação.

- [x] Rever e aprovar job PostgreSQL isolado e testes reais de migrações/concorrência; push autorizado (`docs/POSTGRES_CI_REVIEW.md`).
- [x] Confirmar execução remota do novo job PostgreSQL: CI `40128103871` passou em `ecb412b`, assim como API, Worker e Web.
- [x] Atualizar estados antigos do catálogo local `FEATURES_ROADMAP`, mantendo-o excluído dos pushes.

- [x] Rever e aprovar resumo lateral simplificado, distinto da página completa; autorizado apenas commit local (`docs/MISSION_SUMMARY_REVIEW.md`).
- [x] Obter autorização de push do resumo lateral simplificado, incluído no envio dos testes PostgreSQL.

- [x] Corrigir localmente I001/TRY004 e reproduzir análise/testes com Python 3.12.15 e Ruff 0.17.2: 54 testes passaram.
- [x] Obter autorização de commit/push da correção de CI.
- [x] Confirmar CI da correção `1672e87`: execução `40125277157` passou API, Worker e Web/build/E2E.

- [x] Rever e aprovar preview de websites/fontes por entidade; commit/push autorizados (`docs/MISSION_SOURCES_REVIEW.md`).
- [x] Confirmar Vercel/Render no commit `ecb412b`, incluindo código de fontes e repetição limitada; última sincronização agendada bem-sucedida observada.

- [x] Rever e aprovar diagnóstico seguro e repetição limitada da sincronização (`docs/SYNC_RETRY_REVIEW.md`); autorizado apenas commit local.
- [x] Obter autorização de push da repetição limitada, incluída no envio do incremento de fontes.

- [x] Preparar e validar localmente cache de dados públicos para arranque lento da API; 75 testes, build, quatro E2E e ensaio compilado de falha/recuperação passaram. Ver `docs/COLD_START_REVIEW.md`.
- [x] Rever preview da cache e obter aprovação; autorizado apenas commit local, sem push.
- [x] Autorizar e enviar cache da interface em `d0d8a98`; CI posteriormente confirmada.
- [x] Tratar falha de revalidação e confirmar checkedAt a avançar num ciclo público após `a91dc50` (`docs/CACHE_REVALIDATION_REVIEW.md`).
- [ ] Validar futuramente arranque a frio público controlado, sem confundir o ciclo de revalidação já observado com prova de todas as condições de falha.

- [ ] Alertas configuráveis.
- [x] Rever preview de legibilidade smartphone (texto maior até 600 px); lote aprovado com commit/push autorizados.
- [x] Rever fusos/transmissões concentrados no resumo esquerdo, sem fusos repetidos na lista direita; manter página completa no móvel.
- [x] Rever alinhamento desktop; proposta inicial de apresentação acima de ambos substituída pela correção seguinte.
- [x] Aprovar estrutura original em cima, bases alinhadas e scroll apenas dos resultados abaixo dos filtros, com indicador decorativo de foguetão; commit/push autorizados.
- [x] Aprovar detalhe compacto com Watch here no topo e remoção do trilho extra da lista; commit/push autorizados.
- [x] Aprovar destaque azul do countdown na lista e página completa; autorizado commit local, sem push.
- [x] Propor e rever reorganização do resumo esquerdo, distinguindo informação essencial dos detalhes completos.
- [x] Aprovar resumo com descrição original, identificação da missão, countdown azul, Watch here e View full details; fusos e local apenas na página completa. Commit/push autorizados.
- [ ] Transmissões e ligações oficiais.
- [ ] Telemetria, quando houver fonte adequada.
