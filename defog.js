const TARGETS = {
  remove: ['BlurredOverlay', 'SignInToUnlockButton', "expand-button_ExpandButton"],
  stripClass: ['BlurredContent','ReviewText_isCollapsed', 'EmployerHero_employerHeroImage', 'TruncatedText_truncate'],
};

function removeElements(className) {
  document.querySelectorAll(`[class^="${className}"]`).forEach((el) => el.remove());
}

function stripClass(className) {
  const pattern = new RegExp(`\\s*${className}\\w*`, 'g');
  document.querySelectorAll(`[class^="${className}"]`).forEach((el) => {
    el.className = el.className.replace(pattern, '').trim();
  });
}

function cleanup() {
  observer.disconnect(); // avoid reacting to our own DOM changes
  TARGETS.remove.forEach(removeElements);
  TARGETS.stripClass.forEach(stripClass);
  observer.observe(document.body, observerConfig);
}

let scheduled = false;
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

// Run once for content already on the page, then start observing.
cleanup();