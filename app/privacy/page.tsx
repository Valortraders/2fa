import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data handling practices for Valortraders 2FA authenticator.',
  openGraph: {
    title: 'Privacy Policy | Valortraders 2FA',
    description: 'Learn about our privacy policy and how we handle your data.',
  }
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - Valortraders 2FA',
    description: 'Privacy policy and data handling practices for Valortraders 2FA authenticator.',
    publisher: {
      '@type': 'Organization',
      name: 'Valortraders',
      url: 'https://valortraders.com'
    },
    inLanguage: 'en',
    lastReviewed: '2024-03-22',
    url: 'https://2fa.valortraders.com/privacy',
    mainEntity: {
      '@type': 'WebContent',
      about: {
        '@type': 'Thing',
        name: 'Privacy Policy'
      },
      text: 'Privacy policy for Valortraders 2FA service, explaining data collection, storage, and security practices.'
    }
  };

  return (
    <>
      <Script
        id="privacy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: March 22, 2024</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p>
              At Valortraders, we take your privacy seriously. This privacy policy explains how we handle your data
              when you use our two-factor authentication service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Collection</h2>
            <p>
              Our 2FA service is designed with privacy in mind. We do not collect, store, or transmit any personal data
              or authentication secrets. All 2FA operations are performed locally in your browser.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No personal information is collected</li>
              <li>No authentication secrets are stored on our servers</li>
              <li>No analytics or tracking cookies are used</li>
              <li>No data is shared with third parties</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Local Storage</h2>
            <p>
              The application uses your browser&apos;s local storage only for theme preferences (light/dark mode).
              This data never leaves your device and is not accessible to us or any third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Security</h2>
            <p>
              All 2FA operations are performed client-side using industry-standard TOTP algorithms. Your authentication
              secrets are never transmitted over the network or stored anywhere.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Security Note:</strong> While we implement best practices for security, please ensure you keep your
                2FA secrets secure and never share them with anyone.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <p>
              Our website is hosted on Vercel and uses their infrastructure. While they may collect basic server logs,
              we do not use any additional third-party services, analytics, or tracking tools.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new
              privacy policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at{' '}
              <Link 
                href="mailto:privacy@valortraders.com" 
                className="text-primary hover:underline"
              >
                privacy@valortraders.com
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
