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
  UserCheck,
  Eye,
  Sparkles,
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

/* ── Neo-Brutalism Mini Bar Chart (Riddle UI Style) ── */
function NeoBarChart({ data, color = '#FFD027' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-bold w-28 truncate text-black">{item.label}</span>
          <div className="flex-1 h-3.5 bg-white border-2 border-black rounded-md overflow-hidden shadow-[2px_2px_0px_#000]">
            <div
              className="h-full border-r-2 border-black transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs font-mono font-black text-black min-w-[24px] text-right">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Neo-Brutalism Metric Card (Riddle UI Style) ── */
function NeoMetricCard({
  label,
  value,
  sub,
  icon: Icon,
  badgeColor,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  badgeColor: string
}) {
  return (
    <div className="p-5 sm:p-6 bg-white border-[3px] border-black rounded-[20px] shadow-[5px_5px_0px_#000] flex flex-col justify-between hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000] transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#78716C]">{label}</span>
        <div
          className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]"
          style={{ backgroundColor: badgeColor }}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="my-1">
        <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">{value}</span>
      </div>
      <span className="text-xs font-semibold text-[#78716C] flex items-center gap-1 mt-2">
        <ArrowUpRight size={13} className="text-black" /> {sub}
      </span>
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

  /* ═════════════════════════════════════════════════════════
     LOGIN SCREEN — RIDDLE UI NEO-BRUTALISM
  ═════════════════════════════════════════════════════════ */
  if (!authed) {
    return (
      <div className="riddle-grid-bg min-h-screen flex items-center justify-center p-5 select-none relative">
        <div className="w-full max-w-[400px] bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] p-8 sm:p-9 relative">
          
          {/* Top Decorative Dots */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-black">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-black bg-[#E2442F]" />
              <span className="w-3 h-3 rounded-full border-2 border-black bg-[#FFD027]" />
              <span className="w-3 h-3 rounded-full border-2 border-black bg-[#11A365]" />
            </div>

            <div className="px-2.5 py-0.5 bg-[#B286FD] border-2 border-black rounded-full text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
              Admin Security
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <svg width="26" height="38" viewBox="0 0 436.752 665.228" fill="none">
                <rect x="0" y="0" width="144.634" height="586.476" fill="#A2E435" stroke="#000" strokeWidth="24" />
                <path
                  d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                  fill="#FFFFFF"
                  stroke="#000"
                  strokeWidth="24"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">Konecta Admin</h1>
            <p className="text-xs font-semibold text-[#78716C] mt-1">Gestão de Acessos & Inscrições</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FEE2E2] border-2 border-black text-black font-bold text-xs shadow-[2px_2px_0px_#000]">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 text-black">
                Email de Administrador
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@konecta.cv"
                  className="w-full h-11 pl-10 pr-3.5 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 text-black">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-10 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] transition-all"
                  autoFocus
                />
                <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#A2E435] border-2 border-black font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                {loginLoading ? 'A verificar...' : 'Entrar no Painel →'}
              </button>
            </div>
          </form>

          <p className="text-center mt-6 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
            Acesso Restrito · Dono da Plataforma
          </p>
        </div>
      </div>
    )
  }

  /* ═════════════════════════════════════════════════════════
     ADMIN DASHBOARD — RIDDLE UI NEO-BRUTALISM
  ═════════════════════════════════════════════════════════ */
  const tabs = [
    { id: 'registrations', label: `Inscrições (${data?.registrations?.length ?? 0})`, icon: Users, color: '#A2E435' },
    { id: 'overview', label: 'Estatísticas', icon: Activity, color: '#FFD027' },
    { id: 'visitors', label: 'Tráfego', icon: Globe, color: '#60A5F9' },
    { id: 'intrusions', label: 'Segurança', icon: ShieldCheck, color: '#FF7051' },
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

  return (
    <div className="riddle-grid-bg min-h-screen text-black flex flex-col font-sans">
      
      {/* ── Top Bar (Riddle UI Navigation Frame) ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b-[3px] border-black shadow-[0_4px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="28" viewBox="0 0 436.752 665.228" fill="none">
              <rect x="0" y="0" width="144.634" height="586.476" fill="#A2E435" stroke="#000" strokeWidth="24" />
              <path
                d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                fill="#FFFFFF"
                stroke="#000"
                strokeWidth="24"
              />
            </svg>
            <span className="font-black text-base uppercase tracking-tight">
              Konecta <span className="bg-[#B286FD] px-2 py-0.5 border border-black rounded text-xs">Admin</span>
            </span>
          </div>

          {lastUpdated && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#A2E435] border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              Sync: {lastUpdated}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            onClick={() => {
              setAuthed(false)
              setToken('')
              setData(null)
            }}
            className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#E2442F] text-white border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>

          {/* Admin Avatar Pill */}
          <div
            title={adminEmail || email}
            className="w-9 h-9 rounded-full bg-[#FFD027] border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]"
          >
            {(adminEmail || email).charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-5 sm:p-8 flex flex-col gap-6">
        
        {/* Title banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000]">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-[#B286FD] border border-black rounded text-[10px] font-black uppercase mb-1.5">
              Dashboard de Controlo
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Visão Geral da Plataforma
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#78716C] mt-1">
              Gere candidatos prioritários, visitantes e integridade da rede Konecta.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD027] border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <span>Ver Landing Page</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* 4 Neo-Brutalism Metric Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NeoMetricCard
              label="Total de Konectados"
              value={data.summary.totalRegistrations.toLocaleString()}
              sub="Lista de espera ativa"
              icon={Users}
              badgeColor="#A2E435"
            />
            <NeoMetricCard
              label="Visitantes Únicos"
              value={data.summary.totalVisitors.toLocaleString()}
              sub="Audiência global"
              icon={Globe}
              badgeColor="#60A5F9"
            />
            <NeoMetricCard
              label="Com Perfil Criado"
              value={(data.registrations?.filter(r => r.has_account).length || 0).toLocaleString()}
              sub="Utilizadores autenticados"
              icon={UserCheck}
              badgeColor="#B286FD"
            />
            <NeoMetricCard
              label="Ameaças Bloqueadas"
              value={data.summary.totalIntrusions.toLocaleString()}
              sub="Scanners neutralizados"
              icon={ShieldCheck}
              badgeColor="#FF7051"
            />
          </div>
        )}

        {/* Neo-Brutalist Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-black text-white shadow-[3px_3px_0px_' + tab.color + ']' : 'bg-white text-black shadow-[3px_3px_0px_#000] hover:bg-[#F5F5F4]'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: REGISTRATIONS */}
        {activeTab === 'registrations' && data && (
          <div className="bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000] overflow-hidden flex flex-col">
            
            {/* Search & Filter Bar */}
            <div className="p-4 sm:p-5 border-b-2 border-black flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between bg-[#F5F5F4]">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, telefone ou ilha..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-black pl-10 pr-4 py-2 text-xs font-semibold rounded-xl text-black placeholder-[#78716C] outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#78716C]" />
                <select
                  value={filterIsland}
                  onChange={e => setFilterIsland(e.target.value)}
                  className="bg-white border-2 border-black text-xs font-bold rounded-xl px-4 py-2 text-black outline-none shadow-[2px_2px_0px_#000] cursor-pointer"
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
                <span className="text-xs font-mono font-bold ml-1 text-[#78716C]">
                  {filteredRegistrations.length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-black bg-white uppercase text-[10px] font-black tracking-wider text-[#78716C]">
                    <th className="px-6 py-3.5">Data/Hora</th>
                    <th className="px-6 py-3.5">Nome Completo</th>
                    <th className="px-6 py-3.5">Contacto</th>
                    <th className="px-6 py-3.5">Localização</th>
                    <th className="px-6 py-3.5">Perfil</th>
                    <th className="px-6 py-3.5">País</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {filteredRegistrations.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F5F5F4] transition-colors">
                      <td className="px-6 py-4 font-mono text-[#78716C]">
                        {new Date(r.created_at).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-black text-sm">{r.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-black flex items-center gap-1.5">
                            <Phone size={12} className="text-[#FF7051]" /> {r.phone || '—'}
                          </span>
                          {r.email && (
                            <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1.5">
                              <Mail size={11} /> {r.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFFDF5] border border-black text-[11px] font-bold shadow-[1px_1px_0px_#000]">
                          <MapPin size={11} className="text-[#FFD027]" />
                          {r.island || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.has_account ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#A2E435] border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
                            <CheckCircle2 size={11} /> Criado
                          </span>
                        ) : (
                          <span className="text-[#78716C] font-mono">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#78716C]">{r.country || 'CV'}</td>
                    </tr>
                  ))}

                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#78716C] font-semibold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg border-2 border-black bg-[#FFD027] flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <MapPin size={15} />
                </div>
                <h3 className="text-sm font-black uppercase">Inscrições por Ilha</h3>
              </div>
              {data.islandStats.length > 0 ? (
                <NeoBarChart data={data.islandStats.map(d => ({ label: d.island, value: d.count }))} color="#FFD027" />
              ) : (
                <p className="text-xs text-[#78716C]">Sem dados de ilhas ainda.</p>
              )}
            </div>

            <div className="p-6 bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg border-2 border-black bg-[#60A5F9] flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <Globe size={15} />
                </div>
                <h3 className="text-sm font-black uppercase">Origem do Tráfego</h3>
              </div>
              {data.countryStats.length > 0 ? (
                <NeoBarChart data={data.countryStats.slice(0, 8).map(d => ({ label: d.country, value: d.count }))} color="#60A5F9" />
              ) : (
                <p className="text-xs text-[#78716C]">Sem dados de tráfego geográfico.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VISITORS */}
        {activeTab === 'visitors' && data && (
          <div className="bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="p-4 sm:p-5 border-b-2 border-black bg-[#F5F5F4] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">Tráfego Recente ({data.recentVisitors.length})</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#60A5F9] border border-black rounded">
                IPs Ativos
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-black bg-white uppercase text-[10px] font-black text-[#78716C]">
                    <th className="px-6 py-3">Data/Hora</th>
                    <th className="px-6 py-3">IP de Origem</th>
                    <th className="px-6 py-3">País</th>
                    <th className="px-6 py-3">Cidade</th>
                    <th className="px-6 py-3">Página</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {data.recentVisitors.map((v, i) => (
                    <tr key={i} className="hover:bg-[#F5F5F4]">
                      <td className="px-6 py-3 font-mono text-[#78716C]">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-3 font-mono font-bold text-black">{v.ip_address as string}</td>
                      <td className="px-6 py-3 font-bold">{v.country as string}</td>
                      <td className="px-6 py-3">{v.city as string}</td>
                      <td className="px-6 py-3 font-mono text-[#78716C]">{v.path as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INTRUSIONS */}
        {activeTab === 'intrusions' && data && (
          <div className="bg-white border-[3px] border-black rounded-[20px] shadow-[6px_6px_0px_#000] overflow-hidden">
            <div className="p-4 sm:p-5 border-b-2 border-black bg-[#F5F5F4] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-[#E2442F]">
                Auditoria de Segurança ({data.recentIntrusions.length})
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-[#A2E435] border border-black rounded-full shadow-[1px_1px_0px_#000]">
                ● Proteção Ativa
              </span>
            </div>
            {data.recentIntrusions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <CheckCircle2 size={32} className="text-[#11A365]" />
                <h4 className="font-black text-sm uppercase">Nenhuma Ameaça Encontrada</h4>
                <p className="text-xs text-[#78716C]">O firewall e filtros anti-bot estão a proteger a plataforma normalmente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-black bg-white uppercase text-[10px] font-black text-[#78716C]">
                      <th className="px-6 py-3">Data/Hora</th>
                      <th className="px-6 py-3">IP</th>
                      <th className="px-6 py-3">Tipo de Ataque</th>
                      <th className="px-6 py-3">Destino</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/10">
                    {data.recentIntrusions.map((v, i) => (
                      <tr key={i} className="hover:bg-[#F5F5F4]">
                        <td className="px-6 py-3 font-mono text-[#78716C]">
                          {new Date(v.created_at as string).toLocaleString('pt-PT')}
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-[#E2442F]">{v.ip_address as string}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded bg-[#FEE2E2] border border-black text-[10px] font-mono font-bold">
                            {v.intrusion_type as string}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-[#78716C]">{v.path as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
