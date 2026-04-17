import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ManagedCategoriesSyncInit } from '@/components/managed-categories-sync-init'
import { ProductsSyncInit } from '@/components/products-sync-init'
import { SocialLinksSyncInit } from '@/components/social-links-sync-init'
import './globals.css'

const SITE_TITLE = 'Pickup Jiristore Official Website'
const SITE_DESCRIPTION =
  'Official website of Pickup Jiristore. Explore premium footwear collections, latest arrivals, and trusted brands for men and women.'
const SITE_IMAGE_PATH = '/logo.png'
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.URL?.trim() ||
  process.env.VERCEL_URL?.trim() ||
  'https://jiri-store.firebaseapp.com'
const SITE_URL = RAW_SITE_URL.startsWith('http')
  ? RAW_SITE_URL
  : `https://${RAW_SITE_URL}`

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: '/',
    siteName: SITE_TITLE,
    images: [
      {
        url: SITE_IMAGE_PATH,
        width: 2720,
        height: 2048,
        alt: 'Pickup Jiristore logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE_PATH],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased scroll-smooth">
        <ProductsSyncInit />
        <ManagedCategoriesSyncInit />
        <SocialLinksSyncInit />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
