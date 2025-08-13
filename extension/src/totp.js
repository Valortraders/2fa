import CryptoJS from 'crypto-js';

function base32ToHex(base32) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue; // Skip padding or separators
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }

  return hex;
}

function base64ToHex(base64) {
  try {
    const wordArray = CryptoJS.enc.Base64.parse(base64);
    return wordArray.toString(CryptoJS.enc.Hex);
  } catch {
    throw new Error('Invalid base64 secret');
  }
}

function intToBytes(num) {
  const bytes = new Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = num >> 8;
  }
  return bytes;
}

function hmacHex(messageHex, keyHex, algorithm) {
  const message = CryptoJS.enc.Hex.parse(messageHex);
  const key = CryptoJS.enc.Hex.parse(keyHex);
  if (algorithm === 'SHA256') {
    return CryptoJS.HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
  }
  if (algorithm === 'SHA512') {
    return CryptoJS.HmacSHA512(message, key).toString(CryptoJS.enc.Hex);
  }
  return CryptoJS.HmacSHA1(message, key).toString(CryptoJS.enc.Hex);
}

function truncateToCode(hashHex, digits) {
  const offset = (parseInt(hashHex.slice(-1), 16) & 0xf) * 2;
  const truncatedHash = hashHex.substr(offset, 8);
  const codeInt = parseInt(truncatedHash, 16) & 0x7fffffff;
  const mod = 10 ** digits;
  return (codeInt % mod).toString().padStart(digits, '0');
}

export function parseAuthInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Empty secret');
  }

  const raw = input.trim();

  // otpauth URI
  if (raw.toLowerCase().startsWith('otpauth://')) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      throw new Error('Invalid otpauth URI');
    }

    const type = url.hostname.toLowerCase(); // 'totp' or 'hotp'
    const params = new URLSearchParams(url.search);
    const secretParam = (params.get('secret') || '').replace(/\s/gi, '');
    if (!secretParam) throw new Error('Missing secret in URI');

    const algorithm = (params.get('algorithm') || 'SHA1').toUpperCase();
    const digits = parseInt(params.get('digits') || '6', 10);
    const period = parseInt(params.get('period') || '30', 10);
    const counter = parseInt(params.get('counter') || '0', 10);
    const issuer = params.get('issuer') || '';
    const label = decodeURIComponent(url.pathname.replace(/^\//, ''));

    const secretHex = decodeSecretToHex(secretParam);

    if (type !== 'totp' && type !== 'hotp') {
      throw new Error('Unsupported OTP type');
    }

    return {
      type,
      secretHex,
      algorithm: ['SHA1', 'SHA256', 'SHA512'].includes(algorithm) ? algorithm : 'SHA1',
      digits: Number.isFinite(digits) && digits >= 6 && digits <= 10 ? digits : 6,
      period: Number.isFinite(period) && period > 0 ? period : 30,
      counter: Number.isFinite(counter) && counter >= 0 ? counter : 0,
      issuer,
      label
    };
  }

  // Raw secret: support base32 (default), hex (0x.. or [0-9a-f]), and base64
  const cleaned = raw.replace(/\s/gi, '');
  let secretHex;
  try {
    secretHex = decodeSecretToHex(cleaned);
  } catch (e) {
    throw new Error('Invalid secret key format');
  }

  return {
    type: 'totp',
    secretHex,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    counter: 0,
    issuer: '',
    label: ''
  };
}

function decodeSecretToHex(secret) {
  // Hex prefixed
  if (/^0x[0-9a-fA-F]+$/.test(secret)) {
    return secret.slice(2).toLowerCase();
  }
  // Plain hex
  if (/^[0-9a-fA-F]+$/.test(secret) && secret.length % 2 === 0) {
    return secret.toLowerCase();
  }
  // Base32
  if (/^[A-Za-z2-7]+=*$/.test(secret)) {
    return base32ToHex(secret.toUpperCase());
  }
  // Base64 (fallback)
  if (/^[A-Za-z0-9+/=]+$/.test(secret)) {
    return base64ToHex(secret);
  }
  throw new Error('Unsupported secret encoding');
}

export function generateOTP(config) {
  if (!config || !config.secretHex) {
    throw new Error('Invalid configuration');
  }
  const algorithm = (config.algorithm || 'SHA1').toUpperCase();
  const digits = config.digits || 6;

  if (config.type === 'hotp') {
    const counterBytes = intToBytes(config.counter || 0);
    const counterHex = Array.from(counterBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const hashHex = hmacHex(counterHex, config.secretHex, algorithm);
    return truncateToCode(hashHex, digits);
  }

  const period = config.period || 30;
  const time = Math.floor(Date.now() / 1000 / period);
  const timeBytes = intToBytes(time);
  const timeHex = Array.from(timeBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = hmacHex(timeHex, config.secretHex, algorithm);
  return truncateToCode(hashHex, digits);
}

// Backwards-compatible validators for existing callers
export function validateSecret(secret) {
  try {
    parseAuthInput(secret);
    return secret;
  } catch {
    return null;
  }
}

// Backwards compatibility: keep generateTOTP for simple base32 secrets
export function generateTOTP(secret) {
  const cfg = parseAuthInput(secret);
  if (cfg.type !== 'totp') throw new Error('HOTP requires a counter');
  return generateOTP(cfg);
}