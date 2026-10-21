# Diário de aprendizagem — Launch Tracker

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
