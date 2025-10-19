import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// OAuth callback handler
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

