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

const views: ViewId[] = ['prelogin', 'pin', 'home', 'productos', 'detalle_cuenta'];
const DEMO_PIN = '101380';
let state: AppState = createInitialState();
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let pinTimer: ReturnType<typeof setTimeout> | undefined;
let authenticated = false;

const pinForm = document.querySelector<HTMLFormElement>('#pin-form')!;
const pinInput = document.querySelector<HTMLInputElement>('#pin-input')!;
const pinError = document.querySelector<HTMLElement>('#pin-error')!;
const pinSubmit = document.querySelector<HTMLButtonElement>('#pin-submit')!;

function resetPin() {
  clearTimeout(pinTimer);
  pinInput.value = '';
  pinInput.disabled = false;
  pinInput.removeAttribute('aria-invalid');
  pinError.textContent = '';
  pinSubmit.disabled = false;
  pinSubmit.textContent = 'Entrar a mi cuenta';
  document.getElementById('view-pin')!.classList.remove('pin-validating');
}

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
  if (!authenticated && view !== 'prelogin' && view !== 'pin') view = 'pin';
  if (view === 'prelogin') {
    authenticated = false;
    resetPin();
  }
  if (view === 'pin' && state.currentView !== 'pin') resetPin();
  state = navigateToView(state, view);
  render();
  if (view === 'pin') requestAnimationFrame(() => pinInput.focus());
}

function openAccountDetail(accountId: AccountId, sourceView: ViewId) {
  if (!authenticated) {
    goTo('pin');
    return;
  }
  if (!ACCOUNTS[accountId] || !['home', 'productos'].includes(sourceView)) return;
  state = navigateToView({ ...state, currentView: sourceView }, 'detalle_cuenta', accountId);
  render();
}

function goBackFromDetail() {
  if (!authenticated) {
    goTo('pin');
    return;
  }
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

pinInput.addEventListener('input', () => {
  pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6);
  pinInput.removeAttribute('aria-invalid');
  pinError.textContent = '';
  if (pinInput.value.length === 6) pinForm.requestSubmit();
});

pinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (pinInput.disabled) return;
  if (pinInput.value !== DEMO_PIN) {
    pinError.textContent = pinInput.value.length === 6 ? 'Clave incorrecta. Inténtalo de nuevo.' : 'Ingresa los 6 dígitos de tu clave.';
    pinInput.setAttribute('aria-invalid', 'true');
    pinInput.value = '';
    pinInput.focus();
    return;
  }

  pinInput.disabled = true;
  pinSubmit.disabled = true;
  pinSubmit.textContent = 'Ingresando...';
  document.getElementById('view-pin')!.classList.add('pin-validating');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 520;
  pinTimer = setTimeout(() => {
    authenticated = true;
    state = navigateToView(state, 'home');
    render();
    resetPin();
  }, delay);
});

if (new URLSearchParams(location.search).get('autostart') === '1') {
  state = navigateToView(state, 'pin');
}
render();
