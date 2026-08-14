const SUPPORTED_HOSTS = /(^|\.)glassdoor\.[a-z]{2,3}(\.[a-z]{2,3})?$/i;

const hostEl = document.getElementById('host');
const statusPill = document.getElementById('status-pill');
const unsupportedEl = document.getElementById('unsupported');
const controlsEl = document.getElementById('controls');
const toggleEl = document.getElementById('toggle');
const subtitleEl = document.getElementById('subtitle');
const counterValue = document.getElementById('counter-value');

let tabId = null;

function render(enabled, total) {
  statusPill.textContent = enabled ? 'Active' : 'Paused';
  statusPill.classList.toggle('is-active', enabled);
  toggleEl.classList.toggle('is-on', enabled);
  toggleEl.setAttribute('aria-checked', String(enabled));
  subtitleEl.textContent = enabled
    ? 'Overlays are hidden as the page loads.'
    : 'Paused — the page shows everything.';
  counterValue.textContent = String(total ?? 0);
}

function showUnsupported() {
  unsupportedEl.hidden = false;
  controlsEl.hidden = true;
  statusPill.hidden = true;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = tab?.url ? safeHostname(tab.url) : null;

  if (!tab || !hostname || !SUPPORTED_HOSTS.test(hostname)) {
    showUnsupported();
    return;
  }

  tabId = tab.id;
  hostEl.textContent = hostname;

  chrome.tabs.sendMessage(tabId, { type: 'GET_STATE' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      showUnsupported();
      return;
    }
    render(response.enabled, response.total);
  });
}

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

toggleEl.addEventListener('click', () => {
  if (tabId == null) return;
  const nextEnabled = !toggleEl.classList.contains('is-on');
  chrome.tabs.sendMessage(tabId, { type: 'SET_ENABLED', enabled: nextEnabled }, (response) => {
    if (chrome.runtime.lastError || !response) return;
    render(response.enabled, response.total);
    // Elements already removed from the DOM can't come back without a fresh load.
    if (!response.enabled) chrome.tabs.reload(tabId);
  });
});

init();
