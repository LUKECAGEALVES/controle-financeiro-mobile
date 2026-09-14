/* Controle Financeiro Mobile v0.9.0 — motor puro FGTS x reinvestimento
 *
 * Sem dependência da interface. As funções são expostas em globalThis para a
 * PWA e também podem ser carregadas diretamente pelo Node.js em testes.
 */
(function(root){
  'use strict';
  const n=v=>{const x=Number(String(v??0).replace(',','.'));return Number.isFinite(x)?x:0};
  const FGTS_MONTHLY_DEPOSIT_RATE=.08;

  function annualToMonthlyRate(annualPct){const a=n(annualPct)/100;if(a<=-1)throw new Error('Taxa anual precisa ser maior que -100%.');return Math.pow(1+a,1/12)-1}
  function fixedIncomeIrRate(holdingMonths){const m=Math.max(0,Math.floor(Number(holdingMonths)||0));if(m<=6)return .225;if(m<=12)return .20;if(m<=24)return .175;return .15}
  function birthdayWithdrawal(balance){const b=Math.max(0,n(balance));if(b<=500)return Math.min(b,b*.50);if(b<=1000)return Math.min(b,b*.40+50);if(b<=5000)return Math.min(b,b*.30+150);if(b<=10000)return Math.min(b,b*.20+650);if(b<=15000)return Math.min(b,b*.15+1150);if(b<=20000)return Math.min(b,b*.10+1900);return Math.min(b,b*.05+2900)}
  function fisherRealRate(nominalPct,inflationPct){const nominal=n(nominalPct)/100,inflation=n(inflationPct)/100;if(inflation<=-1)throw new Error('Inflação precisa ser maior que -100%.');return ((1+nominal)/(1+inflation)-1)*100}
  function snapshot(lots,currentMonth){let gross=0,principal=0,tax=0;for(const lot of lots){gross+=lot.value;principal+=lot.principal;const gain=Math.max(0,lot.value-lot.principal),holding=Math.max(0,currentMonth-lot.month);tax+=gain*fixedIncomeIrRate(holding)}return {gross,principal,tax,net:gross-tax,gain:gross-principal}}
  function addLot(lots,amount,month,source){const value=Math.max(0,n(amount));if(value>0)lots.push({principal:value,value,month:Number(month)||0,source})}
  function validate(p){if(!(Number(p.period_months)>=1&&Number(p.period_months)<=1200))throw new Error('O período precisa ficar entre 1 e 1.200 meses.');for(const [name,v] of [['Valor inicial',p.initial_investment],['Aporte mensal',p.monthly_contribution],['13º total',p.thirteenth_total],['PLR 1',p.plr_first_value],['PLR 2',p.plr_second_value],['Saldo FGTS',p.fgts_initial_balance],['Salário bruto mensal',p.gross_monthly_salary]])if(n(v)<0)throw new Error(`${name} não pode ser negativo.`);if(Math.abs(n(p.thirteenth_first_pct)+n(p.thirteenth_second_pct)-100)>.000001)throw new Error('As duas parcelas do 13º precisam somar 100%.');for(const m of [p.thirteenth_first_month,p.thirteenth_second_month,p.plr_first_month,p.plr_second_month,p.birthday_month])if(Number(m)<1||Number(m)>12)throw new Error('Todos os meses precisam ficar entre 1 e 12.');annualToMonthlyRate(p.portfolio_annual_rate_pct);annualToMonthlyRate(p.fgts_annual_rate_pct);annualToMonthlyRate(p.inflation_annual_pct);return p}

  function simulate(raw){
    const p=validate({...raw,period_months:Math.max(1,Math.round(n(raw.period_months)))}),portfolioRate=annualToMonthlyRate(p.portfolio_annual_rate_pct),fgtsRate=annualToMonthlyRate(p.fgts_annual_rate_pct),inflationRate=annualToMonthlyRate(p.inflation_annual_pct),lotsA=[],lotsB=[];
    addLot(lotsA,p.initial_investment,0,'Valor inicial');addLot(lotsB,p.initial_investment,0,'Valor inicial');
    let fgtsA=n(p.fgts_initial_balance),fgtsB=fgtsA,userTotal=n(p.initial_investment),fgtsInjected=0,fgtsDeposited=0;const rows=[];
    for(let month=1;month<=p.period_months;month++){
      const moy=(month-1)%12+1,year=Math.floor((month-1)/12)+1;
      for(const lot of lotsA)lot.value*=1+portfolioRate;for(const lot of lotsB)lot.value*=1+portfolioRate;fgtsA*=1+fgtsRate;fgtsB*=1+fgtsRate;
      const fgtsMonthlyDeposit=Math.max(0,n(p.gross_monthly_salary))*FGTS_MONTHLY_DEPOSIT_RATE;fgtsA+=fgtsMonthlyDeposit;fgtsB+=fgtsMonthlyDeposit;fgtsDeposited+=fgtsMonthlyDeposit;
      let thirteenth=0;if(moy===Number(p.thirteenth_first_month))thirteenth+=n(p.thirteenth_total)*n(p.thirteenth_first_pct)/100;if(moy===Number(p.thirteenth_second_month))thirteenth+=n(p.thirteenth_total)*n(p.thirteenth_second_pct)/100;
      let plr=0;if(moy===Number(p.plr_first_month))plr+=n(p.plr_first_value);if(moy===Number(p.plr_second_month))plr+=n(p.plr_second_value);
      const monthly=Math.max(0,n(p.monthly_contribution)),userMonth=monthly+thirteenth+plr;userTotal+=userMonth;
      for(const lots of [lotsA,lotsB]){addLot(lots,monthly,month,'Aporte mensal');addLot(lots,thirteenth,month,'13º');addLot(lots,plr,month,'PLR')}
      let withdrawal=0;if(moy===Number(p.birthday_month)&&fgtsB>.005){withdrawal=birthdayWithdrawal(fgtsB);fgtsB-=withdrawal;fgtsInjected+=withdrawal;addLot(lotsB,withdrawal,month,'FGTS reinvestido')}
      const a=snapshot(lotsA,month),b=snapshot(lotsB,month),totalA=a.net+fgtsA,totalB=b.net+fgtsB,inflationFactor=Math.pow(1+inflationRate,month);
      rows.push({mes:month,ano_simulacao:year,mes_do_ano:moy,aporte_mensal_usuario:monthly,decimo_terceiro:thirteenth,plr,aporte_usuario_total_mes:userMonth,deposito_fgts_mensal:fgtsMonthlyDeposit,saque_fgts_cenario_b:withdrawal,fgts_a:fgtsA,fgts_b:fgtsB,carteira_bruta_a:a.gross,carteira_bruta_b:b.gross,ir_estimado_a:a.tax,ir_estimado_b:b.tax,carteira_liquida_a:a.net,carteira_liquida_b:b.net,patrimonio_total_a:totalA,patrimonio_total_b:totalB,patrimonio_real_a:totalA/inflationFactor,patrimonio_real_b:totalB/inflationFactor});
    }
    const a=snapshot(lotsA,p.period_months),b=snapshot(lotsB,p.period_months),totalA=a.net+fgtsA,totalB=b.net+fgtsB,delta=totalB-totalA,deltaPct=Math.abs(totalA)>1e-12?delta/totalA*100:0,finalInflation=Math.pow(1+n(p.inflation_annual_pct)/100,p.period_months/12);
    const scenarioA={total_user_contributed:userTotal,total_fgts_deposited:fgtsDeposited,total_fgts_injected:0,fgts_remaining:fgtsA,portfolio_gross:a.gross,ir_withheld:a.tax,portfolio_net:a.net,consolidated_total:totalA,real_consolidated_total:totalA/finalInflation,gross_portfolio_gain:a.gain};
    const scenarioB={total_user_contributed:userTotal,total_fgts_deposited:fgtsDeposited,total_fgts_injected:fgtsInjected,fgts_remaining:fgtsB,portfolio_gross:b.gross,ir_withheld:b.tax,portfolio_net:b.net,consolidated_total:totalB,real_consolidated_total:totalB/finalInflation,gross_portfolio_gain:b.gain};
    return {params:p,scenario_a:scenarioA,scenario_b:scenarioB,delta_value:delta,delta_pct:deltaPct,portfolio_real_rate_pct:fisherRealRate(p.portfolio_annual_rate_pct,p.inflation_annual_pct),fgts_real_rate_pct:fisherRealRate(p.fgts_annual_rate_pct,p.inflation_annual_pct),fgts_monthly_deposit_rate_pct:FGTS_MONTHLY_DEPOSIT_RATE*100,rows};
  }

  function comparisonRows(result){const a=result.scenario_a,b=result.scenario_b;return [['Total aportado pelo usuário',a.total_user_contributed,b.total_user_contributed],['Depósitos do empregador no FGTS',a.total_fgts_deposited,b.total_fgts_deposited],['Total reinvestido do saque FGTS',a.total_fgts_injected,b.total_fgts_injected],['Saldo FGTS restante',a.fgts_remaining,b.fgts_remaining],['Carteira bruta',a.portfolio_gross,b.portfolio_gross],['IR retido estimado',a.ir_withheld,b.ir_withheld],['Carteira líquida',a.portfolio_net,b.portfolio_net],['Patrimônio total consolidado',a.consolidated_total,b.consolidated_total],['Patrimônio real (poder de compra)',a.real_consolidated_total,b.real_consolidated_total]]}
  function rowsToCsv(rows){const cols=['mes','ano_simulacao','mes_do_ano','aporte_mensal_usuario','decimo_terceiro','plr','aporte_usuario_total_mes','deposito_fgts_mensal','saque_fgts_cenario_b','fgts_a','fgts_b','carteira_bruta_a','carteira_bruta_b','ir_estimado_a','ir_estimado_b','carteira_liquida_a','carteira_liquida_b','patrimonio_total_a','patrimonio_total_b','patrimonio_real_a','patrimonio_real_b'];return cols.join(';')+'\n'+rows.map(r=>cols.map(c=>typeof r[c]==='number'?String(Math.round(r[c]*100)/100).replace('.',','):String(r[c]??'')).join(';')).join('\n')}

  root.fgtsAnnualToMonthlyRate=annualToMonthlyRate;
  root.fgtsIrRate=fixedIncomeIrRate;
  root.fgtsBirthdayWithdrawal=birthdayWithdrawal;
  root.fgtsFisherRealRate=fisherRealRate;
  root.simulateFgtsComparisonJS=simulate;
  root.fgtsComparisonRows=comparisonRows;
  root.fgtsRowsToCsv=rowsToCsv;
  if(typeof module!=='undefined'&&module.exports)module.exports={annualToMonthlyRate,fixedIncomeIrRate,birthdayWithdrawal,fisherRealRate,simulate,comparisonRows,rowsToCsv};
})(typeof globalThis!=='undefined'?globalThis:this);
