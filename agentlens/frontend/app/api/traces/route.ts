import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase'

export async function GET(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('traces')
      .select('*, agents(name, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (agentId) query = query.eq('agent_id', agentId)
    if (status) query = query.eq('status', status)
    if (limit) query = query.limit(limit)

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('GET /api/traces error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('traces')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/traces error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const traceId = searchParams.get('id')
    
    if (!traceId) {
      return NextResponse.json({ error: 'Trace ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('traces')
      .update(body)
      .eq('id', traceId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('PUT /api/traces error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const traceId = searchParams.get('id')
    
    if (!traceId) {
      return NextResponse.json({ error: 'Trace ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('traces')
      .delete()
      .eq('id', traceId)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/traces error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
