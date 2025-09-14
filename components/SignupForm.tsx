"use client"
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Please enter a valid email')
})

type FormValues = z.infer<typeof schema>

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (res.ok) {
        if (data?.status === 'already_subscribed') {
          setToast({ type: 'success', message: 'You are already on the list. Welcome back!' })
        } else {
          setToast({ type: 'success', message: 'Thanks! You are on the waitlist.' })
          reset()
        }
      } else {
        setToast({ type: 'error', message: data?.error || 'Something went wrong. Please try again.' })
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="input"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary h-12 px-5 min-w-[10rem]" disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Joining…</span>
          ) : (
            'Join Waitlist'
          )}
        </button>
      </form>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg border text-sm max-w-sm ${
            toast.type === 'success'
              ? 'bg-white dark:bg-[hsl(var(--bg))] border-green-300 text-green-800 dark:text-green-300'
              : 'bg-white dark:bg-[hsl(var(--bg))] border-red-300 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

