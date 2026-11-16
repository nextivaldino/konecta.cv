import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ivaldinofortes@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password são obrigatórios.' }, { status: 400 })
    }

    // Create a client-side supabase (anon key) to authenticate the user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data?.session) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    // Only allow the designated admin email
    if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 })
    }

    return NextResponse.json({
      token: data.session.access_token,
      email: data.user.email,
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 })
  }
}
