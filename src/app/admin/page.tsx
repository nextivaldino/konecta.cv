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

  /* ── TELA DE LOGIN ESTILO KONECTA (Dark Glassmorphic) ── */
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5 select-none relative overflow-hidden"
        style={{ backgroundColor: '#081DF4' }}
      >
        {/* Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,60,255,0.45) 0%, rgba(8,29,244,1) 70%)',
            opacity: 0.6,
          }}
        />

        {/* Card Login */}
        <div
          className="relative z-10 w-full max-w-[380px] p-8 border border-white/10"
          style={{
            borderRadius: '16px',
            background: 'rgba(10, 14, 38, 0.98)',
            boxShadow: 'none',
          }}
        >
          <div className="flex flex-col items-center text-center mb-7">
            {/* Logo K minimalista */}
            <div className="mb-4">
              <svg width="26" height="38" viewBox="0 0 436.752 665.228" fill="none">
                <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
                <path
                  d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                  fill="#efefef"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-[#efefef]">Konecta Admin</h1>
            <p className="text-xs text-white/45 mt-1.5">Painel de Acesso & Registos</p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Palavra-passe de acesso"
                className="w-full bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-[#efefef] placeholder-white/30 outline-none transition-colors focus:border-[#dee054]"
                style={{ borderRadius: '999px' }}
                autoFocus
              />
              <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                backgroundColor: '#dee054',
                color: '#081DF4',
                borderRadius: '999px',
              }}
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'registrations',
      label: `Konectados (${data?.registrations?.length ?? 0})`,
      icon: Users,
    },
    { id: 'overview', label: 'Estatísticas & Ilhas', icon: Globe },
    { id: 'visitors', label: 'Visitantes Recentes', icon: Users },
    { id: 'intrusions', label: 'Segurança & Intrusões', icon: AlertTriangle },
  ] as const

  // Filtragem e busca de registros
  const filteredRegistrations = (data?.registrations ?? []).filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.island?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIsland = filterIsland === 'ALL' || r.island?.includes(filterIsland)
    return matchesSearch && matchesIsland
  })

  return (
    <div className="min-h-screen bg-[#070b1e] text-[#efefef] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#0a0e26]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="26" viewBox="0 0 436.752 665.228" fill="none">
              <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
              <path
                d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                fill="#efefef"
              />
            </svg>
            <span className="font-bold text-sm tracking-wide text-[#efefef]">Konecta Admin</span>
          </div>

          {lastUpdated && (
            <span className="hidden sm:inline-block text-[11px] text-[#dee054] px-2.5 py-0.5 rounded-full bg-[#dee054]/10 border border-[#dee054]/20">
              ● Atualizado: {lastUpdated}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => {
              setAuthed(false)
              setToken('')
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
          >
            <LogOut size={12} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 sm:p-6 flex flex-col gap-5">
        {/* Metric Cards - 14px border radius & flat glassmorphic style */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Registos */}
            <div
              className="p-5 border border-white/10 flex flex-col justify-between"
              style={{ borderRadius: 14, background: '#0a0e26' }}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>Inscrições Prioritárias</span>
                <span className="w-2 h-2 rounded-full bg-[#dee054] shadow-[0_0_8px_#dee054]" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-[#dee054]">
                  {data.summary.totalRegistrations.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-white/40">Candidatos para novos serviços</span>
            </div>

            {/* Card 2: Visitantes */}
            <div
              className="p-5 border border-white/10 flex flex-col justify-between"
              style={{ borderRadius: 14, background: '#0a0e26' }}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>Visitantes Únicos</span>
                <Globe size={14} className="text-blue-400" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-white">
                  {data.summary.totalVisitors.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-white/40">Tráfego total na landing page</span>
            </div>

            {/* Card 3: Intrusões */}
            <div
              className="p-5 border border-white/10 flex flex-col justify-between"
              style={{ borderRadius: 14, background: '#0a0e26' }}
            >
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>Ameaças Neutralizadas</span>
                <AlertTriangle size={14} className="text-red-400" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-red-400">
                  {data.summary.totalIntrusions.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-white/40">Scanners e scripts barrados</span>
            </div>
          </div>
        )}

        {/* Tab Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.id ? '#dee054' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#081DF4' : 'rgba(239,239,239,0.60)',
                fontWeight: activeTab === tab.id ? 700 : 500,
              }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && data && (
          <div
            className="border border-white/10 overflow-hidden flex flex-col"
            style={{ borderRadius: 14, background: '#0a0e26' }}
          >
            {/* Filter bar */}
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, telefone ou ilha..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 pl-9 pr-4 py-2 text-xs rounded-full text-[#efefef] placeholder-white/30 outline-none focus:border-[#dee054]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={13} className="text-white/40" />
                <select
                  value={filterIsland}
                  onChange={e => setFilterIsland(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 text-xs rounded-full px-3 py-1.5 text-white/80 outline-none cursor-pointer"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase text-[10px] tracking-wider bg-black/20">
                    <th className="px-5 py-3.5 font-semibold">Data</th>
                    <th className="px-5 py-3.5 font-semibold">Nome Completo</th>
                    <th className="px-5 py-3.5 font-semibold">Contacto Telefónico</th>
                    <th className="px-5 py-3.5 font-semibold">Ilha & Concelho</th>
                    <th className="px-5 py-3.5 font-semibold">País Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegistrations.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-white/40">
                        {new Date(r.created_at).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#efefef]">{r.name}</td>
                      <td className="px-5 py-3.5 font-mono text-[#dee054]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="opacity-70" />
                          <span>{r.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] text-white/90 border border-white/10 text-[11px]">
                          <MapPin size={10} className="text-[#dee054]" />
                          {r.island || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/50">{r.country || 'Cabo Verde'}</td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-white/35">
                        Nenhum registo encontrado com estes critérios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === 'overview' && data && (
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="p-5 border border-white/10"
              style={{ borderRadius: 14, background: '#0a0e26' }}
            >
              <h3 className="text-sm font-semibold mb-4 text-[#dee054] flex items-center gap-2">
                <span>Distribuição por Ilha & Região</span>
              </h3>
              <div className="flex flex-col gap-3">
                {data.islandStats.map(item => (
                  <div key={item.island} className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{item.island}</span>
                    <span className="font-mono text-[#dee054] font-bold px-2 py-0.5 rounded-full bg-white/5">
                      {item.count}
                    </span>
                  </div>
                ))}
                {data.islandStats.length === 0 && (
                  <p className="text-xs text-white/30">Sem inscrições por ilha ainda.</p>
                )}
              </div>
            </div>

            <div
              className="p-5 border border-white/10"
              style={{ borderRadius: 14, background: '#0a0e26' }}
            >
              <h3 className="text-sm font-semibold mb-4 text-[#dee054] flex items-center gap-2">
                <span>Origem dos Visitantes</span>
              </h3>
              <div className="flex flex-col gap-3">
                {data.countryStats.slice(0, 10).map(c => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{c.country}</span>
                    <span className="font-mono text-white font-semibold px-2 py-0.5 rounded-full bg-white/5">
                      {c.count}
                    </span>
                  </div>
                ))}
                {data.countryStats.length === 0 && (
                  <p className="text-xs text-white/30">Sem dados geográficos ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISITORS */}
        {activeTab === 'visitors' && data && (
          <div
            className="border border-white/10 overflow-hidden"
            style={{ borderRadius: 14, background: '#0a0e26' }}
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-[#dee054]">
                Acessos Recentes à Landing Page ({data.recentVisitors.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase text-[10px] tracking-wider bg-black/20">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">Endereço IP</th>
                    <th className="px-5 py-3">País</th>
                    <th className="px-5 py-3">Cidade</th>
                    <th className="px-5 py-3">Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentVisitors.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white/40">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3 font-mono text-white/70">{v.ip_address as string}</td>
                      <td className="px-5 py-3 text-[#dee054] font-medium">{v.country as string}</td>
                      <td className="px-5 py-3 text-white/60">{v.city as string}</td>
                      <td className="px-5 py-3 font-mono text-white/40">{v.path as string}</td>
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
            style={{ borderRadius: 14, background: '#0a0e26' }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-400">
                Ataques & Scanners Bloqueados ({data.recentIntrusions.length})
              </h3>
              <span className="text-[11px] text-white/40">Filtro de intrusões ativo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 uppercase text-[10px] tracking-wider bg-black/20">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">IP Origem</th>
                    <th className="px-5 py-3">Tipo de Bloqueio</th>
                    <th className="px-5 py-3">Alvo Tentado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentIntrusions.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white/40">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3 font-mono text-red-400">{v.ip_address as string}</td>
                      <td className="px-5 py-3 font-mono text-yellow-300">
                        <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px]">
                          {v.intrusion_type as string}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-white/40">{v.path as string}</td>
                    </tr>
                  ))}
                  {data.recentIntrusions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-white/30">
                        <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400 opacity-60" />
                        Nenhuma tentativa suspeita detetada. Sistema seguro.
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
