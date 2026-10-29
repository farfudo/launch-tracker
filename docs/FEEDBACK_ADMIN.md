# Feedback Hub — administrador único (rascunho local)

## Escolha de arquitetura

O frontend Next.js corre na Vercel, a API FastAPI no Render e o PostgreSQL é partilhado no backend. Não existia uma identidade administrativa segura reutilizável; o `SYNC_TOKEN` tem outra finalidade e não é reutilizado.

Este painel usa um único utilizador definido no ambiente da API, sem tabela de contas, registo público ou serviço externo. A password existe apenas como hash scrypt. O login passa pelo Next.js; a API emite uma sessão opaca aleatória de 256 bits, cujo digest HMAC fica no PostgreSQL. O Next.js coloca o token num cookie HttpOnly do domínio web. O token nunca é devolvido em JSON ao navegador, nem guardado em localStorage. Uma chave de transporte separada permite à API aceitar pedidos administrativos apenas do servidor Next.js; esta chave não é a sessão do administrador.

O scrypt usa N=32768, r=8, p=3 e salt aleatório: a opção de 32 MiB/3 passagens indicada pela [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Evita novas dependências e limita o consumo de memória no Render. As propriedades de cookie e expiração seguem as recomendações da [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Variáveis necessárias

Todas são **server-side**. Nunca usar o prefixo `NEXT_PUBLIC_`, copiar valores para o Git, colocar credenciais em URLs ou reutilizar segredos de sincronização/feedback.

| Variável | API Render | Next.js Vercel | Finalidade |
|---|---|---|---|
| `ADMIN_ENABLED=true` | sim | sim | Ativação explícita; omissa/falsa mantém acesso fechado |
| `ADMIN_USERNAME` | sim | não | Único utilizador autorizado |
| `ADMIN_PASSWORD_HASH` | sim | não | Hash gerado pelo comando abaixo, nunca password em claro |
| `ADMIN_SESSION_SECRET` | sim | não | Segredo aleatório de pelo menos 32 caracteres para digests e revogação |
| `ADMIN_BFF_SECRET` | sim | sim | Outro segredo aleatório de pelo menos 32 caracteres, igual nos dois servidores |
| `ADMIN_WEB_ORIGIN` | sim | sim | Origem HTTPS exata do frontend, por exemplo `https://<dominio-aprovado>`; sem caminho/query |
| `API_BASE_URL` | não | sim | URL HTTPS da API existente; não redirecionável |
| `DATABASE_URL` | sim | não | PostgreSQL existente |

O override `FEEDBACK_API_BASE_URL`, já existente para a prévia, também é respeitado pelos pedidos administrativos. Em produção, omitir esse override ou usar apenas a API HTTPS aprovada. Não partilhar credenciais/segredos de produção com ambientes públicos de preview; usar uma API/base isoladas e segredos distintos para staging.

`ADMIN_ALLOW_INSECURE_LOCAL=true` serve **exclusivamente** para HTTP em `127.0.0.1`/`localhost`. O código recusa HTTP em domínios públicos mesmo com esta flag. A prévia usa um cookie de nome diferente, `nrl_admin_local`; em produção o cookie é `__Host-nrl_admin`, com `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/` e sem `Domain`. A flag local deve ficar omissa em produção.

## Configurar o primeiro administrador

1. Num terminal privado com o ambiente Python da API, executar `cd services/api` e `python -m app.admin_auth hash-password`. O comando pede e confirma a password sem a mostrar; exige 16–256 caracteres e imprime apenas o hash. Guardar esse hash no secret manager do Render como `ADMIN_PASSWORD_HASH`, e escolher o `ADMIN_USERNAME`.
2. Gerar separadamente `ADMIN_SESSION_SECRET` e `ADMIN_BFF_SECRET`, por exemplo com `python -c "import secrets; print(secrets.token_urlsafe(48))"`, no terminal privado. Configurar o primeiro apenas no Render e o segundo nos dois serviços. Nunca enviar estes valores no chat ou incluir em ficheiros versionados.
3. Configurar `ADMIN_WEB_ORIGIN` igual nos dois serviços, usando a origem pública HTTPS exata. Não usar `*` nem confiar em cabeçalhos de origem enviados pelo cliente para definir a configuração.
4. Aplicar primeiro em staging a migration Alembic `20261029_10`, que acrescenta apenas `admin_sessions`. `alembic upgrade head` é o comando normal. O downgrade para `20261029_09` remove sessões e termina o acesso, preservando a tabela de feedback; deve ser planeado/aprovado, tal como qualquer migration.
5. Validar login, sessão, filtros, alteração de estado e logout em staging, incluindo chamadas diretas sem autenticação. Só depois configurar `ADMIN_ENABLED=true` nos serviços aprovados e executar o deploy autorizado. O arranque Render existente executa migrations: rever e aprovar esse efeito antes de qualquer deploy/reinício de produção.
6. Abrir `/admin/login`. Não existe criação de utilizadores pela interface nem uma password inicial predefinida. Usar o gestor de passwords do administrador.

Este trabalho não executou migration/deploy em produção, nem modificou configurações de Render/Vercel. As credenciais da prévia são temporárias, geradas localmente, e não são credenciais de produção.

## Sessão, CSRF e autorização

- Sessão absoluta de 2 horas; inatividade máxima de 30 minutos, ambas verificadas pela API em cada pedido. A interface remove o conteúdo e inicia logout conservadoramente após 29 minutos sem pedidos válidos. As sessões são partilhadas entre réplicas via PostgreSQL, não por memória do processo Vercel/Render.
- Cada login gera um novo token; não se aceita um ID fornecido pelo visitante. Só o digest HMAC, a versão das credenciais e datas ficam em `admin_sessions`. Alterar o hash da password, o utilizador ou `ADMIN_SESSION_SECRET` invalida sessões anteriores. Para revogação de emergência, desligar o acesso e **rodar `ADMIN_SESSION_SECRET`**; desligar e voltar a ligar sem rotação não elimina sessões ainda dentro do prazo.
- Logout apaga a sessão na base e remove apenas o cookie administrativo. Não limpa favoritos, idioma ou outras preferências. Reutilizar o token antigo deixa de permitir leitura. Falhas de rede no logout são mostradas; não se afirma revogação bem-sucedida antes da confirmação do servidor.
- O login exige origem/Host web exatos. Mutações autenticadas exigem também um token CSRF derivado da sessão, enviado num cabeçalho dedicado e validado novamente na API. Este token anti-CSRF, por si só, não autentica nem dá acesso aos dados. `SameSite=Strict` é defesa adicional, não substitui essa verificação.
- Os pedidos do Next.js à API exigem `X-Admin-Gateway` (configuração server-side) e, exceto o login, o token de sessão como Bearer. Nenhum destes valores é aceite a partir de uma chave colocada pelo visitante no frontend. Chamadas diretas à API sem ambos não podem consultar feedback.
- Limitação partilhada: 5 tentativas por janela de 15 minutos e 30 por dia, incluindo passwords erradas e logins válidos. Não guarda IPs nem nomes nos contadores. Como o limite é global para um administrador, um atacante pode esgotar temporariamente o orçamento; a recuperação é aguardar a janela, não criar um bypass público.
- Comparação de credenciais/CSRF em tempo constante; o custo de hash também é executado para um nome de utilizador incorreto. Respostas genéricas não mostram passwords, tokens ou diagnósticos SQL. Não registar corpos de login, Authorization, cookies ou a chave de gateway nos serviços/proxy. O evento de alteração de estado regista apenas ID do feedback e novo estado, sem mensagem/contactos.
- Rotas/páginas administrativas e respostas de sessão/dados usam `Cache-Control: no-store`, `noindex` e `Referrer-Policy: no-referrer`. O HTML inicial do painel só é renderizado após validação server-side e não contém mensagens/contactos; o cliente carrega-os pela API protegida. Logout usa navegação completa e remove os dados da interface, e a restauração de uma página valida novamente a sessão.
- Login tem limite de 4 KiB; atualizações de estado, 1 KiB. Os valores de filtro/estado são enumerados no servidor. O conteúdo das mensagens é texto React escapado, nunca HTML executável.

## Rotas e utilização

| Navegador (Next.js) | API FastAPI | Proteção |
|---|---|---|
| `/admin/login` | — | Formulário, sem credenciais de configuração serializadas |
| `/api/admin/login` POST | `/admin/auth/login` POST | Origem exata + gateway + password + orçamento partilhado |
| `/admin/feedback` | `/admin/auth/session` GET | Validação server-side da sessão antes do painel |
| `/api/admin/session` GET | `/admin/auth/session` GET | Cookie/sessão válida; devolve só CSRF e expiração |
| `/api/admin/feedback` GET | `/admin/feedback` GET | Sessão; filtros tipo/estado; offset, 50 registos por página |
| `/api/admin/feedback/{id}` GET/PATCH | `/admin/feedback/{id}` GET/PATCH | Sessão; origem + CSRF também no PATCH |
| `/api/admin/logout` POST | `/admin/auth/logout` POST | Sessão + origem + CSRF; revogação persistente |

O painel reutiliza `FeedbackAdminPanel`: lista por data decrescente, contagem global de `new`, filtros no servidor, mensagens completas, contactos apenas quando existem e estados New/Reviewed/Planned/Resolved. UI e mensagens são PT/EN/ES; formulários e controlos têm foco visível, alvos táteis e layout mobile. O botão público de feedback não aparece dentro da administração.

A tarefa diária `python -m app.feedback_retention` já fornecida também remove sessões cuja expiração absoluta terminou. Mantêm-se as regras anteriores de retenção do feedback; não foi alterada a sincronização LL2 nem a lógica dos lançamentos.

## Verificação

Testes da API cobrem configuração fechada, gateway obrigatório, credenciais erradas, limites partilhados, sessões guardadas como digest, filtros/leitura, CSRF ausente/incorreto, logout/replay, inatividade, expiração absoluta e rotação de password. Testes web verificam flags do cookie, origem, ausência de tokens na resposta, recusa de HTTP público e chamadas sem sessão. Jornadas reais locais exercitam login, filtros, alteração de estado, logout, expiração, HTML malicioso apresentado como texto, traduções e light/dark em 1440/390 px.

Há verificações PostgreSQL próprias para persistência/revogação e orçamento concorrente. Não foram executadas localmente porque o Docker/PostgreSQL local estava indisponível; a migration e a integração da prévia foram testadas apenas numa base SQLite isolada. Nenhum teste foi desativado para obter sucesso.
