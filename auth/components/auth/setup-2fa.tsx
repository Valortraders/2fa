'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { generateTOTPSecret, verifyTOTP, TOTPSecret } from '@/lib/auth/totp';

interface Setup2FAProps {
  email: string;
  onSuccess: (secret: string) => void;
  onCancel: () => void;
}

export function Setup2FA({ email, onSuccess, onCancel }: Setup2FAProps) {
  const [secret, setSecret] = useState<TOTPSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const totpSecret = await generateTOTPSecret(email);
      setSecret(totpSecret);
    } catch (_error: unknown) {
      void _error;
      toast({
        title: 'Error',
        description: 'Failed to generate 2FA secret. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (!secret) return;

    if (verifyTOTP(verificationCode, secret.secret)) {
      onSuccess(secret.secret);
      toast({
        title: 'Success',
        description: '2FA has been successfully set up!',
      });
    } else {
      toast({
        title: 'Invalid Code',
        description: 'The verification code is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!secret) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">Set Up Two-Factor Authentication</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Two-factor authentication adds an extra layer of security to your account.
          Use an authenticator app like Google Authenticator or Authy.
        </p>
        <Button onClick={handleSetup} disabled={isLoading}>
          {isLoading ? 'Setting up...' : 'Begin Setup'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Do this later
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Scan QR Code</h2>
      <p className="text-muted-foreground text-center">
        Scan this QR code with your authenticator app. Then enter the verification
        code below.
      </p>
      
      <div className="relative aspect-square w-48">
        <Image
          src={secret.qrCode}
          alt="2FA QR Code"
          fill
          className="rounded-lg"
        />
      </div>

      <div className="w-full space-y-2">
        <Label htmlFor="verificationCode">Verification Code</Label>
        <Input
          id="verificationCode"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
      </div>

      <div className="flex gap-4 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleVerify}
          disabled={verificationCode.length !== 6}
        >
          Verify
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium">Manual Entry</p>
        <p>If you can&apos;t scan the QR code, enter this code manually:</p>
        <code className="bg-muted p-2 rounded block mt-1 text-center select-all">
          {secret.secret}
        </code>
      </div>

      <p>Don&apos;t forget to save your backup codes</p>
    </div>
  );
} 