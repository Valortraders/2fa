import { generateTOTP, validateSecret } from './totp.js';

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
let updateTimer;

function validateAndCleanSecret(input) {
  const cleanSecret = input.replace(/\s/g, '').toUpperCase();
  const base32Regex = /^[A-Z2-7]+=*$/;
  
  if (!base32Regex.test(cleanSecret)) {
    showError('Secret key must only contain letters A-Z and numbers 2-7');
    return null;
  }

  const validSecret = validateSecret(cleanSecret);
  if (!validSecret) {
    showError('Invalid secret key format');
    return null;
  }

  hideError();
  return cleanSecret;
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
  const timeStep = 30;
  const currentTimeSlot = Math.floor(now / timeStep);
  const nextUpdate = (currentTimeSlot + 1) * timeStep;
  const timeLeft = nextUpdate - now;
  
  timeLeftDisplay.textContent = `Refreshes in ${timeLeft}s`;
  
  // Update progress bar
  const progressBar = document.querySelector('.bg-primary\\/50');
  if (progressBar) {
    progressBar.style.width = `${(timeLeft / 30) * 100}%`;
  }
  
  // Generate new code at the start of each time slot
  if (now % timeStep === 0) {
    generateCode();
  }
}

function generateCode() {
  if (!currentSecret) return;
  
  const cleanSecret = validateAndCleanSecret(currentSecret);
  if (!cleanSecret) {
    codeDisplay.textContent = '';
    codeContainer.classList.add('hidden');
    return;
  }

  try {
    const code = generateTOTP(cleanSecret);
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