'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, ChevronDown, Check, User, ArrowLeft, Lock, Mail, Sparkles, MapPin } from 'lucide-react'

/* ── Neo-Brutalism K Mark ── */
function NeoKMark() {
  const barPath = 'M0 0 L144.634 0 L144.634 586.476 L0 586.476 Z'
  const curvePath =
    'M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z'

  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="34" viewBox="0 0 436.752 665.228" fill="none" className="overflow-visible drop-shadow-[2px_2px_0px_#000]">
        <path d={barPath} fill="#A2E435" stroke="#000000" strokeWidth="24" />
        <path d={curvePath} fill="#FFFFFF" stroke="#000000" strokeWidth="24" />
      </svg>
      <span className="font-extrabold text-lg tracking-tight uppercase">Konecta</span>
    </div>
  )
}

/* 10 Ilhas + Concelhos Oficiais de Cabo Verde + Diáspora com cores neo-brutalistas */
const ILHAS_CV = [
  { name: 'Santo Antão', color: '#FF7051', concelhos: ['Ribeira Grande', 'Paul', 'Porto Novo'] },
  { name: 'São Vicente', color: '#FFCA7F', concelhos: ['São Vicente'] },
  { name: 'Santa Luzia', color: '#FFD027', concelhos: ['Reserva Natural'] },
  { name: 'São Nicolau', color: '#11A365', concelhos: ['Ribeira Brava', 'Tarrafal de São Nicolau'] },
  { name: 'Sal', color: '#60A5F9', concelhos: ['Sal'] },
  { name: 'Boa Vista', color: '#B286FD', concelhos: ['Boa Vista'] },
  { name: 'Maio', color: '#E2442F', concelhos: ['Maio'] },
  { name: 'Santiago', color: '#22D2ED', concelhos: ['Praia', 'Santa Catarina', 'São Domingos', 'Santa Cruz', 'São Lourenço dos Órgãos', 'Ribeira Grande de Santiago', 'São Salvador do Mundo', 'Tarrafal', 'São Miguel'] },
  { name: 'Fogo', color: '#FF7051', concelhos: ['São Filipe', 'Mosteiros', 'Santa Catarina do Fogo'] },
  { name: 'Brava', color: '#68D391', concelhos: ['Brava'] },
  { name: 'Diáspora', color: '#A2E435', concelhos: ['Portugal', 'Estados Unidos', 'França', 'Outro País'] },
]

export default function KonectaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<'prompt' | 'form' | 'ask_profile' | 'profile_form' | 'success'>('prompt')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedIsland, setSelectedIsland] = useState('')
  const [selectedConcelho, setSelectedConcelho] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedIsland, setExpandedIsland] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const calculateProgress = () => {
    let filled = 0
    let total = 3
    if (name.trim().length >= 2) filled++
    if (phone.trim().length >= 5) filled++
    if (selectedIsland) filled++
    if (step === 'profile_form') {
      total = 5
      if (email.trim().includes('@')) filled++
      if (password.length >= 6) filled++
    }
    return Math.round((filled / total) * 100)
  }

  const progress = calculateProgress()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const reset = () => {
    setTimeout(() => {
      setStep('prompt')
      setError('')
      setIsDropdownOpen(false)
      setExpandedIsland(null)
    }, 350)
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  const handleInitialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Indica o teu nome completo.')
    if (!phone.trim()) return setError('Indica o teu número de telefone.')
    if (!selectedIsland) return setError('Seleciona a tua ilha.')
    setError('')
    setIsDropdownOpen(false)
    setStep('ask_profile')
  }

  const handleFinalSubmit = async (withProfile: boolean) => {
    if (withProfile) {
      if (!email.trim() || !email.includes('@')) return setError('Indica um email válido.')
      if (password.length < 6) return setError('A palavra-passe deve ter pelo menos 6 caracteres.')
    }

    setLoading(true)
    setError('')
    try {
      const fullLocation = selectedConcelho
        ? `${selectedIsland} (${selectedConcelho})`
        : selectedIsland

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          island: fullLocation,
          email: withProfile ? email.trim() : '',
          password: withProfile ? password : '',
          createProfile: withProfile,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar.')
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo correu mal.')
    } finally {
      setLoading(false)
    }
  }

  const currentIslandObj = ILHAS_CV.find(i => i.name === selectedIsland)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Riddle Backdrop: Semi-transparent black with neo grid dots */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container — Riddle UI Neo-Brutalism Style */}
          <motion.div
            layout
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-[430px] bg-white border-[3px] border-black rounded-[20px] shadow-[8px_8px_0px_#000] p-6 sm:p-7 text-black box-border"
          >
            {/* Header: Logo + Progress badge + Close button */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b-2 border-black">
              <NeoKMark />

              <div className="flex items-center gap-3">
                {/* Progress Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F4] border-2 border-black rounded-full text-xs font-bold shadow-[2px_2px_0px_#000]">
                  <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: progress === 100 ? '#11A365' : '#FFD027' }} />
                  <span>{progress}%</span>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full border-2 border-black bg-[#E2442F] text-white flex items-center justify-center shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-[#FEE2E2] border-2 border-black text-black font-semibold text-xs shadow-[2px_2px_0px_#000]">
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1: PROMPT */}
            {step === 'prompt' && (
              <div className="flex flex-col gap-5">
                <div className="p-4 bg-[#F5F5F4] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                  <div className="inline-block px-2 py-0.5 bg-[#B286FD] border border-black rounded text-[10px] font-extrabold uppercase mb-2">
                    Lançamento Exclusivo
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight mb-1">Queres Konectar-te?</h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Sê um dos primeiros cabo-verdianos a aceder às novas oportunidades, serviços e novidades da rede Konecta.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="w-full flex items-center justify-center min-h-[54px] py-4 px-8 rounded-xl bg-[#A2E435] border-2 border-black font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    Sim, Konecta-me! 🚀
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full flex items-center justify-center min-h-[44px] py-3.5 px-8 rounded-xl bg-white border-2 border-black font-bold text-xs uppercase tracking-wide text-[#78716C] hover:bg-[#F5F5F4] transition-all cursor-pointer"
                  >
                    Agora não
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FORM */}
            {step === 'form' && (
              <form onSubmit={handleInitialFormSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Manuel Silva"
                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] focus:shadow-[4px_4px_0px_#000] transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    Número de Contacto *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: 9912345"
                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] focus:shadow-[4px_4px_0px_#000] transition-all"
                  />
                </div>

                {/* Island Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    Onde Estás Localizado? *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-xl font-medium text-sm flex items-center justify-between shadow-[3px_3px_0px_#000] hover:bg-[#FFFDF5] transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      {currentIslandObj ? (
                        <>
                          <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: currentIslandObj.color }} />
                          <span className="font-bold">{selectedIsland} {selectedConcelho && `(${selectedConcelho})`}</span>
                        </>
                      ) : (
                        <span className="text-[#78716C]">Escolhe a tua Ilha / Concelho</span>
                      )}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-30 max-h-56 overflow-y-auto bg-white border-2 border-black rounded-xl shadow-[5px_5px_0px_#000] p-1.5">
                      {ILHAS_CV.map(island => {
                        const isSelected = selectedIsland === island.name
                        const isExpanded = expandedIsland === island.name
                        return (
                          <div key={island.name} className="border-b border-black/10 last:border-b-0">
                            <div
                              onClick={() => {
                                setSelectedIsland(island.name)
                                setSelectedConcelho('')
                                setExpandedIsland(isExpanded ? null : island.name)
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer font-bold text-xs hover:bg-[#F5F5F4] transition-colors ${isSelected ? 'bg-[#FFD027]/25' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: island.color }} />
                                <span>{island.name}</span>
                              </div>
                              <span className="text-[10px] text-[#78716C] uppercase font-mono">
                                {island.concelhos.length} concelho(s)
                              </span>
                            </div>

                            {/* Sub-concelhos */}
                            {isExpanded && (
                              <div className="pl-6 pr-2 py-1 flex flex-wrap gap-1 bg-[#F5F5F4] rounded-md my-1">
                                {island.concelhos.map(conc => (
                                  <button
                                    key={conc}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedIsland(island.name)
                                      setSelectedConcelho(conc)
                                      setIsDropdownOpen(false)
                                    }}
                                    className={`px-2 py-1 text-[11px] font-bold border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer hover:bg-white transition-all ${selectedConcelho === conc ? 'bg-[#A2E435]' : 'bg-white'}`}
                                  >
                                    {conc}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center min-h-[54px] py-4 px-8 rounded-xl bg-[#FFD027] border-2 border-black font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    Continuar →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ASK PROFILE */}
            {step === 'ask_profile' && (
              <div className="flex flex-col gap-5">
                <div className="p-4 bg-[#B286FD]/20 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-[#000]" />
                    <h3 className="text-base font-extrabold uppercase">Queres Criar um Perfil?</h3>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Cria uma conta pessoal para teres prioridade máxima e acesso imediato à plataforma quando abrir.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setStep('profile_form')}
                    className="w-full flex items-center justify-center min-h-[54px] py-4 px-8 rounded-xl bg-[#B286FD] border-2 border-black font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    ✨ Sim, Criar Meu Perfil
                  </button>

                  <button
                    onClick={() => handleFinalSubmit(false)}
                    disabled={loading}
                    className="w-full flex items-center justify-center min-h-[46px] py-3.5 px-8 rounded-xl bg-white border-2 border-black font-bold text-xs uppercase tracking-wide shadow-[3px_3px_0px_#000] hover:bg-[#F5F5F4] transition-all cursor-pointer"
                  >
                    {loading ? 'A guardar...' : 'Apenas Entrar na Lista'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PROFILE FORM */}
            {step === 'profile_form' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setStep('ask_profile')}
                    className="p-1 border border-black rounded hover:bg-[#F5F5F4]"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider">Criar Perfil Konecta</span>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    O teu Email *
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="teuemail@exemplo.cv"
                      className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                    Palavra-passe Segura *
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black rounded-xl font-medium text-sm outline-none shadow-[3px_3px_0px_#000] focus:bg-[#FFFDF5] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleFinalSubmit(true)}
                    disabled={loading}
                    className="w-full flex items-center justify-center min-h-[54px] py-4 px-8 rounded-xl bg-[#A2E435] border-2 border-black font-extrabold text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  >
                    {loading ? 'A processar...' : 'Finalizar & Konectar! 🎉'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 'success' && (
              <div className="flex flex-col items-center text-center py-4 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#A2E435] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000] mb-2">
                  <CheckCircle2 size={36} strokeWidth={2.5} />
                </div>

                <div className="inline-block px-3 py-1 bg-[#FFD027] border-2 border-black rounded-full text-xs font-black uppercase">
                  Estás Konectado!
                </div>

                <h3 className="text-xl font-black tracking-tight">Obrigado, {name.split(' ')[0]}!</h3>

                <p className="text-xs text-[#78716C] leading-relaxed max-w-xs">
                  O teu registo foi guardado com sucesso. Brevemente entraremos em contacto com todas as novidades prioritárias.
                </p>

                <button
                  onClick={handleClose}
                  className="mt-3 w-full flex items-center justify-center min-h-[48px] py-3.5 px-8 rounded-xl bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#FFD027] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
