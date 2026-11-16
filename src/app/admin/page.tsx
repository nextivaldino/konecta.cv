'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Users,
  Globe,
  AlertTriangle,
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

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState('')
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
        setError('Sessão expirada ou password incorreta.')
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

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setToken(password)
    setAuthed(true)
  }

  /* ── TELA DE LOGIN ESTILO GOOGLE ACCOUNT (Material 3 Surface Container) ── */
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 select-none relative overflow-hidden"
        style={{ backgroundColor: '#081DF4' }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,60,255,0.45) 0%, rgba(8,29,244,1) 70%)',
            opacity: 0.6,
          }}
        />

        {/* Card Login - Google Material You Surface Card com respiro e layout equilibrado */}
        <div
          className="relative z-10 w-full border border-white/10"
          style={{
            maxWidth: 390,
            borderRadius: 24,
            background: '#0a0e26',
            padding: '36px 32px 32px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Logo */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="mb-4">
              <svg width="24" height="36" viewBox="0 0 436.752 665.228" fill="none">
                <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
                <path
                  d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                  fill="#efefef"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-[#f1f3f4]">Konecta Account</h1>
            <p className="text-xs text-[#9aa0a6] mt-1.5">Painel de Controlo & Gestão de Acessos</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-wider uppercase text-white/45 mb-1.5 pl-1">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Introduza a palavra-passe"
                  className="w-full bg-white/[0.06] border border-white/15 px-4 py-3 text-sm text-[#f1f3f4] placeholder-[#9aa0a6] outline-none transition-colors focus:border-[#dee054]"
                  style={{ borderRadius: '12px', boxSizing: 'border-box' }}
                  autoFocus
                />
                <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:brightness-105 active:scale-[0.98]"
                style={{
                  backgroundColor: '#dee054',
                  color: '#081DF4',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Seguinte →
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'registrations',
      label: `Inscrições (${data?.registrations?.length ?? 0})`,
      icon: Users,
    },
    { id: 'overview', label: 'Estatísticas & Ilhas', icon: Activity },
    { id: 'visitors', label: 'Tráfego & Dispositivos', icon: Globe },
    { id: 'intrusions', label: 'Segurança & Proteção', icon: ShieldCheck },
  ] as const

  const filteredRegistrations = (data?.registrations ?? []).filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.island?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIsland = filterIsland === 'ALL' || r.island?.includes(filterIsland)
    return matchesSearch && matchesIsland
  })

  return (
    <div className="min-h-screen bg-[#070b1e] text-[#f1f3f4] flex flex-col font-sans">
      {/* Top App Bar - Google Account Clean Navigation */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1333]/90 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="28" viewBox="0 0 436.752 665.228" fill="none">
              <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
              <path
                d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                fill="#efefef"
              />
            </svg>
            <span className="font-semibold text-base tracking-tight text-[#f1f3f4]">
              Konecta <span className="text-[#9aa0a6] font-normal">Account</span>
            </span>
          </div>

          {lastUpdated && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#dee054] px-3 py-1 rounded-full bg-[#dee054]/10 border border-[#dee054]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dee054] animate-pulse" />
              Sincronizado {lastUpdated}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition-colors text-[#f1f3f4]"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => {
              setAuthed(false)
              setToken('')
            }}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-colors"
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-5 sm:p-8 flex flex-col gap-6">
        {/* Welcome Section Header - Google Style */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#f1f3f4]">
            Visão Geral da Plataforma
          </h2>
          <p className="text-sm text-[#9aa0a6]">
            Gira os candidatos prioritários, audite acessos e monitore a integridade do sistema.
          </p>
        </div>

        {/* Material 3 Expressive Metric Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div
              className="p-6 border border-white/10 flex flex-col justify-between transition-all hover:border-white/20"
              style={{
                borderRadius: '24px',
                background: '#0d1333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[#9aa0a6] text-xs">
                <span className="font-medium">Total de Konectados</span>
                <span className="p-2 rounded-full bg-[#dee054]/10 text-[#dee054]">
                  <Users size={16} />
                </span>
              </div>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-bold text-[#dee054]">
                  {data.summary.totalRegistrations.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-[#9aa0a6] flex items-center gap-1">
                <ArrowUpRight size={13} className="text-[#dee054]" /> Lista de espera prioritária
              </span>
            </div>

            {/* Metric 2 */}
            <div
              className="p-6 border border-white/10 flex flex-col justify-between transition-all hover:border-white/20"
              style={{
                borderRadius: '24px',
                background: '#0d1333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[#9aa0a6] text-xs">
                <span className="font-medium">Visitantes Únicos</span>
                <span className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                  <Globe size={16} />
                </span>
              </div>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-bold text-[#f1f3f4]">
                  {data.summary.totalVisitors.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-[#9aa0a6]">Audiência global registada</span>
            </div>

            {/* Metric 3 */}
            <div
              className="p-6 border border-white/10 flex flex-col justify-between transition-all hover:border-white/20"
              style={{
                borderRadius: '24px',
                background: '#0d1333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <div className="flex items-center justify-between text-[#9aa0a6] text-xs">
                <span className="font-medium">Segurança e Filtros</span>
                <span className="p-2 rounded-full bg-red-500/10 text-red-400">
                  <ShieldCheck size={16} />
                </span>
              </div>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-bold text-red-400">
                  {data.summary.totalIntrusions.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-[#9aa0a6]">Scanners e ataques neutralizados</span>
            </div>
          </div>
        )}

        {/* Material 3 Segmented Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2.5 text-xs px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.id ? '#dee054' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#081DF4' : '#9aa0a6',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: REGISTRATIONS - Card View with Material Surface */}
        {activeTab === 'registrations' && data && (
          <div
            className="border border-white/10 overflow-hidden flex flex-col"
            style={{
              borderRadius: '24px',
              background: '#0d1333',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            {/* Search & Filter Header */}
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, contacto ou ilha..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 pl-11 pr-4 py-2.5 text-xs rounded-full text-[#f1f3f4] placeholder-[#9aa0a6] outline-none focus:border-[#dee054] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={13} className="text-[#9aa0a6]" />
                <select
                  value={filterIsland}
                  onChange={e => setFilterIsland(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 text-xs rounded-full px-4 py-2 text-[#f1f3f4] outline-none cursor-pointer"
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
              </div>
            </div>

            {/* Registrations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#9aa0a6] uppercase text-[10px] tracking-wider bg-white/[0.02]">
                    <th className="px-6 py-4 font-semibold">Registo</th>
                    <th className="px-6 py-4 font-semibold">Nome Completo</th>
                    <th className="px-6 py-4 font-semibold">Telefone</th>
                    <th className="px-6 py-4 font-semibold">Localização</th>
                    <th className="px-6 py-4 font-semibold">País</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegistrations.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-[#9aa0a6]">
                        {new Date(r.created_at).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#f1f3f4]">{r.name}</td>
                      <td className="px-6 py-4 font-mono text-[#dee054]">
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="opacity-70" />
                          <span>{r.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-[#f1f3f4] border border-white/10 text-[11px]">
                          <MapPin size={10} className="text-[#dee054]" />
                          {r.island || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#9aa0a6]">{r.country || 'Cabo Verde'}</td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#9aa0a6]">
                        Nenhum registo encontrado com estes filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW - Material Cards Grid */}
        {activeTab === 'overview' && data && (
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="p-6 border border-white/10"
              style={{
                borderRadius: '24px',
                background: '#0d1333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <h3 className="text-sm font-semibold mb-5 text-[#dee054] flex items-center gap-2">
                <span>Inscrições por Ilha & Região</span>
              </h3>
              <div className="flex flex-col gap-3">
                {data.islandStats.map(item => (
                  <div key={item.island} className="flex items-center justify-between text-xs">
                    <span className="text-[#f1f3f4]">{item.island}</span>
                    <span className="font-mono text-[#dee054] font-bold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
                      {item.count}
                    </span>
                  </div>
                ))}
                {data.islandStats.length === 0 && (
                  <p className="text-xs text-[#9aa0a6]">Sem inscrições por ilha ainda.</p>
                )}
              </div>
            </div>

            <div
              className="p-6 border border-white/10"
              style={{
                borderRadius: '24px',
                background: '#0d1333',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <h3 className="text-sm font-semibold mb-5 text-[#dee054] flex items-center gap-2">
                <span>Origem Geográfica do Tráfego</span>
              </h3>
              <div className="flex flex-col gap-3">
                {data.countryStats.slice(0, 10).map(c => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="text-[#f1f3f4]">{c.country}</span>
                    <span className="font-mono text-[#f1f3f4] font-semibold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
                      {c.count}
                    </span>
                  </div>
                ))}
                {data.countryStats.length === 0 && (
                  <p className="text-xs text-[#9aa0a6]">Sem dados geográficos ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISITORS */}
        {activeTab === 'visitors' && data && (
          <div
            className="border border-white/10 overflow-hidden"
            style={{
              borderRadius: '24px',
              background: '#0d1333',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-semibold text-[#dee054]">
                Registos de Tráfego Recentes ({data.recentVisitors.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#9aa0a6] uppercase text-[10px] tracking-wider bg-white/[0.02]">
                    <th className="px-6 py-3.5">Data/Hora</th>
                    <th className="px-6 py-3.5">IP de Origem</th>
                    <th className="px-6 py-3.5">País</th>
                    <th className="px-6 py-3.5">Cidade</th>
                    <th className="px-6 py-3.5">Página Visitada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentVisitors.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-3.5 text-[#9aa0a6]">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-white/80">{v.ip_address as string}</td>
                      <td className="px-6 py-3.5 text-[#dee054] font-medium">{v.country as string}</td>
                      <td className="px-6 py-3.5 text-[#f1f3f4]">{v.city as string}</td>
                      <td className="px-6 py-3.5 font-mono text-[#9aa0a6]">{v.path as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INTRUSIONS */}
        {activeTab === 'intrusions' && data && (
          <div
            className="border border-white/10 overflow-hidden"
            style={{
              borderRadius: '24px',
              background: '#0d1333',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            }}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-400">
                Auditoria de Segurança & Ameaças Bloqueadas ({data.recentIntrusions.length})
              </h3>
              <span className="text-xs text-[#9aa0a6]">Proteção ativa 24/7</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#9aa0a6] uppercase text-[10px] tracking-wider bg-white/[0.02]">
                    <th className="px-6 py-3.5">Data/Hora</th>
                    <th className="px-6 py-3.5">IP</th>
                    <th className="px-6 py-3.5">Tipo de Ataque</th>
                    <th className="px-6 py-3.5">Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentIntrusions.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-3.5 text-[#9aa0a6]">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-red-400">{v.ip_address as string}</td>
                      <td className="px-6 py-3.5 font-mono text-yellow-300">
                        <span className="px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px]">
                          {v.intrusion_type as string}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[#9aa0a6]">{v.path as string}</td>
                    </tr>
                  ))}
                  {data.recentIntrusions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#9aa0a6]">
                        <CheckCircle2 size={26} className="mx-auto mb-2 text-green-400 opacity-70" />
                        Nenhuma intrusão ou scanner detetado. Ambiente seguro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
