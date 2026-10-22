# Preparação da demonstração

A versão Docker contém interface, API, migrações e PostgreSQL. Usa um volume próprio e a porta 3100 para permitir ensaiar o arranque sem alterar a base local de desenvolvimento.

## Ensaio local

Definir `DEMO_DATABASE_PASSWORD` no ambiente ou num `.env` na raiz (não versionado). Usar uma palavra-passe aleatória longa com letras e números; a interpolação na URL de ligação exige caracteres seguros para URLs.

```sh
docker compose -f compose.demo.yaml up -d --build
docker compose -f compose.demo.yaml exec api python -m app.sync
```

Abrir http://127.0.0.1:3100. As migrações terminam antes de a API arrancar. A primeira sincronização preenche a base inicialmente vazia. Para consultar o estado e os registos:

```sh
docker compose -f compose.demo.yaml ps -a
docker compose -f compose.demo.yaml logs api web migrate
```

Para parar preservando a base:

```sh
docker compose -f compose.demo.yaml down
```

## Alojamento público

No Render, usar Root Directory `services/api`, runtime Docker e Docker Command `/bin/sh /app/start.sh`. Este ficheiro executa as migrações e inicia o servidor na porta definida pelo alojamento. Uma falha nas migrações impede o arranque. A sincronização é independente: um deploy ou reinício já não consulta a fonte externa.

Esta configuração é um ensaio local. O alojamento deve fornecer HTTPS, armazenamento persistente e cópias de segurança. Expor apenas a interface; a API e o PostgreSQL comunicam na rede privada. O endpoint de sincronização é uma operação administrativa e não deve ficar acessível publicamente sem autenticação.

Definir `API_BASE_URL` no servidor Next.js e `DATABASE_URL` na API. Executar `alembic upgrade head` antes de iniciar a nova versão e `python -m app.sync` como tarefa agendada, respeitando os limites do fornecedor. Uma falha dessa tarefa deve gerar um alerta operacional; os dados existentes continuam disponíveis na cache.

A interface foi publicada em https://launch-tracker-beryl.vercel.app/ e a API em https://launch-tracker-ie09.onrender.com/. A base usa Neon. Os deploys são feitos pelas integrações dos fornecedores com o GitHub; o workflow CI apenas valida código.

## Sincronização horária gratuita

O workflow `Sync launches` corre `python -m app.sync` num runner do GitHub e escreve diretamente na base Neon, sem depender do processo Render. Faz uma consulta por execução; não repete automaticamente uma resposta 429. O limite gratuito documentado pela Launch Library é 15 consultas por hora: https://ll.thespacedevs.com/docs.

Configuração no repositório GitHub:

1. Em Settings → Secrets and variables → Actions → Secrets, criar `NEON_DATABASE_URL` com a mesma ligação privada da API (`postgresql+psycopg://...`, preservando SSL). Nunca a guardar em ficheiros versionados.
2. Em Actions → Sync launches, executar Run workflow e confirmar uma execução bem-sucedida.
3. Em Settings → Secrets and variables → Actions → Variables, criar `SYNC_ENABLED` com valor `true` para ativar a execução horária, ao minuto 23 UTC. Remover a variável ou defini-la como `false` pausa o agendamento. O botão manual funciona independentemente dessa variável.

Sem `SYNC_ENABLED`, as execuções agendadas são ignoradas. Sem o segredo, uma execução manual termina com uma mensagem de configuração em falta. As execuções são serializadas e têm limite de cinco minutos. O GitHub pode atrasar tarefas agendadas e desativar agendamentos em repositórios públicos inativos; esta opção serve uma demonstração e não oferece atualização em tempo real. Consultar falhas em Actions e ativar as notificações de falha na conta GitHub.

`GET /api/v1/data-status` indica quantos registos existem, quando foi atualizado o registo mais recente e se a cache tem mais de seis horas. A interface distingue cache vazia de pesquisa sem resultados e mostra um aviso quando a atualização está atrasada.

O endpoint `POST /api/v1/launches/sync` fica desativado por omissão. Se for necessário usá-lo administrativamente, configurar `SYNC_TOKEN` na API e enviar o mesmo valor no cabeçalho `X-Sync-Token`. A tarefa GitHub usa a CLI e não precisa desse token. Evitar desencadear sincronizações simultaneamente por várias vias.

Ao acrescentar campos persistidos, aguardar que o deploy da API aplique a migração antes de executar manualmente `Sync launches`. A migração `20261022_03`, por exemplo, acrescenta os campos opcionais de missão/local/janela: os registos anteriores permanecem acessíveis e recebem essa informação na sincronização seguinte.
