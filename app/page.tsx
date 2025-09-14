"use client"
import { Navbar } from '@/components/Navbar'
import { FeatureCard } from '@/components/FeatureCard'
import { FAQ } from '@/components/FAQ'
import { SignupForm } from '@/components/SignupForm'
import { motion } from 'framer-motion'
import { Zap, Droplet, Candy, Leaf } from "lucide-react";


import Link from 'next/link'
import AnimatedPillsSection from '@/components/AnimatedPillSection'

export default function Page() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="container-px mx-auto max-w-6xl pt-8 sm:pt-16">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              PacePop - The new generation of fueling.
            </h1>
            <p className="mt-4 text-[hsl(var(--muted-fg))] text-lg">
              No more sticky gels. PacePop dissolves in your mouth in 60s <br></br> 5g carbs + electrolytes, clean fuel that goes down easy.
              </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#signup" className="btn btn-primary h-11 px-6">Join Waitlist</a>
              <a href="#features" className="btn btn-outline h-11 px-6">Learn more</a>
            </div>
          </motion.div>
          <AnimatedPillsSection />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-px mx-auto max-w-6xl py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-[hsl(var(--muted))]/40 text-[hsl(var(--muted-fg))]">
            Built for runners
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold">Why PacePop</h2>
          <p className="mt-3 text-[hsl(var(--muted-fg))]">
            Clean, dissolving fuel that melts in your mouth. No sticky gels - just smart energy you can actually enjoy.
          </p>
        </div>

        {/* Equal-height grid + proper Icon prop */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          <div className="h-full">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Clean Fuel, No Gels"
              description="Dissolves in under 60s for quick energy without the mess or gut bombs."
            />
          </div>
          <div className="h-full">
            <FeatureCard
              icon={<Droplet className="h-5 w-5" />}
              title="Smart Energy Dosing"
              description="Each tablet = 5g carbs + electrolytes. Take 1–2 every 10–15 min to hit your plan."
            />
          </div>
          <div className="h-full">
            <FeatureCard
              icon={<Candy className="h-5 w-5" />}
              title="Flavors You’ll Like"
              description="Citrus Blast, Cola Rush, Green Apple, Salted Lime—fuel that actually tastes good."
            />
          </div>
          <div className="h-full">
            <FeatureCard
              icon={<Leaf className="h-5 w-5" />}
              title="Pocket-Friendly"
              description="Slim blister strips slip into any pocket—perfect for 5Ks to long trail days."
            />
          </div>
        </div>

        {/* Mini highlights: centered, consistent pills */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-[hsl(var(--muted-fg))]">
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-center">5g carbs / tab</div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-center">Electrolytes included</div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-center">Dissolves &lt; 60s</div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-center">Made in the EU</div>
        </div>
      </section>


      {/* Pricing (coming soon) */}
      {/* <section id="pricing" className="container-px mx-auto max-w-5xl py-12 sm:py-16">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Pricing</h2>
          <p className="mt-3 text-[hsl(var(--muted-fg))]">Coming soon. Early adopters from the waitlist get special access.</p>
          <div className="mt-6">
            <a href="#signup" className="btn btn-primary h-11 px-6">Join Waitlist</a>
          </div>
        </div>
      </section> */}

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

