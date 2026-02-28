import { generateOTP, parseAuthInput } from './totp.js';
import {
  createVault,
  hasVault,
  persistVault,
  rotateVaultPassphrase,
  unlockVault
} from './vault.js';

const APP_VIEWS = ['generate', 'saved', 'scan', 'settings'];
const THEME_STORAGE_KEY = 'theme';
const VAULT_STORAGE_KEY = 'secureVaultV1';

const state = {
  timerId: null,
  currentView: 'generate',
  activeConfig: null,
  activeAccountName: '',
  activeAccountId: null,
  vaultSession: null,
  pendingDeleteAccountId: null,
  copiedAccountId: null,
  copiedUntilMs: 0
};

const elements = {};

function byId(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing DOM node: #${id}`);
  }
  return element;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setVisibility(element, isVisible) {
  element.classList.toggle('hidden', !isVisible);
}

function setButtonBusy(button, label) {
  button.dataset.originalLabel = button.textContent || '';
  button.textContent = label;
  button.disabled = true;
  button.classList.add('opacity-70', 'cursor-not-allowed');
}

function resetButtonBusy(button) {
  if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
  }
  button.disabled = false;
  button.classList.remove('opacity-70', 'cursor-not-allowed');
}

function normalizeDisplayName(config, customName = '') {
  if (customName.trim()) {
    return customName.trim();
  }

  if (config.label?.trim()) {
    const labelParts = config.label.split(':');
    return labelParts.length > 1 ? labelParts.slice(1).join(':').trim() : config.label.trim();
  }

  if (config.issuer?.trim()) {
    return config.issuer.trim();
  }

  return 'Saved account';
}

function formatOtpCode(code) {
  if (!code) {
    return '';
  }
  if (code.length <= 3) {
    return code;
  }
  const midpoint = Math.floor(code.length / 2);
  return `${code.slice(0, midpoint)} ${code.slice(midpoint)}`;
}

function getTotpTimeLeft(period = 30) {
  const nowMs = Date.now();
  const periodMs = period * 1000;
  const elapsedInPeriod = nowMs % periodMs;
  return (periodMs - elapsedInPeriod) / 1000;
}

function getAccounts() {
  return state.vaultSession?.data?.accounts ?? [];
}

function setGenerateError(message = '') {
  elements.generateError.textContent = message;
  setVisibility(elements.generateError, Boolean(message));
}

function setScanStatus(message, isError = false) {
  elements.scanStatus.textContent = message;
  elements.scanStatus.classList.toggle('text-destructive', isError);
  elements.scanStatus.classList.toggle('text-muted-foreground', !isError);
}

let appStatusTimer = null;
function setAppStatus(message, isError = false) {
  clearTimeout(appStatusTimer);
  elements.appStatus.textContent = message;
  elements.appStatus.className = isError
    ? 'text-xs rounded-md px-3 py-2 border border-destructive/40 text-destructive bg-destructive/10'
    : 'text-xs rounded-md px-3 py-2 border border-border text-muted-foreground bg-white/5';
  setVisibility(elements.appStatus, Boolean(message));
  if (message) {
    appStatusTimer = setTimeout(() => {
      setVisibility(elements.appStatus, false);
    }, 3000);
  }
}

function setUnlockMessage(message = '', isError = true) {
  elements.unlockError.textContent = message;
  elements.unlockError.classList.toggle('text-destructive', isError);
  elements.unlockError.classList.toggle('text-muted-foreground', !isError);
  setVisibility(elements.unlockError, Boolean(message));
}

function setChangePassphraseError(message = '') {
  elements.changePassphraseError.textContent = message;
  setVisibility(elements.changePassphraseError, Boolean(message));
}

function resetChangePassphraseForm() {
  if (!elements.changePassphraseForm) {
    return;
  }
  elements.currentPassphraseInput.value = '';
  elements.newPassphraseInput.value = '';
  elements.confirmNewPassphraseInput.value = '';
  setChangePassphraseError('');
}

function clearActiveCode() {
  state.activeConfig = null;
  state.activeAccountName = '';
  state.activeAccountId = null;
  setVisibility(elements.activeCodeCard, false);
}

function renderActiveCodeCard() {
  const config = state.activeConfig;
  if (!config) {
    setVisibility(elements.activeCodeCard, false);
    return;
  }

  try {
    const code = generateOTP(config);
    elements.activeCode.textContent = formatOtpCode(code);
    elements.activeAccountMeta.textContent = state.activeAccountName || 'One-time password';

    if (config.type === 'hotp') {
      elements.activeTimeLeft.textContent = `HOTP counter: ${config.counter}`;
      elements.activeProgress.style.width = '100%';
    } else {
      const period = config.period || 30;
      const timeLeft = getTotpTimeLeft(period);
      elements.activeTimeLeft.textContent = `Refreshes in ${Math.ceil(timeLeft)}s`;
      elements.activeProgress.style.width = `${(timeLeft / period) * 100}%`;
    }

    setVisibility(elements.activeCodeCard, true);
  } catch (error) {
    setGenerateError(error?.message || 'Could not generate OTP code.');
    setVisibility(elements.activeCodeCard, false);
  }
}

function validateVaultAccount(rawAccount) {
  if (!rawAccount || typeof rawAccount !== 'object' || !rawAccount.config) {
    return null;
  }

  const config = rawAccount.config;
  if (!config.secretHex || !config.type) {
    return null;
  }

  return {
    id: typeof rawAccount.id === 'string' ? rawAccount.id : crypto.randomUUID(),
    name: typeof rawAccount.name === 'string' && rawAccount.name.trim() ? rawAccount.name.trim() : normalizeDisplayName(config),
    createdAt: Number.isFinite(rawAccount.createdAt) ? rawAccount.createdAt : Date.now(),
    config: {
      type: config.type === 'hotp' ? 'hotp' : 'totp',
      secretHex: String(config.secretHex),
      algorithm: typeof config.algorithm === 'string' ? config.algorithm : 'SHA1',
      digits: Number.isFinite(config.digits) ? config.digits : 6,
      period: Number.isFinite(config.period) ? config.period : 30,
      counter: Number.isFinite(config.counter) ? config.counter : 0,
      issuer: typeof config.issuer === 'string' ? config.issuer : '',
      label: typeof config.label === 'string' ? config.label : ''
    }
  };
}

async function persistVaultSession() {
  if (!state.vaultSession) {
    return;
  }
  await persistVault(state.vaultSession);
}

function parseGenerateForm() {
  const rawInput = elements.authInput.value.trim();
  if (!rawInput) {
    throw new Error('Enter a secret or otpauth URI.');
  }
  const config = parseAuthInput(rawInput);
  const accountName = normalizeDisplayName(config, elements.accountNameInput.value);
  return { config, accountName };
}

function getSavedAccountMetrics(account) {
  let generatedCode = '------';
  let refreshLabel = 'Invalid account configuration';
  let progress = 100;

  try {
    generatedCode = formatOtpCode(generateOTP(account.config));
    if (account.config.type === 'hotp') {
      refreshLabel = `HOTP • Counter ${account.config.counter}`;
      progress = 100;
    } else {
      const period = account.config.period || 30;
      const timeLeft = getTotpTimeLeft(period);
      refreshLabel = `Refreshes in ${Math.ceil(timeLeft)}s`;
      progress = (timeLeft / period) * 100;
    }
  } catch {}

  return {
    generatedCode,
    refreshLabel,
    progress
  };
}

function updateSavedCardNode(account, cardElement) {
  const { generatedCode, refreshLabel, progress } = getSavedAccountMetrics(account);
  const refreshNode = cardElement.querySelector('[data-role="refresh"]');
  const codeNode = cardElement.querySelector('[data-role="code"]');
  const progressNode = cardElement.querySelector('[data-role="progress"]');
  const copyLabelNode = cardElement.querySelector('[data-copy-label]');

  if (refreshNode) {
    refreshNode.textContent = refreshLabel;
  }
  if (codeNode) {
    codeNode.textContent = generatedCode;
  }
  if (progressNode) {
    progressNode.style.width = `${progress}%`;
  }

  if (copyLabelNode) {
    const isCopyConfirmed =
      state.copiedAccountId === account.id &&
      state.copiedUntilMs > Date.now();
    copyLabelNode.textContent = isCopyConfirmed ? 'Copied' : 'Copy';
  }
}

function updateSavedCardsRealtime() {
  if (!elements.savedList || state.currentView !== 'saved') {
    return;
  }

  const accountsById = new Map(getAccounts().map((account) => [account.id, account]));
  const cardNodes = elements.savedList.querySelectorAll('[data-account-id]');
  cardNodes.forEach((cardNode) => {
    const accountId = cardNode.dataset.accountId;
    const account = accountsById.get(accountId);
    if (!account) {
      return;
    }
    updateSavedCardNode(account, cardNode);
  });
}

function renderSavedAccounts() {
  const accounts = getAccounts();
  setVisibility(elements.savedEmpty, accounts.length === 0);
  if (!accounts.length) {
    elements.savedList.innerHTML = '';
    return;
  }

  const html = accounts
    .map((account) => {
      const { generatedCode, refreshLabel, progress } = getSavedAccountMetrics(account);

      const isActive = account.id === state.activeAccountId;
      const isPendingDelete = state.pendingDeleteAccountId === account.id;
      const isCopyConfirmed =
        state.copiedAccountId === account.id &&
        state.copiedUntilMs > Date.now();
      const deleteAction = isPendingDelete ? 'delete-confirm' : 'delete-arm';
      const deleteButtonClass = isPendingDelete
        ? 'h-8 w-8 rounded-md border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 inline-flex items-center justify-center'
        : 'h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 inline-flex items-center justify-center';
      const deleteIcon = isPendingDelete
        ? `
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        `
        : `
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"/>
          </svg>
        `;
      const copyLabel = isCopyConfirmed ? 'Copied' : 'Copy';
      return `
        <article data-account-id="${escapeHtml(account.id)}" class="relative rounded-md border ${isActive ? 'border-primary/60' : 'border-border'} bg-white/5 p-3 overflow-hidden">
          <div data-role="progress" class="absolute left-0 bottom-0 h-0.5 bg-primary/60" style="width:${progress}%"></div>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-medium leading-tight">${escapeHtml(account.name)}</p>
              <p data-role="refresh" class="text-[11px] text-muted-foreground">${escapeHtml(refreshLabel)}</p>
            </div>
            <p data-role="code" class="text-2xl font-mono font-semibold tracking-[0.2em] leading-none whitespace-nowrap">${escapeHtml(generatedCode)}</p>
          </div>
          <div class="mt-2 flex items-center gap-1">
            <button type="button" data-action="copy" data-account-id="${escapeHtml(account.id)}" class="flex-1 h-8 px-2 text-[11px] rounded-md border border-border hover:bg-accent inline-flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H7a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2v1m-5 10h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
              </svg>
              <span data-copy-label>${copyLabel}</span>
            </button>
            <button type="button" data-action="use" data-account-id="${escapeHtml(account.id)}" aria-label="Use account" class="h-8 w-8 rounded-md border border-border hover:bg-accent inline-flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button type="button" data-action="${deleteAction}" data-account-id="${escapeHtml(account.id)}" aria-label="${isPendingDelete ? 'Confirm delete account' : 'Delete account'}" class="${deleteButtonClass}">
              ${deleteIcon}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  elements.savedList.innerHTML = html;
}

function setView(view) {
  if (!APP_VIEWS.includes(view)) {
    return;
  }
  state.currentView = view;

  APP_VIEWS.forEach((viewName) => {
    setVisibility(elements.viewPanels[viewName], viewName === view);
  });

  elements.viewButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle('bg-primary/15', isActive);
    button.classList.toggle('text-primary', isActive);
    button.classList.toggle('text-muted-foreground', !isActive);
  });

  if (view === 'saved') {
    renderSavedAccounts();
    updateSavedCardsRealtime();
  }
}

function readImageBitmap(file) {
  return createImageBitmap(file);
}

async function decodeQrFromImage(file) {
  if (!('BarcodeDetector' in globalThis)) {
    throw new Error('QR scan is not supported in this Chrome build.');
  }

  let detector;
  try {
    detector = new BarcodeDetector({ formats: ['qr_code'] });
  } catch {
    detector = new BarcodeDetector();
  }

  const bitmap = await readImageBitmap(file);
  try {
    const result = await detector.detect(bitmap);
    const qrValue = result.find((item) => typeof item.rawValue === 'string' && item.rawValue.trim());
    if (!qrValue) {
      throw new Error('No QR code found in image.');
    }
    return qrValue.rawValue.trim();
  } finally {
    bitmap.close();
  }
}

function extractAuthCandidate(rawText) {
  if (!rawText) {
    return '';
  }

  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();
  const uriIndex = lower.indexOf('otpauth://');
  if (uriIndex >= 0) {
    return trimmed.slice(uriIndex).split(/\s/)[0].trim();
  }

  const compactBase32 = trimmed.toUpperCase().replace(/[^A-Z2-7]/g, '');
  if (compactBase32.length >= 16) {
    return compactBase32;
  }

  return trimmed;
}

async function runOcrFallback(file) {
  if (!('TextDetector' in globalThis)) {
    return '';
  }

  const detector = new TextDetector();
  const bitmap = await readImageBitmap(file);
  try {
    const blocks = await detector.detect(bitmap);
    return blocks.map((block) => block.rawValue || '').join('\n');
  } finally {
    bitmap.close();
  }
}

function applyScannedInput(candidate) {
  const parsed = parseAuthInput(candidate);
  const accountName = normalizeDisplayName(parsed);

  elements.authInput.value = candidate;
  elements.accountNameInput.value = accountName;
  state.activeConfig = { ...parsed };
  state.activeAccountName = accountName;
  state.activeAccountId = null;

  setGenerateError('');
  renderActiveCodeCard();
  setView('generate');
}

async function copyCodeToClipboard(config, accountId = null) {
  const code = generateOTP(config);
  await navigator.clipboard.writeText(code);

  if (config.type === 'hotp') {
    config.counter += 1;
    if (accountId) {
      const account = getAccounts().find((item) => item.id === accountId);
      if (account) {
        account.config.counter = config.counter;
      }
    }
    await persistVaultSession();
  }
}

async function handleSavedListAction(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) {
    return;
  }

  const accountId = actionButton.dataset.accountId;
  const action = actionButton.dataset.action;
  const account = getAccounts().find((item) => item.id === accountId);
  if (!account) {
    return;
  }

  if (action === 'delete-arm') {
    state.pendingDeleteAccountId = account.id;
    renderSavedAccounts();
    updateSavedCardsRealtime();
    return;
  }

  if (action === 'delete-confirm') {
    state.vaultSession.data.accounts = getAccounts().filter((item) => item.id !== account.id);
    if (state.activeAccountId === account.id) {
      clearActiveCode();
    }
    if (state.copiedAccountId === account.id) {
      state.copiedAccountId = null;
      state.copiedUntilMs = 0;
    }
    state.pendingDeleteAccountId = null;
    await persistVaultSession();
    renderSavedAccounts();
    updateSavedCardsRealtime();
    setAppStatus('Account deleted.');
    return;
  }

  if (action === 'use') {
    state.pendingDeleteAccountId = null;
    state.activeConfig = { ...account.config };
    state.activeAccountName = account.name;
    state.activeAccountId = account.id;
    renderActiveCodeCard();
    setView('generate');
    return;
  }

  if (action === 'copy') {
    const hadPendingDelete = Boolean(state.pendingDeleteAccountId);
    state.pendingDeleteAccountId = null;
    try {
      await copyCodeToClipboard(account.config, account.id);
      state.copiedAccountId = account.id;
      state.copiedUntilMs = Date.now() + 1000;
      if (hadPendingDelete) {
        renderSavedAccounts();
      }
      updateSavedCardsRealtime();
      if (state.activeAccountId === account.id) {
        state.activeConfig = { ...account.config };
        renderActiveCodeCard();
      }
      setAppStatus('Code copied.');
    } catch (error) {
      setAppStatus(error?.message || 'Failed to copy code.', true);
    }
  }
}

async function handleGenerateCode() {
  try {
    const { config, accountName } = parseGenerateForm();
    state.activeConfig = { ...config };
    state.activeAccountName = accountName;
    state.activeAccountId = null;
    setGenerateError('');
    renderActiveCodeCard();
  } catch (error) {
    clearActiveCode();
    setGenerateError(error?.message || 'Invalid account input.');
  }
}

async function handleSaveAccount() {
  if (!state.vaultSession) {
    return;
  }

  try {
    const { config, accountName } = parseGenerateForm();
    const duplicate = getAccounts().find(
      (account) =>
        account.config.type === config.type &&
        account.config.secretHex === config.secretHex &&
        account.name.toLowerCase() === accountName.toLowerCase()
    );

    if (duplicate) {
      duplicate.config = { ...config };
      duplicate.name = accountName;
      duplicate.createdAt = Date.now();
      state.activeAccountId = duplicate.id;
    } else {
      state.vaultSession.data.accounts.unshift({
        id: crypto.randomUUID(),
        name: accountName,
        createdAt: Date.now(),
        config: { ...config }
      });
      state.activeAccountId = state.vaultSession.data.accounts[0].id;
    }

    state.activeConfig = { ...config };
    state.activeAccountName = accountName;
    await persistVaultSession();
    renderActiveCodeCard();
    renderSavedAccounts();
    setAppStatus(duplicate ? 'Account updated.' : 'Account saved.');
  } catch (error) {
    setGenerateError(error?.message || 'Could not save account.');
  }
}

async function handleActiveCopy() {
  if (!state.activeConfig) {
    return;
  }

  try {
    await copyCodeToClipboard(state.activeConfig, state.activeAccountId);
    renderActiveCodeCard();
    if (state.currentView === 'saved') {
      renderSavedAccounts();
    }
    elements.activeCopyButton.textContent = 'Copied';
    setTimeout(() => {
      elements.activeCopyButton.textContent = 'Copy';
    }, 1000);
  } catch (error) {
    setAppStatus(error?.message || 'Failed to copy code.', true);
  }
}

async function handleScanFromImage() {
  const file = elements.qrFileInput.files?.[0];
  if (!file) {
    setScanStatus('Select an image first.', true);
    return;
  }

  setScanStatus('Scanning image...');
  try {
    const scanned = await decodeQrFromImage(file);
    applyScannedInput(scanned);
    setScanStatus('QR imported. Review and save.');
    setAppStatus('QR data loaded.');
    return;
  } catch {}

  try {
    const ocrText = await runOcrFallback(file);
    const candidate = extractAuthCandidate(ocrText);
    if (!candidate) {
      throw new Error('No usable secret found in image.');
    }
    applyScannedInput(candidate);
    setScanStatus('No QR found, imported fallback text candidate.');
    setAppStatus('Fallback OCR candidate loaded.');
  } catch (error) {
    setScanStatus(error?.message || 'QR scan failed. Try OCR fallback text.', true);
  }
}

function isValidVaultRecord(record) {
  return Boolean(
    record &&
      typeof record === 'object' &&
      record.version === 1 &&
      typeof record.salt === 'string' &&
      record.salt.length > 0 &&
      record.encrypted &&
      typeof record.encrypted === 'object' &&
      typeof record.encrypted.iv === 'string' &&
      record.encrypted.iv.length > 0 &&
      typeof record.encrypted.data === 'string' &&
      record.encrypted.data.length > 0
  );
}

function extractVaultRecordFromBackup(payload) {
  if (isValidVaultRecord(payload)) {
    return payload;
  }
  if (isValidVaultRecord(payload?.vault)) {
    return payload.vault;
  }
  if (isValidVaultRecord(payload?.[VAULT_STORAGE_KEY])) {
    return payload[VAULT_STORAGE_KEY];
  }
  return null;
}

function downloadBackupFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function handleExportBackup() {
  try {
    const stored = await chrome.storage.local.get(VAULT_STORAGE_KEY);
    const vaultRecord = stored?.[VAULT_STORAGE_KEY];
    if (!isValidVaultRecord(vaultRecord)) {
      throw new Error('Local vault is unavailable for export.');
    }

    const backupPayload = {
      format: 'valor2fa-encrypted-vault',
      exportedAt: new Date().toISOString(),
      vault: vaultRecord
    };

    const dateStamp = new Date().toISOString().slice(0, 10);
    const content = JSON.stringify(backupPayload, null, 2);
    downloadBackupFile(`valor2fa-backup-${dateStamp}.v2fa`, content);
    setAppStatus('Encrypted backup exported. Open the .v2fa file in a text editor to view JSON structure.');
  } catch (error) {
    setAppStatus(error?.message || 'Failed to export backup.', true);
  }
}

async function handleImportBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const rawText = await file.text();
    const parsed = JSON.parse(rawText);
    const importedRecord = extractVaultRecordFromBackup(parsed);
    if (!isValidVaultRecord(importedRecord)) {
      throw new Error('Invalid backup file format.');
    }

    const confirmed = window.confirm('Importing a backup will replace the current local vault. Continue?');
    if (!confirmed) {
      return;
    }

    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: importedRecord });
    lockVault();
    setUnlockMessage('Backup imported. Unlock with the backup passphrase.', false);
  } catch (error) {
    setAppStatus(error?.message || 'Failed to import backup.', true);
  } finally {
    elements.importBackupInput.value = '';
  }
}

async function handleChangePassphraseSubmit(event) {
  event.preventDefault();
  if (!state.vaultSession) {
    return;
  }

  const currentPassphrase = elements.currentPassphraseInput.value.trim();
  const nextPassphrase = elements.newPassphraseInput.value.trim();
  const confirmPassphrase = elements.confirmNewPassphraseInput.value.trim();

  if (!currentPassphrase) {
    setChangePassphraseError('Enter your current passphrase.');
    return;
  }
  if (!nextPassphrase || nextPassphrase.length < 8) {
    setChangePassphraseError('New passphrase must contain at least 8 characters.');
    return;
  }
  if (nextPassphrase !== confirmPassphrase) {
    setChangePassphraseError('New passphrases do not match.');
    return;
  }
  if (currentPassphrase === nextPassphrase) {
    setChangePassphraseError('New passphrase must be different from current passphrase.');
    return;
  }

  setChangePassphraseError('');
  setButtonBusy(elements.changePassphraseSubmitButton, 'Updating...');
  try {
    const nextSession = await rotateVaultPassphrase(currentPassphrase, nextPassphrase);
    state.vaultSession = nextSession;
    resetChangePassphraseForm();
    setAppStatus('Vault password updated.');
  } catch (error) {
    setChangePassphraseError(error?.message || 'Failed to update vault password.');
  } finally {
    resetButtonBusy(elements.changePassphraseSubmitButton);
  }
}

function handleFallbackTextImport() {
  const candidate = extractAuthCandidate(elements.scanFallbackInput.value);
  if (!candidate) {
    setScanStatus('Paste OCR text, a secret, or an otpauth URI.', true);
    return;
  }

  try {
    applyScannedInput(candidate);
    setScanStatus('Imported fallback text.');
    setAppStatus('Text candidate loaded.');
  } catch (error) {
    setScanStatus(error?.message || 'Fallback text is not valid OTP input.', true);
  }
}

async function loadTheme() {
  const stored = await chrome.storage.local.get(THEME_STORAGE_KEY);
  const theme = stored?.[THEME_STORAGE_KEY] || 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

async function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  await chrome.storage.local.set({ [THEME_STORAGE_KEY]: isDark ? 'dark' : 'light' });
}

function lockVault() {
  stopTicker();
  state.vaultSession = null;
  state.pendingDeleteAccountId = null;
  state.copiedAccountId = null;
  state.copiedUntilMs = 0;
  resetChangePassphraseForm();
  clearActiveCode();
  elements.unlockPassphrase.value = '';
  setUnlockMessage('');
  setVisibility(elements.appShell, false);
  setVisibility(elements.bottomNav, false);
  setVisibility(elements.lockButton, false);
  setVisibility(elements.vaultSetup, false);
  setVisibility(elements.vaultUnlock, true);
}

function hydrateStateFromVault() {
  state.vaultSession.data.accounts = getAccounts()
    .map(validateVaultAccount)
    .filter(Boolean)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function startTicker() {
  if (state.timerId) {
    clearInterval(state.timerId);
  }
  state.timerId = setInterval(() => {
    if (state.activeConfig?.type === 'totp') {
      renderActiveCodeCard();
    }
    if (state.currentView === 'saved') {
      updateSavedCardsRealtime();
    }
  }, 120);
}

function stopTicker() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

async function openUnlockedApp(session) {
  state.vaultSession = session;
  hydrateStateFromVault();
  setUnlockMessage('');
  resetChangePassphraseForm();
  setVisibility(elements.vaultSetup, false);
  setVisibility(elements.vaultUnlock, false);
  setVisibility(elements.appShell, true);
  setVisibility(elements.bottomNav, true);
  setVisibility(elements.lockButton, true);
  setView('saved');
  renderSavedAccounts();
  updateSavedCardsRealtime();
  renderActiveCodeCard();
  startTicker();
}

async function initializeVaultScreens() {
  const vaultExists = await hasVault();
  setUnlockMessage('');
  setVisibility(elements.vaultSetup, !vaultExists);
  setVisibility(elements.vaultUnlock, vaultExists);
  setVisibility(elements.appShell, false);
  setVisibility(elements.bottomNav, false);
  setVisibility(elements.lockButton, false);
}

async function handleVaultSetupSubmit(event) {
  event.preventDefault();
  const passphrase = elements.setupPassphrase.value.trim();
  const confirmPassphrase = elements.setupConfirmPassphrase.value.trim();

  if (passphrase.length < 8) {
    elements.setupError.textContent = 'Passphrase must contain at least 8 characters.';
    setVisibility(elements.setupError, true);
    return;
  }
  if (passphrase !== confirmPassphrase) {
    elements.setupError.textContent = 'Passphrases do not match.';
    setVisibility(elements.setupError, true);
    return;
  }

  setVisibility(elements.setupError, false);
  setButtonBusy(elements.setupSubmitButton, 'Creating...');
  try {
    const session = await createVault(passphrase, { accounts: [] });
    elements.setupPassphrase.value = '';
    elements.setupConfirmPassphrase.value = '';
    await openUnlockedApp(session);
    setAppStatus('Vault created.');
  } catch (error) {
    elements.setupError.textContent = error?.message || 'Failed to create vault.';
    setVisibility(elements.setupError, true);
  } finally {
    resetButtonBusy(elements.setupSubmitButton);
  }
}

async function handleVaultUnlockSubmit(event) {
  event.preventDefault();
  const passphrase = elements.unlockPassphrase.value.trim();
  if (!passphrase) {
    setUnlockMessage('Enter your vault passphrase.');
    return;
  }

  setUnlockMessage('');
  setButtonBusy(elements.unlockSubmitButton, 'Unlocking...');
  try {
    const session = await unlockVault(passphrase);
    elements.unlockPassphrase.value = '';
    await openUnlockedApp(session);
  } catch (error) {
    setUnlockMessage(error?.message || 'Failed to unlock vault.');
  } finally {
    resetButtonBusy(elements.unlockSubmitButton);
  }
}

function wireDomReferences() {
  elements.vaultSetup = byId('vault-setup');
  elements.vaultUnlock = byId('vault-unlock');
  elements.appShell = byId('app-shell');
  elements.bottomNav = byId('bottom-nav');
  elements.lockButton = byId('lock-button');
  elements.themeToggle = byId('theme-toggle');

  elements.setupForm = byId('vault-setup-form');
  elements.setupPassphrase = byId('setup-passphrase');
  elements.setupConfirmPassphrase = byId('setup-confirm-passphrase');
  elements.setupError = byId('setup-error');
  elements.setupSubmitButton = elements.setupForm.querySelector('button[type="submit"]');

  elements.unlockForm = byId('vault-unlock-form');
  elements.unlockPassphrase = byId('unlock-passphrase');
  elements.unlockError = byId('unlock-error');
  elements.unlockSubmitButton = elements.unlockForm.querySelector('button[type="submit"]');

  elements.appStatus = byId('app-status');
  elements.authInput = byId('auth-input');
  elements.accountNameInput = byId('account-name-input');
  elements.generateButton = byId('generate-button');
  elements.saveButton = byId('save-button');
  elements.generateError = byId('generate-error');
  elements.activeCodeCard = byId('active-code-card');
  elements.activeCode = byId('active-code');
  elements.activeAccountMeta = byId('active-account-meta');
  elements.activeTimeLeft = byId('active-time-left');
  elements.activeCopyButton = byId('active-copy-button');
  elements.activeProgress = byId('active-progress');

  elements.savedEmpty = byId('saved-empty');
  elements.savedList = byId('saved-list');
  elements.exportBackupButton = byId('export-backup-button');
  elements.importBackupInput = byId('import-backup-input');
  elements.changePassphraseForm = byId('change-passphrase-form');
  elements.currentPassphraseInput = byId('current-passphrase-input');
  elements.newPassphraseInput = byId('new-passphrase-input');
  elements.confirmNewPassphraseInput = byId('confirm-new-passphrase-input');
  elements.changePassphraseError = byId('change-passphrase-error');
  elements.changePassphraseSubmitButton = elements.changePassphraseForm.querySelector('button[type="submit"]');
  elements.viewPanels = {
    generate: byId('view-generate'),
    saved: byId('view-saved'),
    scan: byId('view-scan'),
    settings: byId('view-settings')
  };
  elements.viewButtons = Array.from(document.querySelectorAll('.view-button'));

  elements.qrFileInput = byId('qr-file-input');
  elements.scanButton = byId('scan-button');
  elements.scanStatus = byId('scan-status');
  elements.scanFallbackInput = byId('scan-fallback-input');
  elements.scanFallbackButton = byId('scan-fallback-button');
}

function bindEventListeners() {
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.lockButton.addEventListener('click', lockVault);

  elements.setupForm.addEventListener('submit', handleVaultSetupSubmit);
  elements.unlockForm.addEventListener('submit', handleVaultUnlockSubmit);

  elements.generateButton.addEventListener('click', handleGenerateCode);
  elements.saveButton.addEventListener('click', handleSaveAccount);
  elements.activeCopyButton.addEventListener('click', handleActiveCopy);
  elements.savedList.addEventListener('click', handleSavedListAction);
  elements.exportBackupButton.addEventListener('click', handleExportBackup);
  elements.importBackupInput.addEventListener('change', handleImportBackup);
  elements.changePassphraseForm.addEventListener('submit', handleChangePassphraseSubmit);

  elements.scanButton.addEventListener('click', handleScanFromImage);
  elements.scanFallbackButton.addEventListener('click', handleFallbackTextImport);

  elements.viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetView = button.dataset.view;
      setView(targetView);
    });
  });

  elements.authInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleGenerateCode();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  wireDomReferences();
  bindEventListeners();
  await loadTheme();
  await initializeVaultScreens();
  setScanStatus('Tip: upload a QR screenshot or paste OCR text.');
});

window.addEventListener('unload', stopTicker);
