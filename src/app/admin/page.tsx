'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Shield, Users, Globe, AlertTriangle, LogOut, Phone, MapPin } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'visitors' | 'intrusions'>('registrations')
  const [lastUpdated, setLastUpdated] = useState<string>('')

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

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#081DF4' }}
      >
        <div
          className="w-full max-w-sm rounded-3xl p-8 shadow-2xl backdrop-blur-2xl"
          style={{ backgroundColor: '#efefef' }}
        >
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#081DF4] text-[#dee054] flex items-center justify-center font-bold text-xl mb-3 shadow-lg">
                K
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#081DF4]">
                Konecta Admin
              </h1>
              <p className="text-xs text-gray-500 mt-1">Estatísticas & Registos Konect-se</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-xl">
                {error}
              </p>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Palavra-passe de acesso"
                className="w-full border border-black/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#081DF4] text-[#0a0f3d]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#081DF4', color: '#dee054' }}
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'registrations', label: `Registos Konect-se (${data?.registrations?.length ?? 0})`, icon: Users },
    { id: 'overview', label: 'Visão Geral & Ilhas', icon: Globe },
    { id: 'visitors', label: 'Visitantes', icon: Users },
    { id: 'intrusions', label: 'Tentativas de Intrusão', icon: AlertTriangle },
  ] as const

  return (
    <div className="min-h-screen bg-[#070b1e] text-[#efefef]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#081DF4]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#dee054] text-[#081DF4] flex items-center justify-center font-black text-sm">
            K
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Konecta.cv — Painel Admin
            </h1>
            {lastUpdated && (
              <p className="text-[11px] text-[#dee054]/80">Atualizado às {lastUpdated}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(token)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => {
              setAuthed(false)
              setToken('')
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-red-500/30 transition-all text-red-200"
          >
            <LogOut size={12} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pb-2">
          <div className="rounded-2xl p-5 bg-[#0f1738] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Konectados</span>
              <Users size={16} className="text-[#dee054]" />
            </div>
            <p className="text-3xl font-bold text-[#dee054]">
              {data.summary.totalRegistrations.toLocaleString()}
            </p>
            <span className="text-[11px] text-green-400">Pessoas à espera de serviços grátis</span>
          </div>

          <div className="rounded-2xl p-5 bg-[#0f1738] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Visitantes Únicos</span>
              <Globe size={16} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {data.summary.totalVisitors.toLocaleString()}
            </p>
            <span className="text-[11px] text-gray-400">Acessos à landing page</span>
          </div>

          <div className="rounded-2xl p-5 bg-[#0f1738] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Intrusões Bloqueadas</span>
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">
              {data.summary.totalIntrusions.toLocaleString()}
            </p>
            <span className="text-[11px] text-red-300/80">Scanners e ataques filtrados</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? '#081DF4' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#dee054' : '#888',
            }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 pt-3">
        {/* TAB: REGISTRATIONS */}
        {activeTab === 'registrations' && data && (
          <div className="rounded-2xl overflow-hidden bg-[#0f1738] border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#dee054]">
                Pessoas Konectadas ({data.registrations.length})
              </h3>
              <span className="text-xs text-gray-400">Candidatos para serviços grátis</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-black/30 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3.5">Data</th>
                    <th className="px-5 py-3.5">Nome Completo</th>
                    <th className="px-5 py-3.5">Telefone</th>
                    <th className="px-5 py-3.5">Ilha</th>
                    <th className="px-5 py-3.5">País</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.registrations.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-gray-400">
                        {new Date(r.created_at).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white">{r.name}</td>
                      <td className="px-5 py-3.5 font-mono text-[#dee054]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="opacity-70" />
                          <span>{r.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]">
                          <MapPin size={10} />
                          {r.island || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">{r.country}</td>
                    </tr>
                  ))}
                  {data.registrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                        Nenhum registo ainda. Clica na pílula &quot;Konect-se&quot; na landing page para testar!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && data && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-5 bg-[#0f1738] border border-white/10">
              <h3 className="text-sm font-semibold mb-4 text-[#dee054]">
                🏝️ Inscrições por Ilha de Cabo Verde
              </h3>
              <div className="flex flex-col gap-2.5">
                {data.islandStats.map((item) => (
                  <div key={item.island} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{item.island}</span>
                    <span className="font-mono text-[#dee054] font-semibold">{item.count}</span>
                  </div>
                ))}
                {data.islandStats.length === 0 && (
                  <p className="text-xs text-gray-500">Sem inscrições por ilha ainda.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-[#0f1738] border border-white/10">
              <h3 className="text-sm font-semibold mb-4 text-[#dee054]">
                🌍 Países com mais Acessos
              </h3>
              <div className="flex flex-col gap-2.5">
                {data.countryStats.slice(0, 10).map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{c.country}</span>
                    <span className="font-mono text-white">{c.count}</span>
                  </div>
                ))}
                {data.countryStats.length === 0 && (
                  <p className="text-xs text-gray-500">Sem dados geográficos ainda.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISITORS */}
        {activeTab === 'visitors' && data && (
          <div className="rounded-2xl overflow-hidden bg-[#0f1738] border border-white/10">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-[#dee054]">
                Últimos Visitantes na Landing Page ({data.recentVisitors.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-black/30 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">IP</th>
                    <th className="px-5 py-3">País</th>
                    <th className="px-5 py-3">Cidade</th>
                    <th className="px-5 py-3">Página</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentVisitors.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-300">{v.ip_address as string}</td>
                      <td className="px-5 py-3 text-[#dee054]">{v.country as string}</td>
                      <td className="px-5 py-3 text-gray-400">{v.city as string}</td>
                      <td className="px-5 py-3 font-mono text-gray-400">{v.path as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: INTRUSIONS */}
        {activeTab === 'intrusions' && data && (
          <div className="rounded-2xl overflow-hidden bg-[#0f1738] border border-white/10">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-red-400">
                Tentativas de Intrusão & Scanners Bloqueados ({data.recentIntrusions.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-black/30 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-5 py-3">IP</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Página Alvo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentIntrusions.map((v, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(v.created_at as string).toLocaleString('pt-PT')}
                      </td>
                      <td className="px-5 py-3 font-mono text-red-400">{v.ip_address as string}</td>
                      <td className="px-5 py-3 font-mono text-yellow-300">{v.intrusion_type as string}</td>
                      <td className="px-5 py-3 font-mono text-gray-400">{v.path as string}</td>
                    </tr>
                  ))}
                  {data.recentIntrusions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                        Nenhuma intrusão detectada. Sistema seguro ✓
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
