# Paridade funcional — Windows v7.4.0 ↔ Mobile v0.9.0

As duas versões usam a mesma lógica para Receitas, Gastos, Saldo, Aportes, Resgates, Financiamentos, Dívidas e Patrimônio Líquido. O Mobile mantém os módulos do desktop adaptados à tela pequena e compartilha a mesma base pelo Google Drive.

O histórico legado é conciliado com lançamentos detalhados sem dupla contagem. O saldo das contas é dinâmico: contas sem âncora usam as movimentações; após atualização/conciliação, a âncora passa a ser o saldo informado mais as movimentações posteriores.

Operações exclusivas do Windows, como instalador EXE e backup físico do SQLite, continuam no desktop; o Mobile usa backup/restauração JSON e PWA.

## Calculadora FGTS x reinvestimento — v7.4.0 / v0.9.0

Os dois aplicativos usam o mesmo modelo mensal, as mesmas faixas de saque-aniversário, a mesma tabela regressiva de IR por lote e a mesma deflação por inflação. O cenário de referência de 60 meses foi comparado numericamente entre Python e JavaScript com diferença inferior a R$ 0,01. A implementação Java incluída também reproduz o cenário de 120 meses com os mesmos valores arredondados.
