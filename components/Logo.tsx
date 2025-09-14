"use client"
import * as React from 'react'

type Props = React.SVGProps<SVGSVGElement> & { withText?: boolean }

export function Logo({ withText = true, ...props }: Props) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={!withText}
        {...props}
      >
        <defs>
          <linearGradient id="ppg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-from)" />
            <stop offset="100%" stopColor="var(--accent-to)" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#ppg)" opacity="0.2" />
        <path
          d="M14 27V13h8.2c3.4 0 5.8 2.28 5.8 5.5S25.6 24 22.2 24H18v3h-4Zm4-7h4.2c1.2 0 2.2-1.02 2.2-1.5S23.4 16 22.2 16H18v4Z"
          fill="url(#ppg)"
        />
      </svg>
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-[hsl(var(--fg))]">
          PacePop
        </span>
      )}
    </div>
  )
}

