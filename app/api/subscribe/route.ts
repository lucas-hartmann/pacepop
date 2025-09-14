import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceSupabase } from '@/lib/supabase'
import { rateLimitAllow } from '@/lib/rateLimit'

const BodySchema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  if (!rateLimitAllow(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { email } = parsed.data
  try {
    const supabase = getServiceSupabase()
    // Upsert with unique constraint on email; ignore duplicates
    const { error } = await supabase
      .from('waitlist_signups')
      .insert({ email })
    if (error) {
      // 23505 = unique_violation
      if ((error as any).code === '23505') {
        return NextResponse.json({ status: 'already_subscribed' })
      }
      // If duplicate constraint isn't present yet, check manually
      if (error.message?.toLowerCase().includes('duplicate')) {
        return NextResponse.json({ status: 'already_subscribed' })
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    return NextResponse.json({ status: 'subscribed' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

