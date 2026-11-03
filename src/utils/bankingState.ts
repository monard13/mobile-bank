export type ViewId = 'prelogin' | 'pin' | 'home' | 'productos' | 'detalle_cuenta';
export type AccountId = 'sbp_pen' | 'intangible_pen' | 'sbp_usd';
export type DetailTabId = 'movimientos' | 'quiero';

export interface AccountData {
  id: AccountId;
  title: string;
  currency: 'US$';
  balance: string;
  maskedBalance: string;
  accountNumber: string;
  cci: string;
}

export interface AppState {
  currentView: ViewId;
  previousView: ViewId;
  showBalances: boolean;
  selectedAccountId: AccountId;
  activeDetailTab: DetailTabId;
}

export const ACCOUNTS: Record<AccountId, AccountData> = {
  sbp_pen: {
    id: 'sbp_pen',
    title: 'Cuenta Digital SBP',
    currency: 'US$',
    balance: 'US$ 150.00',
    maskedBalance: 'US$ ••••••',
    accountNumber: 'Scotiabank: 039-0650-428-83',
    cci: '009-428-214280390650-40',
  },
  intangible_pen: {
    id: 'intangible_pen',
    title: 'Cuenta Intangible',
    currency: 'US$',
    balance: 'US$ 0.00',
    maskedBalance: 'US$ ••••••',
    accountNumber: 'Scotiabank: 039-0650-428-83',
    cci: '009-428-214280390650-40',
  },
  sbp_usd: {
    id: 'sbp_usd',
    title: 'Cuenta Digital SBP',
    currency: 'US$',
    balance: 'US$ 150.00',
    maskedBalance: 'US$ ••••••',
    accountNumber: 'Scotiabank: 039-0650-428-83',
    cci: '009-428-214280390650-40',
  },
};

export function createInitialState(): AppState {
  return {
    currentView: 'prelogin',
    previousView: 'home',
    showBalances: false,
    selectedAccountId: 'sbp_pen',
    activeDetailTab: 'movimientos',
  };
}

export function navigateToView(
  state: AppState,
  targetView: ViewId,
  accountId?: AccountId
): AppState {
  const previousView: ViewId =
    targetView === 'detalle_cuenta' &&
    (state.currentView === 'home' || state.currentView === 'productos')
      ? state.currentView
      : state.previousView;

  return {
    ...state,
    currentView: targetView,
    previousView,
    selectedAccountId: accountId ?? state.selectedAccountId,
    showBalances: targetView === 'prelogin' ? false : state.showBalances,
    activeDetailTab: targetView === 'detalle_cuenta' ? 'movimientos' : state.activeDetailTab,
  };
}

export function navigateBackFromDetail(state: AppState): AppState {
  const target: ViewId =
    state.previousView === 'productos' ? 'productos' : 'home';
  return {
    ...state,
    currentView: target,
  };
}

export function toggleBalanceVisibility(state: AppState): AppState {
  return {
    ...state,
    showBalances: !state.showBalances,
  };
}

export function setDetailTab(state: AppState, tab: DetailTabId): AppState {
  return {
    ...state,
    activeDetailTab: tab,
  };
}

export function formatAccountDisplayBalance(
  accountId: AccountId,
  showBalances: boolean
): string {
  const acc = ACCOUNTS[accountId];
  return showBalances ? acc.balance : acc.maskedBalance;
}
