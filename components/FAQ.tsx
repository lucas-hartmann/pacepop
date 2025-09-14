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
    a: 'PacePop is a new endurance fueling product: a mouth-dissolving effervescent tablet that delivers 5g of carbs plus electrolytes in under 60 seconds. It’s designed as a clean, fun alternative to sticky energy gels.',
  },
  {
    q: 'When will PacePop be available?',
    a: 'We are in the prototype stage now. Join the waitlist to be the first to test our pilot packs when they launch later this year.',
  },
  {
    q: 'How do you handle my data?',
    a: 'We only collect your email for the waitlist. You can unsubscribe anytime. Your data will never be sold or shared.',
  },
  {
    q: 'How is PacePop different from gels?',
    a: 'Unlike gels, PacePop is clean, non-sticky, and dissolves directly in your mouth. You can micro-dose energy (5g at a time) instead of forcing down 20–30g in one go, reducing stomach issues.',
  },
  {
    q: 'How many should I take during a run?',
    a: 'It depends on your distance and intensity. A general guide is 1–2 tablets every 10–15 minutes, aiming for 30–60g carbs per hour. We’ll provide fueling guides when you join the waitlist.',
  },
  {
    q: 'What flavors are you making?',
    a: 'Our first test flavors are Citrus Blast, Cola Rush, Green Apple, and Salted Lime. Join the waitlist and help vote for your favorite!',
  },
  {
    q: 'Is it safe?',
    a: 'Yes. PacePop uses common sports nutrition ingredients (maltodextrin, fructose, electrolytes) in line with EFSA recommendations. All production will follow strict EU food safety standards.',
  },
];

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

