"use client"
import { Navbar } from '@/components/Navbar'
import { FeatureCard } from '@/components/FeatureCard'
import { FAQ } from '@/components/FAQ'
import { SignupForm } from '@/components/SignupForm'
import { motion } from 'framer-motion'
import { Bolt, GaugeCircle, Layout, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="container-px mx-auto max-w-6xl pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Launch faster with clarity.
            </h1>
            <p className="mt-4 text-[hsl(var(--muted-fg))] text-lg">
              PacePop is a minimalist launch page that helps you share your vision and collect interest—without the clutter.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#signup" className="btn btn-primary h-11 px-6">Join Waitlist</a>
              <a href="#features" className="btn btn-outline h-11 px-6">Learn more</a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-white/50 dark:bg-white/5 backdrop-blur-sm aspect-video shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-accent-gradient opacity-10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-sm text-[hsl(var(--muted-fg))]">
                Minimal UI designed for speed and signal.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-px mx-auto max-w-6xl py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold">What you get</h2>
          <p className="mt-3 text-[hsl(var(--muted-fg))]">Essentials only. Crafted for focused launches and clear storytelling.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <FeatureCard icon={<GaugeCircle className="h-5 w-5" />} title="Fast setup" description="Go from idea to live page in minutes, not hours." />
          <FeatureCard icon={<Layout className="h-5 w-5" />} title="Clean design" description="Whitespace, thoughtful typography, and accessible defaults." />
          <FeatureCard icon={<Bolt className="h-5 w-5" />} title="Built-in waitlist" description="Collect emails securely with duplicate detection." />
          <FeatureCard icon={<Shield className="h-5 w-5" />} title="Privacy-first" description="We only use your email to send product updates." />
        </div>
      </section>

      {/* Pricing (coming soon) */}
      <section id="pricing" className="container-px mx-auto max-w-5xl py-12 sm:py-16">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Pricing</h2>
          <p className="mt-3 text-[hsl(var(--muted-fg))]">Coming soon. Early adopters from the waitlist get special access.</p>
          <div className="mt-6">
            <a href="#signup" className="btn btn-primary h-11 px-6">Join Waitlist</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Signup */}
      <section id="signup" className="container-px mx-auto max-w-2xl py-12 sm:py-16">
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold">Get early access</h2>
          <p className="mt-2 text-[hsl(var(--muted-fg))]">Join the waitlist and we’ll email you when we launch.</p>
          <div className="mt-5">
            <SignupForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-14 border-t border-[hsl(var(--border))] py-6">
        <div className="container-px mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[hsl(var(--muted-fg))]">
          <p>© {new Date().getFullYear()} PacePop</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

