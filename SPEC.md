# Launch Tracker — Especificação do MVP

## Visão

O Launch Tracker ajuda entusiastas do espaço a encontrar, compreender e acompanhar lançamentos orbitais e suborbitais. O produto começa como uma aplicação web de portefólio, mas a arquitetura deve permitir evoluir para alertas e funcionalidades comerciais.

## Utilizador-alvo

- Pessoas interessadas em lançamentos espaciais, de iniciantes a fãs regulares.
- Utilizadores que querem uma agenda confiável e uma página clara para cada missão.

## MVP

1. Calendário global de próximos lançamentos.
2. Pesquisa por missão, veículo, agência ou local de lançamento.
3. Filtros por agência e veículo.
4. Página de detalhe: missão, data/hora prevista, janela, estado, veículo, local, agência e ligações a fontes oficiais quando existirem.
5. Indicação transparente da origem e da hora da última atualização dos dados.

## Fora do MVP

- Contas de utilizador e favoritos.
- Alertas por e-mail, push ou calendário.
- Reprodução de transmissões em direto.
- Telemetria ou acompanhamento do voo em tempo real.
- Pagamentos, publicidade ou subscrições.

## Fontes de dados

- Fonte principal: Launch Library 2.
- A API guarda uma cópia normalizada e em cache; a interface nunca depende diretamente de um fornecedor externo.
- Cada lançamento deve conservar URL(s) de fontes oficiais quando forem disponibilizadas.

## Arquitetura

```text
Next.js (web) -> FastAPI (API) -> PostgreSQL
                           -> cache / tarefas de sincronização
                           -> Launch Library 2
```

O frontend e a API são aplicações independentes no mesmo repositório. A API é a única responsável por integração, normalização e cache de dados externos.

## Requisitos de qualidade

- TypeScript estrito no frontend e tipagem no backend.
- Testes automatizados para endpoints, transformação de dados e componentes críticos.
- Estado e data de atualização claramente visíveis no produto.
- Datas tratadas em UTC na API; mostradas no fuso horário do utilizador na interface.
- Sem chaves ou segredos no repositório.

## Critérios de aceitação do primeiro incremento

- A página web abre e apresenta um estado inicial de calendário.
- `GET /health` responde com o estado da API.
- `GET /api/v1/launches` tem contrato documentado, mesmo enquanto usa dados de demonstração.
- Os testes da API passam localmente.
