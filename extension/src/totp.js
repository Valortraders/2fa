import CryptoJS from 'crypto-js';

function base32ToHex(base32) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';

  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue; // Skip padding
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }

  return hex;
}

function intToBytes(num) {
  const bytes = new Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = num >> 8;
  }
  return bytes;
}

export function generateTOTP(secret) {
  try {
    // Clean and validate the secret
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    
    // Convert base32 secret to hex
    const secretHex = base32ToHex(cleanSecret);
    const key = CryptoJS.enc.Hex.parse(secretHex);

    // Get current time period
    const time = Math.floor(Date.now() / 1000 / 30);
    const timeBytes = intToBytes(time);
    const timeHex = Array.from(timeBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const message = CryptoJS.enc.Hex.parse(timeHex);

    // Calculate HMAC
    const hash = CryptoJS.HmacSHA1(message, key);
    const hashHex = hash.toString(CryptoJS.enc.Hex);
    
    // Get offset
    const offset = parseInt(hashHex.slice(-1), 16) & 0xf;
    
    // Generate 6-digit code
    const truncatedHash = hashHex.substr(offset * 2, 8);
    const code = parseInt(truncatedHash, 16) & 0x7fffffff;
    return (code % 1000000).toString().padStart(6, '0');
  } catch (error) {
    throw new Error('Invalid secret key');
  }
}

export function validateSecret(secret) {
  try {
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    // Check if it's a valid base32 string
    if (!/^[A-Z2-7]+=*$/.test(cleanSecret)) {
      return null;
    }
    // Try to convert to hex to validate further
    base32ToHex(cleanSecret);
    return cleanSecret;
  } catch (error) {
    return null;
  }
} 