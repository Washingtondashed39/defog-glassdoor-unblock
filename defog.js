const TARGETS = {
  remove: ['BlurredOverlay', 'SignInToUnlockButton', "expand-button_ExpandButton"],
  stripClass: ['BlurredContent','ReviewText_isCollapsed', 'EmployerHero_employerHeroImage', 'TruncatedText_truncate'],
};

const STORAGE_KEY = 'disabledHosts';
const hostname = location.hostname;

let enabled = true;
let total = 0;
let scheduled = false;

function removeElements(className) {
  let removed = 0;
  document.querySelectorAll(`[class^="${className}"]`).forEach((el) => {
    el.remove();
    removed++;
  });
  return removed;
}

function stripClass(className) {
  const pattern = new RegExp(`\\s*${className}\\w*`, 'g');
  document.querySelectorAll(`[class^="${className}"]`).forEach((el) => {
    el.className = el.className.replace(pattern, '').trim();
  });
}

function reportIconState() {
  chrome.runtime.sendMessage({ type: 'ICON_STATE', enabled });
}

function cleanup() {
  observer.disconnect(); // avoid reacting to our own DOM changes
  total += TARGETS.remove.reduce((sum, className) => sum + removeElements(className), 0);
  TARGETS.stripClass.forEach(stripClass);
  if (enabled) observer.observe(document.body, observerConfig);
}

function scheduleCleanup() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    cleanup();
  });
}

const observerConfig = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true,
};

const observer = new MutationObserver(() => scheduleCleanup());

function setEnabled(next, sendResponse) {
  enabled = next;
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const disabledHosts = result[STORAGE_KEY] || [];
    const updated = enabled
      ? disabledHosts.filter((h) => h !== hostname)
      : disabledHosts.includes(hostname) ? disabledHosts : [...disabledHosts, hostname];
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      if (enabled) {
        cleanup();
      } else {
        observer.disconnect();
      }
      reportIconState();
      sendResponse({ enabled, total });
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'GET_STATE') {
    sendResponse({ enabled, total });
    return;
  }

  if (message?.type === 'SET_ENABLED') {
    setEnabled(message.enabled, sendResponse);
    return true; // keep the message channel open for the async storage write
  }
});

chrome.storage.local.get(STORAGE_KEY, (result) => {
  const disabledHosts = result[STORAGE_KEY] || [];
  enabled = !disabledHosts.includes(hostname);
  if (enabled) cleanup();
  reportIconState();
});
