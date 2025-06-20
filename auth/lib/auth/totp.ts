import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { RateLimiter } from '../rate-limiter';
import { AppError, ErrorCodes } from '../error-handler';

// Configure authenticator
authenticator.options = {
  window: 1, // Allow one step before/after for time drift
  step: 30, // 30-second step
};

const rateLimiter = new RateLimiter(
  Number(process.env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS) || 10,
  (Number(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW) || 60) * 1000
);

export interface TOTPSecret {
  secret: string;
  uri: string;
  qrCode: string;
}

export const generateTOTPSecret = async (email: string, issuer: string = '2FA Authenticator'): Promise<TOTPSecret> => {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(email, issuer, secret);
  const qrCode = await QRCode.toDataURL(uri);

  return {
    secret,
    uri,
    qrCode,
  };
};

export const verifyTOTP = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};

export function validateSecret(secret: string): boolean {
  try {
    // Remove spaces and convert to uppercase
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    
    // Check if it's a valid base32 string
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(cleanSecret)) {
      return false;
    }

    // This will throw if the secret is invalid
    authenticator.decode(cleanSecret);
    return true;
  } catch (_e: unknown) {
    void _e; // Explicitly ignore error
    return false;
  }
}

export function generateTOTP(secret: string): string {
  try {
    // Rate limiting check
    const rateLimitCheck = rateLimiter.check(secret);
    if (!rateLimitCheck.success) {
      throw new AppError(
        `Too many attempts. Please try again in ${rateLimitCheck.timeLeft} seconds.`,
        429,
        ErrorCodes.RATE_LIMIT_EXCEEDED
      );
    }

    // Validate and clean secret
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    if (!validateSecret(cleanSecret)) {
      throw new AppError(
        'Invalid secret key format. Please check your input.',
        400,
        ErrorCodes.INVALID_SECRET
      );
    }

    // Generate TOTP
    const token = authenticator.generate(cleanSecret);
    return token;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      'Failed to generate code. Please check your secret key.',
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }
} 