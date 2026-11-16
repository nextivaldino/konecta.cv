import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Intrusion detection patterns
const INTRUSION_PATTERNS = [
  { pattern: /\/(wp-admin|wp-login|xmlrpc|phpmyadmin|admin\.php|config\.php)/i, type: 'CMS_SCAN' },
  { pattern: /\/(etc\/passwd|proc\/version|windows\/system32)/i, type: 'PATH_TRAVERSAL' },
  { pattern: /(union\s+select|drop\s+table|insert\s+into|delete\s+from)/i, type: 'SQL_INJECTION' },
  { pattern: /(<script|javascript:|onerror=|onload=)/i, type: 'XSS_ATTEMPT' },
  { pattern: /\/(\.env|\.git\/|\.ssh\/|\.bash_history)/i, type: 'SENSITIVE_FILE' },
  { pattern: /\/(shell\.php|cmd\.php|hack|exploit)/i, type: 'SHELL_UPLOAD' },
  { pattern: /sqlmap|nikto|nmap|masscan|burpsuite/i, type: 'SCANNER_TOOL' },
]

function detectIntrusion(url: string, userAgent: string): { isIntrusion: boolean; type: string | null } {
  const fullPath = url + userAgent
  for (const { pattern, type } of INTRUSION_PATTERNS) {
    if (pattern.test(fullPath)) {
      return { isIntrusion: true, type }
    }
  }
  return { isIntrusion: false, type: null }
}

function detectBot(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|mediapartners/i.test(userAgent)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  // Skip static files, API tracking itself, and admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/track') ||
    pathname.includes('.') && !pathname.includes('.php')
  ) {
    return NextResponse.next()
  }

  const { isIntrusion, type } = detectIntrusion(request.url, userAgent)
  const isBot = detectBot(userAgent)

  // Fire-and-forget tracking (don't await)
  trackVisit({
    ip_address: ip,
    country: request.headers.get('x-vercel-ip-country') || 'Unknown',
    country_code: request.headers.get('x-vercel-ip-country') || 'XX',
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    user_agent: userAgent.slice(0, 500),
    path: pathname,
    is_bot: isBot,
    is_intrusion_attempt: isIntrusion,
    intrusion_type: type,
  })

  if (isIntrusion) {
    return new NextResponse('Not Found', { status: 404 })
  }

  return NextResponse.next()
}

async function trackVisit(data: {
  ip_address: string
  country: string
  country_code: string
  city: string
  user_agent: string
  path: string
  is_bot: boolean
  is_intrusion_attempt: boolean
  intrusion_type: string | null
}) {
  try {
    await supabaseAdmin.from('visitors').insert(data)
  } catch (e) {
    // Silently fail - never break the page because of tracking
    console.error('Track error:', e)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
