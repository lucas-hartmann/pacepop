"use client"
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

type Item = { q: string; a: string }

function FAQItem({ item }: { item: Item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[hsl(var(--border))] py-3">
      <button
        className="w-full flex items-center justify-between text-left py-2"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium">{item.q}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="text-sm text-[hsl(var(--muted-fg))] pr-6"
        >
          {item.a}
        </motion.div>
      )}
    </div>
  )
}

export function FAQ() {
  const items: Item[] = [
    {
      q: 'What is PacePop?',
      a: 'PacePop is a minimalist way to share launches and collect interest with clarity and speed.',
    },
    {
      q: 'When will it be available?',
      a: 'We are inviting early users from the waitlist soon. Join now to get notified first.',
    },
    {
      q: 'Is the waitlist free?',
      a: 'Yes. There is no obligation—just early updates and access when ready.',
    },
    {
      q: 'How do you handle my email?',
      a: 'We store it securely and only use it to send product updates. You can opt out anytime.',
    },
  ]

  return (
    <section id="faq" className="mx-auto max-w-3xl container-px py-12 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center">FAQ</h2>
      <div className="mt-6 sm:mt-8 divide-y divide-[hsl(var(--border))]">
        {items.map((it) => (
          <FAQItem key={it.q} item={it} />
        ))}
      </div>
    </section>
  )
}

