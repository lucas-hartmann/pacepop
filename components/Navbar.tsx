"use client"
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-white/70 dark:bg-[hsl(var(--bg))]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl container-px h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-1" aria-label="PacePop Home">
        <div className="flex items-center gap-2">
           <img
                src={"/logo.png"}
                className="h-10"
                alt="PacePop Logo"
            />
          <span
            className="relative top-[2px] text-lg text-transparent font-bold bg-clip-text bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)]"
          >
            PacePop
          </span>
        </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="#signup" className="btn btn-primary h-9 px-4 text-sm">
            Join Waitlist
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

