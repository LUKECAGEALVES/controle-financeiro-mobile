# Paridade funcional — Windows v7.2 x Mobile v0.7.2

A v0.7.2 foi estruturada para disponibilizar no celular as funções financeiras do desktop, adaptadas para tela pequena.

| Módulo | Paridade mobile |
|---|---|
| Visão Geral | período, KPIs, fluxo, categorias, orçamento, saúde e composição |
| Movimentações | filtros avançados, busca, incluir, editar, excluir, importar e exportar CSV |
| Importação Nubank | preview, regras, duplicidades, histórico |
| Orçamento | ano/mês, categoria, status, gasto, saldo e copiar mês anterior |
| Contas fixas | CRUD, filtros, ativar/pausar, essencial, frequência, conta |
| Dívidas | CRUD, saldo, parcela, pagamento, amortização, simulação, histórico e estratégia |
| Investimentos | CRUD, valor/preço, aporte, resgate, rendimento, extrato, alocação e dados do ativo |
| Calculadora | simples, completa, meta reversa, benchmarks, Monte Carlo e cenários |
| Metas e reserva | CRUD, filtros, aportes, ajuste de saldo, histórico e reserva |
| Patrimônio | CRUD, filtros, atualização de saldo, conciliação e histórico |
| Cartões | CRUD, compras parceladas, parcelas, pagamento e projeção de faturas |
| Saúde financeira | mesmos indicadores e regras de cálculo do desktop |
| Relatórios | ano/mês, fluxo mensal, categorias, maiores gastos e CSV |
| Administração | categorias, regras, auditoria, lixeira, diagnóstico e Drive |
| Configurações | parâmetros financeiros, autosave, retenção, Drive, backup JSON e PWA |

## Filtros mobile

Os filtros usam bottom sheet e chips ativos. Existem filtros específicos por módulo para período, tipo, categoria, conta, status, instituição, prioridade, cartão, parcelas, orçamento e auditoria.

## Funções específicas do Windows

Operações que dependem do sistema operacional, como instalar EXE, escolher pasta física de backup SQLite ou executar o instalador Windows, permanecem no desktop. O mobile oferece os equivalentes aplicáveis: backup/restauração JSON, atualização PWA e consulta de diagnóstico/auditoria/lixeira sincronizados.
