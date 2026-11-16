import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ivaldinofortes@gmail.com'

async function checkAuth(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get('authorization')
  if (!auth) return false
  const token = auth.replace('Bearer ', '')

  try {
    // Verify the JWT with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false
    return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [visitorsResult, registrationsResult, intrusionsResult] = await Promise.all([
    supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .eq('is_bot', false)
      .eq('is_intrusion_attempt', false),
    supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .eq('is_intrusion_attempt', true),
  ])

  // Last 50 visitors
  const { data: recentVisitors } = await supabaseAdmin
    .from('visitors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Last 50 intrusions
  const { data: recentIntrusions } = await supabaseAdmin
    .from('visitors')
    .select('*')
    .eq('is_intrusion_attempt', true)
    .order('created_at', { ascending: false })
    .limit(50)

  // Registrations (all)
  const { data: registrations } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  // Island stats
  const { data: islandData } = await supabaseAdmin.from('registrations').select('island')
  const islandCount: Record<string, number> = {}
  islandData?.forEach((r) => {
    if (r.island) {
      islandCount[r.island] = (islandCount[r.island] || 0) + 1
    }
  })

  // Visitors by country
  const { data: visitorsByCountry } = await supabaseAdmin
    .from('visitors')
    .select('country')
    .eq('is_bot', false)
  const countryCount: Record<string, number> = {}
  visitorsByCountry?.forEach((v) => {
    if (v.country) {
      countryCount[v.country] = (countryCount[v.country] || 0) + 1
    }
  })

  // Intrusion types
  const { data: intrusionTypes } = await supabaseAdmin
    .from('visitors')
    .select('intrusion_type')
    .eq('is_intrusion_attempt', true)
  const intrusionTypeCount: Record<string, number> = {}
  intrusionTypes?.forEach((v) => {
    if (v.intrusion_type) {
      intrusionTypeCount[v.intrusion_type] = (intrusionTypeCount[v.intrusion_type] || 0) + 1
    }
  })

  return NextResponse.json({
    summary: {
      totalVisitors: visitorsResult.count || 0,
      totalRegistrations: registrationsResult.count || 0,
      totalIntrusions: intrusionsResult.count || 0,
    },
    countryStats: Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([country, count]) => ({ country, count })),
    islandStats: Object.entries(islandCount)
      .sort((a, b) => b[1] - a[1])
      .map(([island, count]) => ({ island, count })),
    intrusionTypeStats: Object.entries(intrusionTypeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
    recentVisitors: recentVisitors || [],
    recentIntrusions: recentIntrusions || [],
    registrations: registrations || [],
  })
}
