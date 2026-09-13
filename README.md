# Controle Financeiro Mobile v0.7 — Paridade Completa

A v0.7 aproxima o aplicativo mobile da versão desktop v7.2, mantendo a mesma base sincronizada pelo Google Drive.

## Principais recursos

- Visão geral com filtros de período, KPIs, fluxo mensal, categorias e composição dos indicadores.
- Movimentações com filtros avançados, busca, inclusão, edição, exclusão, importação Nubank e exportação CSV.
- Orçamento por ano/mês/categoria/status e cópia do mês anterior.
- Contas fixas com CRUD, filtros, ativar/pausar, essencial, frequência e conta.
- Dívidas com CRUD, pagamentos, amortização extra, simulação, histórico e estratégias.
- Investimentos com CRUD completo, aportes, resgates, rendimentos, valor/preço, extrato e alocação.
- Calculadora simples/completa, meta reversa, benchmarks, Monte Carlo e cenários.
- Metas e reserva com filtros, CRUD, aportes, ajuste de saldo e histórico.
- Patrimônio com CRUD de contas, saldos, conciliação e histórico.
- Cartões com CRUD, compras parceladas, parcelas, pagamentos e projeção de faturas.
- Saúde financeira com a mesma regra de cálculo do desktop.
- Relatórios anuais/mensais com exportação CSV.
- Categorias, regras automáticas, auditoria, lixeira, diagnóstico e configurações.
- Sincronização automática/manual com Google Drive e proteção de conflitos.

## Filtros

Os módulos usam um painel de filtros em formato mobile (bottom sheet) e chips removíveis para filtros ativos.

## Atualização

Publique os arquivos desta pasta na raiz do repositório GitHub Pages. O `index.html` deve permanecer na raiz.

## Segurança

Nunca publique `credentials.json`, `client_secret`, tokens OAuth ou bancos SQLite no GitHub. O mobile utiliza apenas o OAuth Web Client ID.
