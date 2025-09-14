import { NextRequest } from 'next/server'

type Bucket = { tokens: number; updatedAt: number }

const buckets = new Map<string, Bucket>()

// Token bucket: 5 requests / 600s, refill linearly
const CAPACITY = 5
const WINDOW_MS = 10 * 60 * 1000

export function getClientIp(req: NextRequest) {
  const xf = req.headers.get('x-forwarded-for')
  return (xf?.split(',')[0]?.trim() || req.ip || 'unknown') as string
}

export function rateLimitAllow(req: NextRequest) {
  const key = `ip:${getClientIp(req)}`
  const now = Date.now()
  const prev = buckets.get(key) || { tokens: CAPACITY, updatedAt: now }
  const elapsed = now - prev.updatedAt
  const refill = (elapsed / WINDOW_MS) * CAPACITY
  const tokens = Math.min(CAPACITY, prev.tokens + refill)
  const allowed = tokens >= 1
  const nextTokens = Math.max(0, tokens - 1)
  buckets.set(key, { tokens: allowed ? nextTokens : tokens, updatedAt: now })
  return allowed
}

