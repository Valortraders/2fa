'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { verifyTOTP } from '@/lib/auth/totp';

interface Verify2FAProps {
  secret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function Verify2FA({ secret, onSuccess, onCancel }: Verify2FAProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      if (verifyTOTP(code, secret)) {
        onSuccess();
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (_error: unknown) {
      void _error;
      toast({
        title: 'Error',
        description: 'An error occurred while verifying the code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
      <p className="text-muted-foreground text-center">
        Enter the verification code from your authenticator app to continue.
      </p>

      <div className="w-full space-y-2">
        <Label htmlFor="verificationCode">Verification Code</Label>
        <Input
          id="verificationCode"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="text-center text-2xl tracking-widest"
          autoComplete="one-time-code"
        />
      </div>

      <div className="flex gap-4 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleVerify}
          disabled={code.length !== 6 || isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        <p>Lost access to your authenticator app?</p>
        <Button variant="link" className="p-0 h-auto" onClick={onCancel}>
          Use recovery codes
        </Button>
      </div>
    </div>
  );
} 