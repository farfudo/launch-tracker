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

Esta configuração é um ensaio local. O alojamento deve fornecer HTTPS, armazenamento persistente e cópias de segurança. Expor apenas a interface; a API e o PostgreSQL comunicam na rede privada. O endpoint de sincronização é uma operação administrativa e não deve ficar acessível publicamente sem autenticação.

Definir `API_BASE_URL` no servidor Next.js e `DATABASE_URL` na API. Executar `alembic upgrade head` antes de iniciar a nova versão e `python -m app.sync` como tarefa agendada, respeitando os limites do fornecedor. Uma falha dessa tarefa deve gerar um alerta operacional; os dados existentes continuam disponíveis na cache.

Antes da publicação falta escolher fornecedor e orçamento, configurar os segredos nesse fornecedor, HTTPS e a tarefa de sincronização, e verificar o calendário e um detalhe através do endereço público. O fluxo CI atual valida código; ainda não faz publicação automática.
