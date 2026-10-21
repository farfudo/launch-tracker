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

### Próxima melhoria desta etapa

O comando `python -m app.initialize_db` cria a tabela inicial no ambiente de desenvolvimento. Depois, a sincronização preenche a cache através de `POST /api/v1/launches/sync`. Quando o modelo estabilizar, substituiremos este inicializador por migrações versionadas.
