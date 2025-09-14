import { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent-gradient text-white flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-[hsl(var(--muted-fg))]">{description}</p>
    </div>
  )
}

