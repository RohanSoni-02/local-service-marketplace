import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { PhoneFrame } from '@/components/phone-frame'
import { inventory } from '@/lib/mock-data'
import './globals.css'

const _headingFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
})
const _bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})
const _devanagariFont = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Thikana — Local shops, on call',
  description:
    'Book trusted local plumbers, electricians, carpenters and more, or rent tools from verified shops near you.',
  generator: 'v0.app',
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
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#0F5B4C' }],
  userScalable: false,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${_headingFont.variable} ${_bodyFont.variable} ${_devanagariFont.variable}`}
    >
      <body className="antialiased font-sans">
        <PhoneFrame>{children}</PhoneFrame>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          id="inventory-mock"
          dangerouslySetInnerHTML={{
            __html: `window.__INVENTORY_MOCK__ = ${JSON.stringify(
              inventory
            )};`,
          }}
        />
      </body>
    </html>
  )
}
