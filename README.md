# Controle Financeiro Mobile v0.9.0 — Mais didático e confiável

## Novidades da v0.9.0

- Guia interativo de primeiros passos na tela inicial.
- Recomendações automáticas conforme saldo, orçamento, dívidas e patrimônio.
- Formulário de lançamento explica dinamicamente receitas, despesas, aportes, resgates e transferências próprias.
- Orçamento vazio agora aparece como configuração pendente, sem exibir um percentual enganoso.
- Leitura compatível com tipos antigos (`Entrada`/`Saída`) e arredondamento correto de centavos negativos.
- Planejador converte a taxa de administração anual por equivalência composta e usa exatamente os meses simulados no valor real.
- Rentabilidade e inflação iguais a `0%` são preservadas, sem serem trocadas silenciosamente pelos valores padrão.
- Entradas não finitas são rejeitadas para impedir `NaN` ou infinito nos indicadores.
- Nova bateria de regressão para os cálculos financeiros gerais.



## Calculadora FGTS x reinvestimento

- Nova opção **FGTS x reinvest.** dentro da Calculadora.
- Mesmas regras do Windows v7.4.0 para valor inicial, aportes mensais, 13º em duas parcelas, PLR em duas parcelas, inflação e FGTS.
- Compara FGTS conservador com saque-aniversário reinvestido, incluindo IR regressivo por lote e patrimônio real.
- Mostra resumo A x B, diferença, gráfico SVG e evolução mensal completa.
- Permite baixar a evolução detalhada em CSV.
- O motor da PWA fica isolado em `fgts-calculator.js`; a pasta `java/` contém implementação Java equivalente para futura versão Android nativa.

## Visão Geral v0.8.0

- Mostra aviso quando a receita do período parece parcial ou quando o mês ainda está em andamento.
- Percentuais do realizado passam a ser explicitamente tratados como provisórios quando a base está incompleta.
- **Gastos por categoria** ganhou uma tabela completa com todos os valores exatos, participação, grupo e indicação de essencial.
- A regra é a mesma do Windows v7.3.0.

A v0.8.0 alinha os cálculos do Mobile com o Windows v7.3.0 e corrige os indicadores da Visão Geral sem converter nem regravar os lançamentos existentes.

## Correções financeiras da v0.8.0

- Histórico mensal e movimentações detalhadas são conciliados por mês/categoria, sem perder valores quando a migração está parcial.
- Entradas de empréstimos/financiamentos não entram em Receitas.
- Aportes, resgates e transferências próprias permanecem separados de Receitas/Gastos.
- Categorias legadas são normalizadas apenas durante os cálculos.
- Patrimônio líquido usa saldo calculado das contas, com âncora/conciliação quando existente.
- Dívidas zeradas não continuam comprometendo a renda.
- Contas fixas semanais usam `52/12`; anuais usam `1/12`.
- Série mensal, Relatórios, Saúde Financeira, maiores gastos e composição seguem a mesma regra.
- **Saúde Financeira:** usa a renda mensal configurada como referência; sem ela, calcula a média somente dos meses que possuem renda registrada. Meses sem receita não viram renda zero no denominador.
- A tela mostra `Renda ref.` e informa a origem da base, deixando Taxa de poupança, Dívidas/Renda, Essenciais/Renda e Score auditáveis.
- O filtro **00 - Todos os meses** permanece disponível onde faz sentido.
- O Diagnóstico mostra também a coerência financeira local.

## Principais módulos

Visão Geral, Movimentações, Orçamento, Contas Fixas, Dívidas, Investimentos, Calculadoras, Metas/Reserva, Patrimônio/Conciliação, Cartões, Saúde Financeira, Relatórios, Categorias/Regras, Auditoria, Lixeira, Diagnóstico, Configurações e Google Drive.

## Sincronização

Use esta versão com o Windows v7.4.0. As contas sincronizam a posição atual e a âncora de saldo para evitar patrimônio congelado ou movimentações contadas duas vezes.

## Publicação

Publique os arquivos desta pasta na raiz do repositório GitHub Pages. O `index.html` deve permanecer na raiz. Nunca publique credenciais, tokens OAuth ou bancos SQLite.
