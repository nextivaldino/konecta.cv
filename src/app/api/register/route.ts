import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, island, email, password, createProfile } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Por favor, insere o teu nome completo.' }, { status: 400 })
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      return NextResponse.json({ error: 'Por favor, insere um número de telefone válido.' }, { status: 400 })
    }

    if (!island || typeof island !== 'string') {
      return NextResponse.json({ error: 'Por favor, seleciona a tua ilha.' }, { status: 400 })
    }

    // Sanitize
    const cleanName = name.trim().slice(0, 100)
    const cleanPhone = phone.trim().slice(0, 30)
    const cleanIsland = island.trim().slice(0, 70)
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 100) : ''

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const country = request.headers.get('x-vercel-ip-country') || 'CV'

    // Se o utilizador optou por criar perfil no Supabase Auth
    let userId: string | null = null
    if (createProfile && cleanEmail && password && password.length >= 6) {
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { name: cleanName, phone: cleanPhone, island: cleanIsland },
        })
        if (!authError && authData?.user) {
          userId = authData.user.id
        }
      } catch (authErr) {
        console.warn('Auth user creation warning (continuing registration):', authErr)
      }
    }

    const { error } = await supabaseAdmin.from('registrations').insert({
      name: cleanName,
      phone: cleanPhone,
      island: cleanIsland,
      email: cleanEmail,
      has_account: !!createProfile,
      ip_address: ip,
      country,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Erro ao guardar dados.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Register API error:', err)
    return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 })
  }
}
