import './index.css';
import {
  ACCOUNTS,
  createInitialState,
  formatAccountDisplayBalance,
  navigateBackFromDetail,
  navigateToView,
  setDetailTab,
  toggleBalanceVisibility,
  type AccountId,
  type AppState,
  type DetailTabId,
  type ViewId,
} from './utils/bankingState';

const views: ViewId[] = ['prelogin', 'home', 'productos', 'detalle_cuenta'];
let state: AppState = createInitialState();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function renderBalances() {
  document.querySelectorAll<HTMLElement>('[data-balance-account]').forEach((node) => {
    const id = node.dataset.balanceAccount as AccountId;
    if (ACCOUNTS[id]) node.textContent = formatAccountDisplayBalance(id, state.showBalances);
  });
  document.querySelectorAll<HTMLElement>('.eye-icon-open').forEach((node) => node.classList.toggle('hidden', state.showBalances));
  document.querySelectorAll<HTMLElement>('.eye-icon-closed').forEach((node) => node.classList.toggle('hidden', !state.showBalances));
  document.querySelectorAll<HTMLButtonElement>('[data-toggle-balance]').forEach((button) => {
    button.setAttribute('aria-pressed', String(state.showBalances));
    button.setAttribute('aria-label', state.showBalances ? 'Ocultar saldos' : 'Mostrar saldos');
  });
}

function renderDetail() {
  const account = ACCOUNTS[state.selectedAccountId];
  document.getElementById('detail-account-title')!.textContent = account.title;
  document.getElementById('detail-account-balance')!.textContent = formatAccountDisplayBalance(account.id, state.showBalances);
  document.getElementById('detail-account-number')!.textContent = account.accountNumber;
  document.getElementById('detail-account-cci')!.textContent = account.cci;
}

function renderTabs() {
  for (const tab of ['movimientos', 'quiero'] as DetailTabId[]) {
    const active = state.activeDetailTab === tab;
    const button = document.getElementById(`tab-btn-${tab}`)!;
    const panel = document.getElementById(`tab-panel-${tab}`)!;
    button.setAttribute('aria-selected', String(active));
    button.classList.toggle('bg-white', active);
    button.classList.toggle('text-gray-900', active);
    button.classList.toggle('shadow-xs', active);
    button.classList.toggle('text-gray-600', !active);
    panel.classList.toggle('hidden', !active);
  }
}

function render() {
  for (const view of views) {
    const active = state.currentView === view;
    const element = document.getElementById(`view-${view}`)!;
    element.classList.toggle('active-view', active);
    element.classList.toggle('visible-view', active);
    element.setAttribute('aria-hidden', String(!active));
    const button = document.getElementById(`dev-btn-${view}`);
    if (button) {
      button.classList.toggle('bg-[#EC111A]', active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('text-slate-300', !active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    }
  }
  renderBalances();
  renderDetail();
  renderTabs();
}

function goTo(view: ViewId) {
  if (!views.includes(view)) return;
  state = navigateToView(state, view);
  render();
}

function openAccountDetail(accountId: AccountId, sourceView: ViewId) {
  if (!ACCOUNTS[accountId] || !['home', 'productos'].includes(sourceView)) return;
  state = navigateToView({ ...state, currentView: sourceView }, 'detalle_cuenta', accountId);
  render();
}

function goBackFromDetail() {
  state = navigateBackFromDetail(state);
  render();
}

function toggleBalances() {
  state = toggleBalanceVisibility(state);
  render();
}

function switchDetailTab(tab: DetailTabId) {
  if (tab !== 'movimientos' && tab !== 'quiero') return;
  state = setDetailTab(state, tab);
  renderTabs();
}

function showToast(message: string) {
  const toast = document.getElementById('phone-toast')!;
  document.getElementById('phone-toast-text')!.textContent = message;
  toast.classList.add('toast-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 3000);
}

async function copyAccountData() {
  const account = ACCOUNTS[state.selectedAccountId];
  const payload = `${account.title} - ${account.accountNumber} | CCI: ${account.cci}`;
  try {
    await navigator.clipboard.writeText(payload);
    showToast('¡Datos de cuenta copiados!');
  } catch {
    showToast('No se pudo copiar. Selecciona los datos manualmente.');
  }
}

declare global {
  interface Window {
    appRouter: {
      goTo: typeof goTo;
      openAccountDetail: typeof openAccountDetail;
      goBackFromDetail: typeof goBackFromDetail;
      toggleBalances: typeof toggleBalances;
      switchDetailTab: typeof switchDetailTab;
      showToast: typeof showToast;
      copyAccountData: typeof copyAccountData;
      getState: () => AppState;
    };
  }
}

window.appRouter = {
  goTo, openAccountDetail, goBackFromDetail, toggleBalances,
  switchDetailTab, showToast, copyAccountData, getState: () => ({ ...state }),
};

if (new URLSearchParams(location.search).get('autostart') === '1') {
  state = navigateToView(state, 'home');
}
render();
