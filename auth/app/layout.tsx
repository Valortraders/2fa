import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/theme-provider'
import { ValorLogo } from '../components/ui/valor-logo'
import { ThemeToggle } from '../components/ui/theme-toggle'
import { Footer } from '../components/ui/footer'
import { Toaster } from '../components/ui/toaster'
import Galaxy from '../components/galaxy/Galaxy'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Valortraders 2FA - Secure Two-Factor Authentication Generator',
    template: '%s | Valortraders 2FA'
  },
  description: 'Free, secure, and user-friendly two-factor authentication (2FA) generator for enhanced account security. Generate TOTP codes instantly without storing your secrets. Open-source, privacy-focused and built by Valortraders.',
  keywords: [
    '2FA', 'two-factor authentication', 'security', 'authentication', 'TOTP', 
    'Valortraders', 'crypto security', 'trading security', 'authenticator app',
    'secure login', 'account protection', 'time-based one-time password',
    'online security', 'privacy', 'open source 2FA', 'free 2FA generator',
    'secure authenticator', 'TOTP generator', 'multi-factor authentication',
    'OTP generator', 'security tool', 'password security'
  ],
  authors: [{ name: 'Valortraders', url: 'https://valortraders.com' }],
  creator: 'Valortraders',
  publisher: 'Valortraders',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://2fa.valortraders.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://2fa.valortraders.com',
    title: 'Valortraders 2FA - Secure Two-Factor Authentication Generator',
    description: 'Free, secure, and user-friendly two-factor authentication (2FA) generator for enhanced account security. Generate TOTP codes instantly without storing your secrets.',
    siteName: 'Valortraders 2FA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Valortraders 2FA - Secure Authentication Tool Preview',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Valortraders 2FA - Square Logo',
        type: 'image/png',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valortraders 2FA - Secure Two-Factor Authentication Generator',
    description: 'Free, secure, and user-friendly two-factor authentication (2FA) generator for enhanced account security.',
    creator: '@valoralgo',
    site: '@valoralgo',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
  category: 'Security',
  applicationName: 'Valortraders 2FA',
  classification: 'Security & Privacy',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Valor 2FA',
    'mobile-web-app-capable': 'yes',
    'application-name': 'Valortraders 2FA',
    'msapplication-TileColor': '#0A0B0D',
    'theme-color': '#0A0B0D',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0B0D" />
        <link rel="canonical" href="https://2fa.valortraders.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-white to-blue-50 dark:from-[#0A0B0D] dark:via-[#0A0B0D] dark:to-blue-950/20 text-gray-900 dark:text-white transition-colors">
            <Galaxy />
            
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0B0D]/80 backdrop-blur-sm border-b border-gray-200/20 dark:border-gray-800/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <ValorLogo />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center pt-24 pb-16">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        
        {/* Structured data for organization */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Valortraders',
              url: 'https://valortraders.com',
              logo: 'https://2fa.valortraders.com/logo.png',
              description: 'Professional trading platform and security tools provider',
              foundingDate: '2023',
              sameAs: [
                'https://twitter.com/valoralgo',
                'https://facebook.com/valoralgo',
                'https://linkedin.com/company/valoralgo',
                'https://youtube.com/@valoralgo',
                'https://t.me/valoralgo',
                'https://discord.gg/valortraders',
                'https://reddit.com/r/valoralgo'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@valortraders.com',
                contactType: 'customer service',
                availableLanguage: 'English'
              }
            })
          }}
        />
        
        {/* Structured data for website */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Valortraders 2FA',
              url: 'https://2fa.valortraders.com',
              description: 'Free, secure two-factor authentication generator',
              inLanguage: 'en-US',
              isAccessibleForFree: true,
              publisher: {
                '@type': 'Organization',
                name: 'Valortraders'
              }
            })
          }}
        />
        
        {/* Structured data for software application */}
        <Script
          id="application-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Valortraders 2FA',
              applicationCategory: 'SecurityApplication',
              applicationSubCategory: 'Two-Factor Authentication',
              operatingSystem: 'Web Browser',
              browserRequirements: 'Requires JavaScript. Requires HTML5.',
              softwareVersion: '1.0.0',
              releaseNotes: 'Initial release with TOTP support',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '124',
                bestRating: '5',
                worstRating: '1'
              },
              featureList: [
                'TOTP Code Generation',
                'Secure Local Storage',
                'Dark/Light Mode',
                'Mobile Responsive',
                'Open Source'
              ],
              screenshot: 'https://2fa.valortraders.com/og-image.png',
              downloadUrl: 'https://2fa.valortraders.com',
              installUrl: 'https://2fa.valortraders.com'
            })
          }}
        />
        
        {/* FAQ Structured Data */}
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Valortraders 2FA?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Valortraders 2FA is a free, secure, and user-friendly two-factor authentication generator that creates TOTP codes for enhanced account security.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Is Valortraders 2FA free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Valortraders 2FA is completely free to use with no hidden costs or premium features.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'How secure is this 2FA generator?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Very secure. All secrets are stored locally in your browser, never transmitted to our servers, and the app uses industry-standard TOTP algorithms.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Does it work offline?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, once loaded, the 2FA generator works completely offline as all computations happen in your browser.'
                  }
                }
              ]
            })
          }}
        />
        <Analytics />
      </body>
    </html>
  )
} 