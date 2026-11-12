import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "@fontsource-variable/onest"
import "@fontsource-variable/bricolage-grotesque"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Thikana — local shops, on call", template: "%s · Thikana" },
  description:
    "Book trusted local plumbers, electricians, carpenters and more, or rent tools from verified shops near you.",
  applicationName: "Thikana",
  appleWebApp: { capable: true, title: "Thikana", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8f5ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <div className="relative mx-auto min-h-dvh w-full max-w-[30rem] bg-background sm:border-x sm:border-line">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "14px",
              border: "1px solid var(--color-line)",
              background: "var(--color-surface)",
              color: "var(--color-ink)",
            },
          }}
        />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  )
}
