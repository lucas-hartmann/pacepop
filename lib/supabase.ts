import { createClient } from '@supabase/supabase-js'

export function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing Supabase public env vars')
  return createClient(url, anon)
}

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !service) throw new Error('Missing Supabase service env vars')
  return createClient(url, service, { auth: { persistSession: false } })
}

