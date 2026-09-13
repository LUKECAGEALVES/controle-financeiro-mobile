# Paridade funcional — Windows v7.2.3 ↔ Mobile v0.7.3

As duas versões usam a mesma lógica para Receitas, Gastos, Saldo, Aportes, Resgates, Financiamentos, Dívidas e Patrimônio Líquido. O Mobile mantém os módulos do desktop adaptados à tela pequena e compartilha a mesma base pelo Google Drive.

O histórico legado é conciliado com lançamentos detalhados sem dupla contagem. O saldo das contas é dinâmico: contas sem âncora usam as movimentações; após atualização/conciliação, a âncora passa a ser o saldo informado mais as movimentações posteriores.

Operações exclusivas do Windows, como instalador EXE e backup físico do SQLite, continuam no desktop; o Mobile usa backup/restauração JSON e PWA.
