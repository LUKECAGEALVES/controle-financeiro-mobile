# Calculadora Avançada — FGTS x Reinvestimento

## Depósitos e saque-aniversário

- O empregador deposita **8% do salário bruto** no FGTS em todos os meses simulados; esse valor não é descontado do salário.
- Uma vez por ano, no mês de aniversário escolhido, o Cenário B calcula o saque sobre o saldo total disponível e reinveste 100% na carteira.
- Faixas: até R$ 500, 50%; até R$ 1.000, 40% + R$ 50; até R$ 5.000, 30% + R$ 150; até R$ 10.000, 20% + R$ 650; até R$ 15.000, 15% + R$ 1.150; até R$ 20.000, 10% + R$ 1.900; acima de R$ 20.000, 5% + R$ 2.900.

## Cenários

- **A — FGTS conservador:** o saldo inicial do FGTS permanece na conta e rende pela taxa anual informada. A carteira recebe somente capital inicial, aportes mensais, 13º e PLR.
- **B — saque-aniversário reinvestido:** no mês de aniversário de cada ano, o saque é calculado sobre o saldo corrente do FGTS, retirado da conta e aplicado integralmente na carteira.

O patrimônio final de cada cenário é:

`Carteira líquida após IR + saldo residual do FGTS`

## Saque-aniversário

| Saldo FGTS | Alíquota | Parcela adicional |
|---|---:|---:|
| Até R$ 500,00 | 50% | R$ 0,00 |
| R$ 500,01 a R$ 1.000,00 | 40% | R$ 50,00 |
| R$ 1.000,01 a R$ 5.000,00 | 30% | R$ 150,00 |
| R$ 5.000,01 a R$ 10.000,00 | 20% | R$ 650,00 |
| R$ 10.000,01 a R$ 15.000,00 | 15% | R$ 1.150,00 |
| R$ 15.000,01 a R$ 20.000,00 | 10% | R$ 1.900,00 |
| Acima de R$ 20.000,00 | 5% | R$ 2.900,00 |

## IR regressivo da carteira

Cada aporte vira um lote independente. Na data final, o imposto incide apenas sobre o rendimento positivo de cada lote:

- até 6 meses: 22,5%;
- 7 a 12 meses: 20%;
- 13 a 24 meses: 17,5%;
- acima de 24 meses: 15%.

A equivalência mensal representa as faixas de 180, 360 e 720 dias da tabela regressiva.

## Inflação e Fisher

A taxa real exibida usa a relação exata:

`(1 + taxa nominal) / (1 + inflação) - 1`

O patrimônio real final é o patrimônio nominal deflacionado por todo o período.

## Convenção mensal

Em cada mês:

1. carteira e FGTS recebem o rendimento do mês;
2. entram aporte mensal, parcelas do 13º e parcelas da PLR;
3. se for o mês de aniversário, o Cenário B calcula o saque e o reinveste no fim do mês.

O modelo não cria depósitos trabalhistas novos no FGTS porque o requisito desta versão usa somente o saldo inicial.

## Arquivos

- `investment_fgts.py`: motor Python puro.
- `fgts_cli.py`: execução opcional por terminal, DataFrame, CSV e gráfico.
- `java/InvestmentFgtsCalculator.java`: implementação Java equivalente.
- `ui/pages.py`: integração PySide6.

## Mobile

A interface Mobile atual é uma PWA e executa o motor equivalente em `fgts-calculator.js`. O arquivo Java está incluído como referência para uma futura versão Android nativa; Java não é executado pelo navegador/GitHub Pages.
