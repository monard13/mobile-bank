import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACCOUNTS,
  createInitialState,
  navigateToView,
  navigateBackFromDetail,
  toggleBalanceVisibility,
  setDetailTab,
  formatAccountDisplayBalance,
} from './bankingState';

test('initial state starts at prelogin with hidden balances', () => {
  const state = createInitialState();
  assert.equal(state.currentView, 'prelogin');
  assert.equal(state.showBalances, false);
  assert.equal(state.selectedAccountId, 'sbp_pen');
  assert.equal(state.activeDetailTab, 'movimientos');
});

test('navigation from home to detalle_cuenta remembers home as previousView', () => {
  let state = createInitialState();
  state = navigateToView(state, 'home');
  assert.equal(state.currentView, 'home');

  state = navigateToView(state, 'detalle_cuenta', 'sbp_pen');
  assert.equal(state.currentView, 'detalle_cuenta');
  assert.equal(state.previousView, 'home');
  assert.equal(state.selectedAccountId, 'sbp_pen');

  state = navigateBackFromDetail(state);
  assert.equal(state.currentView, 'home');
});

test('navigation from productos to detalle_cuenta remembers productos as previousView', () => {
  let state = createInitialState();
  state = navigateToView(state, 'home');
  state = navigateToView(state, 'productos');
  assert.equal(state.currentView, 'productos');

  state = navigateToView(state, 'detalle_cuenta', 'intangible_pen');
  assert.equal(state.currentView, 'detalle_cuenta');
  assert.equal(state.previousView, 'productos');
  assert.equal(state.selectedAccountId, 'intangible_pen');

  state = navigateBackFromDetail(state);
  assert.equal(state.currentView, 'productos');
});

test('toggleBalanceVisibility switches between masked and real USD balances', () => {
  let state = createInitialState();
  assert.equal(formatAccountDisplayBalance('sbp_pen', state.showBalances), 'US$ ••••••');
  assert.equal(formatAccountDisplayBalance('intangible_pen', state.showBalances), 'US$ ••••••');
  assert.equal(formatAccountDisplayBalance('sbp_usd', state.showBalances), 'US$ ••••••');

  state = toggleBalanceVisibility(state);
  assert.equal(state.showBalances, true);
  assert.equal(formatAccountDisplayBalance('sbp_pen', state.showBalances), 'US$ 150.00');
  assert.equal(formatAccountDisplayBalance('intangible_pen', state.showBalances), 'US$ 0.00');
  assert.equal(formatAccountDisplayBalance('sbp_usd', state.showBalances), 'US$ 150.00');
});

test('setDetailTab switches between movimientos and quiero', () => {
  let state = createInitialState();
  state = setDetailTab(state, 'quiero');
  assert.equal(state.activeDetailTab, 'quiero');
  state = setDetailTab(state, 'movimientos');
  assert.equal(state.activeDetailTab, 'movimientos');
});

test('ACCOUNTS registry has exact required USD balances, account number, and CCI', () => {
  assert.equal(ACCOUNTS.sbp_pen.balance, 'US$ 150.00');
  assert.equal(ACCOUNTS.intangible_pen.balance, 'US$ 0.00');
  assert.equal(ACCOUNTS.sbp_usd.balance, 'US$ 150.00');
  assert.equal(ACCOUNTS.sbp_pen.accountNumber, 'Scotiabank: 039-0650-428-83');
  assert.equal(ACCOUNTS.sbp_pen.cci, '009-428-214280390650-40');
});
