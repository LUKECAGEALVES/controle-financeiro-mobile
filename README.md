# Controle Financeiro Mobile v0.7.3 — Paridade Completa

A v0.7.3 alinha os cálculos do Mobile com o Windows v7.2.3 e corrige os indicadores da Visão Geral sem converter nem regravar os lançamentos existentes.

## Correções financeiras da v0.7.3

- Histórico mensal e movimentações detalhadas são conciliados por mês/categoria, sem perder valores quando a migração está parcial.
- Entradas de empréstimos/financiamentos não entram em Receitas.
- Aportes, resgates e transferências próprias permanecem separados de Receitas/Gastos.
- Categorias legadas são normalizadas apenas durante os cálculos.
- Patrimônio líquido usa saldo calculado das contas, com âncora/conciliação quando existente.
- Dívidas zeradas não continuam comprometendo a renda.
- Contas fixas semanais usam `52/12`; anuais usam `1/12`.
- Série mensal, Relatórios, Saúde Financeira, maiores gastos e composição seguem a mesma regra.
- O filtro **00 - Todos os meses** permanece disponível onde faz sentido.
- O Diagnóstico mostra também a coerência financeira local.

## Principais módulos

Visão Geral, Movimentações, Orçamento, Contas Fixas, Dívidas, Investimentos, Calculadoras, Metas/Reserva, Patrimônio/Conciliação, Cartões, Saúde Financeira, Relatórios, Categorias/Regras, Auditoria, Lixeira, Diagnóstico, Configurações e Google Drive.

## Sincronização

Use esta versão com o Windows v7.2.3. As contas sincronizam a posição atual e a âncora de saldo para evitar patrimônio congelado ou movimentações contadas duas vezes.

## Publicação

Publique os arquivos desta pasta na raiz do repositório GitHub Pages. O `index.html` deve permanecer na raiz. Nunca publique credenciais, tokens OAuth ou bancos SQLite.
