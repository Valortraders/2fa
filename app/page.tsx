'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { generateTOTP } from '../lib/auth/totp';
import { Copy, Check, AlertCircle, KeyRound, Info } from 'lucide-react';
import { authenticator } from 'otplib';
import { AdCard } from '../components/ad-card';
import { AppError, ErrorCodes } from '../lib/error-handler';
import Script from 'next/script';

export default function HomePage() {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const validateAndCleanSecret = (input: string) => {
    // Remove spaces and convert to uppercase
    const cleanSecret = input.replace(/\s/g, '').toUpperCase();
    
    // Check if it's a valid base32 string
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(cleanSecret)) {
      setError('Secret key must only contain letters A-Z and numbers 2-7');
      return null;
    }

    try {
      // This will throw if the secret is invalid
      authenticator.decode(cleanSecret);
      setError('');
      return cleanSecret;
    } catch (e: unknown) {
      void e; // Explicitly ignore error
      setError('Invalid secret key format. Please check your input.');
      return null;
    }
  };

  const generateCode = useCallback(() => {
    if (!secret.trim()) return;
    
    const cleanSecret = validateAndCleanSecret(secret);
    if (!cleanSecret) {
      setCode('');
      return;
    }

    try {
      const totpCode = generateTOTP(cleanSecret);
      setCode(totpCode);
      setError('');
    } catch (e) {
      if (e instanceof AppError) {
        setError(e.message);
        if (e.code === ErrorCodes.RATE_LIMIT_EXCEEDED) {
          return;
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setCode('');
    }
  }, [secret]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSecretChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSecret = event.target.value;
    setSecret(newSecret);
    if (newSecret.trim()) {
      validateAndCleanSecret(newSecret);
    } else {
      setError('');
    }
  };

  useEffect(() => {
    if (!secret.trim()) {
      setCode('');
      setError('');
      return;
    }

    const cleanSecret = validateAndCleanSecret(secret);
    if (!cleanSecret) return;

    const updateTimeAndCode = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeStep = 30;
      const currentTimeSlot = Math.floor(now / timeStep);
      const nextUpdate = (currentTimeSlot + 1) * timeStep;
      setTimeLeft(nextUpdate - now);

      // Only generate new code when we're at the start of a new time slot
      if (now % timeStep === 0) {
        generateCode();
      }
    };

    // Initial update
    updateTimeAndCode();
    generateCode();

    // Update timer every second
    const timer = setInterval(updateTimeAndCode, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secret, generateCode]);

  return (
    <>
      {/* JSON-LD structured data for the homepage */}
      <Script
        id="homepage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Valortraders 2FA Generator',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            description: 'Free and secure two-factor authentication (2FA) code generator for enhanced account security.',
            featureList: [
              'Generate TOTP codes instantly',
              'No data storage or tracking',
              'Open-source and privacy-focused',
              'Works with any standard 2FA implementation'
            ],
            screenshot: 'https://2fa.valortraders.com/app-screenshot.png',
            softwareHelp: 'https://2fa.valortraders.com/privacy',
            author: {
              '@type': 'Organization',
              name: 'Valortraders',
              url: 'https://valortraders.com'
            },
            keywords: '2FA, two-factor authentication, security, TOTP, authenticator'
          })
        }}
      />

      <div className="w-full max-w-md mx-auto px-4">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 mx-auto">
              <KeyRound className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <h1 className="text-2xl font-medium">2FA Code Generator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your 2FA secret key to generate authentication codes
            </p>
          </div>

          <div className="space-y-4">
            {/* Input Container */}
            <div className="p-6 rounded-lg border border-gray-200/20 dark:border-gray-800/20 bg-purple-50/30 dark:bg-purple-900/10 backdrop-blur-md backdrop-saturate-150 shadow-lg">
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Enter your secret key"
                    value={secret}
                    onChange={handleSecretChange}
                    className={`h-12 bg-white/50 dark:bg-white/5 border-0 text-center text-lg font-mono 
                      placeholder:text-gray-400 dark:placeholder:text-gray-500 
                      focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-800/20
                      ${error ? 'ring-1 ring-red-500' : ''}`}
                    aria-label="Secret key input"
                  />
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Info className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Secret keys contain only letters A-Z and numbers 2-7
                    </p>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm justify-center px-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {code && (
                <div className="mt-6 space-y-4">
                  <div className="p-8 rounded-lg bg-white/50 dark:bg-white/5 relative overflow-hidden">
                    {/* Progress bar */}
                    <div 
                      className="absolute bottom-0 left-0 h-0.5 bg-purple-500/50 dark:bg-purple-400/50 transition-all duration-1000"
                      style={{ width: `${(timeLeft / 30) * 100}%` }}
                      aria-hidden="true"
                    />
                    
                    {/* Code display */}
                    <div className="space-y-6">
                      <p className="text-3xl md:text-4xl font-mono font-bold tracking-[0.5em] text-center break-all" aria-live="polite" aria-label={`Your 2FA code is ${code}`}>
                        {code}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400 min-w-[90px]" aria-live="polite">
                          Refreshes in {timeLeft}s
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-200/50
                            dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
                          onClick={handleCopy}
                          aria-label={copied ? "Code copied" : "Copy code to clipboard"}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ad Space - Always visible */}
          <div className="mt-8">
            <AdCard />
          </div>
        </div>
      </div>
    </>
  );
} 