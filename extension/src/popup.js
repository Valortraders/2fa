import { parseAuthInput, generateOTP, generateTOTP, validateSecret } from './totp.js';

// DOM Elements
let secretInput;
let codeDisplay;
let errorDisplay;
let timeLeftDisplay;
let copyButton;
let themeToggle;
let codeContainer;

// State
let currentSecret = '';
let currentConfig = null;
let updateTimer;

async function parseInputToConfig(input) {
  try {
    const cfg = parseAuthInput(input);
    if (cfg.type === 'hotp') {
      const storageKey = `hotp:${cfg.label || ''}:${cfg.issuer || ''}:${cfg.secretHex.slice(0, 16)}`;
      const stored = await chrome.storage.sync.get(storageKey);
      if (stored && typeof stored[storageKey] === 'number') {
        cfg.counter = stored[storageKey];
      } else {
        await chrome.storage.sync.set({ [storageKey]: cfg.counter });
      }
      cfg._storageKey = storageKey;
    }
    hideError();
    return cfg;
  } catch (e) {
    showError(e.message || 'Invalid input');
    return null;
  }
}

function showError(message) {
  errorDisplay.querySelector('span').textContent = message;
  errorDisplay.classList.remove('hidden');
}

function hideError() {
  errorDisplay.querySelector('span').textContent = '';
  errorDisplay.classList.add('hidden');
}

function updateTimeLeft() {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = currentConfig && currentConfig.type === 'totp' ? (currentConfig.period || 30) : 30;
  const currentTimeSlot = Math.floor(now / timeStep);
  const nextUpdate = (currentTimeSlot + 1) * timeStep;
  const timeLeft = nextUpdate - now;
  
  if (currentConfig && currentConfig.type === 'hotp') {
    timeLeftDisplay.textContent = `HOTP • Counter ${currentConfig.counter}`;
  } else {
    timeLeftDisplay.textContent = `Refreshes in ${timeLeft}s`;
  }
  
  // Update progress bar
  const progressBar = document.querySelector('.bg-primary\\/50');
  if (progressBar) {
    if (currentConfig && currentConfig.type === 'hotp') {
      progressBar.style.width = `100%`;
    } else {
      progressBar.style.width = `${(timeLeft / timeStep) * 100}%`;
    }
  }
  
  // Generate new code at the start of each time slot
  if (currentConfig && currentConfig.type !== 'hotp' && now % timeStep === 0) {
    generateCode();
  }
}

async function generateCode() {
  if (!currentSecret) return;
  
  const cfg = await parseInputToConfig(currentSecret);
  currentConfig = cfg;
  if (!cfg) {
    codeDisplay.textContent = '';
    codeContainer.classList.add('hidden');
    return;
  }

  try {
    const code = cfg.type === 'totp' ? generateOTP(cfg) : generateOTP(cfg);
    codeDisplay.textContent = code;
    codeContainer.classList.remove('hidden');
    hideError();
  } catch (e) {
    showError(e.message);
    codeDisplay.textContent = '';
    codeContainer.classList.add('hidden');
  }
}

function handleSecretChange(event) {
  currentSecret = event.target.value;
  if (currentSecret.trim()) {
    generateCode();
  } else {
    hideError();
    codeContainer.classList.add('hidden');
  }
}

async function handleCopy() {
  const code = codeDisplay.textContent;
  if (!code) return;
  
  await navigator.clipboard.writeText(code);
  copyButton.textContent = 'Copied!';
  if (currentConfig && currentConfig.type === 'hotp') {
    currentConfig.counter += 1;
    if (currentConfig._storageKey) {
      await chrome.storage.sync.set({ [currentConfig._storageKey]: currentConfig.counter });
    }
    try {
      const nextCode = generateOTP(currentConfig);
      codeDisplay.textContent = nextCode;
      timeLeftDisplay.textContent = `HOTP • Counter ${currentConfig.counter}`;
    } catch {}
  }
  setTimeout(() => {
    copyButton.textContent = 'Copy';
  }, 2000);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  chrome.storage.sync.set({ theme: isDark ? 'dark' : 'light' });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  secretInput = document.getElementById('secret-input');
  codeDisplay = document.getElementById('code-display');
  errorDisplay = document.getElementById('error-display');
  timeLeftDisplay = document.getElementById('time-left');
  copyButton = document.getElementById('copy-button');
  themeToggle = document.getElementById('theme-toggle');
  codeContainer = document.getElementById('code-container');

  // Add event listeners
  secretInput.addEventListener('input', handleSecretChange);
  copyButton.addEventListener('click', handleCopy);
  themeToggle.addEventListener('click', toggleTheme);

  // Load theme preference
  const { theme } = await chrome.storage.sync.get('theme') || { theme: 'dark' };
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Start timer
  updateTimer = setInterval(updateTimeLeft, 1000);
});

// Cleanup when popup closes
window.addEventListener('unload', () => {
  clearInterval(updateTimer);
}); 