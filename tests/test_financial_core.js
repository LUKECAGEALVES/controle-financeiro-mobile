'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const data = {
  transactions: [], goals: [], accounts: [], investments: [], debts: [], recurring: [], cards: [],
  budget: {}, reserve: {current: 0, months: 6}, settings: {monthlyIncome: 0}, importedFiles: [], scenarios: [],
  desktopExtra: {},
};
const context = {
  console, data, state: {meta: {}}, Date, Math, Number, String, Object, Array, Set, Map, JSON,
  save() {}, uid: (() => {let n=0; return () => `id-${++n}`})(), isoToday: () => '2026-09-13',
  nowIso: () => '2026-09-13T12:00:00Z', escapeHtml: String,
  num(raw) {
    const value = Number(String(raw ?? 0).replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
  },
};
vm.createContext(context);
const source = fs.readFileSync(path.join(__dirname, '..', 'parity-core.js'), 'utf8');
vm.runInContext(source, context, {filename: 'parity-core.js'});

const tests = {
  'arredondamento monetário negativo é simétrico'() {
    assert.strictEqual(context.moneyRound(-1.005), -1.01);
    assert.strictEqual(context.moneyRound(1.005), 1.01);
  },
  'tipos legados preservam o sinal econômico'() {
    assert.strictEqual(context.signedAmount({type: 'Entrada', amount: 20}), 20);
    assert.strictEqual(context.signedAmount({type: 'Saída', amount: 20}), -20);
    assert.strictEqual(context.signedAmount({amount: -20}), -20);
  },
  'taxa anual é convertida por equivalência composta'() {
    const result = context.simulateInvestmentJS({initial: 1000, years: 1, rate: 0, fee: 12, tax: 0, inflation: 0});
    assert.ok(Math.abs(result.net - 880) < 1e-8, result.net);
    assert.ok(Math.abs(result.real_net - 880) < 1e-8, result.real_net);
  },
  'valor real usa os meses efetivamente simulados'() {
    const result = context.simulateInvestmentJS({initial: 1000, years: 1.04, rate: 0, fee: 0, tax: 0, inflation: 10});
    assert.strictEqual(result.years, 1);
    assert.ok(Math.abs(result.real_net - 1000 / 1.10) < 1e-8, result.real_net);
  },
  'histórico complementar não duplica lançamentos detalhados'() {
    data.desktopExtra.categories = [{name: 'Alimentação', group_name: 'Despesa', essential: true, active: true}];
    data.transactions = [{date: '2026-09-05', type: 'expense', amount: 70, category: 'Alimentação', impactBudget: true}];
    data.desktopExtra.historicalSummary = [{year: 2026, month: 9, category: 'Alimentação', amount: 100}];
    const metrics = context.periodMetrics(2026, 9);
    assert.strictEqual(metrics.expense, 100);
    assert.strictEqual(metrics.historical_expense_added, 30);
  },
};

for (const test of Object.values(tests)) test();
console.log(`${Object.keys(tests).length}/${Object.keys(tests).length} testes financeiros gerais JS OK`);
