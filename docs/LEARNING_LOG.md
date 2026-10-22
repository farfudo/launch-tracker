# Diário de aprendizagem — LaunchSkyline

A primeira execução manual do workflow `Sync launches` terminou com sucesso em 22 de outubro de 2026 (execução GitHub `39766771749`). A API pública confirmou 100 lançamentos e uma cache recente. A variável `SYNC_ENABLED=true` foi ativada após essa validação; as execuções horárias futuras ficam dependentes do agendador GitHub.

## Etapa 9 — Fiabilidade e atualização dos dados

A publicação mostrou que o arranque dependia da disponibilidade da fonte externa e consumia uma consulta a cada deploy. A sincronização passa para um workflow horário independente no GitHub. A tarefa só é ativada após configurar um segredo de ligação ao Neon e uma variável de ativação. Esta etapa não requer um plano pago.

Uma resposta 429 é identificada explicitamente e o tempo `Retry-After`, quando enviado pelo fornecedor, é preservado no erro da tarefa. Não fazemos tentativas em ciclo. O endpoint de sincronização HTTP exige um token administrativo e fica desativado se esse token não estiver configurado, evitando que pedidos de visitantes consumam a quota da fonte.

A interface apresenta a hora de atualização e distingue dados ainda não carregados de uma pesquisa sem resultados. O indicador de cache antiga usa seis horas como limite operacional, não como garantia de validade dos horários das missões. Testamos a proteção do endpoint, os estados vazio/recente/antigo, a ausência de sincronização no arranque e o tratamento de limites sem consultas reais ao fornecedor.

## Etapa 4 — Persistência e cache

### Problema

Consultar a Launch Library em cada visita torna a página mais lenta e deixa a aplicação dependente de uma fonte externa. Também não permite construir pesquisa, filtros ou histórico de forma eficiente.

### Decisão

Usamos PostgreSQL para guardar uma versão normalizada dos lançamentos. A API deixa de entregar diretamente a resposta externa: lê a base de dados e atualiza-a através de uma operação de sincronização.

O contentor expõe a base de dados em `localhost:5433`. A porta normal `5432` já era usada por outro projeto no computador; escolher uma porta diferente mantém ambos isolados.

### Componentes criados

- `app/db.py`: ligação e ciclo de vida das sessões de base de dados.
- `app/models.py`: modelo `Launch`, a representação persistida de um lançamento.
- `app/repositories.py`: operações de leitura e atualização da cache.
- `app/schemas.py`: contrato público da API, separado do modelo da base de dados.

### Porque separar estes componentes?

Cada camada tem uma responsabilidade única: o cliente externo obtém dados, o repositório persiste-os e os endpoints expõem-nos. Isto torna os testes e futuras alterações — como trocar de fornecedor ou acrescentar filtros — mais seguros.

### Migrações versionadas

O estado da base de dados deixa de ser criado por código ao iniciar. A migração `20261021_01` descreve a estrutura inicial da tabela. O comando `alembic upgrade head` aplica todas as mudanças pendentes, enquanto `alembic downgrade -1` permite reverter a última alteração durante desenvolvimento.

Como esta base de dados já foi criada no passo anterior, vamos marcá-la como estando nesta versão sem apagar os dados. Este processo chama-se *stamp* e é usado ao introduzir migrações num projeto existente.

## Etapa 5 — Pesquisa, filtros e detalhe

### Problema

Uma lista longa de lançamentos só é útil se for possível encontrar rapidamente uma missão. A aplicação também precisa de uma ligação estável para cada lançamento, para suportar partilha e evoluir a página de detalhe.

### Decisão

Os filtros são parâmetros na URL (`q`, `agency`, `vehicle`) enviados à API. A filtragem é feita na base de dados, não no browser, e cada cartão aponta para `/launches/{id}`. Desta forma, uma pesquisa pode ser guardada ou partilhada e a interface móvel poderá reutilizar a mesma API.

### O que foi entregue

- Pesquisa por nome, agência ou veículo.
- Filtros preenchidos a partir dos dados realmente disponíveis na cache.
- Endpoint de detalhe e página individual de lançamento.
- Indicação da hora de atualização da cache.

As fontes oficiais exigem que passemos a guardar URLs fornecidos pela fonte externa. Essa extensão será a próxima pequena migração do modelo de dados, em vez de inventar ligações que possam não ser oficiais.

## Etapa 6 — Transparência da fonte e estados da interface

### Decisão

A Launch Library expõe uma URL canónica para cada lançamento, mas não garante uma URL oficial da agência. Guardamos essa URL como referência da fonte dos dados e identificamo-la explicitamente como tal na interface. Uma fonte oficial só será apresentada quando for disponibilizada e validada.

Esta alteração exige a migração `20261021_02`: acrescenta a coluna opcional `source_url` sem afetar os registos existentes. A interface ganha ainda ecrãs específicos durante o carregamento, em caso de erro e quando uma pesquisa não encontra resultados.

## Etapa 7 — Integração contínua


### Problema

Testar manualmente antes de cada envio funciona enquanto o projeto é pequeno, mas torna-se fácil esquecer um passo ou introduzir uma alteração que quebra outra parte da aplicação.

### Decisão

O GitHub Actions executa dois trabalhos independentes a cada envio para `main` e em cada pull request: um para a API e outro para a interface. A API instala as dependências, verifica estilo com Ruff e corre os testes. A interface instala exatamente as versões do ficheiro de bloqueio, corre os testes e cria uma compilação de produção.

Os trabalhos são independentes para que uma falha indique imediatamente se está no backend ou no frontend. Nesta fase não fazemos publicação automática: validar automaticamente não deve ser confundido com colocar a aplicação em produção.

## Etapa 8 — Ensaio de produção em Docker

Criámos imagens para a API e a interface e um ambiente de demonstração isolado na porta 3100. A base de dados tem um volume próprio e as migrações correm antes do arranque da API. O endereço interno da API é configurável em tempo de execução através de `API_BASE_URL`.

O ensaio encontrou uma dependência de produção incorretamente classificada como desenvolvimento: `httpx`, usada pelo cliente externo. Foi movida para as dependências normais. Este teste demonstra por que razão os testes numa máquina com todas as ferramentas instaladas não substituem um arranque limpo.

A sincronização também pode ser executada com `python -m app.sync`, permitindo ao alojamento agendá-la sem chamar um endpoint público. O orçamento aprovado é apenas gratuito; a publicação online depende da configuração das contas de alojamento. Os passos operacionais estão em `DEPLOYMENT.md`.
