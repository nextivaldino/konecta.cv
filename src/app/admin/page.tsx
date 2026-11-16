'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Users,
  Globe,
  LogOut,
  Phone,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Mail,
  TrendingUp,
  Eye,
  UserCheck,
} from 'lucide-react'

type SummaryData = {
  totalVisitors: number
  totalRegistrations: number
  totalIntrusions: number
}

type Registration = {
  id: string
  created_at: string
  name: string
  phone: string
  island: string
  country: string
  email?: string
  has_account?: boolean
}

type AdminData = {
  summary: SummaryData
  countryStats: { country: string; count: number }[]
  islandStats: { island: string; count: number }[]
  intrusionTypeStats: { type: string; count: number }[]
  recentVisitors: Record<string, string | boolean | null>[]
  recentIntrusions: Record<string, string | boolean | null>[]
  registrations: Registration[]
}

/* ── Mini Bar Chart Component ── */
function BarChart({ data, color = '#dee054' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'rgba(241,243,244,0.8)', width: 110, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
          <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(item.value / max) * 100}%`,
                borderRadius: 999,
                background: color,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Metric Card ── */
function MetricCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 20,
        background: '#0d1333',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(154,160,166,0.9)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ padding: '8px', borderRadius: 12, background: bg, color }}>
          <Icon size={15} />
        </span>
      </div>
      <span style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'rgba(154,160,166,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ArrowUpRight size={12} style={{ color }} />
        {sub}
      </span>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} style={{ color: 'rgba(154,160,166,0.6)' }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f3f4' }}>{title}</span>
      <span style={{ fontSize: 12, color: 'rgba(154,160,166,0.7)', maxWidth: 280 }}>{sub}</span>
    </div>
  )
}

export default function AdminPage() {
  const [email, setEmail] = useState('ivaldinofortes@gmail.com')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [token, setToken] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'registrations' | 'overview' | 'visitors' | 'intrusions'>('registrations')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIsland, setFilterIsland] = useState('ALL')

  const fetchData = useCallback(async (tok: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${tok}` },
      })
      if (res.status === 401) {
        setAuthed(false)
        setToken('')
        setError('Sessão expirada. Faça login novamente.')
        return
      }
      if (!res.ok) throw new Error('Erro ao carregar dados')
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date().toLocaleTimeString('pt-PT'))
    } catch {
      setError('Erro ao carregar dados. Verifica a ligação.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed || !token) return
    fetchData(token)
    const interval = setInterval(() => fetchData(token), 30000)
    return () => clearInterval(interval)
  }, [authed, token, fetchData])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Credenciais inválidas.')
        return
      }
      setToken(json.token)
      setAdminEmail(json.email)
      setAuthed(true)
    } catch {
      setError('Erro de ligação ao servidor.')
    } finally {
      setLoginLoading(false)
    }
  }

  /* ══════════════════════════════════════════
     LOGIN SCREEN
  ══════════════════════════════════════════ */
  if (!authed) {
    return (
      <div
        style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, background: '#081DF4', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,60,255,0.45) 0%, rgba(8,29,244,1) 70%)',
          opacity: 0.6,
        }} />

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 390,
          borderRadius: 24, background: '#0a0e26',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '40px 32px 36px', boxSizing: 'border-box',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Logo + Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <svg width="28" height="42" viewBox="0 0 436.752 665.228" fill="none">
                <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
                <path d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z" fill="#efefef" />
              </svg>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f3f4', margin: 0, letterSpacing: '-0.02em' }}>Konecta Account</h1>
            <p style={{ fontSize: 12, color: 'rgba(154,160,166,0.8)', marginTop: 6, margin: '6px 0 0' }}>Painel de Controlo & Gestão de Acessos</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', fontSize: 12, textAlign: 'center',
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(239,239,239,0.45)', marginBottom: 7 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(239,239,239,0.3)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  style={{
                    width: '100%', height: 46, padding: '0 16px 0 40px',
                    borderRadius: 14, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#f1f3f4',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#dee054')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(239,239,239,0.45)', marginBottom: 7 }}>
                Palavra-passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 46, padding: '0 42px 0 16px',
                    borderRadius: 14, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#f1f3f4',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#dee054')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                  autoFocus
                />
                <Lock size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(239,239,239,0.3)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: 8 }}>
              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%', height: 48, borderRadius: 999,
                  backgroundColor: loginLoading ? 'rgba(222,224,84,0.55)' : '#dee054',
                  color: '#081DF4', fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  border: 'none', cursor: loginLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'filter 0.2s, transform 0.1s',
                }}
                onMouseEnter={e => !loginLoading && (e.currentTarget.style.filter = 'brightness(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                {loginLoading ? (
                  <>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid #081DF4', borderTopColor: 'transparent',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite',
                    }} />
                    A entrar...
                  </>
                ) : 'Entrar no Painel →'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(154,160,166,0.5)' }}>
            Acesso restrito · Apenas administradores
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ══════════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════════ */
  const tabs = [
    { id: 'registrations', label: `Inscrições (${data?.registrations?.length ?? 0})`, icon: Users },
    { id: 'overview', label: 'Estatísticas', icon: Activity },
    { id: 'visitors', label: 'Tráfego', icon: Globe },
    { id: 'intrusions', label: 'Segurança', icon: ShieldCheck },
  ] as const

  const filteredRegistrations = (data?.registrations ?? []).filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.island?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIsland = filterIsland === 'ALL' || r.island?.includes(filterIsland)
    return matchesSearch && matchesIsland
  })

  const adminInitial = (adminEmail || email).charAt(0).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#070b1e', color: '#f1f3f4', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Top App Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'rgba(13,19,51,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Left: Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="27" viewBox="0 0 436.752 665.228" fill="none">
              <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
              <path d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z" fill="#efefef" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#f1f3f4', letterSpacing: '-0.02em' }}>
              Konecta <span style={{ color: 'rgba(154,160,166,0.7)', fontWeight: 400 }}>Account</span>
            </span>
          </div>

          {lastUpdated && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#dee054', padding: '4px 12px',
              borderRadius: 999, background: 'rgba(222,224,84,0.1)',
              border: '1px solid rgba(222,224,84,0.2)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dee054', animation: 'pulse 2s infinite' }} />
              Sync {lastUpdated}
            </span>
          )}
        </div>

        {/* Right: Actions + Admin Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '7px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f3f4', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            <span style={{ display: 'none' }}>Atualizar</span>
          </button>

          <button
            onClick={() => { setAuthed(false); setToken(''); setData(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '7px 14px', borderRadius: 999,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
          >
            <LogOut size={13} />
            <span style={{ display: 'none' }}>Sair</span>
          </button>

          {/* Admin Avatar */}
          <div
            title={adminEmail || email}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dee054 0%, #c8c840 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#081DF4',
              cursor: 'default', flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(222,224,84,0.3)',
            }}
          >
            {adminInitial}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Page heading */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f1f3f4', margin: 0, letterSpacing: '-0.02em' }}>Visão Geral da Plataforma</h2>
          <p style={{ fontSize: 13, color: 'rgba(154,160,166,0.8)', marginTop: 6, margin: '6px 0 0' }}>
            Monitoriza inscrições, visitas e a segurança da plataforma Konecta.cv em tempo real.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: 13,
          }}>{error}</div>
        )}

        {/* Metric Cards */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <MetricCard
              label="Total Konectados"
              value={data.summary.totalRegistrations.toLocaleString()}
              sub="Lista de espera prioritária"
              icon={Users}
              color="#dee054"
              bg="rgba(222,224,84,0.12)"
            />
            <MetricCard
              label="Visitantes Únicos"
              value={data.summary.totalVisitors.toLocaleString()}
              sub="Audiência global registada"
              icon={Eye}
              color="#60a5fa"
              bg="rgba(96,165,250,0.12)"
            />
            <MetricCard
              label="Com Perfil Criado"
              value={(data.registrations?.filter(r => r.has_account).length || 0).toLocaleString()}
              sub="Utilizadores autenticados"
              icon={UserCheck}
              color="#34d399"
              bg="rgba(52,211,153,0.12)"
            />
            <MetricCard
              label="Ameaças Bloqueadas"
              value={data.summary.totalIntrusions.toLocaleString()}
              sub="Scanners e ataques filtrados"
              icon={ShieldCheck}
              color="#f87171"
              bg="rgba(248,113,113,0.12)"
            />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: 130, borderRadius: 20, background: '#0d1333',
                border: '1px solid rgba(255,255,255,0.08)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, padding: '8px 18px', borderRadius: 999,
                  fontWeight: active ? 700 : 500, whiteSpace: 'nowrap',
                  backgroundColor: active ? '#dee054' : 'rgba(255,255,255,0.06)',
                  color: active ? '#081DF4' : 'rgba(154,160,166,0.9)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ══ TAB: REGISTRATIONS ══ */}
        {activeTab === 'registrations' && data && (
          <div style={{
            borderRadius: 24, background: '#0d1333',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            {/* Search & Filter header */}
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
                <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(154,160,166,0.6)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Nome, telefone, email ou ilha..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', height: 38, padding: '0 16px 0 40px',
                    borderRadius: 999, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#f1f3f4',
                    fontSize: 12, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#dee054')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={13} style={{ color: 'rgba(154,160,166,0.6)' }} />
                <select
                  value={filterIsland}
                  onChange={e => setFilterIsland(e.target.value)}
                  style={{
                    height: 38, padding: '0 16px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f3f4', fontSize: 12, outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="ALL">Todas as Ilhas</option>
                  <option value="Santiago">Santiago</option>
                  <option value="São Vicente">São Vicente</option>
                  <option value="Sal">Sal</option>
                  <option value="Santo Antão">Santo Antão</option>
                  <option value="Boa Vista">Boa Vista</option>
                  <option value="Fogo">Fogo</option>
                  <option value="São Nicolau">São Nicolau</option>
                  <option value="Maio">Maio</option>
                  <option value="Brava">Brava</option>
                  <option value="Diáspora">Diáspora</option>
                </select>
                <span style={{ fontSize: 11, color: 'rgba(154,160,166,0.6)', paddingLeft: 4 }}>
                  {filteredRegistrations.length} resultados
                </span>
              </div>
            </div>

            {/* Table */}
            {filteredRegistrations.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum registo encontrado"
                sub="Ajusta os filtros ou aguarda as primeiras inscrições da plataforma."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Data & Hora', 'Nome Completo', 'Contacto', 'Localização', 'Perfil', 'País'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(154,160,166,0.7)', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((r, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 20px', color: 'rgba(154,160,166,0.8)', whiteSpace: 'nowrap' }}>
                          {new Date(r.created_at).toLocaleString('pt-PT')}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#f1f3f4' }}>{r.name}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#dee054', fontFamily: 'monospace' }}>
                              <Phone size={10} style={{ opacity: 0.7 }} /> {r.phone || '—'}
                            </span>
                            {r.email && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(154,160,166,0.7)', fontSize: 11 }}>
                                <Mail size={10} /> {r.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 999,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: 11, color: '#f1f3f4', whiteSpace: 'nowrap',
                          }}>
                            <MapPin size={10} style={{ color: '#dee054' }} />
                            {r.island || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {r.has_account ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 10px', borderRadius: 999,
                              background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                              fontSize: 10, color: '#34d399', fontWeight: 600,
                            }}>
                              <UserCheck size={10} /> Sim
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'rgba(154,160,166,0.5)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgba(154,160,166,0.8)' }}>{r.country || 'CV'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: OVERVIEW ══ */}
        {activeTab === 'overview' && data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Island Stats */}
            <div style={{
              padding: 24, borderRadius: 24, background: '#0d1333',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <MapPin size={15} style={{ color: '#dee054' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dee054', margin: 0 }}>Inscrições por Ilha</h3>
              </div>
              {data.islandStats.length > 0 ? (
                <BarChart data={data.islandStats.map(d => ({ label: d.island, value: d.count }))} color="#dee054" />
              ) : (
                <p style={{ fontSize: 12, color: 'rgba(154,160,166,0.6)' }}>Sem inscrições ainda.</p>
              )}
            </div>

            {/* Country Stats */}
            <div style={{
              padding: 24, borderRadius: 24, background: '#0d1333',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Globe size={15} style={{ color: '#60a5fa' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', margin: 0 }}>Origem Geográfica do Tráfego</h3>
              </div>
              {data.countryStats.length > 0 ? (
                <BarChart data={data.countryStats.slice(0, 10).map(d => ({ label: d.country, value: d.count }))} color="#60a5fa" />
              ) : (
                <p style={{ fontSize: 12, color: 'rgba(154,160,166,0.6)' }}>Sem dados geográficos.</p>
              )}
            </div>

            {/* Intrusion types */}
            {data.intrusionTypeStats.length > 0 && (
              <div style={{
                padding: 24, borderRadius: 24, background: '#0d1333',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <ShieldCheck size={15} style={{ color: '#f87171' }} />
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f87171', margin: 0 }}>Tipos de Ameaças</h3>
                </div>
                <BarChart data={data.intrusionTypeStats.map(d => ({ label: d.type, value: d.count }))} color="#f87171" />
              </div>
            )}

            {/* Trend card */}
            <div style={{
              padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, #0d1333 0%, #111a40 100%)',
              border: '1px solid rgba(222,224,84,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <TrendingUp size={15} style={{ color: '#dee054' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#dee054', margin: 0 }}>Resumo Rápido</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Taxa de conversão', value: data.summary.totalVisitors > 0 ? `${((data.summary.totalRegistrations / data.summary.totalVisitors) * 100).toFixed(1)}%` : '—', color: '#dee054' },
                  { label: 'Visitantes totais', value: data.summary.totalVisitors.toLocaleString(), color: '#60a5fa' },
                  { label: 'Com perfil', value: `${data.registrations?.filter(r => r.has_account).length || 0}`, color: '#34d399' },
                  { label: 'Ameaças bloqueadas', value: data.summary.totalIntrusions.toLocaleString(), color: '#f87171' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'rgba(154,160,166,0.8)' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: VISITORS ══ */}
        {activeTab === 'visitors' && data && (
          <div style={{
            borderRadius: 24, background: '#0d1333',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={14} style={{ color: '#60a5fa' }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', margin: 0 }}>
                Registos de Tráfego Recentes ({data.recentVisitors.length})
              </h3>
            </div>
            {data.recentVisitors.length === 0 ? (
              <EmptyState icon={Globe} title="Sem registos de tráfego" sub="Os visitantes aparecerão aqui assim que acederem à plataforma." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Data/Hora', 'IP de Origem', 'País', 'Cidade', 'Página'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(154,160,166,0.7)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentVisitors.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 20px', color: 'rgba(154,160,166,0.8)', whiteSpace: 'nowrap' }}>{new Date(v.created_at as string).toLocaleString('pt-PT')}</td>
                        <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: 'rgba(241,243,244,0.8)' }}>{v.ip_address as string}</td>
                        <td style={{ padding: '12px 20px', color: '#dee054', fontWeight: 600 }}>{v.country as string}</td>
                        <td style={{ padding: '12px 20px', color: '#f1f3f4' }}>{v.city as string}</td>
                        <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: 'rgba(154,160,166,0.7)' }}>{v.path as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: INTRUSIONS ══ */}
        {activeTab === 'intrusions' && data && (
          <div style={{
            borderRadius: 24, background: '#0d1333',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={14} style={{ color: '#f87171' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f87171', margin: 0 }}>
                  Auditoria de Segurança ({data.recentIntrusions.length})
                </h3>
              </div>
              <span style={{
                fontSize: 10, color: '#34d399', padding: '4px 10px', borderRadius: 999,
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                fontWeight: 600, letterSpacing: '0.04em',
              }}>
                ● PROTEÇÃO ATIVA
              </span>
            </div>
            {data.recentIntrusions.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} style={{ color: '#34d399' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f3f4' }}>Ambiente Seguro</span>
                <span style={{ fontSize: 12, color: 'rgba(154,160,166,0.7)' }}>Nenhuma intrusão ou scanner detetado.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Data/Hora', 'IP', 'Tipo de Ataque', 'Destino'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(154,160,166,0.7)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentIntrusions.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 20px', color: 'rgba(154,160,166,0.8)', whiteSpace: 'nowrap' }}>{new Date(v.created_at as string).toLocaleString('pt-PT')}</td>
                        <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: '#f87171' }}>{v.ip_address as string}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                            color: '#fbbf24', fontSize: 11, fontFamily: 'monospace',
                          }}>
                            {v.intrusion_type as string}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: 'rgba(154,160,166,0.7)' }}>{v.path as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
