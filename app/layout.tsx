import '../styles/globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'PacePop',
  description: 'Join the PacePop waitlist to get early access.',
  metadataBase: new URL('https://pacepop.run'),
}

function ThemeScript() {
  const code = `
  try {
    const ls = localStorage.getItem('pacepop-theme');
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const systemDark = mql.matches;
    const theme = ls || (systemDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch {}
  `
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
