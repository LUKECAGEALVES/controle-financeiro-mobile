/* Controle Financeiro Mobile v0.7.2 — camada de paridade com desktop v7.2
 * Esta camada não substitui nem converte os dados existentes. Ela apenas
 * adiciona UI, filtros e cálculos equivalentes aos serviços do desktop.
 */

function parityEnsureData(){
  data.desktopExtra=(data.desktopExtra&&typeof data.desktopExtra==='object')?data.desktopExtra:{};
  const ex=data.desktopExtra;
  for(const k of ['budgetRecords','categories','rules','historicalSummary','historicalIncome','reconciliations','auditLog','trash','restoreTrashRequests','deletedScenarioNames']){
    if(!Array.isArray(ex[k]))ex[k]=[];
  }
  ex.diagnostics=(ex.diagnostics&&typeof ex.diagnostics==='object')?ex.diagnostics:{};
  ex.desktopSettings=(ex.desktopSettings&&typeof ex.desktopSettings==='object')?ex.desktopSettings:{};
  data.settings={monthlyIncome:0,monthlyInvestmentGoal:0,essentialBase:0,userName:'Usuário',theme:'light',autosave:true,backupRetention:12,...(data.settings||{})};
  data.reserve={current:0,months:6,...(data.reserve||{})};
  state.meta.version='0.7.2';
  state.meta.uiFilters=(state.meta.uiFilters&&typeof state.meta.uiFilters==='object')?state.meta.uiFilters:{};
  state.meta.uiSearch=(state.meta.uiSearch&&typeof state.meta.uiSearch==='object')?state.meta.uiSearch:{};
  save();
}
parityEnsureData();

function signedAmount(tx){return Math.abs(Number(tx?.amount||0))*(tx?.type==='income'?1:-1)}
function boolish(v,def=false){if(v===undefined||v===null)return def;if(v===true||v===1||v==='1'||String(v).toLowerCase()==='true'||String(v).toLowerCase()==='sim')return true;if(v===false||v===0||v==='0'||String(v).toLowerCase()==='false'||String(v).toLowerCase()==='não'||String(v).toLowerCase()==='nao')return false;return def}
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v||0)))}
function monthName(m){return ['Todos os meses','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][Number(m)||0]||'Todos os meses'}
function isoMonthKey(y,m){return `${Number(y)}-${String(Number(m)).padStart(2,'0')}`}
function parseJsonMaybe(v,def={}){if(v&&typeof v==='object')return v;try{return JSON.parse(v||'{}')}catch{return def}}
function nowLocalIso(){const d=new Date(),pad=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function addMonthsIso(iso,n){const [y,m,d]=String(iso).split('-').map(Number);let yy=y,mm=m+n;while(mm>12){yy++;mm-=12}while(mm<1){yy--;mm+=12}const last=new Date(yy,mm,0).getDate();return `${yy}-${String(mm).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`}
function csvEscape(v){const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function downloadText(name,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);a.remove()}

function categoryRows(activeOnly=false){
  const rows=(data.desktopExtra?.categories||[]).map(x=>({...x,essential:boolish(x.essential),active:boolish(x.active,true)}));
  if(rows.length)return activeOnly?rows.filter(x=>x.active):rows;
  const known=new Set([...Object.keys(data.budget||{}),...(data.transactions||[]).map(x=>x.category).filter(Boolean)]);
  return [...known].sort().map(name=>({name,group_name:['Recebimentos','Renda','Estornos'].includes(name)?'Receita':name==='Investimentos'?'Investimento':name==='Transferência entre contas'?'Neutro':'Despesa',essential:false,active:true}));
}
function categoryByName(name){return categoryRows(false).find(x=>x.name===name)||{name,group_name:['Recebimentos','Renda','Estornos'].includes(name)?'Receita':name==='Investimentos'?'Investimento':name==='Transferência entre contas'?'Neutro':'Outros',essential:false,active:true}}
function categoryNames(includeInactive=false){return categoryRows(!includeInactive).map(x=>x.name).sort((a,b)=>a.localeCompare(b,'pt-BR'))}
function uniqueValues(items,key){return [...new Set((items||[]).map(x=>String(typeof key==='function'?key(x):x?.[key]??'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'))}
function availableYears(){
  const ys=new Set([new Date().getFullYear()]);
  for(const t of data.transactions||[]){const y=Number(String(t.date||'').slice(0,4));if(y)ys.add(y)}
  for(const h of data.desktopExtra?.historicalSummary||[]){if(Number(h.year))ys.add(Number(h.year))}
  for(const h of data.desktopExtra?.historicalIncome||[]){if(Number(h.year))ys.add(Number(h.year))}
  for(const b of data.desktopExtra?.budgetRecords||[]){if(Number(b.year))ys.add(Number(b.year))}
  return [...ys].sort((a,b)=>b-a);
}
function latestPeriod(){
  const candidates=[];
  for(const t of data.transactions||[]){if(/^\d{4}-\d{2}/.test(t.date||''))candidates.push([Number(t.date.slice(0,4)),Number(t.date.slice(5,7))])}
  for(const h of data.desktopExtra?.historicalSummary||[]){if(Number(h.year)&&Number(h.month))candidates.push([Number(h.year),Number(h.month)])}
  for(const h of data.desktopExtra?.historicalIncome||[]){if(Number(h.year)&&Number(h.month))candidates.push([Number(h.year),Number(h.month)])}
  if(!candidates.length){const d=new Date();return {year:d.getFullYear(),month:d.getMonth()+1}}
  candidates.sort((a,b)=>b[0]-a[0]||b[1]-a[1]);return {year:candidates[0][0],month:candidates[0][1]};
}
function inPeriod(tx,year,month){
  if(!tx?.date)return false;const y=Number(tx.date.slice(0,4)),m=Number(tx.date.slice(5,7));
  return (!year||year==='Todos'||Number(year)===y)&&(!month||Number(month)===m);
}
function historicalPeriodUsed(year,month,granularMonths){
  const match=h=>(!year||year==='Todos'||Number(h.year)===Number(year))&&(!month||Number(h.month)===Number(month))&&!granularMonths.has(isoMonthKey(h.year,h.month));
  return (data.desktopExtra?.historicalSummary||[]).some(match)||(data.desktopExtra?.historicalIncome||[]).some(match);
}
function flowClassification(t){
  const a=signedAmount(t),cat=String(t?.category||'Outros').trim()||'Outros',meta=categoryByName(cat),group=String(meta.group_name||'Outros').trim().toLowerCase();
  const own=boolish(t?.ownTransfer,false),impact=boolish(t?.impactBudget,true),catLow=cat.toLowerCase();
  if(own||['neutro','neutral'].includes(group)||['transferência entre contas','transferencia entre contas'].includes(catLow))return {kind:'neutral',value:Math.abs(a),cat};
  if(['investimento','investment'].includes(group)||cat==='Investimentos'||cat==='Resgate de investimento'){
    if(a<0)return {kind:'investment',value:-a,cat};
    if(a>0)return {kind:'withdrawal',value:a,cat};
    return {kind:'neutral',value:0,cat};
  }
  if(a>0)return {kind:'income',value:a,cat};
  if(a<0&&impact)return {kind:'expense',value:-a,cat};
  return {kind:'neutral',value:Math.abs(a),cat};
}
function periodMetrics(year='Todos',month=0){
  const tx=(data.transactions||[]).filter(t=>inPeriod(t,year,month));
  const granular=new Set(tx.filter(t=>/^\d{4}-\d{2}/.test(t.date||'')).map(t=>String(t.date).slice(0,7)));
  let income=0,expense=0,investments=0,withdrawals=0,essential=0,discretionary=0;const categories={};
  for(const t of tx){
    const {kind,value,cat}=flowClassification(t);
    if(kind==='income')income+=value;
    else if(kind==='expense'){
      expense+=value;categories[cat]=(categories[cat]||0)+value;
      if(boolish(categoryByName(cat).essential,false))essential+=value;else discretionary+=value;
    }else if(kind==='investment')investments+=value;
    else if(kind==='withdrawal')withdrawals+=value;
  }
  for(const h of data.desktopExtra?.historicalSummary||[]){
    const y=Number(h.year),m=Number(h.month);if((year&&year!=='Todos'&&Number(year)!==y)||(month&&Number(month)!==m)||granular.has(isoMonthKey(y,m)))continue;
    const cat=h.category||'Outros',v=Number(h.amount||0);expense+=v;categories[cat]=(categories[cat]||0)+v;if(boolish(categoryByName(cat).essential,false))essential+=v;else discretionary+=v;
  }
  for(const h of data.desktopExtra?.historicalIncome||[]){
    const y=Number(h.year),m=Number(h.month);if((year&&year!=='Todos'&&Number(year)!==y)||(month&&Number(month)!==m)||granular.has(isoMonthKey(y,m)))continue;income+=Number(h.amount||0);
  }
  const balance=income-expense;
  const sorted=Object.fromEntries(Object.entries(categories).sort((a,b)=>b[1]-a[1]));
  return {income,expense,balance,investments,withdrawals,savings_rate:income?balance/income*100:0,investment_rate:income?investments/income*100:0,essential,discretionary,categories:sorted,transactions:tx.length,historical_used:historicalPeriodUsed(year,month,granular)};
}
function flowTotals(year,month){const m=periodMetrics(year,month);return {income:m.income,expense:m.expense,balance:m.balance,investmentContrib:m.investments,withdrawals:m.withdrawals}}
function monthlySeries(year){const y=Number(year)||latestPeriod().year;return Array.from({length:12},(_,i)=>{const d=periodMetrics(y,i+1);return {month:i+1,income:d.income,expense:d.expense,balance:d.balance,investments:d.investments}})}
function debtSummary(){const rows=(data.debts||[]).filter(x=>String(x.status||'EM ABERTO').toUpperCase()!=='QUITADA'&&Number(x.balance||0)>0.005),original=rows.reduce((a,x)=>a+Number(x.original||0),0),balance=rows.reduce((a,x)=>a+Number(x.balance||0),0),monthly=rows.reduce((a,x)=>a+Number(x.payment||0),0),inc=Number(data.settings.monthlyIncome||0);return {balance,monthly,original,paid:Math.max(0,original-balance),count:rows.length,commitment:inc?monthly/inc*100:0}}
function investmentCost(a){return String(a.kind||'').toLowerCase()==='renda fixa'?Number(a.invested||0):Number(a.quantity||0)*Number(a.avgPrice||0)}
function investmentMarket(a){return String(a.kind||'').toLowerCase()==='renda fixa'?Number(a.current||0):Number(a.quantity||0)*Number(a.currentPrice||0)}
function investmentSummary(){const aa=data.investments||[],market=aa.reduce((s,a)=>s+investmentMarket(a),0),cost=aa.reduce((s,a)=>s+investmentCost(a),0),income=aa.reduce((s,a)=>s+(a.incomeHistory||[]).reduce((q,h)=>q+Number(h.amount||0),0),0),allocation={};for(const a of aa)allocation[a.type||'Outros']=(allocation[a.type||'Outros']||0)+investmentMarket(a);return {market,cost,gain:market-cost,gain_pct:cost?(market-cost)/cost*100:0,income,allocation,count:aa.length}}
function networthSummary(){const accounts=(data.accounts||[]).filter(a=>a.include!==false&&a.active!==false).reduce((s,a)=>s+Number(a.balance||0),0),investments=investmentSummary().market,debts=debtSummary().balance;return {accounts,investments,debts,networth:accounts+investments-debts,reserve_reference:Number(data.reserve.current||0)}}
function emergencyReserve(){
  const months=Math.max(1,Number(data.reserve.months||6)),current=Number(data.reserve.current||0),vals=[];let {year,month}=latestPeriod();
  for(let i=0;i<12&&vals.length<6;i++){const d=periodMetrics(year,month);if(d.essential>0)vals.push(d.essential);month--;if(month===0){month=12;year--}}
  const base=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:Number(data.settings.essentialBase||0),target=base*months;
  return {months,current,monthly_base:base,target,missing:Math.max(0,target-current),progress:target?current/target*100:0};
}
function reserveSummary(){const r=emergencyReserve();return {base:r.monthly_base,target:r.target,current:r.current,missing:r.missing,progress:r.progress}}
function totals(){const p=latestPeriod(),flow=flowTotals(p.year,p.month),nw=networthSummary();return {...flow,accounts:nw.accounts,investments:nw.investments,debts:nw.debts,networth:nw.networth,period:p}}
function budgetMap(year,month){
  const y=Number(year),m=Number(month),out={};
  for(const r of data.desktopExtra?.budgetRecords||[]){if(Number(r.year)===y&&Number(r.month)===m)out[r.category]=Number(r.amount||0)}
  const now=new Date();if(y===now.getFullYear()&&m===now.getMonth()+1&&Object.keys(out).length===0)Object.assign(out,data.budget||{});
  return out;
}
function budgetRows(year,month){const spending=periodMetrics(year,month).categories,bud=budgetMap(year,month),rows=[];for(const c of categoryRows(true)){if(['Receita','Investimento','Neutro'].includes(c.group_name))continue;const b=Number(bud[c.name]||0),s=Number(spending[c.name]||0),used=b?s/b*100:0,status=b<=0?'Sem orçamento':s>b?'Estourado':used>=80?'Atenção':'OK';rows.push({category:c.name,budget:b,spent:s,balance:b-s,used,status,essential:boolish(c.essential)})}return rows}
function budgetRowsAllMonths(year){const merged={};for(let m=1;m<=12;m++){for(const r of budgetRows(year,m)){if(!merged[r.category])merged[r.category]={category:r.category,budget:0,spent:0,essential:r.essential};merged[r.category].budget+=Number(r.budget||0);merged[r.category].spent+=Number(r.spent||0)}}return Object.values(merged).map(r=>{const used=r.budget?r.spent/r.budget*100:0,status=r.budget<=0?'Sem orçamento':r.spent>r.budget?'Estourado':used>=80?'Atenção':'OK';return {...r,balance:r.budget-r.spent,used,status}})}
function setBudgetRecord(year,month,category,amount){const ex=data.desktopExtra;let r=ex.budgetRecords.find(x=>Number(x.year)===Number(year)&&Number(x.month)===Number(month)&&x.category===category);if(r)r.amount=Number(amount||0);else ex.budgetRecords.push({id:uid(),year:Number(year),month:Number(month),category,amount:Number(amount||0)});const d=new Date();if(Number(year)===d.getFullYear()&&Number(month)===d.getMonth()+1)data.budget[category]=Number(amount||0)}
function recurringMonthlyValue(r){const a=Number(r.amount||0);return r.frequency==='Semanal'?a*4.33:r.frequency==='Anual'?a/12:a}
function recurringSummary(){const rows=(data.recurring||[]).filter(x=>x.active!==false),monthly=rows.reduce((s,x)=>s+recurringMonthlyValue(x),0),essential=rows.filter(x=>boolish(x.essential)).reduce((s,x)=>s+recurringMonthlyValue(x),0);return {monthly,essential,count:rows.length}}
function monthlyRecurring(){return recurringSummary().monthly}
function categorySpent(cat,year=null,month=null){const p=year?{year,month}:latestPeriod();return Number(periodMetrics(p.year,p.month).categories[cat]||0)}
function dashboardComposition(year,month){const d=periodMetrics(year,month),ds=debtSummary(),nw=networthSummary();return {'Receitas':[['Movimentações e histórico',d.income]],'Gastos':Object.entries(d.categories),'Saldo do período':[['Receitas',d.income],['Gastos',-d.expense]],'Aportes':[['Aportes identificados',d.investments]],'Saldo de dívidas':(data.debts||[]).filter(x=>String(x.status||'EM ABERTO').toUpperCase()!=='QUITADA'&&Number(x.balance||0)>0.005).map(x=>[x.item,Number(x.balance||0)]),'Patrimônio líquido':[['Contas',nw.accounts],['Investimentos',nw.investments],['Dívidas',-ds.balance]]}}
function annualReport(year){const series=monthlySeries(year);return {series,income:series.reduce((s,x)=>s+x.income,0),expense:series.reduce((s,x)=>s+x.expense,0),balance:series.reduce((s,x)=>s+x.balance,0),investments:series.reduce((s,x)=>s+x.investments,0)}}
function topDescriptions(year,month=0,limit=15){const agg={};for(const r of data.transactions||[]){if(!inPeriod(r,year,month))continue;const a=signedAmount(r);if(a<0&&boolish(r.impactBudget,true)&&!boolish(r.ownTransfer)&&r.category!=='Investimentos'){const k=String(r.description||'').slice(0,70);agg[k]=(agg[k]||0)+(-a)}}return Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,limit)}
function financialHealth(){
  let {year,month}=latestPeriod(),recent=[];const ly=year,lm=month;
  for(let i=0;i<6;i++){const d=periodMetrics(year,month);if(d.income>0||d.expense>0)recent.push(d);month--;if(month===0){month=12;year--}}
  const avgIncome=recent.length?recent.reduce((s,x)=>s+x.income,0)/recent.length:Number(data.settings.monthlyIncome||0),avgExpense=recent.length?recent.reduce((s,x)=>s+x.expense,0)/recent.length:0,avgEssential=recent.length?recent.reduce((s,x)=>s+x.essential,0)/recent.length:0,current=periodMetrics(ly,lm),debt=debtSummary(),reserve=emergencyReserve(),nw=networthSummary();
  const savingsRate=avgIncome?(avgIncome-avgExpense)/avgIncome*100:0,debtCommit=avgIncome?debt.monthly/avgIncome*100:0,reserveMonths=avgEssential?reserve.current/avgEssential:0,essentialPct=avgIncome?avgEssential/avgIncome*100:0,alerts=[];
  if(savingsRate<0)alerts.push(['Crítico','Seus gastos médios estão acima da renda média.']);else if(savingsRate<10)alerts.push(['Atenção','Sua taxa média de poupança está abaixo de 10%.']);
  if(debtCommit>30)alerts.push(['Atenção',`Parcelas de dívidas comprometem ${debtCommit.toFixed(1).replace('.',',')}% da renda média.`]);
  if(reserveMonths<3&&avgEssential>0)alerts.push(['Prioridade',`Sua reserva cobre cerca de ${reserveMonths.toFixed(1).replace('.',',')} mês(es) de gastos essenciais.`]);
  if(recent.length){for(const [cat,val] of Object.entries(current.categories).slice(0,8)){const hist=recent.slice(1).map(x=>Number(x.categories[cat]||0)).filter(x=>x>0);if(hist.length){const avg=hist.reduce((a,b)=>a+b,0)/hist.length;if(val>avg*1.25){alerts.push(['Variação',`${cat}: gasto do mês está ${Math.round((val/avg-1)*100)}% acima da média recente.`]);break}}}}
  if(!alerts.length)alerts.push(['Bom','Os principais indicadores estão dentro de faixas confortáveis para o seu histórico.']);
  let score=100;if(savingsRate<0)score-=35;else if(savingsRate<10)score-=20;else if(savingsRate<20)score-=10;if(debtCommit>40)score-=30;else if(debtCommit>30)score-=20;else if(debtCommit>20)score-=10;if(reserveMonths<1)score-=25;else if(reserveMonths<3)score-=15;else if(reserveMonths<6)score-=5;score=clamp(score,0,100);
  return {score,avg_income:avgIncome,avg_expense:avgExpense,savings_rate:savingsRate,debt_commitment:debtCommit,reserve_months:reserveMonths,essential_pct:essentialPct,networth:nw.networth,alerts,period:`${monthName(lm)}/${ly}`};
}
function healthSummary(){const h=financialHealth();return {score:h.score,saveRate:h.savings_rate,debtCommit:h.debt_commitment,reserveMonths:h.reserve_months,networth:h.networth,essentialPct:h.essential_pct,avgIncome:h.avg_income,alerts:h.alerts}}
function calculatedAccountBalance(account,referenceDate){const a=(data.accounts||[]).find(x=>x.name===account);if(!a)return 0;const opening=a.openingDate||isoToday();if(referenceDate<opening)return Number(a.balance||0);let total=Number(a.openingBalance||0);for(const t of data.transactions||[]){if(t.account===account&&String(t.date||'')>opening&&String(t.date||'')<=referenceDate)total+=signedAmount(t)}return Math.round(total*100)/100}

// ----- filtros universais -----
var PARITY_FILTER_DEFAULTS={
  dashboard:{year:String(latestPeriod().year),month:String(latestPeriod().month)},
  transactions:{year:'Todos',month:'0',type:'all',category:'Todas',account:'Todas',impact:'Todos',own:'Todos'},
  budget:{year:String(latestPeriod().year),month:String(latestPeriod().month),status:'Todos',category:'Todas'},
  recurring:{status:'Todos',category:'Todas',essential:'Todos',frequency:'Todas',account:'Todas'},
  debts:{status:'Todos',creditor:'Todos',debtType:'Todos',priority:'Todos'},
  investments:{kind:'Todos',assetClass:'Todos',institution:'Todos'},
  goals:{status:'Todos',type:'Todos',priority:'Todos',deadline:'Todos'},
  networth:{institution:'Todos',type:'Todos',include:'Todos'},
  cards:{bank:'Todos',card:'Todos',installmentStatus:'Todos',year:'Todos',month:'0'},
  reports:{year:String(latestPeriod().year),month:'0'},
  imports:{status:'Todos'},
  audit:{module:'Todos',action:'Todos'},
};
function getFilters(module){return {...(PARITY_FILTER_DEFAULTS[module]||{}),...(state.meta.uiFilters?.[module]||{})}}
function setFilters(module,obj){state.meta.uiFilters[module]={...(state.meta.uiFilters[module]||{}),...obj};save()}
function resetFilters(module){state.meta.uiFilters[module]={...(PARITY_FILTER_DEFAULTS[module]||{})};save();render()}
function filterCount(module){const f=getFilters(module),d=PARITY_FILTER_DEFAULTS[module]||{};return Object.keys(f).filter(k=>String(f[k])!==String(d[k])).length}
function chipLabel(k,v){const names={year:'Ano',month:'Mês',type:'Tipo',category:'Categoria',account:'Conta',impact:'Orçamento',own:'Transferência',status:'Status',essential:'Essencial',frequency:'Frequência',creditor:'Credor',debtType:'Tipo',priority:'Prioridade',kind:'Modalidade',assetClass:'Classe',institution:'Instituição',deadline:'Prazo',include:'Patrimônio',bank:'Banco',card:'Cartão',installmentStatus:'Parcelas',module:'Módulo',action:'Ação'};return `${names[k]||k}: ${k==='month'?monthName(v):v}`}
function filterBar(module){const f=getFilters(module),d=PARITY_FILTER_DEFAULTS[module]||{},active=Object.entries(f).filter(([k,v])=>String(v)!==String(d[k]));return `<div class="filter-bar"><button class="filter-btn" onclick="openFilters('${module}')">☷ Filtros${filterCount(module)?` <span>${filterCount(module)}</span>`:''}</button>${active.length?`<div class="filter-chips">${active.map(([k,v])=>`<button class="filter-chip" onclick="clearOneFilter('${module}','${k}')">${escapeHtml(chipLabel(k,v))} ×</button>`).join('')}<button class="filter-clear" onclick="resetFilters('${module}')">Limpar</button></div>`:'<div class="muted small">Nenhum filtro adicional ativo</div>'}</div>`}
function clearOneFilter(module,key){const d=PARITY_FILTER_DEFAULTS[module]||{};setFilters(module,{[key]:d[key]??'Todos'});render()}
function optionsHtml(values,current,allLabel='Todos'){const arr=[...values];return (allLabel!==null?`<option value="Todos" ${String(current)==='Todos'?'selected':''}>${escapeHtml(allLabel)}</option>`:'')+arr.map(v=>`<option value="${escapeHtml(v)}" ${String(current)===String(v)?'selected':''}>${escapeHtml(v)}</option>`).join('')}
function yearOptions(current,allowAll=true){return (allowAll?`<option value="Todos" ${String(current)==='Todos'?'selected':''}>Todos</option>`:'')+availableYears().map(y=>`<option value="${y}" ${String(current)===String(y)?'selected':''}>${y}</option>`).join('')}
function monthOptions(current,allowAll=true){return (allowAll?`<option value="0" ${String(current)==='0'?'selected':''}>Todos os meses</option>`:'')+Array.from({length:12},(_,i)=>i+1).map(m=>`<option value="${m}" ${String(current)===String(m)?'selected':''}>${monthName(m)}</option>`).join('')}
function filterField(id,label,html){return `<label>${label}</label>${html.replace('class="field"',`class="field" id="pf_${id}"`)}`}
function openFilters(module){
  const f=getFilters(module);let body='';
  const select=(id,label,opts)=>{body+=filterField(id,label,`<select class="field">${opts}</select>`)};
  if(['dashboard','transactions','budget','reports','cards'].includes(module)){select('year','Ano',yearOptions(f.year,module!=='budget'&&module!=='dashboard'));select('month','Mês',monthOptions(f.month,true))}
  if(module==='transactions'){select('type','Tipo',optionsHtml(['income','expense'],f.type,'Todos').replace('>income<','>Receitas<').replace('>expense<','>Despesas<'));select('category','Categoria',optionsHtml(categoryNames(true),f.category));select('account','Conta',optionsHtml(uniqueValues(data.accounts,'name'),f.account));select('impact','Impacta orçamento',optionsHtml(['Sim','Não'],f.impact));select('own','Transferência própria',optionsHtml(['Sim','Não'],f.own))}
  if(module==='budget'){select('status','Status',optionsHtml(['OK','Atenção','Estourado','Sem orçamento'],f.status));select('category','Categoria',optionsHtml(categoryNames(true),f.category))}
  if(module==='recurring'){select('status','Status',optionsHtml(['Ativa','Pausada'],f.status));select('category','Categoria',optionsHtml(categoryNames(true),f.category));select('essential','Essencial',optionsHtml(['Sim','Não'],f.essential));select('frequency','Frequência',optionsHtml(['Mensal','Semanal','Anual'],f.frequency));select('account','Conta',optionsHtml(uniqueValues(data.recurring,'account'),f.account))}
  if(module==='debts'){select('status','Status',optionsHtml(uniqueValues(data.debts,x=>x.status||'EM ABERTO'),f.status));select('creditor','Credor',optionsHtml(uniqueValues(data.debts,'creditor'),f.creditor));select('debtType','Tipo',optionsHtml(uniqueValues(data.debts,'debtType'),f.debtType));select('priority','Prioridade',optionsHtml(['1','2','3','4','5'],f.priority))}
  if(module==='investments'){select('kind','Modalidade',optionsHtml(['Renda fixa','Renda variável'],f.kind));select('assetClass','Classe',optionsHtml(uniqueValues(data.investments,'type'),f.assetClass));select('institution','Instituição',optionsHtml(uniqueValues(data.investments,'institution'),f.institution))}
  if(module==='goals'){select('status','Status',optionsHtml(['Em andamento','Concluída','Atrasada'],f.status));select('type','Tipo',optionsHtml(uniqueValues(data.goals,'type'),f.type));select('priority','Prioridade',optionsHtml(['1','2','3','4','5'],f.priority));select('deadline','Prazo',optionsHtml(['Com prazo','Sem prazo','Vencidas'],f.deadline))}
  if(module==='networth'){select('institution','Instituição',optionsHtml(uniqueValues(data.accounts,'institution'),f.institution));select('type','Tipo',optionsHtml(uniqueValues(data.accounts,'type'),f.type));select('include','Inclui no patrimônio',optionsHtml(['Sim','Não'],f.include))}
  if(module==='cards'){select('bank','Banco',optionsHtml(uniqueValues(data.cards,'bank'),f.bank));select('card','Cartão',optionsHtml(uniqueValues(data.cards,'name'),f.card));select('installmentStatus','Parcelas',optionsHtml(['Aberto','Pago','Vencido'],f.installmentStatus))}
  if(module==='imports'){select('status','Status',optionsHtml(uniqueValues(data.importedFiles,x=>x.status||'Concluído'),f.status))}
  if(module==='audit'){select('module','Módulo',optionsHtml(uniqueValues(data.desktopExtra?.auditLog,x=>x.table_name),f.module));select('action','Ação',optionsHtml(uniqueValues(data.desktopExtra?.auditLog,x=>x.action),f.action))}
  openModal(`<div class="sheet-handle"></div><div class="sheet-title">Filtros</div><div class="sheet-sub">Os filtros ficam salvos neste aparelho.</div>${body}<div class="sheet-footer"><button class="secondary" onclick="resetFilters('${module}');closeModal()">Limpar</button><button class="primary" onclick="applyFiltersFromSheet('${module}')">Aplicar filtros</button></div>`);
}
function applyFiltersFromSheet(module){const obj={};modalHost.querySelectorAll('[id^="pf_"]').forEach(el=>obj[el.id.slice(3)]=el.value);setFilters(module,obj);closeModal();render()}

function kpiHtml(label,value,sub='',tone=''){return `<div class="kpi ${tone}"><div class="kpi-label">${escapeHtml(label)}</div><div class="kpi-value">${value}</div>${sub?`<div class="small muted" style="margin-top:5px">${sub}</div>`:''}</div>`}
function infoRows(rows){return `<div class="info-list">${rows.map(([a,b])=>`<div class="info-row"><span>${escapeHtml(a)}</span><strong>${b}</strong></div>`).join('')}</div>`}
function simpleBars(entries,maxN=8){const arr=entries.slice(0,maxN),max=Math.max(1,...arr.map(x=>Number(x[1]||0)));return arr.length?arr.map(([n,v])=>`<div class="metric-bar"><div class="row-between"><span>${escapeHtml(n)}</span><strong>${fmt(v)}</strong></div><div class="progress blue"><div style="width:${Math.min(100,Number(v||0)/max*100)}%"></div></div></div>`).join(''):'<div class="empty">Sem dados no período.</div>'}
function monthlyBars(series){const max=Math.max(1,...series.flatMap(x=>[x.income,x.expense]));return `<div class="monthly-chart">${series.map(x=>`<div class="month-col"><div class="month-bars"><i class="income-bar" style="height:${Math.max(1,x.income/max*100)}%"></i><i class="expense-bar" style="height:${Math.max(1,x.expense/max*100)}%"></i></div><span>${String(x.month).padStart(2,'0')}</span></div>`).join('')}</div><div class="chart-legend"><span class="income">■ Receitas</span><span class="expense">■ Gastos</span></div>`}

// ----- calculadoras: mesmos modelos do desktop -----
function simulateSavingsGoalJS(p){
  const initial=Math.max(0,num(p.initial)),contribution=Math.max(0,num(p.contribution)),target=Math.max(0,num(p.target)),annual=Math.max(-99.9,num(p.rate)),freq=(p.frequency||'Semanal'),ppy={Semanal:52,Mensal:12,Anual:1}[freq];if(!ppy)throw new Error('Escolha uma frequência válida.');if(target<=0)throw new Error('Informe quanto custa o objetivo.');const sr=Math.pow(1+annual/100,1/ppy)-1;let bal=initial,steps=initial>=target?0:null,invested=initial,points=[{step:0,years:0,balance:initial,invested:initial}];if(steps===null){for(let i=1;i<=ppy*200;i++){bal*=1+sr;bal+=contribution;invested+=contribution;if(i===1||i%Math.max(1,Math.round(ppy/12))===0)points.push({step:i,years:i/ppy,balance:bal,invested});if(bal+1e-9>=target){steps=i;break}if(contribution<=0&&annual<=0)break}}
  const reached=steps!==null,goalYears=reached?steps/ppy:null,goalDays=reached?Math.round(freq==='Semanal'?steps*7:freq==='Mensal'?steps*365.2425/12:steps*365.2425):null,goalDate=reached?new Date(Date.now()+goalDays*86400000):null,goalInvested=reached?initial+contribution*steps:invested;return {target,initial,contribution,frequency:freq,annual_rate:annual,goal_reached:reached,goal_steps:steps,goal_years:goalYears,goal_days:goalDays,goal_label:reached?`${steps} ${freq==='Semanal'?'semana(s)':freq==='Mensal'?'mês(es)':'ano(s)'}`:'Meta não atingida',friendly_detail:reached?`aproximadamente ${goalYears<1?(goalDays+' dias'):(goalYears.toFixed(1).replace('.',',')+' ano(s)')}`:'Aumente o valor guardado ou informe um valor inicial.',goal_date:goalDate?goalDate.toISOString().slice(0,10):'',goal_date_br:goalDate?goalDate.toLocaleDateString('pt-BR'):'—',goal_balance:bal,goal_invested:goalInvested,goal_interest:reached?bal-goalInvested:0,points};
}
function parseOneoffs(s){const out={};for(const it of String(s||'').split(';')){if(!it.includes(':'))continue;const [a,b]=it.split(':',2),m=parseInt(a.trim()),v=Math.max(0,num(b));if(m>0)out[m]=(out[m]||0)+v}return out}
function parseRatePhases(s){const out=[];for(const it of String(s||'').split(';')){if(!it.includes(':'))continue;const [span,raw]=it.split(':',2);let a,b;if(span.includes('-'))[a,b]=span.split('-',2).map(x=>parseInt(x.trim()));else a=b=parseInt(span.trim());if(a&&b)out.push([Math.max(1,a),Math.max(1,b),num(raw)])}return out}
function simulateInvestmentJS(p){
  const initial=Math.max(0,num(p.initial)),years=Math.max(1/12,num(p.years||10)),annual=Math.max(-99.9,num(p.rate||12)),inflation=Math.max(-99,num(p.inflation||4.5)),tax=clamp(num(p.tax),0,100),fee=clamp(num(p.fee),0,100),salary=Math.max(0,num(p.salary)),salaryPct=clamp(num(p.salary_pct),0,100),monthlyFixed=Math.max(0,num(p.monthly)),mode=p.monthly_mode||'Valor fixo',salaryGrowth=Math.max(-99,num(p.salary_growth)),growth=Math.max(-99,num(p.growth)),thFixed=Math.max(0,num(p.thirteenth)),thPct=clamp(num(p.thirteenth_pct??100),0,100),plr=Math.max(0,num(p.plr)),plrPct=clamp(num(p.plr_pct??100),0,100),vacPct=clamp(num(p.vacation_pct),0,100),annualExtra=Math.max(0,num(p.annual_extra)),thMonth=Number(p.thirteenth_month||12),plrMonth=Number(p.plr_month||3),vacMonth=Number(p.vacation_month||1),skip=new Set(String(p.skip_months||'').replace(/;/g,',').split(',').map(x=>parseInt(x.trim())).filter(x=>x>=1&&x<=12)),oneoffs=parseOneoffs(p.oneoffs),phases=parseRatePhases(p.rate_phases),months=Math.max(1,Math.round(years*12));let balance=initial,invested=initial,points=[];
  for(let month=1;month<=months;month++){const yi=Math.floor((month-1)/12),moy=(month-1)%12+1,simYear=yi+1;let curAnnual=annual;for(const [a,b,r] of phases)if(a<=simYear&&simYear<=b){curAnnual=r;break}const mr=Math.pow(1+curAnnual/100,1/12)-1,curSalary=salary*Math.pow(1+salaryGrowth/100,yi),base=mode==='% do salário'?curSalary*salaryPct/100:monthlyFixed*Math.pow(1+growth/100,yi),effective=(1+mr)*(1-fee/100/12)-1;balance*=1+effective;if(!skip.has(moy)){balance+=base;invested+=base}if(moy===thMonth){const x=(thFixed<=0?curSalary:thFixed)*thPct/100;balance+=x;invested+=x}if(moy===plrMonth){const x=plr*plrPct/100;balance+=x;invested+=x}if(moy===vacMonth&&vacPct>0){const x=(curSalary/3)*vacPct/100;balance+=x;invested+=x}if(moy===12&&annualExtra>0){balance+=annualExtra;invested+=annualExtra}if(oneoffs[month]){balance+=oneoffs[month];invested+=oneoffs[month]}const real=inflation>-100?balance/Math.pow(1+inflation/100,month/12):balance;if(month===1||month===months||month%12===0)points.push({month,balance,invested,real})}
  const gross=Math.max(0,balance-invested),taxValue=gross*tax/100,net=Math.max(0,balance-taxValue),realNet=inflation>-100?net/Math.pow(1+inflation/100,years):net,withdrawal=Math.max(0,num(p.withdrawal_rate??0.6))/100;return {net,nominal:balance,real_net:realNet,invested,gross_interest:balance-invested,tax_value:taxValue,monthly_income:net*withdrawal,points,years,annual_rate:annual};
}
function requiredMonthlyForTargetJS(params,target){target=Math.max(0,num(target));if(!target)return 0;let lo=0,hi=Math.max(1000,target/12),p={...params,monthly_mode:'Valor fixo',salary_pct:0};for(let i=0;i<30;i++){p.monthly=hi;if(simulateInvestmentJS(p).net>=target)break;hi*=2}for(let i=0;i<60;i++){const mid=(lo+hi)/2;p.monthly=mid;if(simulateInvestmentJS(p).net>=target)hi=mid;else lo=mid}return hi}
function yearsToTargetJS(params,target,maxYears=80){target=Math.max(0,num(target));if(!target)return 0;let p={...params,years:1/12};if(simulateInvestmentJS(p).net>=target)return 0;p.years=maxYears;if(simulateInvestmentJS(p).net<target)return null;let lo=1/12,hi=maxYears;for(let i=0;i<50;i++){const mid=(lo+hi)/2;p.years=mid;if(simulateInvestmentJS(p).net>=target)hi=mid;else lo=mid}return hi}
function benchmarkComparisonJS(params){const cases=[['Seu cenário',num(params.rate)]],cdi=num(params.cdi_rate),ipca=num(params.ipca_rate),spread=num(params.ipca_spread),fixed=num(params.fixed_reference);if(cdi>0)cases.push(['CDI referência',cdi]);if(ipca||spread)cases.push(['IPCA + taxa',(Math.pow(1+ipca/100,1)*Math.pow(1+spread/100,1)-1)*100]);if(fixed>0)cases.push(['Taxa fixa ref.',fixed]);return cases.map(([name,rate],i)=>{const p={...params,rate};if(i)p.rate_phases='';return {name,rate,result:simulateInvestmentJS(p)}})}
function simulateDebtExtraPaymentJS(d,extra){let bal=Math.max(0,Number(d.balance||0)),pay=Math.max(0,Number(d.payment||0)),ex=Math.max(0,num(extra)),rate=Math.max(0,Number(d.interest||0))/100;if(pay<=0)return {months_before:null,months_after:null,interest_before:0,interest_after:0,saved_interest:0};const sim=start=>{let b=start,months=0,interest=0;while(b>.005&&months<1200){const j=b*rate;interest+=j;b=Math.max(0,b+j-pay);months++;if(rate>0&&pay<=j&&months>24)return [null,null]}return [months,Math.round(interest*100)/100]};const [mb,ib]=sim(bal),[ma,ia]=sim(Math.max(0,bal-ex));return {months_before:mb,months_after:ma,interest_before:ib||0,interest_after:ia||0,saved_interest:Math.round(((ib||0)-(ia||0))*100)/100}}
function monteCarloJS(params,simulations=400,volatilityPct=12){simulations=clamp(Math.round(simulations),100,2000);const vol=Math.max(0,num(volatilityPct))/100,annual=num(params.rate)/100,years=Math.max(1,Math.round(num(params.years||1))),months=years*12,initial=num(params.initial),monthly=num(params.monthly),finals=[];function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}for(let i=0;i<simulations;i++){let bal=initial;for(let m=0;m<months;m++){const r=Math.max(-.95,annual/12+randn()*vol/Math.sqrt(12));bal=Math.max(0,bal*(1+r)+monthly)}finals.push(bal)}finals.sort((a,b)=>a-b);const q=p=>Math.round(finals[Math.min(finals.length-1,Math.max(0,Math.floor((finals.length-1)*p)))]*100)/100;return {p10:q(.1),p50:q(.5),p90:q(.9),simulations,volatility_pct:volatilityPct}}

function cloudPayload(revision){return {schema:'controle-financeiro-sync',schemaVersion:1,revision:Number(revision||0),updatedAt:nowIso(),updatedBy:state.meta.deviceId,meta:{app:'Controle Financeiro Mobile',mobileVersion:'0.7.2'},data}}
