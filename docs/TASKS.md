# Próximas tarefas

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
- [x] Apresentar uma ligação transparente para a fonte de dados na página de detalhe.
- [x] Adicionar estados de carregamento, vazio e erro.
- [ ] Guardar e apresentar fontes oficiais, quando a fonte externa as disponibilizar.

## Incremento 4 — Confiança e lançamento

- [ ] Adicionar testes de interface e integração.
- [x] Configurar CI no GitHub Actions.
- [x] Preparar imagens Docker e ambiente isolado de demonstração.
- [x] Publicar demonstração online com alojamento gratuito.
- [x] Preparar sincronização horária e apresentar a idade dos dados.
- [x] Configurar o segredo Neon no GitHub, validar a primeira sincronização manual e ativar o agendamento horário.

## Depois do MVP

- [ ] Alertas configuráveis.
- [ ] Transmissões e ligações oficiais.
- [ ] Telemetria, quando houver fonte adequada.
