import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and usage conditions for Valortraders 2FA authenticator.',
  openGraph: {
    title: 'Terms of Service | Valortraders 2FA',
    description: 'Learn about our terms of service and usage conditions.',
  }
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - Valortraders 2FA',
    description: 'Terms of service and usage conditions for Valortraders 2FA authenticator.',
    publisher: {
      '@type': 'Organization',
      name: 'Valortraders',
      url: 'https://valortraders.com'
    },
    inLanguage: 'en',
    lastReviewed: '2024-06-01',
    url: 'https://2fa.valortraders.com/terms',
    mainEntity: {
      '@type': 'WebContent',
      about: {
        '@type': 'Thing',
        name: 'Terms of Service'
      },
      text: 'Terms of service for Valortraders 2FA service, explaining usage conditions, limitations, and legal information.'
    }
  };

  return (
    <>
      <Script
        id="terms-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: June 1, 2024</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p>
              Welcome to Valortraders 2FA. By accessing or using our service, you agree to be bound by these Terms of Service.
              If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Use of Service</h2>
            <p>
              Valortraders 2FA is a free service that generates time-based one-time passwords (TOTP) for two-factor authentication.
              The service is provided &quot;as is&quot; without warranty of any kind.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may use this service for personal or commercial purposes</li>
              <li>You are responsible for maintaining the security of your authentication secrets</li>
              <li>You agree not to misuse the service or attempt to interfere with its operation</li>
              <li>We reserve the right to modify or discontinue the service at any time</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Intellectual Property</h2>
            <p>
              The Valortraders 2FA service, including its code, design and branding, is owned by Valortraders.
              The service is open-source under the MIT license, which allows for modification and redistribution
              under certain conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
            <p>
              In no event shall Valortraders, its directors, employees, partners, agents, suppliers, or affiliates
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> While we implement industry-standard security practices, we cannot guarantee
                absolute security. You use this service at your own risk.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which
              Valortraders operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
              provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change
              will be determined at our sole discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <Link 
                href="mailto:legal@valortraders.com" 
                className="text-primary hover:underline"
              >
                legal@valortraders.com
              </Link>
            </p>
          </section>

          <div className="pt-8 border-t border-border">
            <Link 
              href="/"
              className="text-primary hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 