# NextRocketLaunch — evolução técnica e histórico explicado

## Commercial Crew — validação antes do envio (28/10/2026)

Após autorização de commit e push, passaram 142 testes unitários, build, seis testes browser Starship e os testes dirigidos Commercial Crew. A suite browser completa detetou primeiro uma duplicação temporária de `.booster-catch` durante a navegação; teste passou a esperar a existência de uma única figura antes de interagir, mantendo todas as asserções de reprodução, e passou em desktop/mobile. Nova execução completa teve 49 passagens, oito omissões existentes e uma falha desktop do Histórico ao preservar a pesquisa; o mesmo teste passou isoladamente em desktop/mobile sem retries. Nenhum código de Launches ou Mission Details foi alterado. A suite completa não ficou integralmente verde localmente; a CI remota continua a ser o critério de confirmação e este risco foi registado.

## Commercial Crew — sequência visual e associação simulada (28/10/2026)

Após pedido de refinamento, mantida comparação fotográfica e acrescentado esquema SVG sem escala: lançamento, ISS e regresso, com trajetórias distintas, título e descrição acessíveis PT/EN/ES e lista de cinco etapas preservada. Prévia mobile 390×844 revista: diagrama e texto legíveis, sem transbordo.

Extraído o bloco local de lançamentos relacionados para componente próprio, sem alterar serviços nem regras existentes de Mission Details. Com dados simulados, testes confirmam que `Crew-10` liga ao ID devolvido, uma missão semelhante não é associada, ausência de correspondência e falha da leitura exibem os estados corretos. O fixture não representa lançamento futuro real. Oito testes dirigidos passaram, assim como TypeScript, lint, build e dois testes browser desktop/mobile incluindo a existência acessível do diagrama. Prévia local sem API real mantém mensagem de indisponibilidade. Rascunho sem commit/push/deploy.

## Commercial Crew — rascunho local (28/10/2026)

Branch isolada `codex/commercial-crew` sobre `21fb3cc`; CI anterior confirmada verde. Página `/explore-space/programs/commercial-crew` e ligação no cartão existente, usando estruturas visuais Artemis e Starship: hero fotográfico, comparação com fotografias, fases da missão, cronologia, importância e ligações. Conteúdo PT/EN/ES e revisão editorial datada. Crew Dragon operacional e Starliner ainda em certificação são distintos; CFT regressou sem tripulação, com voo de avaliação não tripulado seguinte previsto sem data fixa.

Fontes oficiais: NASA Commercial Crew https://www.nasa.gov/humans-in-space/commercial-space/commercial-crew-program/ ; NASA e Boeing sobre certificação https://www.nasa.gov/news-release/nasa-boeing-share-update-on-commercial-starliner-development-plans/ ; Boeing https://www.boeing.com/content/theboeingcompany/us/en/space/starliner/starliner-1.html ; SpaceX Crew-10 https://www.spacex.com/launches/crew10 . NASA Demo-2 e Crew-1 ligadas na cronologia. Dois endereços NASA inicialmente devolviam 404; substituídos por fontes oficiais verificadas.

Imagens NASA: `iss063e021563` Demo-2, 31/05/2020 https://www.nasa.gov/image-article/spacex-crew-dragon-approaches-international-space-station-4/ ; `iss067e066644` Starliner OFT-2 não tripulado, 20/05/2022 https://www.nasa.gov/image-article/boeings-starliner-crew-ship-approaches-space-station/ . Convertidas para WebP; Starliner recortada; crédito e data junto das imagens, orientações https://www.nasa.gov/nasa-brand-center/images-and-media/ .

Related Launches usa apenas correspondências exatas de nomes revistos sobre a cache pública existente, sem mudar Launches, Mission Details, API, LL2 ou sincronização; pode não mostrar missões quando o nome fornecido não coincide exatamente. Prévia local sem API mostra estado de indisponibilidade. Dez testes dirigidos, TypeScript, lint e build passaram; dois testes browser desktop/mobile passaram com API fictícia sem correspondências, navegação, imagens, fases e ambos os temas. Prévia desktop/mobile, âncoras, idiomas inglês/espanhol e tema escuro observados; não constitui auditoria completa de acessibilidade nem validação de dados reais. Rascunho não aprovado, sem commit/push/deploy.

## CI Starship — correção local da recolha (28/10/2026)

A CI `40718914700` de `dca90db` falhou porque a suite normal recolhia os seis testes de Starship, mas não iniciava os seus servidores específicos. Corrigida a configuração normal para não recolher esse ficheiro e acrescentado passo próprio na mesma CI que executa a configuração Starship, iniciando as três origens de API simulada e três servidores locais; evidência dessa suite também é guardada. Os testes não foram eliminados nem ignorados pela CI: são executados no passo próprio.

Recolha confirmada: 56 casos normais e seis Starship, sem sobreposição. Os seis Starship passaram em desktop/mobile; na execução normal passaram 47, oito foram omitidos conforme regras existentes e um teste desktop do vídeo falhou por encontrar duas figuras durante navegação; repetido isoladamente sem retries, passou. Não se afirma que a suite normal completa passou, nem que a CI remota foi validada. Nenhuma alteração de produto/infraestrutura/produção. Rascunho local sem commit/push; necessário rever e obter autorização específica para envio.

## Starship — build completo e API simulada no navegador (28/10/2026)

Build de produção completo passou com Turbopack, TypeScript e geração das páginas, incluindo a nova rota. A ligação simbólica às dependências fora da raiz impedia o build; tentativa de cópia ficou lenta e foi interrompida. Instalação isolada com `npm ci --no-audit --no-fund`, usando o lock existente, resolveu sem alterar dependências versionadas nem o checkout original. `next-env.d.ts` voltou ao conteúdo de produção original.

Adicionados servidor simulado somente GET e configuração Playwright específica, com três origens localhost separadas para impedir contaminação da cache entre correspondência, ausência de correspondência e HTTP 503. Não usa API real, PostgreSQL, LL2 ou credenciais. Os seis cenários desktop/mobile passaram; toque real em contexto Chromium móvel (`tap`, 390×844) abriu a página a partir do cartão e navegou para Artemis. Os 14 testes unitários dirigidos voltaram a passar e lint/diff foram verificados.

A inspeção da captura com dados disponíveis revelou conflito visual herdado: `.artemis-guide :is(article,aside,details) a` tornava o link do cartão `inline-flex`, alinhando os textos horizontalmente. Correção limitada a `.starship-guide .related-launch-card .launch-card-link { display:block; }`, sem alterar Artemis ou Launches. Build repetido passou; quatro cenários de ausência/erro passaram e os dois casos afetados passaram na repetição dirigida após corrigir a medição para obter ambos os retângulos no mesmo frame (scroll suave tornava leituras separadas inconsistentes). Capturas em `apps/web/output/playwright/starship-validation/`, incluindo `related-card.png`; dados explicitamente fictícios para teste. Rascunho pronto para revisão, não publicado, sem commit/push/merge/deploy.

## Starship — fecho da validação dirigida (28/10/2026)

Resolvida a falha do teste de indisponibilidade: `beforeEach(()=>read.mockReset())` devolvia a função mock; Vitest interpretava-a como limpeza e executava-a depois do teste, voltando a lançar a rejeição simulada. A função de preparação passou a usar bloco sem retorno. Mantidas verificações de erro acessível, correspondência por metadados e ausência de cartões; nenhum componente ou serviço de dados foi alterado. Os 14 testes dirigidos, TypeScript e lint do teste passaram.

Percurso landing → Starship → Artemis → landing exercitado em PT/EN/ES, claro/escuro, 1440×900 e 390×844 (12 combinações), confirmando destinos, preservação de idioma/tema e ausência de transbordo nas páginas de guia. Um clique automatizado mobile não navegou; a mesma ligação funcionou por Enter, e restantes percursos mobile foram concluídos por teclado. Não foi reproduzido defeito do produto, mas não se declara validação exaustiva de toque. Prévia local continua em localhost:3326; API ausente continua a produzir a mensagem de indisponibilidade de Related Launches, coberta agora por teste. Validação de produção/build completo não foi executada nesta fase dirigida. Sem commit/push/merge/deploy; aprovação visual e qualquer envio continuam separados.

## Starship — refinamento autorizado do rascunho (28/10/2026)

Substituída fotografia distante por Starship/Super Heavy na plataforma antes do Voo 5 (12/10/2024), Steve Jurvetson, CC BY 2.0. Origem e licença verificadas em https://commons.wikimedia.org/wiki/File:SpaceX_Starship_before_IFT-5.jpg ; recorte/redimensionamento documentados no crédito. WebP local 72 822 bytes. Hero dividido: fotografia separada do texto em mobile, para manter o veículo visível e a leitura independente da imagem.

Adicionado diagrama SVG acessível com percursos contínuo/tracejado para propulsor e nave no Voo 5, descrição textual e ressalva de escala/simultaneidade. Cronologia acrescenta primeiro revoo de Super Heavy (Voo 9, 27/05/2025) e primeiro V3/Raptor 3 (Voo 12, 22/05/2026), com perdas/limitações explícitas e fontes SpaceX. A seleção continua sem alegar ser um registo completo até ao último voo. Ligação do cartão Starship ativada sem reformular landing ou Artemis.

TypeScript e lint passaram. Nos 14 testes dirigidos, correspondência real por metadados, exclusão de veículos alheios e ausência de cartões sem correspondência passaram; o novo teste de rejeição da leitura em RelatedMissions falhou ao propagar o erro simulado, permanecendo pendente. Componente de produção preservado, teste não omitido nem expectativa enfraquecida. Prévias 1440/390 observadas, incluindo hero e cartões no escuro; sem commit/push/merge/deploy. Não considerar o rascunho totalmente validado antes de resolver o teste pendente.

## Starship Development — rascunho isolado de 28/10/2026

Criada página `/explore-space/programs/starship` em `codex/starship-development`, base GitHub `52582d9`. Reutiliza apresentação Artemis/Programas sem reformular páginas aprovadas. Hero fotográfico com CC BY 2.0 documentada, arquitetura e Raptor, reutilização, marcos históricos selecionados, perfil didático do Voo 5, HLS, RelatedMissions existente, importância e continuação PT/EN/ES. Distingue demonstrações de objetivos, sem datas futuras fixas. Nenhuma alteração nas áreas Launches, Mission Details, countdown, favoritos, A07 ou serviços de dados.

Dificuldades e soluções: clone inicial não continha a landing aprovada; obtida base remota em worktree isolado, preservando alterações locais. Turbopack recusou dependências partilhadas fora da raiz; prévia Webpack local funcionou sem alterar configuração. TypeScript, lint dos novos ficheiros e 11 testes dirigidos passaram. Prévia observada em 1440 e 390 px, fotografia carregada, zero âncoras internas sem destino, sem overflow mobile; PT/EN/ES e tema escuro exercitados. RelatedMissions apresentou estado de indisponibilidade por ausência da API nesta prévia, sem criar associações. Fontes, direitos e limites em STARSHIP_DEVELOPMENT_REVIEW.md. Rascunho sem commit/push/merge/deploy, pendente de aprovação visual.

## A18 — Fase 5: revisão final Explore Space (rascunho local, 28/10/2026)

Estado confirmado antes da revisão: `main` pública em `05db8ec` inclui as Fases 1–4 (hub, conteúdos Discoveries/Artemis, ligações contextuais e cronologia), com CI e Vercel verdes. As quatro fotografias da cronologia estavam apenas no commit local `6b1c33d`, ainda não publicado; a revisão foi preparada no worktree `codex/a18-phase5` sobre esse commit, sem alterar `main`.

Correções concretas: fotografias dos marcos usam moldura comum 3:2 sem barras laterais; a imagem completa continua disponível na ampliação; a página Space Milestones passa a usar a imagem de aterragem Falcon 9 já documentada, em vez do fundo da ISS, com crédito/licença CC0 e fonte correta. Fotografias locais têm 92–212 KB, dimensões até 960 px, `next/image`, carregamento lazy e ampliação nativa por diálogo; texto alternativo, créditos, Escape, foco e toque existentes foram preservados. Rotas antigas `/discoveries` e `/discoveries/artemis`, metadata e ligações editoriais verificadas; as associações continuam baseadas nas regras explícitas existentes, sem gerar relações por palavras-chave.

Verificação: 125 testes Vitest passaram (incluindo suíte de regressões completa). Prévia manual inspecionada em 1440 px e 390 px, claro/escuro e PT/EN/ES; navegação, títulos, alternativas, créditos, timeline e guia Artemis visíveis. E2E direcionados não executaram as asserções: o Chromium headless encerrou no arranque com `MachPortRendezvousServer: Permission denied` neste ambiente. Lint não terminou no limite local; build e E2E permanecem para CI. O carregamento do player externo do excerto no browser da prévia também não foi confirmado.

Sem commit, push, merge ou deploy. O trabalho é um rascunho isolado; a prévia local está em `/explore-space/milestones`.

## A18 — imagens dos Space Milestones (rascunho local, 28/10/2026)

Atualizada a cronologia com imagens históricas locais para Sputnik 1, Vostok 1/Yuri Gagarin, Apollo 11 e aterragem Falcon 9 de 2015. Mantidos os textos, a ordem e as ligações existentes. Cada imagem tem alt text PT/EN/ES, crédito e link para a fonte/licença; detalhes e limites jurisdicionais estão em `SPACE_MILESTONES_IMAGE_CREDITS.md`. Os thumbnails têm até 960 px e são apresentados com carregamento responsivo/lazy; clicar ou tocar abre uma ampliação acessível por teclado, Escape, botão de fechar e toque fora. Testes direcionados e prévias desktop/mobile pendentes. Sem commit, push ou deploy.

## A18 — Descobertas e Artemis (rascunho local)

Acrescentadas conclusões educativas curtas nos três temas e no guia Artemis, legendas de texto legível sob as ilustrações e ligações a lançamentos apenas quando os dados da API contêm uma correspondência explícita. A leitura reutiliza a cache pública; falhas ou ausência de correspondência não criam uma ligação. Testes direcionados: cinco passaram; prévia local bloqueou no carregamento, pelo que desktop/mobile continuam por rever.

### A18 — Fase 1: hub Explore Space (rascunho local)

Criada uma entrada única «Explore Space» no cabeçalho, com landing page educativa e quatro cartões: Discoveries & Advances, Space Programs, How Rockets Work e Space Milestones. Cada cartão aponta para conteúdo real já disponível: biblioteca de descobertas, guia Artemis completo, laboratório tecnológico ou calendário de lançamentos. Não foram criadas páginas vazias nem marcos fictícios. As rotas `/discoveries` e `/discoveries/artemis` continuam acessíveis e mantêm o separador Explore Space ativo; o fundo contextual de Descobertas também é reutilizado no hub.

Textos e metadata PT/EN/ES; layout adaptável, foco visível e respeito por redução de movimento. Testes E2E atualizados para a navegação e rotas legadas, com novo percurso do hub e largura mobile de 320 px. Esta alteração limita-se a navegação/conteúdo frontend; calendário, filtros, favoritos, detalhes, API, sincronização e infraestrutura não foram alterados. Sem commit/push/deploy.

### A18 — Fase 4: Space Milestones (rascunho local, 27/10/2026)

O cartão Space Milestones abre agora uma cronologia educativa separada do calendário futuro. Inclui Sputnik 1 (04/10/1957), Vostok 1 (12/04/1961), Apollo 11 (20/07/1969) e a aterragem orbital do primeiro estágio Falcon 9 (21/12/2015). Cada marco tem categoria, explicação e «Why it matters» em PT/EN/ES, data histórica civil sem hora/fuso, e fonte primária: NASA para Sputnik, Vostok e Apollo 11; SpaceX para a aterragem do Falcon 9. Não foram adicionadas imagens externas: a timeline usa elementos gráficos CSS originais. Ligações educativas aparecem apenas para Apollo 11 → guia Artemis e Falcon 9 → laboratório sobre reutilização; não foi inferida relação para Sputnik/Vostok. Vitest: 6/6 aprovados; Playwright desktop/mobile: 6/6 aprovados, incluindo as três línguas e ausência de overflow mobile. Prévia local em `/explore-space/milestones`. ESLint local não terminou nem apresentou resultado; validação de estilo fica pendente. Sem alterações ao calendário, API, base de dados ou sincronização. Sem commit/push/merge/deploy.

## A07 — countdown estimado com precisão desconhecida

A pedido do utilizador, regressa a contagem baseada no horário de referência quando a precisão da fonte é desconhecida, identificada como estimativa com hora não confirmada. Missões concluídas, sem data, em voo e suspensas preservam o seu tratamento; períodos amplos não recebem countdown. Prévia visual demonstrativa com dados fictícios; validação da aplicação real pendente.

## A07 — correção de apresentação (rascunho local)

A API pública consultada devolveu precisão nula nos primeiros três lançamentos e a última importação observada antecedia o deploy A07; isto não prova falha de propagação. A interface volta a mostrar a data de referência em UTC para precisão desconhecida, com um único aviso, sem assumir hora exata. Contagens para SEC/MIN/HR deixam visíveis apenas as unidades suportadas e períodos amplos continuam sem contagem; estados operacionais continuam a prevalecer. Não foram efetuadas sincronizações manuais. Testes dirigidos preparados para três idiomas; Vitest local bloqueou e exige validação por CI isolada.

## A07 — precisão temporal (27/10/2026, rascunho local)

Propagado o objeto net_precision da LL2 2.3.0 pelo cliente, persistência JSON anulável, upsert, schemas e frontend. Catálogo dos 17 IDs confirmado em duas consultas de configuração lldev previamente autorizadas, documentado em A07_TEMPORAL_PRECISION_CONTRACT.md; nenhuma consulta LL2 foi feita nesta implementação. Migração 20261027_08 adiciona campo sem backfill: registos antigos ficam desconhecidos. IDs futuros são preservados, mas não interpretados como exatos. Clientes antigos podem ignorar o novo campo; o frontend aceita respostas antigas sem precisão.

Formatação central: SEC inclui segundos, MIN não inclui segundos, HR não inclui minutos/segundos e é apresentado em UTC sem projetar uma hora aproximada no fuso do visitante. Só SEC mais estado Go permite countdown/lembrete exatos; as restrições A04 de TBC/TBD/Hold, em voo e terminal continuam a prevalecer. Períodos amplos mostram apenas a granularidade com referência por confirmar: o catálogo não comprova a convenção para extrair dia/mês/ano de NET. Não se inventam fronteiras de manhã/tarde, ano fiscal ou década. Datas completas de observação A05 mantêm semântica própria e não são limitadas pela precisão da missão.

Validação local: 54 testes de parsing/round-trip/cliente LL2 e 11 testes API passaram (65 total); Ruff nos ficheiros Python relevantes aprovado. Dois testes PostgreSQL 17.11 isolados passaram: migração/rollback/upgrade com linha legada e cadeia existente preservando dados e sync_control. Base descartável desligada após os testes. Aviso de depreciação Starlette/httpx do ambiente, sem falha. Vitest dirigido e TypeScript bloquearam sem conclusão e foram interrompidos; testes web (17 IDs, null/IDs futuros, meia-noite, DST, fusos, históricos, calendário e regressões A04/A05) preparados, mas não declarados aprovados. Sem nova dependência, commit, push, deploy ou configuração de produção. Prévia visual e CI web isolada pendentes de autorização.

## A05 — frescura por missão (27/10/2026, integração autorizada)

Separadas a última importação global, a observação individual na importação e a verificação da cópia da interface. O campo API source_updated_at mantém contrato e passa a ser descrito como observação local, sem o apresentar como alteração do fornecedor (timestamp indisponível). Missões não terminais com observação de pelo menos seis horas têm aviso; NET ultrapassado não prova conclusão. Estados terminais mostram aviso de histórico retido, sem promessa de reconciliação recente. Snapshot global ausente ou com revalidação vencida não certifica frescura. Refresh não modifica a idade da missão. Sem pedidos LL2, novos endpoints ou mudanças A01/A04. Acrescentados quatro testes de regressão para observação individual antiga, refresh/cópia recente, histórico terminal e passado sem resultado, datas inválidas/futuras, snapshot global indisponível/vencido e traduções PT/EN/ES. Verificação git diff --check aprovada. Vitest (forks e threads) e ESLint locais bloquearam sem resultados e foram interrompidos; não se declara aprovação. Validação por CI isolada e prévia visual pendentes, sem commit/push/deploy.

Validação isolada: commit 2d35008 (base main c2e806a), CI 40521665560 totalmente verde: lint, build, 18 regressões dirigidas, 108 unitários e 40 E2E aprovados/8 ignorados. Os seis casos de falha global e seis casos de observação passaram separadamente em desktop/mobile PT/EN/ES; seis skips da suite completa correspondem aos cenários de falha executados separadamente, mais dois skips mobile de scroll já existentes. Revisão de 18 capturas da homepage/detalhe/falha: mensagens legíveis e sem cortes A05 observados. Defeito comprovado corrigido: Date.now durante render da homepage violava pureza React; confirmação global passou para getCachedStatus, sem novos pedidos. Proteção Vercel por branch e Render main/previews Off verificadas; sem deploy, LL2 real ou sync manual. CI temporária e vercel.json da branch devem ser excluídos da futura integração. Integração em main autorizada; somente código, testes e documentação A05, sem configurações temporárias ou artefactos de validação.

## A04 — estado, data e contagem (27/10/2026, integração autorizada)

Preparada distinção entre missões concluídas, em voo, suspensas, com hora incerta ou data por determinar e missões Go. Estados terminais não apresentam contagem ou aviso de hora por confirmar. Estimativas fornecidas para datas incertas permanecem visíveis e identificadas como provisórias; datas inválidas não são formatadas. O calendário explica a indisponibilidade para missões concluídas ou em voo. Acrescentados testes de regressão. Dificuldade: testes locais ficaram bloqueados; validação preparada em CI isolada, sem alterar A01.

Validação CI 40489077931 no commit f754a1e: build, lint, 104 testes unitários e E2E (34 aprovados, 2 ignorados), incluindo teste dirigido de scroll. Dificuldade adicional: o seletor global encontrava a cópia SSR temporária oculta em div#S:0 e a lista visível; o teste passou a exigir um único calendário visível, preservando as verificações de scroll. Integração seletiva exclui CI temporária e bloqueio de deploy, mantendo todas as entradas A01.

## A01 — observabilidade do limite LL2 (27/10/2026, integração autorizada)

Preparados registos estruturados para tentativas reais, motivo de bloqueio, Retry-After normalizado, prazo efetivo e resultado, sem registar credenciais nem respostas arbitrárias. A dificuldade anterior era distinguir 429, reservas e pedidos efetivos; a contagem é isolada por contexto e não acrescenta chamadas. Mantidos os locks e a política de espera. Validação PostgreSQL 17.11 isolado: 15 testes passaram, incluindo migrações, locks reais, reserva persistente, Retry-After numérico/data, bloqueio entre sessões, contagem de tentativas e cooldown. Fornecedor simulado; nenhum pedido LL2 real. A base descartável foi criada com UTF8 após um problema inicial de codificação. Os 57 testes SQLite anteriores não foram repetidos na validação PostgreSQL local. CI isolada verde no commit 9a870a7: 71 testes API, 15 PostgreSQL 17 e 27 Worker, com Ruff aprovado. Integração em main autorizada; o incremento inclui o timeout de 180 s do Worker, sem alterar cron ou publicar código Cloudflare. Configurações temporárias de CI e bloqueio de deploy excluídas.

## Estabilização A02, A03 e A14 (27/10/2026, rascunho)

Os testes de navegação e Descobertas foram alinhados com o comportamento aprovado. O InfoDisclosure passou a usar HTML válido, com interação por toque, ponteiro e teclado, Escape, fecho ao tocar fora e reposicionamento; as etiquetas do excerto foram clarificadas em PT, EN e ES. Os testes identificaram HTML temporário oculto transmitido pelo servidor: a verificação foi circunscrita à página visível, mantendo a associação única entre botão e painel.

A CI isolada passou no commit 0ed3e52. A integração seletiva deve ser novamente validada; permanecem pendentes testes em leitores de ecrã e dispositivos reais. Não integrar os ajustes temporários de CI nem o bloqueio de deploy da branch de validação.

## A01.1 — primeira verificação automática deteta falha e cron divergente (26/10/2026 ~20:32 UTC)

Monitorização de leitura confirmou Worker 4c29b5dc executado com cron */30 * * * *, enquanto a confirmação visual inicial registara 17 * * * *. Settings mostra agora Every 30 minutes; causa da divergência não determinada. Evento das 20:00 falhou com HTTP 503 em cerca de 4,31 s, run d203ac25-fef9-4067-97f2-697b60a96e82; das 20:30 completou com imported=0/skipped=true/retry_wait, run eb7f4751-174f-4838-87ed-7049e947ba54. Ambos têm started/resultado correlacionados, sem prova de nova importação; API continua em 15:20:07.038970Z e GitHub sem run posterior acessível. Cron Events vazio diverge dos logs Observability, pelo que não constitui prova de ausência. Evidência detalhada em A01_1_PRODUCTION_VALIDATION. Utilizador avisado, sem alterar produção, repetir sync ou ler segredos. A01 não encerrado; monitor de leitura preservado e condição registada para evitar alertas repetidos.

## A02 — plano de CI isolada sem publicação (26/10/2026)

Leitura confirmou CI manual disponível em branch; nenhuma chamada a Sync launches/deploy ou segredo de produção na CI. Render acompanha main/services/api, auto-deploy On Commit, previews Off. Vercel acompanha main em produção e todas as restantes branches em Preview, com root apps/web. Dificuldade: branch isolada, por si só, não impede preview. Solução proposta: primeiro envio já conter proteção git.deploymentEnabled apenas para codex/a02-e2e-validation, mais patch A02 num worktree separado; nada criado/enviado. CI terá ajuste temporário só nessa branch para lint web e E2E dirigidos antes da suite completa sem retries; não alterar CI permanentemente, sincronização ou integrações globais. Plano/evidência/fontes em A02_E2E_REVIEW. Execução continua pendente de aprovação; A01 e alterações existentes preservados.

## A02 — continuação limitada do bloqueio de validação (26/10/2026)

Sem alterar produto/A01: processos/portas livres; amostra de importação Next, limitada a 12 s e anterior às páginas da app, ficou numa leitura de dependência. Após ler diretamente o ficheiro, importação isolada terminou em 1,42 s; não demonstra a causa de origem. Uma única tentativa E2E normal justificou-se por essa melhoria: Next abriu 3300, mas falhou prontidão aos 60 s, ainda com leitura de dependência do router observada. Nenhum caso foi executado. Interrompido conforme pedido, sem reinstalar pacotes, aumentar timeouts, repetir lint/unitários/build bloqueados ou alterar configuração versionada. Patch apenas dos dois testes em /private/tmp/nrl-a02-tests.patch; proposta de CI isolada, com confirmação prévia de que integrações não publicam previews/produção, em A02_E2E_REVIEW. A02 continua por validar. Sem commit/push/deploy/dispatch; documentação local atualizada com dificuldade e evidência.

## A02 — contratos funcionais de E2E (26/10/2026, rascunho por validar)

Verificados os componentes reais e a correção anterior b5791d7. Navegação agora tem teste independente do Histórico, validando nomes, destinos, estado ativo e navegação a Descobertas; pesquisa/períodos continuam no caso próprio. Retirados os limites geométricos remanescentes de Descobertas: ordem das secções, conteúdo secundário inicialmente recolhido, abertura por teclado e atalhos com destino/título no viewport preservam cobertura funcional em desktop/mobile. Sem alteração de design, componentes, funcionalidades ou A01; mantidas verificações de fontes, filtros, temas/idiomas e screenshots.

Dificuldade: três tentativas de E2E falharam antes de executar casos, por indisponibilidade do servidor Next local (60 s, 60 s e 180 s numa configuração temporária não versionada). API fictícia saudável; amostra Next captou espera em leitura de dependências, causa não confirmada. Unitários, lint e build iniciados mas sem resultados após vários minutos; interrompidos juntamente com a leitura auxiliar de cache. Não foram instaladas dependências nem alterados timeouts de asserção/CI. Recolha Playwright passou (32 casos em 8 ficheiros), diff sem erros; **não é aprovação da execução**. Suite completa e A02 permanecem por validar. Evidência/comandos e pendências: `A02_E2E_REVIEW.md`. Sem commit/push/deploy; alterações locais anteriores de A01 preservadas.

## Ativar cron principal A01.1 (26/10/2026)

Após autorização explícita separada, guardado um único cron Cloudflare `17 * * * *` no Worker nextrocketlaunch-sync, ativo em 4c29b5dc com 180 s. Interface confirmou execução horária ao minuto 17 e próximo evento 20:17 UTC de 26/10. Não foi acionado teste/sync manual nem alterado segredo ou fallback GitHub. Criado acompanhamento de leitura `validar-cron-principal-a01-1` ao minuto 22 de cada hora, com alertas apenas por resultado relevante/falha/intervenção, três ciclos e revisão de 24 h. Dificuldade: configuração adicionada ainda exigia Save global; só foi considerada ativa após gravar e desaparecer «Unsaved changes». Estado/evidência em `A01_1_PRODUCTION_VALIDATION.md`. Ativação não prova importação; A01 continua aberto até validar cadência. Sem commit/push neste passo.

## Confirmar publicação A01.1 e preparar margem do Worker (26/10/2026, rascunho)

Publicação concluída em 26/10/2026, cerca das 19:39 UTC, após o utilizador colar o ficheiro local e pedir verificação. Fonte conferida no editor: constante 180000 ms, ambas as esperas usam a constante, POST único, redirect manual, contrato com retry_wait e handler scheduled preservados; editor sem problemas. Deploy autorizado confirmou versão **4c29b5dc (Active) Latest**, substituindo 62974619. Settings voltou a confirmar **No cron triggers configured** e SYNC_TOKEN encriptado. Não foi disparado teste Schedule nem sync manual, nem alterado segredo/cron. Isto comprova publicação do código, não importação real nem cadência. Rollback disponível para 62974619 mediante autorização. Fonte/testes/documentação locais ainda sem commit/push deste ajuste.

Incidente de preparação manual: a área de transferência da sessão de browser não coincidiu com a do macOS; o utilizador selecionou o código e colou conteúdo vazio. Foi confirmado que a versão ativa continuava `62974619` e não houve deploy. O rascunho vazio foi descartado pela ação «Discard and continue», sem guardar versão. Para evitar repetir o problema, o ficheiro local deve ser copiado diretamente pelo utilizador com ⌘C antes de ⌘V no editor. Não declarar publicação concluída até verificar conteúdo e nova versão ativa.

O utilizador autorizou publicar o ajuste de 180 s no Worker, mantendo cron desligado e sem sync manual. A tentativa pelo editor Cloudflare ficou bloqueada: o campo dentro do iframe recusa teclado/foco e não expõe um setter de valor padrão. Nenhuma alteração foi aplicada/publicada. Código local validado colocado na área de transferência do browser para o utilizador colar; publicação e nova versão ativa continuam por confirmar. Não foram lidos nem alterados segredos. Este bloqueio é da interação com o editor, não um resultado de execução do Worker.

Consulta autenticada confirmou API Render Live no commit `92416eb`, deploy `dep-dbfnlgff3r2c73857vfg`, Auto-Deploy de 59,9 s. Não foi necessário desencadear outro deploy; `b5791d7` só altera testes/documentação. Cloudflare continua na versão `62974619`, com segredo encriptado, logs ativos e sem Cron Triggers. Estas consultas não executaram sync.

Risco encontrado: timeout 90 s pode ser consumido por arranque Render Free (aviso da interface: 50 s ou mais) e importação. As durações de 33–42 s vistas na CLI GitHub não medem o percurso Render; somá-las ao arranque é uma avaliação de risco, não uma falha real reproduzida. Preparado ajuste local de espera para 180 s, sem repetir POST, aumentar frequência, alterar autenticação, contratos ou reservas. Não garante tempo máximo ponta a ponta: HTTPX aplica timeout por operação e alojamento/fonte podem continuar indisponíveis. Testes simulados do Worker: 27 passaram; diff sem erros. Publicação Worker e cron continuam pendentes de autorização explícita própria, conforme sequência acordada. Nenhum commit/push/publicação/configuração foi feito neste passo; A01 permanece aberto até importação natural e cadência comprovadas.

## Corrigir expectativas dos testes de navegador após A01.1 (26/10/2026, rascunho)

O utilizador aprovou a correção e autorizou commit e push deste lote. O envio pode acionar as integrações automáticas existentes; resultado da nova CI e deploy devem ser confirmados separadamente. Não autoriza ativação do cron Cloudflare. Roadmap, auditoria geral e documentos de partilha permanecem locais.

A execução CI `40356048948` do commit `92416eb` passou API, PostgreSQL, Worker, testes unitários web e build, mas falhou em três casos de navegador. Histórico ainda esperava dois separadores, apesar da navegação aprovada já incluir Artemis; Descobertas media 1935 px contra um teto antigo de 1900 px. Correção local apenas nos testes: verificar nomes/ligações/estado ativo da navegação atual e medir o percurso compacto por ecrãs (hook/laboratório no primeiro, Artemis até ao segundo, biblioteca até ao terceiro), após as fontes carregarem. Não se aumentou simplesmente o teto global nem se alterou a interface para satisfazer o teste.

Dificuldade de validação: primeira execução reutilizou o servidor de fixtures da preview e apresentou uma indisponibilidade transitória no Histórico, passando na repetição; causa dessa indisponibilidade não confirmada. Para isolar a verificação final, arrancaram-se servidores próprios em portas 3340/3341, sem alterar a preview aberta, e desativaram-se repetições. Resultado: 28 testes passaram e dois casos exclusivos de desktop foram ignorados em mobile, conforme configuração preexistente; nenhum falhou ou precisou de retry. Lint e diff sem erros. Sem consultas LL2, sincronizações, alterações de produção, commit ou push.

## A01.1 — separar idade do fallback e orçamento global (26/10/2026, rascunho)

Após revisão da prontidão e do risco de timeout no Render Free, o utilizador autorizou commit e push deste lote. O envio pode acionar as integrações automáticas existentes; não autoriza ativar o cron Cloudflare. CI, deploy e importação natural precisam de confirmação própria. Documentos locais de partilha, FEATURES_ROADMAP e auditoria geral ficam fora deste lote; o diagnóstico A01 acompanha a revisão.

Implementação local autorizada: a CLI GitHub só fica elegível com dados de pelo menos 90 minutos, mas reserva o mesmo intervalo de 45 minutos da API. Nova variável opcional SYNC_FALLBACK_MIN_AGE_SECONDS herda o intervalo anterior quando omitida. Locks PostgreSQL, reserva durável antes da rede, Retry-After e prazos antigos preservados; skips não renovam a reserva. Workflow conserva cron/serialização; Worker de execução inalterado após verificar contrato e timeout de 90 s. Sem migração, consultas reais, commit, push, deploy ou alterações Cloudflare/Render.

Dificuldade: PostgreSQL temporário criado inicialmente em SQL_ASCII devolveu bytes na identificação do servidor, causando cinco erros de preparação. Recriação apenas da base descartável em UTF-8 resolveu o ambiente, sem alterar a aplicação/dependências. Verificação final: 67 testes API, 12 PostgreSQL isolado e 27 Worker; Ruff e diff sem erros. Aviso Starlette/httpx preexistente. Os testes exercitam concorrência entre sessões, limiares exatos, skip sem escrita, compatibilidade e Retry-After. Não comprovam cadência nem orçamento de cold start em produção. Configuração, aceitação e rollback: `A01_1_SYNC_REVIEW.md`. A01 não está encerrado e ativação depende de aprovação.

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

### Novo rascunho — gesto de zoom iOS e repetição do excerto

Após publicação, utilizador mostrou espaço à direita durante pinch/zoom-out em Safari/iPhone e relatou que a captura do booster ficava preta após o primeiro ciclo. O teste de largura documental não reproduz todo o comportamento do visual viewport/ressalto elástico do Safari. Reforçado `overflow-x: clip` também no body, com largura de 100% e min-width zero, mantendo o eixo vertical, os scrollers internos e a possibilidade de zoom (sem maximum-scale nem user-scalable=no). Esta mitigação necessita confirmação no dispositivo físico; não se apresenta emulação Chromium como prova do gesto nativo Safari.

No leitor, o código anterior usava `end` e `loadVideoById` ao terminar: isso iniciava novo carregamento/reprodução a cada ciclo. Substituído por `getCurrentTime` e `seekTo` no mesmo vídeo antes do fim do excerto, com intervalo de 100 ms, fallback de estado ended, reposicionamento ao regressar à viewport e ao carregar em reproduzir. Mantidas pausa fora de vista/aba oculta, movimento reduzido, áudio desligado e 2× quando disponível. O navegador pode continuar a bloquear autoplay; o botão continua utilizável para retomar, sem prometer contornar restrições do iOS. Teste com leitor simulado verifica três ciclos, pausa fora da viewport, retoma, ended, autoplay bloqueado e limpeza dos temporizadores. Fonte técnica: https://developers.google.com/youtube/iframe_api_reference.

Reposta altura mínima de 200 px recomendada para embeds YouTube, mantendo a largura explícita de 100% que impede o crescimento lateral por aspect-ratio. Build, 97 testes unitários e lint do componente/teste passaram. Rascunho local, sem commit/push; reprodução real no iPhone ainda por confirmar.

### Ilustrações tecnológicas com maior detalhe — rascunho local

Utilizador aprovou as correções anteriores e pediu commit: guardadas em `6078c07`, sem push. Novo pedido: aprofundar as animações de motores, materiais e reabastecimento, mantendo a direção intuitiva para não especialistas.

Enriquecidos os SVG existentes, sem imagens pesadas, dependências ou novos pedidos externos. Motor: linhas de alimentação, indicadores nos depósitos, elementos rotativos simbólicos, injetor/câmara, bocal em corte, brilho de combustão, saída dos gases e seta de impulso oposta. Compósito: trama de fibras em camadas, pontos de sensores com pulsação, traço de aquecimento e desaparecimento progressivo da fissura ilustrativa. Reabastecimento: paredes duplas esquemáticas, marcas de nível, ligações, válvula e indicadores, partículas de fluxo e transição mais lenta dos níveis. Acrescentada uma legenda de três etapas em PT/EN/ES. São esquemas conceptuais — não diagramas de engenharia do Raptor/BE-4, simulações físicas ou prova de reparação operacional.

Movimento só no estado ativado, com botão para repor; preferência de movimento reduzido desativa animações/transições e apresenta o resultado estático. Mantida leitura por teclado e descrição textual. Atualizado o leitor simulado E2E ao contrato seekTo/getCurrentTime introduzido no commit anterior, para testar repetição sem recarregar. Build, 97 testes unitários e lint verificados; alterações visuais permanecem para aprovação local, sem commit/push.

Suite E2E completa: 24 cenários passaram, dois exclusivos desktop omitidos no projeto mobile. Inclui três tecnologias, teclado, temas, idiomas, movimento reduzido, repetição do vídeo e limites laterais. `git diff --check` sem erros.

### Revisão visual — de diagramas planos a cortes ilustrados com volume

Utilizador não aprovou a versão anterior das animações: continuava demasiado simples/plana. Pediu uma direção mais 3D, mas compreensível. Rascunho reformulado em SVG com perspetiva, superfícies sombreadas, reflexos e cortes visíveis — não WebGL, modelos rodáveis ou uma simulação física. A escolha reutiliza o sistema vetorial existente, evita bibliotecas/ficheiros 3D pesados e mantém texto/teclado/acessibilidade e desempenho mobile.

Motor com depósitos cilíndricos, tubagem curva, bombas, câmara, bocal metálico e secção interior; compósito em vista isométrica com três camadas que se separam para revelar o aquecimento; depósitos cilíndricos com corte semitransparente, superfície elíptica do líquido e ligação com válvula. Mantidas as legendas de três passos e preferência de movimento reduzido. Geometria conceptual, não reprodução de hardware real. Separado desenho em `technology-art.tsx` para não misturar geometria com controlos e traduções. Sem commit/push desta reformulação, para nova revisão.

Verificação da reformulação: build, 97 testes unitários, oito testes E2E de Descobertas/limites mobile e lint dos dois componentes passaram; `git diff --check` sem erros.

### Referências reais no laboratório — Raptor e duas Starships

Utilizador pediu que o motor se baseasse num Raptor real e a transferência mostrasse duas Starships em órbita. Pesquisa oficial SpaceX/NASA registada em DISCOVERIES_REDESIGN: Raptor a metano/oxigénio, arquitetura planeada cisterna → depósito → HLS e diferença entre transferência já demonstrada dentro de uma nave e transferência entre naves ainda por demonstrar nas referências consultadas.

Motor redesenhado com admissão, turbomáquinas e tubagem compacta inspiradas na família Raptor; retirados os grandes depósitos do desenho anterior. Não é uma réplica, modelo CAD ou esquema completo do ciclo. Cena orbital com duas Starships, Terra ao fundo e depósitos/circuitos distintos para metano e oxigénio. Fluxos e níveis simbólicos; orientação/posição da ligação não são anunciadas como hardware final. Texto visível e secção de limites explicam a distinção, traduzidos PT/EN/ES. Fontes oficiais associadas atualizadas; teste editorial evita confundir plano com demonstração. Build, 98 testes unitários e lint passaram. Continuação de rascunho local sem commit/push.

Primeira execução E2E identificou dois ajustes: a legenda adicional aumentou a altura desktop para 1908 px, acima do limite de compacidade de 1900, e o teste de movimento reduzido esperava um único circuito quando agora existem dois. Compactados os três passos no desktop (número junto ao texto, preservando disposição mobile) e verificada ausência de animação em ambos os circuitos, sem enfraquecer a asserção de largura/altura.

Validação final: build e oito testes E2E de Descobertas/limites mobile passaram, além dos 98 testes unitários e lint. Rascunho continua sem commit/push.

### Controlo junto à ilustração e fotografia real de Artemis

Pedido do utilizador: colocar reproduzir/repor imediatamente sob o desenho, retirar os três cartões de passos e substituir o elemento decorativo do destaque Artemis por fotografia real. Movido o mesmo botão acessível (aria-pressed/aria-controls, teclado e tamanho tátil) para a figure, antes da legenda; removidos cartões/traduções/CSS de passos redundantes. Explicação e estado textual permanecem ao lado/abaixo conforme o ecrã.

Escolhida fotografia oficial NASA/JSC `art001e000673`, Artemis I, 28/11/2022: Orion em primeiro plano com Terra e Lua ao fundo. Fonte: https://www.nasa.gov/image-detail/amf-art001e000673/ ; orientações de utilização: https://www.nasa.gov/nasa-brand-center/images-and-media/ . Enquadramento integral com contain, data/crédito e ligação à origem — imagem histórica identificada, não ilustração de uma missão futura. Novo componente traduzido PT/EN/ES usa imagem lazy com dimensões reservadas, foguete de carregamento e fallback com ligação à NASA em erro. Evita texto sobre a fotografia, recortes que percam a Terra/Lua e alteração pública sem aprovação. Build, 98 testes unitários e lint passaram; rascunho sem commit/push.

Oito testes E2E passaram após pequeno ajuste de espaçamento no cartão para manter a compacidade desktop. Verificado carregamento real da fotografia NASA (naturalWidth > 0), além de capturas desktop/mobile e posição do controlo abaixo do SVG. Testes isolados bloqueiam fontes externas e mantêm crédito/estrutura sem depender da NASA. Sem commit/push.

### Reformulação funcional: ciclo Raptor 3 e acoplagem antes da transferência

Utilizador aprovou organização/fotografia, mas rejeitou novamente a animação genérica do motor e pediu funcionamento real do Raptor 3 e aproximação/acoplagem entre Starships. Pesquisa adicional oficial SpaceX sobre Starship V3 (quatro pontos dorsais, sondas e DragonEye) e NASA sobre o ciclo full-flow registada em DISCOVERIES_REDESIGN. Limite essencial: não existe aqui CAD/diagrama completo validado do motor nem configuração final de cada interface. Não inventar precisão a partir do aspeto 3D.

Trocado o simples estado ligado/desligado por explicações em quatro fases. Raptor 3: alimentação/bombas, pré-queimadores/turbinas, câmara principal, bocal e impulso. Texto identifica gás rico em metano e gás rico em oxigénio e diferencia percurso didático de sequência de ignição. Starships: encontro relativo, alinhamento das faces dorsais, quatro capturas mecânicas e preparação de interfaces, transferência por circuitos separados. Antes da última fase não há alteração dos níveis nem fluxo entre naves. Escudos térmicos para fora; posição, tempo e proporção da ligação continuam esquemáticos.

Controlos sob o desenho: reproduzir/pausar, etapa seguinte e repor; indicador compacto 00–04 e explicação de cada fase, sem cartões numerados. Passo automático a cada cinco segundos em tempo didático (não duração real), não avança com aba oculta, e é cancelado ao pausar/trocar tema/desmontar. Movimento reduzido permite apenas passos manuais e elimina animações. Materiais mantém controlo simples. Testes unitários cobrem pausa, temporizador, reposição, troca de tecnologia e proibição de fluxo antes da ligação; 100 testes, build e lint passaram. Rascunho sem commit/push.

Suite completa: 24 E2E passaram, dois cenários exclusivos desktop omitidos em mobile. Ajuste final acrescentou deslocamento também na primeira fase de encontro (não apenas no alinhamento) e retirou botão «seguinte» duplicado no modo de movimento reduzido. Build e regressões unitárias/E2E específicas de fases voltaram a passar. Sem commit/push.

Revisão visual identificou contraste insuficiente no hover do novo botão de avanço por herdar estilo global; aplicada regra específica e teste de cor/fundo. Separadas cores dos fluidos na admissão e afastada a legenda dos pré-queimadores da identificação do metano. Evidência visual de câmara/impulso, captura sem fluxo e transferência após ligação, em desktop/mobile.

Utilizador autorizou o push do conjunto revisto: explicações Raptor 3/Starship por fases, controlos sob as ilustrações, remoção dos cartões de passos e fotografia real Artemis I. Inclui também o commit local anterior `6078c07` (canvas mobile e repetição do vídeo). Documentação/testes acompanham o código; FEATURES_ROADMAP e documentos locais de partilha continuam excluídos. A autorização de push não constitui confirmação do resultado de CI ou deploy.

### Fundos fotográficos contextuais — rascunho de 26/10/2026

Pedido: remover a frase «Escolhe uma tecnologia e experimenta a ilustração. Sem precisares de ser engenheiro.» e cobrir o fundo das páginas com imagens relacionadas, sem comprometer o conteúdo. Frase retirada da interface em todos os idiomas; informação explicativa das tecnologias preservada.

Fundos selecionados: lançamento Artemis I/SLS (NASA/Joel Kowsky) para home/calendário e detalhe de lançamento; laboratório orbital ISS/painéis solares/Terra (NASA) para Descobertas; Orion/Terra/Lua da Artemis I (NASA/JSC) para o guia Artemis. Fontes e títulos históricos ficam em `page-backgrounds.ts`, com crédito discreto no rodapé e ligação oficial. São contexto editorial, não a fotografia de cada missão listada. Imagens oficiais obtidas e convertidas mecanicamente em WebP local: 55 946, 56 256 e 61 776 bytes, respetivamente. Só a secção ativa monta uma imagem, sem carregar os três fundos em simultâneo nem depender da NASA a cada visita.

Implementação: camada decorativa fixa com pointer-events none/aria-hidden e recorte ao viewport, atrás do conteúdo num stacking context isolado. Sem background-attachment fixed, parallax, transições ou dimensões que aumentem o documento. Falha da imagem mantém o fundo sólido. Máscara clara/escura protege texto; cartões mantêm superfícies opacas. Texto secundário claro escurecido e ligações soltas relevantes recebem tom mais escuro para compensar fotografias. Teste conservador calcula contraste do texto do rodapé sobre extremos preto/branco da imagem à menor opacidade da máscara, alvo 4,5:1; não equivale a auditoria completa WCAG. Ligação de fonte de código testada pelo href, não pela posição de último link (agora há crédito adicional).

Build, 102 testes unitários e lint passaram. Rascunho local para aprovação, sem commit/push e sem alteração da publicação atual.

Suite E2E completa: 26 cenários passaram e dois exclusivos desktop omitidos no mobile, incluindo correspondência rota/imagem, carregamento local, máscara/contraste em ambos os temas, largura mobile e comportamento do cabeçalho sticky. `git diff --check` sem erros.

Revisão visual com imagens reais carregadas: home, Descobertas e guia Artemis em desktop; Artemis em modo escuro após terminar a transição de cor; Descobertas em mobile. Cartões e tipografia mantêm-se à frente, fundo visível nas áreas livres. Proposta inicial discreta para aprovação; intensidade pode ser afinada sem mudar as imagens nem introduzir movimento. Sem commit/push.

### Ajuste de intensidade dos fundos após feedback

Utilizador gostou da direção, mas considerou as fotografias demasiado esbatidas. Reduzida a máscara central de 86–87% para 78%, e das extremidades de 94% para 86%, em ambos os temas. As imagens ganham presença sem alterar os cartões opacos, ficheiros ou comportamento de scroll. Para manter leitura nas zonas transparentes do tema claro, texto secundário e ligações relevantes escurecidos ligeiramente. Testes de contraste continuam a usar os extremos preto/branco da imagem na zona menos protegida, sem afirmar auditoria integral WCAG. Rascunho continua sem commit/push.

Build, quatro E2E de fundos/limites mobile e `git diff --check` passaram após este ajuste. Capturas de Descobertas e Artemis confirmam a nova intensidade; preview local reaberta para aprovação.

Novo ajuste fino pedido pelo utilizador: máscara central de 78% para 75% e extremidades de 86% para 83%. Apenas três pontos percentuais adicionais de imagem, sem alterar cores de texto, cartões, ficheiros ou scroll. Mantido como rascunho local sem commit/push.

O extremo branco no teste conservador de contraste do modo escuro ficou em 4,48:1 com máscara de 75%; afinado apenas o centro escuro para 76%, mantendo 75% no claro e 83% nas extremidades. Assim aumenta a presença sem reduzir o alvo de contraste nem alterar a tipografia.

Build e dois testes E2E de fundos/contraste (desktop e mobile) passaram; preview local atualizada. Sem commit/push.

Utilizador aprovou a intensidade final e autorizou commit dos fundos contextuais e remoção da frase. Commit local autorizado; push não autorizado neste pedido. Nova alteração de navegação Artemis será preparada separadamente.

### Artemis como separador principal — rascunho

Fundos aprovados guardados em `d813258`, sem push. Pedido adicional: Artemis ao lado de Descobertas na navegação, preservando o destaque/«glance» e o conteúdo atual de Descobertas. Retirada a apresentação subordinada «↳ Artemis» e adicionada ligação de primeiro nível em todas as páginas. Só o separador correspondente à rota fica ativo, com aria-current page. URL do guia continua `/discoveries/artemis`, evitando quebrar ligações existentes; o destaque e o regresso a Descobertas mantêm-se.

Em mobile, três separadores partilham a linha; ajuste pontual até 360 px mantém texto e alvos táteis sem transbordo. Navegação tem nome acessível próprio PT/EN/ES. Testes de teclado atualizados para a nova ordem (Artemis antes dos controlos de tema/idioma). Alteração de navegação ainda sem commit/push, para aprovação visual.

Verificação: build, lint, 12 testes E2E de Descobertas, cabeçalho e larguras 320/390/430 passaram; `git diff --check` sem erros. Conteúdo/destaque de Descobertas preservados.

Utilizador aprovou o envio da navegação Artemis ao lado de Descobertas e do commit local dos fundos `d813258`. Commit/push autorizados; documentação e testes acompanham as alterações. Documentos locais de partilha e FEATURES_ROADMAP permanecem excluídos. Resultado de CI/deploy requer verificação própria e não é inferido do push.

### Notas secundárias compactas e autoria separada — rascunho

Pedido: reduzir linhas de créditos e colocar os detalhes do excerto num «ⓘ», aplicando o padrão a notas semelhantes. Componente comum usa popover nativo em primeiro plano, evitando que cartões cortem o painel. Abre por cursor, foco ou toque; Escape e toque fora permitem fechar. Texto do excerto, limites das ilustrações, referência das fotografias e nota editorial ficam disponíveis sem ocupar permanentemente espaço. Autor/licença das imagens continuam visíveis. Créditos repetidos da mesma imagem na home são consolidados; avisos de erro, atualização e estados das missões continuam visíveis.

O crédito do fundo fica numa linha própria do rodapé, separado das ligações ao autor e código-fonte. Dificuldade encontrada: eventos de rato sintetizados pelo toque fechavam o painel prematuramente; abertura por hover agora limitada ao ponteiro de rato. Verificação: 102 testes unitários, build e lint passaram; dois testes de navegador confirmaram desktop/mobile, abertura por foco/toque/cursor, Escape, limites horizontais e separação de créditos. Rascunho local, sem commit/push.

Utilizador aprovou a preview e autorizou commit e push. Revisão visual detetou ainda conflito com a cor global dos botões ao passar o cursor; estilo do «ⓘ» isolado para preservar contraste e alvo tátil de 44 px. Build final e verificação do diff passaram. Documentos locais de partilha e FEATURES_ROADMAP excluídos do envio. Sucesso do push não confirma, por si só, CI ou publicação.


### Ajustes após a CI do Explore Space

A CI de `2b3cf07` apontou três E2E: o botão Play estava afastado da ilustração pela legenda; missões `To Be Confirmed` recebiam countdown apesar da data provisória; e o teste de cartões esperava um único countdown entre resultados legítimos. O botão Play foi colocado imediatamente após o desenho e a legenda acessível passou para baixo dos controlos. Countdown agora é omitido para estado TBC, mantendo a data e o aviso provisório; o teste de regressão cobre essa regra. Os dois erros de contagem decorriam do countdown TBC indevido.

Validação local: 3 ficheiros unitários, 7 testes direcionados e `git diff --check` passaram. Os E2E não puderam arrancar nesta sessão: o ambiente bloqueou portas loopback e, na cópia isolada, a resolução local do Next.js/dependências ficou fora da raiz reconhecida. Lint/build também excederam o limite local disponível. Correção permanece sem commit/push; requer validação da CI antes de integração.

### A18 — correções após validação da CI (27/10/2026)

A primeira CI isolada detetou uma comparação de estado inalcançável no countdown após a guarda de estados incertos; removida essa redundância. A CI seguinte passou TypeScript, build e testes unitários, mas o E2E desktop/mobile assumia que o cabeçalho Artemis ainda tinha uma ligação direta para /discoveries. Com o novo hub há apenas o separador Explore Space; a rota antiga continua compatível e deve ser validada por navegação direta. O teste foi ajustado para abrir /discoveries e verificar o conteúdo, sem alterar a navegação do produto. Sem mudanças fora de A18.

### A18 — Fase 3: ligações contextuais a lançamentos

As páginas Descobertas e Artemis ligam agora a lançamentos futuros apenas através de campos específicos já devolvidos pela API: nomes exatos de veículos aprovados editorialmente e títulos exatos das missões Artemis I–VI. A mesma regra alimenta ligações de regresso educativo nos detalhes da missão; IDs de lançamento da API permanecem os destinos estáveis. Padrões genéricos de texto deixam de criar associações. Cartões usam nome, agência, veículo, data/precisão e estado reais da API, sem countdown próprio nem pedido à LL2. Há no máximo um cartão por tema, na ordem editorial, com missões deduplicadas.

Carregamento tem estado acessível; falha de leitura é indicada sem fingir ausência de correspondências. Sem relação confirmada, não é apresentada a secção Related Launches. Limitação: apenas o conjunto de até 100 lançamentos futuros já disponível na cache pode ser associado; missões históricas e veículos sem nome exato aprovado ficam de fora. Não foi alterado o contrato da API nem a lógica de calendário.

## A18 — Capítulo 01: Como voa um foguetão (rascunho)

Criado um capítulo introdutório em PT/EN/ES sobre impulso, forças, vácuo e órbita, com diagrama interativo acessível, alternativa textual, miniquestionário e fontes NASA. O cartão How Rockets Work passa a abrir o capítulo, que mantém uma ligação ao laboratório de tecnologia existente. Sem associações especulativas a missões. Rascunho isolado sem publicação.

Ajuste posterior: cabeçalho do capítulo usa toda a largura disponível e o exemplo de impulso fica ao lado do texto em desktop; em mobile permanece em coluna.

## A18 — Space Programs, Fase 1 (rascunho)

Criada uma landing com apresentação dos seis programas e destaque para o guia Artemis existente. Os restantes cartões são informativos e não simulam guias. Fotografias locais foram redimensionadas e convertidas para WebP; créditos e condições estão em `SPACE_PROGRAMS_IMAGE_CREDITS.md`. O cartão Explore Space passa a abrir a nova página; a rota antiga Artemis mantém-se. Sem alterações ao calendário ou à sincronização.

## A18 — Space Programs, Fase 2: guia Artemis (rascunho)

Reorganizado o guia sem eliminar os quatro sistemas, marcos, esquema funcional, desafios, FAQ ou associações reais de lançamentos. Adicionados hero com imagem NASA existente, explicação introdutória, cronologia, conclusão e ligações a conteúdos relacionados; desafios e FAQ ficam em aprofundamento opcional. NASA confirma Artemis III como demonstração em órbita terrestre baixa prevista para 2027 e Artemis IV como objetivo de alunagem no início de 2028; ESA confirma o regresso da Artemis II e funções do módulo europeu. Fontes: https://www.nasa.gov/artemis-iii-news-and-updates/ e https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Artemis_II_splashdown . Revisão editorial: 28/10/2026. Sem publicação.

Correção de CI: o teste de navegação mobile ainda procurava o antigo texto “Explore Artemis” no hub. Foi atualizado para verificar o novo acesso a Space Programs e a ligação existente ao guia Artemis, mantendo o percurso dos marcos espaciais.

## Launches — contador e favoritos (rascunho)

O contador mantém datas utilizáveis por confirmar, apresenta um aviso acessível com a precisão e limita as unidades à precisão conhecida. Datas amplas são estimativas em dias, sem hora inventada. O painel featured já não inclui favorito; a lista e os detalhes mantêm-no. Prévia com dados fictícios, sem alterações aos serviços.

Ajuste de revisão: todos os cartões mostram o contador completo, incluindo segundos quando a precisão os permite, sem formato de tempo aproximado; mantêm-se os limites de precisão e o aviso acessível.

Revisão do contador: o relógio mostra segundos até ao NET de referência para todas as precisões; quando a fonte não confirma segundos, o título e o aviso explicitam que o instante não é um lançamento confirmado.

## Resumo de lançamento e calendário — rascunho
Removido favorito apenas do resumo selecionado à esquerda. Exportação admite NET utilizável em missões por confirmar, preservando evento provisório e aviso de cópia sem atualização; precisões amplas exportam dia inteiro de referência.

## Correção de validação do calendário
O teste de MissionCalendar ainda exigia bloquear TBC e não foi incluído na validação direcionada anterior. Atualizado para verificar links, aviso e ICS provisório de dia inteiro; mantida cobertura negativa para data inválida e missão concluída. Adicionado `npm run check:push`, com todas as etapas web do CI, e requisito de execução antes de pushes web no AGENTS.md.

Isolada também a origem da API fictícia dos testes de navegador (3302) da prévia local (3301), para evitar reutilização de dados de precisão em cache durante testes do histórico. A prévia da interface mantém-se em 3345.

Validação final desta correção: 145 testes unitários/componentes, build, 50 percursos de navegador e 6 percursos Starship passaram. As 8 exclusões condicionais existentes mantêm-se (cenários com falha global da API e verificações exclusivas de desktop). Nenhum teste foi desativado nesta correção.

## Simplificação da data e contador — rascunho
A lista, o resumo e a data principal da missão mostram a data de referência disponível em vez do rótulo genérico de precisão ampla, sem acrescentar hora. O contador apresenta apenas números e unidades, conforme revisão do utilizador. Informação detalhada de precisão e exportação permanece nos respetivos locais.

## Space Programs — Ariane 6 (rascunho, 28/10/2026)
Criado guia PT/EN/ES com fotografia ESA existente, arquitetura A62/A64, perfil visual e textual, quatro marcos selecionados e ligações aos guias aprovados. Reutiliza classes e padrões Artemis/Starship/Commercial Crew. O primeiro voo inclui a limitação da demonstração final; o primeiro voo comercial e o primeiro Ariane 64 são acontecimentos realizados. Related Launches lê apenas a API em cache existente, filtra o veículo Ariane 6/62/64, deduplica IDs e trata dados parciais, vazios e indisponíveis. Sem alterações a Launches ou serviços.
Fontes: ESA (primeiro voo e relatório de 16/09/2024; voo comercial de 06/03/2025), ArianeGroup (arquitetura) e Arianespace (VA267, 12/02/2026), ligadas no guia. Nenhum calendário futuro fixo introduzido. Fotografia e licença em SPACE_PROGRAMS_IMAGE_CREDITS.md.

Validação do rascunho: sete testes direcionados (associação, deduplicação, dados vazios/parciais/indisponíveis, traduções e landing), build e dois percursos de navegador passaram. Percursos cobrem PT/EN/ES × light/dark em 1440px e 390px, imagem local carregada, navegação e ausência de overflow. Prévia em http://127.0.0.1:3345/explore-space/programs/ariane-6 com dados fictícios locais; API real não foi alterada.

## Launches — Mission Control (rascunho, 28/10/2026)
Reutilizados VehicleVisual, Countdown, LocalLaunchDate, InfoDisclosure, SearchForm, filtros e seleção existentes. A coluna esquerda passa a Spotlight, atividade e filtros; o resumo aparece após seleção, mantendo o comportamento dos cartões da lista. O Spotlight escolhe a primeira NET futura elegível e atualiza a leitura existente uma vez após a passagem dessa NET. Um modo opcional de precisão limita SEC/MIN/HR e suprime contador para períodos amplos apenas no Spotlight; o comportamento aprovado da lista e Mission Details mantém-se.
As métricas contam resultados e agências carregados, com âmbito explícito; não são totais globais ou anuais. A API atual oferece pesquisa, período próximos/histórico, agência, veículo e estado. Não existe filtro por local nem suporte para totais anuais completos; a interface explica o local nos detalhes. Não foram adicionados pedidos LL2, serviços, migrações ou alterações a Explore Space.
Layout local limitado a Launches, 1440/768/390px, claro/escuro e PT/EN/ES. As fotografias chegam dos dados existentes e mantêm crédito, licença e fallback; a prévia de revisão usa fotografia NASA/Joel Kowsky de Artemis I (2022) e uma data futura explicitamente fictícia. Fonte da fotografia já existente: https://www.nasa.gov/image-article/two-years-ago-artemis-i-liftoff/ .
Diferenças intencionais face ao mockup: duas métricas de âmbito limitado, período próximos/histórico e aviso de indisponibilidade do filtro por local; sem menus, pesquisa duplicada ou ordenação não suportada. Mantém o lettering e as funcionalidades de favoritos e seleção. Testes de navegação atualizados para a nova posição dos filtros, preservando verificações de query, scroll, favoritos e detalhes.

Validação do rascunho: 155 testes unitários/componentes, build e ESLint nos componentes alterados passaram; 14 percursos existentes relevantes passaram (duas exclusões mobile já existentes para scroll desktop). A matriz visual nova passou em ambos os contextos de navegador, cobrindo 1440/768/390px × PT/EN/ES × claro/escuro, sem overflow, com créditos acessíveis e sem favorito no Spotlight. Capturas em /private/tmp/nrl-mission-control-previews; prévia em http://127.0.0.1:3345/.

Ajuste de revisão: removido o resumo selecionado da página principal. Os links da lista abrem diretamente a missão em todos os tamanhos. Acrescentado botão circular de play com nome acessível por missão. Abre diálogo nativo (Escape, foco e botão fechar), carrega detalhes uma vez por cartão apenas a pedido e reutiliza MissionStreams para links, avisos e estado sem transmissão. Não há autoplay, iframe ou estado live presumido. Favoritos mantêm a lógica existente.

Validação do ajuste sem preview: 155 testes, build e lint passaram. Seis percursos específicos de navegação/play passaram em desktop/mobile; verificam carregamento apenas a pedido, reutilização da leitura ao reabrir, Escape/foco, dados sem transmissão e recuperação de erro. A matriz de idiomas/temas/tamanhos do layout também passou.

Revisão visual: botão de play da lista passa a laranja, com estados hover/foco e variantes claro/escuro, seguindo o acento de reprodução existente.

Validação final antes do push: corrigida uma condição de corrida no teste de Discoveries, que lia a estrutura antes da resolução de Suspense. A verificação passa a aguardar o título dos lançamentos relacionados, mantendo a comparação exata da estrutura. Não altera código ou conteúdo de Explore Space.

Validação final para envio: 155 testes unitários/componentes, build, 58 percursos de navegador e 6 percursos Starship passaram. Mantidas as 8 exclusões condicionais existentes. O play laranja e a navegação direta, sem resumo lateral, fazem parte do desenho aprovado.

### 2026-10-29 — Launch list quick actions (local draft)
- Branch `codex/launch-quick-actions`: compact icon row in order Play, favorite, calendar, share; 44px targets, translated labels, focus and filled saved star. Existing Spotlight, countdown, filters and backend unchanged.
- Reuses FavoriteButton persistence, LaunchWatchButton/MissionStreams, MissionCalendar precision-aware exports and MissionShare native/clipboard/manual fallbacks. Clicks stay separate from the mission link.
- Broadcast availability is absent from the list payload: only visible cards read the existing cached mission endpoint once per mount, with cancellation/timeout. Play stays hidden unless a safe HTTPS stream is confirmed; no new endpoint or polling. Calendar can use list timing while detail data is unavailable, retaining broad-precision all-day reference notices.
- Preview uses fictional local fixtures on port 3345. Review alternatives: keep the subtle orange Play accent (draft), or use the same neutral accent for every icon. No commit/push/deployment authorized.
- Validation: 155 component/unit tests passed; production build and targeted lint passed. Browser validation covers individual actions, no detail navigation on actions, missing/unsafe streams, keyboard focus, 1440/390/320, PT/EN/ES and light/dark; final results recorded after completion.
- Final browser regression run: 12 passed across desktop/mobile; production build, 155 unit/component tests and targeted ESLint passed. Visual captures saved at `/private/tmp/nrl-quick-previews/` (PT, 1440/390/320, light/dark); all locale/theme combinations checked. Initial browser failures were corrected test locators and an expired local response cache; no tests were disabled or weakened.
- Follow-up draft: replaced the wide favorites privacy disclosure with the existing accessible information icon; the translated explanation remains available by hover, focus and touch. No favorites behavior changed.
- Follow-up draft: compact “About this data” now shows only ⓘ with a translated accessible name; native disclosure, timestamps, freshness warnings and retry behavior remain unchanged.
- Data information icon now reuses InfoDisclosure exactly like the other ⓘ controls: hover/focus/touch activation, outside click and Escape dismissal, positioned panel and focus restoration. Freshness browser checks now target that shared component.
- Shared-icon validation: production build and 2 component checks passed; 8 focused browser checks passed (PT/EN/ES, desktop/mobile) after clearing only expired generated local fetch-cache. No test assertions disabled.
- Broader regression limitation: desktop list scroll-boundary test still fails in isolation (208px from bottom after wheel); development/detail check passes. This remains pending, without changing scroll behavior or weakening its test in this icon-only adjustment.
- Local spacing draft: placed the existing data ⓘ beside the Launches heading and removed its separate row/margins. Preserves shared disclosure, status/retry messages and mobile wrapping.
- Local placement draft: moved favorites privacy ⓘ beside the “My favorites” view link, outside the link itself, removing the isolated footer icon. Reuses the same disclosure and translations without changing storage or navigation.
- New local size draft: all shared ⓘ controls use a consistent 22px glyph/28px visual hover circle, retaining the 44×44px interactive target and visible keyboard focus. Warning triangles keep their established styling. Placement changes committed separately as `6dad404`; size changes pending visual approval.
- Pre-push fix: reserved the quick-action row width before async broadcast discovery. Adding Play previously could wrap the action area and increase card heights during scrolling; the existing desktop scroll-boundary test now passes unchanged. Added a delayed-response regression proving card height stays stable (desktop/mobile). This resolves the earlier recorded scroll limitation.
- Scroll-position investigation: the compact navigation can sit beneath the sticky header at the fixed test offset. Browser focus reveals the clicked control by 7px before navigation; the regression records the focused starting position and keeps exact position assertions after navigation. Selectors target the visible main, excluding hidden Next.js transition copies.
- Final pre-push validation: all 155 unit/component tests, production build and targeted ESLint passed. Full browser suite: 62 passed, 8 existing conditional skips; isolated Starship suite: 6 passed. Exact scroll checks and the delayed-broadcast layout regression pass; no remaining scroll-test limitation in this run.

### 2026-10-29 — Compact calendar heading and spotlight seconds (local draft)
- Reduced heading/view-control margins to remove the redundant blank band.
- Spotlight now ticks reference seconds for SEC/MIN/HR NET, as requested; the existing uncertainty icon and source precision remain available. Broad day/month/unknown precision still avoids an artificial exact countdown; invalid, held, in-flight and elapsed handling unchanged.
- Added minute/hour ticking regression with broad-precision guards. No commit/push authorized for this draft.
- Validation: 8 focused countdown/spotlight tests, production build and targeted lint passed; browser matrix passed at 1440/768/390 in PT/EN/ES and light/dark, with filter regression passing on desktop/mobile. Reference seconds use the same ceiling calculation as list counters to avoid a one-second mismatch. Preview remains on port 3345 with fictional data.
- Visual warning refinement: replaced the plain spotlight triangle with a yellow warning sign containing a contrasting dark exclamation mark. Shared disclosure interaction and translated accessible label remain unchanged.
- Approved commit/push validation: `npm run check:push` passed (157 component/unit tests, production build, 62 main browser tests with 8 existing conditional skips, and 6 isolated Starship tests). Warning-versus-info behavior also passed 2 desktop/mobile comparisons against the local minute-precision preview. Commit and main push explicitly authorized by the user.

### 2026-10-29 — Information panel layering (local draft)
- Shared information panels use the browser top layer (manual popover), escaping isolated/overflow-hidden hero cards and image stacking contexts. Existing pointer, focus, touch, outside-click and Escape behavior is preserved.
- Investigating the reported mobile photo-information interaction using real-photo fixtures; no list layout or launch behavior changes, and no commit/push authorization for this draft.
- Confirmed against real-photo fixtures with long credits: warning and photo-credit panels remain above all neighbouring images (nine hit-test points per panel), open by mobile touch, fit the viewport and close with Escape with focus restored. Desktop/mobile and light/dark passed. Six shared browser interaction checks, six focused component checks and production build passed; added a persistent top-layer assertion to the shared disclosure browser regression. Preview on port 3345 uses fictional missions with NASA reference photography.
- User approved commit/push. Final `npm run check:push` passed: 157 unit/component tests, production build, 62 main browser tests (8 existing conditional skips) and 6 isolated Starship tests. No tests disabled or weakened.

### 2026-10-29 — Filter disclosure motion (local draft)
- Removed absolute positioning from “Reset” inside the Launches filter panel; it now follows the expandable heading in normal flow and cannot overlap the trigger.
- Applied one smooth content-height transition to all native expandable sections across the site, including the separately styled live-stream disclosure. The browser interpolates intrinsic height; reduced-motion preference disables the animation.
- Added a desktop/mobile browser regression for reset placement, an in-progress intrinsic-height interpolation, the shared transition timing and reduced-motion behavior. Production build, targeted lint, whitespace validation and both browser project runs passed; previews captured at 1440px and 390px. No behavior or tests outside the disclosure UX were changed.

- Follow-up review: intrinsic-size interpolation now also applies to stream disclosures; verified intermediate heights during both opening and closing on desktop/mobile. Production build and both focused browser regressions passed. Draft remains uncommitted.

- Visual refinement: Reset now shares the period-navigation row inside the expanded filters, with wrapping at narrow widths, removing its isolated row.

- Pre-push regression: desktop wheel gestures could remain trapped at list boundaries with the compact panel geometry. Added a boundary-only handoff to document scrolling; native scrolling inside the list and mobile document scrolling remain intact. The existing exact boundary regression passes without assertion changes.

- Authorized main push validation: all 157 unit/component tests, production build, 64 browser tests (8 existing conditional skips), 6 isolated Starship checks and targeted lint passed. Existing scroll regression assertions remain unchanged.

### 2026-10-29 — Feedback Hub MVP (local draft)
- Added a shared floating feedback button and footer entry, native responsive modal, PT/EN/ES, keyboard/focus handling, independent optional contacts, length counter, server-confirmed success and retry deduplication. Existing launch/countdown/favorites/filter/Explore behavior unchanged.
- Added FastAPI anonymous intake, isolated feedback/rate-bucket models and Alembic revision `20261029_09`; same-origin bounded web proxy uses only the existing server API origin (optional separate local feedback origin). Intake requires explicit enablement, secret and controller/privacy-contact configuration.
- PostgreSQL atomic aggregate budgets (24/minute, 500/day) retain no client identifiers; honeypot, capped bodies, generic validation/storage errors, UUID retry keys and keyed payload digests. Retention command clears optional contacts/digests after 30 days and whole records after 180 days.
- No safe admin identity exists: all administrative API routes fail closed, and the web admin route returns an uncacheable 404 before streaming. A localized admin panel is prepared but unmounted; safe authentication and authorization must precede activation.
- Activation, privacy/controller review, retention scheduling, migration and admin prerequisites documented in `docs/FEEDBACK_HUB.md`. No production changes, commit or push authorized.
- Validation so far: 107 API tests, 157 existing web tests, 3 new proxy checks and 16 focused browser journeys passed; production build and focused lint passed. Alembic upgrade succeeded on a new isolated SQLite database; a real proxy-to-API retry created exactly one persistent row. PostgreSQL migration/concurrency validation remains pending because the local Docker daemon is unavailable.

- Final preview validation: desktop/mobile light/dark screenshots and two live browser submissions passed against local isolated storage. Intake form fields lock during a pending request. The additional API failure/configuration checks bring the focused feedback suite to 15 tests.

- Final API regression run: 109 tests passed; Ruff passed on app/tests/new migration. Web build and lint passed after final form changes; 4 feedback journeys re-passed. Existing web unit regression (157), new proxy tests (3), 16 relevant browser checks and 2 real local integration/preview checks passed during this draft.

- Approved placement refinement: moved the feedback entry beside the development badge (below it on mobile), with a message icon and text. Removed the floating button; footer access and the existing modal remain.
- Header placement validation: build/lint and 10 relevant browser checks passed (feedback, page bounds, responsive header/footer). Preview restarted on port 3345 with the current assets.

- User authorized commit and main push. Final `npm run check:push` passed: 160 web unit/component tests, production build, 68 main browser checks (8 existing conditional skips), and 6 isolated Starship checks. API regression previously passed 109 checks; Ruff passed app/tests/PostgreSQL tests/new migration. Added CI PostgreSQL migration, concurrent retry and atomic-budget regressions; updated the exact expected Alembic head to the new revision. Local PostgreSQL remains unavailable, so those checks await the CI service.


### 2026-10-29 — Private Feedback administration (local draft)
- Continued `codex/feedback-hub`; reused intake/storage, protected feedback endpoints and the prepared admin panel. Architecture review confirmed Vercel Next.js → Render FastAPI → shared PostgreSQL, with no reusable safe administrative identity.
- Added a single environment-configured administrator, interactive scrypt password hashing, hashed opaque sessions in Alembic revision `20261029_10`, 2-hour absolute/30-minute idle expiry, server-side logout/revocation and credential-rotation invalidation. No account-registration system or frontend administrative secret.
- Next.js `/admin/login` and `/admin/feedback` use a same-origin BFF, HttpOnly/Secure/Strict host cookie, server-only gateway authentication, exact Origin/Host validation and session-bound CSRF on mutations. Data routes and the page validate sessions on the server; no-store/noindex headers and no PII in initial page payloads.
- Admin panel supports server filters, newest-first pagination, global new-feedback count, full text and optional contacts, state changes, logout and expired-session feedback in PT/EN/ES/light/dark/mobile. Public feedback remains unchanged; its entry is hidden only within administration.
- Shared PostgreSQL login budgets count successes/failures without storing IPs or usernames. Administrative request bodies are capped; status audit events contain only record ID/status. Retention job also removes expired sessions.
- Activation and recovery documented in `docs/FEEDBACK_ADMIN.md`: all server-only settings, interactive first-password setup and staging migration/deployment sequence. No production migration, deploy, commit or push authorized/performed. Only the isolated local SQLite preview was migrated.
- Validation: 117 API tests, 165 web unit/component tests, production build, focused lint and six standard browser checks passed. Two real local desktop/mobile journeys passed login, filtering, status update, CSRF denial, logout/replay, session expiry, escaped message text and PT/EN/ES light/dark previews. Additional checks confirmed no contacts/session/gateway token in initial HTML and no temporary administrator secrets in client bundles.
- Added PostgreSQL persistence/revocation and concurrent login-budget tests; updated the exact expected Alembic head. These PostgreSQL checks remain unrun locally because the Docker/PostgreSQL daemon is unavailable. Review preview remains on port 3345 with fictional records and temporary credentials.

- User authorized commit and main push. Final `npm run check:push` passed: 165 web tests, production build, 70 main browser checks (8 existing conditional skips), and 6 isolated Starship journeys. Ruff passed app/tests/PostgreSQL tests/new migration. Existing 117 API tests and two real local administrative browser journeys passed. PostgreSQL-specific session tests await CI; no production credentials or configuration changes are included.
## Fiabilidade operacional do MVP — rascunho local (30/10/2026)

Branch isolada `codex/mvp-operational-safety`, baseada na main publicada `0b6d84d`. Acrescentadas verificações de produção após deploy e agendadas, desligadas até ativação explícita: páginas com conteúdo, API, leitura da cache e frescura, proteção administrativa e validação do feedback sem inserção. O monitor não faz login, não envia mensagens reais nem consulta LL2. Testes offline reproduzem configuração em falta, página vazia, admin exposto e cache atrasada; foram acrescentados ao CI sem remover checks existentes.

Retenção diária preparada em workflow próprio com opt-in separado para avaliação e aplicação, usando o segredo de base existente e ambiente `production-maintenance` a configurar/rever. CLI sem argumentos passa a mostrar apenas contagens; `--apply` é obrigatório para apagar/redigir. Documentação anterior atualizada para não deixar um agendamento silenciosamente sem limpeza. Os períodos de 30/180 dias e a lógica da função de limpeza são preservados; testes verificam avaliação sem escrita, aplicação, sessões/contadores e limites exatos.

Ensaio de recuperação preparado em PostgreSQL 18 descartável com migrations, dump e restauro de um feedback fictício para segunda base e comparação de schema/dados. Não usa Neon, segredos reais ou artifacts de dumps. Docker local indisponível: execução do ensaio continua pendente, tal como escolha e autorização de backups reais. `docs/OPERATIONS.md` apresenta opções de ativação, limitações do cron GitHub, notificações e procedimento de recuperação isolada.

Validação: 119 testes API e seis testes operacionais passaram, lint e sintaxe YAML/shell verificados. Verificação pública passou os nove controlos sem criar dados; prévia SQLite em memória mostrou um registo a eliminar e um a redigir, mantendo os três registos após avaliação. Sem alterações web, produção, agendamentos, migrations, limpezas, sincronizações, commits, push ou deploy neste rascunho.
