const VAULT_STORAGE_KEY = 'secureVaultV1';
const VAULT_VERSION = 1;
const PBKDF2_ITERATIONS = 250000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function ensureSubtleCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto is not available in this browser build.');
  }
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(passphrase, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptPayload(payload, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext))
  };
}

async function decryptPayload(encryptedPayload, key) {
  const iv = base64ToBytes(encryptedPayload.iv);
  const data = base64ToBytes(encryptedPayload.data);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const text = decoder.decode(new Uint8Array(plaintext));
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Vault payload is corrupted.');
  }
  return parsed;
}

async function getVaultRecord() {
  const result = await chrome.storage.local.get(VAULT_STORAGE_KEY);
  return result?.[VAULT_STORAGE_KEY] ?? null;
}

export async function hasVault() {
  ensureSubtleCrypto();
  const record = await getVaultRecord();
  return Boolean(record);
}

export async function createVault(passphrase, payload = { accounts: [] }) {
  ensureSubtleCrypto();
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Passphrase must contain at least 8 characters.');
  }

  const existingRecord = await getVaultRecord();
  if (existingRecord) {
    throw new Error('Vault already exists.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveAesKey(passphrase, salt);
  const encrypted = await encryptPayload(payload, key);
  const saltBase64 = bytesToBase64(salt);

  await chrome.storage.local.set({
    [VAULT_STORAGE_KEY]: {
      version: VAULT_VERSION,
      salt: saltBase64,
      encrypted
    }
  });

  return {
    key,
    salt: saltBase64,
    data: payload
  };
}

export async function unlockVault(passphrase) {
  ensureSubtleCrypto();
  const record = await getVaultRecord();
  if (!record) {
    throw new Error('Vault has not been initialized.');
  }
  if (record.version !== VAULT_VERSION || !record.salt || !record.encrypted) {
    throw new Error('Unsupported vault version.');
  }

  const key = await deriveAesKey(passphrase, base64ToBytes(record.salt));
  let data;
  try {
    data = await decryptPayload(record.encrypted, key);
  } catch {
    throw new Error('Invalid passphrase.');
  }

  if (!Array.isArray(data.accounts)) {
    data.accounts = [];
  }

  return {
    key,
    salt: record.salt,
    data
  };
}

export async function persistVault(session) {
  ensureSubtleCrypto();
  if (!session?.key || !session?.salt || !session?.data) {
    throw new Error('Vault session is not initialized.');
  }

  const encrypted = await encryptPayload(session.data, session.key);

  await chrome.storage.local.set({
    [VAULT_STORAGE_KEY]: {
      version: VAULT_VERSION,
      salt: session.salt,
      encrypted
    }
  });
}
