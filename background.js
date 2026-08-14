const ICONS = {
  active: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  inactive: {
    16: 'icons/icon16-inactive.png',
    32: 'icons/icon32-inactive.png',
    48: 'icons/icon48-inactive.png',
    128: 'icons/icon128-inactive.png',
  },
};

function setIcon(tabId, enabled) {
  chrome.action.setIcon({ tabId, path: enabled ? ICONS.active : ICONS.inactive });
}

// Reset to the inactive icon as soon as a tab starts navigating, so a colour
// left over from a previous Glassdoor page doesn't linger on an unrelated site.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') setIcon(tabId, false);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'ICON_STATE' && sender.tab?.id != null) {
    setIcon(sender.tab.id, message.enabled);
  }
});
