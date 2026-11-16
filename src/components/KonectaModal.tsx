'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2, ChevronDown, Check, User, ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react'

/* ── Animated K mark (draw borders → fill → loop) ── */
function KMark() {
  const barPath = 'M0 0 L144.634 0 L144.634 586.476 L0 586.476 Z'
  const curvePath =
    'M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z'

  const paths = [
    { id: 'bar', d: barPath, color: '#dee054', delay: 0 },
    { id: 'curve', d: curvePath, color: '#efefef', delay: 0.14 },
  ]

  return (
    <svg
      width="22"
      height="33"
      viewBox="0 0 436.752 665.228"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', flexShrink: 0 }}
    >
      {paths.map(el => (
        <motion.path
          key={el.id}
          d={el.d}
          stroke={el.color}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ fill: el.color }}
          animate={{
            pathLength: [0, 1, 1, 1, 0, 0],
            strokeOpacity: [0.3, 1, 1, 0.7, 0.2, 0.3],
            fillOpacity: [0, 0, 1, 1, 0, 0],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.38, 0.52, 0.78, 0.95, 1],
            delay: el.delay,
          }}
        />
      ))}
    </svg>
  )
}

/* 10 Ilhas + Concelhos Oficiais de Cabo Verde + Diáspora */
const ILHAS_CV = [
  {
    name: 'Santo Antão',
    color: '#ff6b6b',
    concelhos: ['Ribeira Grande', 'Paul', 'Porto Novo'],
  },
  {
    name: 'São Vicente',
    color: '#ffb347',
    concelhos: ['São Vicente'],
  },
  {
    name: 'Santa Luzia',
    color: '#ffeb3b',
    concelhos: ['Reserva Natural'],
  },
  {
    name: 'São Nicolau',
    color: '#4caf50',
    concelhos: ['Ribeira Brava', 'Tarrafal de São Nicolau'],
  },
  {
    name: 'Sal',
    color: '#2196f3',
    concelhos: ['Sal'],
  },
  {
    name: 'Boa Vista',
    color: '#9c27b0',
    concelhos: ['Boa Vista'],
  },
  {
    name: 'Maio',
    color: '#e91e63',
    concelhos: ['Maio'],
  },
  {
    name: 'Santiago',
    color: '#00bcd4',
    concelhos: [
      'Praia',
      'Santa Catarina',
      'São Domingos',
      'Santa Cruz',
      'São Lourenço dos Órgãos',
      'Ribeira Grande de Santiago',
      'São Salvador do Mundo',
      'Tarrafal',
      'São Miguel',
    ],
  },
  {
    name: 'Fogo',
    color: '#ff9800',
    concelhos: ['São Filipe', 'Mosteiros', 'Santa Catarina do Fogo'],
  },
  {
    name: 'Brava',
    color: '#00e676',
    concelhos: ['Brava'],
  },
  {
    name: 'Diáspora',
    color: '#9e9e9e',
    concelhos: ['Portugal', 'Estados Unidos', 'França', 'Outro País'],
  },
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

  // Cálculo da porcentagem de progresso para a borda ao redor do avatar do utilizador
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
  const strokeDashoffset = 100 - progress // 100 is perimeter for pathLength=100

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

  // Avançar do formulário inicial
  const handleInitialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Indica o teu nome completo.')
    if (!phone.trim()) return setError('Indica o teu número de telefone.')
    if (!selectedIsland) return setError('Seleciona a tua ilha.')
    setError('')
    setIsDropdownOpen(false)
    // Pergunta se deseja criar perfil
    setStep('ask_profile')
  }

  // Submissão final para o backend
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

  // Status dos primeiros campos preenchidos para efeito de recolhimento ("scroll up" / minimização)
  const isPersonalDataCompleted = name.trim().length >= 2 && phone.trim().length >= 5

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with clean blur + animated drawing lines of the K logo in the blue background */}
          <motion.div
            className="fixed inset-0 overflow-hidden"
            style={{
              background: 'rgba(0, 4, 30, 0.70)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          >
            {/* Linhas desenhando a logo continuamente no fundo azul enquanto o card está aberto */}
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
              style={{ opacity: 0.22 }}
            >
              <svg
                width="640"
                height="640"
                viewBox="0 0 436.752 665.228"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: 'scale(1.25)',
                  filter: 'drop-shadow(0 0 40px rgba(222,224,84,0.35))',
                }}
              >
                <motion.path
                  d="M0 0 L144.634 0 L144.634 586.476 L0 586.476 Z"
                  stroke="#dee054"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ fill: '#dee054' }}
                  animate={{
                    pathLength: [0, 1, 1, 1, 0, 0],
                    strokeOpacity: [0.2, 1, 1, 0.6, 0.1, 0.2],
                    fillOpacity: [0, 0, 0.25, 0.25, 0, 0],
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.4, 0.55, 0.8, 0.95, 1],
                  }}
                />

                <motion.path
                  d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                  stroke="#efefef"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ fill: '#efefef' }}
                  animate={{
                    pathLength: [0, 1, 1, 1, 0, 0],
                    strokeOpacity: [0.2, 1, 1, 0.6, 0.1, 0.2],
                    fillOpacity: [0, 0, 0.2, 0.2, 0, 0],
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.4, 0.55, 0.8, 0.95, 1],
                    delay: 0.18,
                  }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Card - Material You / Google Account style (auto-expanding card to prevent scroll inside) */}
          <motion.div
            layout
            style={{
              position: 'relative',
              width: 410,
              maxWidth: '92vw',
              borderRadius: 24,
              background: '#0d1333',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
              padding: '24px 26px 24px',
              overflow: 'visible', // Permite que a lista expanda sem scrollbar interna
              boxSizing: 'border-box',
              zIndex: 10,
            }}
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Top row: Animated K logo + User Avatar with Progress Ring + Red Close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <KMark />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* User Avatar com Borda de Progresso Dinâmica */}
                <div style={{ position: 'relative', width: 34, height: 34 }}>
                  <svg width="34" height="34" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Ring */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2.5"
                    />
                    {/* Dynamic Progress Ring */}
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#dee054"
                      strokeWidth="2.5"
                      strokeDasharray="94.2" // 2 * PI * 15
                      strokeDashoffset={94.2 * (1 - progress / 100)}
                      strokeLinecap="round"
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </svg>

                  {/* Centered User Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 3,
                      borderRadius: '50%',
                      background: progress === 100 ? 'rgba(222,224,84,0.18)' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: progress === 100 ? '#dee054' : 'rgba(239,239,239,0.7)',
                    }}
                  >
                    <User size={14} />
                  </div>
                </div>

                {/* Botão fechar vermelho redondo */}
                <button
                  onClick={handleClose}
                  aria-label="Fechar"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(255, 59, 48, 0.20)',
                    border: '1px solid rgba(255, 59, 48, 0.45)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.35)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.20)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <X size={12} color="#ff453a" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Content switch */}
            <AnimatePresence mode="wait">
              {/* ── STEP 1: PROMPT ── */}
              {step === 'prompt' && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <p
                    style={{
                      color: '#f1f3f4',
                      fontSize: 20,
                      fontWeight: 650,
                      letterSpacing: '-0.3px',
                      lineHeight: 1.25,
                      marginBottom: 10,
                    }}
                  >
                    Konectar-se?
                  </p>
                  <p
                    style={{
                      color: 'rgba(239,239,239,0.60)',
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      marginBottom: 32,
                    }}
                  >
                    Queres Konectar-se para poderes receber algumas novidades em breve e participar em algo especial?
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <motion.button
                      onClick={() => setStep('form')}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '11px 28px',
                        borderRadius: 999,
                        background: '#dee054',
                        color: '#081DF4',
                        fontWeight: 700,
                        fontSize: 13.5,
                        letterSpacing: '0.04em',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'filter 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.06)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                    >
                      <span>Konecta-te</span>

                      {/* 3 Bolinhas a carregar/piscar com as cores das ilhas de Cabo Verde */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {[0, 1, 2].map(dotIndex => (
                          <motion.span
                            key={dotIndex}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              display: 'inline-block',
                            }}
                            animate={{
                              scale: [0.75, 1.35, 0.75],
                              opacity: [0.45, 1, 0.45],
                              backgroundColor: [
                                '#ff6b6b',
                                '#ffb347',
                                '#2196f3',
                                '#00bcd4',
                                '#ff9800',
                                '#9c27b0',
                                '#00e676',
                                '#ff6b6b',
                              ],
                            }}
                            transition={{
                              duration: 3.2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: dotIndex * 0.35,
                            }}
                          />
                        ))}
                      </span>
                    </motion.button>
                  </div>

                  <button
                    onClick={handleClose}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 24px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239,239,239,0.35)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,239,239,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,239,239,0.35)')}
                  >
                    Agora não
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: FORM (Nome, Telefone, Ilha com auto-expand do card) ── */}
              {step === 'form' && (
                <motion.form
                  key="form"
                  onSubmit={handleInitialFormSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ color: '#f1f3f4', fontSize: 16.5, fontWeight: 650, letterSpacing: '-0.2px' }}>
                      Os teus dados
                    </p>
                    <span style={{ fontSize: 11, color: '#dee054', fontWeight: 600 }}>
                      Passo 1 de 2
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
                    {/* Campos de Nome e Telefone: Recolhem com animação suave quando preenchidos para dar destaque à ilha */}
                    <motion.div
                      layout
                      animate={{
                        opacity: isPersonalDataCompleted && isDropdownOpen ? 0.45 : 1,
                        scale: isPersonalDataCompleted && isDropdownOpen ? 0.98 : 1,
                      }}
                      transition={{ duration: 0.25 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      {/* Nome */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={labelSt}>Nome completo</label>
                          {name.trim().length >= 2 && <Check size={12} color="#dee054" />}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="O teu nome"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          style={inputSt}
                          onFocus={e => (e.target.style.borderColor = 'rgba(222,224,84,0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={labelSt}>Número de telefone</label>
                          {phone.trim().length >= 5 && <Check size={12} color="#dee054" />}
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="+238 9XX XX XX"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          style={inputSt}
                          onFocus={e => (e.target.style.borderColor = 'rgba(222,224,84,0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                        />
                      </div>
                    </motion.div>

                    {/* Selector de Ilhas & Concelhos: Expande o card diretamente (sem barra de scroll interna) */}
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                      <label style={labelSt}>De qual ilha e concelho estás a conectar?</label>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        style={{
                          ...inputSt,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                          borderColor: isDropdownOpen
                            ? 'rgba(222,224,84,0.6)'
                            : selectedIsland
                            ? 'rgba(222,224,84,0.3)'
                            : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {currentIslandObj ? (
                            <>
                              <span
                                style={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: '50%',
                                  backgroundColor: currentIslandObj.color,
                                  boxShadow: `0 0 8px ${currentIslandObj.color}`,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ color: '#f1f3f4', fontSize: 14.5, fontWeight: 550 }}>
                                {currentIslandObj.name}
                                {selectedConcelho ? (
                                  <span style={{ color: '#dee054', fontWeight: 500, marginLeft: 6, fontSize: 13.5 }}>
                                    · {selectedConcelho}
                                  </span>
                                ) : null}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: 'rgba(239,239,239,0.38)', fontSize: 14 }}>
                              Seleciona a tua ilha
                            </span>
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', alignItems: 'center', color: 'rgba(239,239,239,0.45)' }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>

                      {/* Dropdown com expansão contínua no próprio fluxo do card */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            style={{
                              marginTop: 8,
                              background: '#090d24',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 16,
                              padding: '8px',
                              overflow: 'visible',
                            }}
                          >
                            {ILHAS_CV.map(i => {
                              const isIslandActive = selectedIsland === i.name
                              const isSubExpanded = expandedIsland === i.name

                              return (
                                <div key={i.name} style={{ marginBottom: 3 }}>
                                  <div
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 10px',
                                      borderRadius: 10,
                                      background: isIslandActive
                                        ? 'rgba(222,224,84,0.14)'
                                        : 'transparent',
                                      cursor: 'pointer',
                                      transition: 'background 0.15s',
                                    }}
                                    onClick={() => {
                                      setSelectedIsland(i.name)
                                      setExpandedIsland(prev => (prev === i.name ? null : i.name))
                                    }}
                                    onMouseEnter={e => {
                                      if (!isIslandActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                                    }}
                                    onMouseLeave={e => {
                                      if (!isIslandActive) e.currentTarget.style.background = 'transparent'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <span
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          backgroundColor: i.color,
                                          flexShrink: 0,
                                        }}
                                      />
                                      <span
                                        style={{
                                          color: isIslandActive ? '#dee054' : '#f1f3f4',
                                          fontSize: 14,
                                          fontWeight: isIslandActive ? 600 : 500,
                                        }}
                                      >
                                        {i.name}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {isIslandActive && !selectedConcelho && (
                                        <Check size={14} color="#dee054" />
                                      )}
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color: 'rgba(239,239,239,0.40)',
                                          padding: '2px 6px',
                                          borderRadius: 6,
                                          background: 'rgba(255,255,255,0.06)',
                                        }}
                                      >
                                        {i.concelhos.length} conc.
                                      </span>
                                    </div>
                                  </div>

                                  {/* Concelhos expandidos dentro da ilha */}
                                  <AnimatePresence>
                                    {isSubExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.16 }}
                                        style={{
                                          paddingLeft: 20,
                                          paddingTop: 4,
                                          paddingBottom: 4,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 2,
                                        }}
                                      >
                                        {i.concelhos.map(conc => {
                                          const isConcSelected =
                                            isIslandActive && selectedConcelho === conc

                                          return (
                                            <button
                                              key={conc}
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation()
                                                setSelectedIsland(i.name)
                                                setSelectedConcelho(conc)
                                                setIsDropdownOpen(false)
                                              }}
                                              style={{
                                                textAlign: 'left',
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                background: isConcSelected
                                                  ? 'rgba(222,224,84,0.18)'
                                                  : 'transparent',
                                                border: 'none',
                                                color: isConcSelected ? '#dee054' : 'rgba(239,239,239,0.8)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                              }}
                                              onMouseEnter={e => {
                                                if (!isConcSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                                              }}
                                              onMouseLeave={e => {
                                                if (!isConcSelected) e.currentTarget.style.background = 'transparent'
                                              }}
                                            >
                                              <span>{conc}</span>
                                              {isConcSelected && <Check size={12} color="#dee054" />}
                                            </button>
                                          )
                                        })}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: '#ff6b7a', fontSize: 12, marginBottom: 10, paddingLeft: 2 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: '#dee054',
                      color: '#081DF4',
                      fontWeight: 700,
                      fontSize: 14,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      marginBottom: 8,
                      transition: 'filter 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.06)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    Continuar →
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      setStep('prompt')
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 24px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239,239,239,0.35)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(239,239,239,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,239,239,0.35)')}
                  >
                    ← Voltar
                  </button>
                </motion.form>
              )}

              {/* ── STEP 3: ASK PROFILE (Queres criar um perfil para ter acesso primeiro?) ── */}
              {step === 'ask_profile' && (
                <motion.div
                  key="ask_profile"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div className="flex items-center gap-2 mb-2 text-[#dee054]">
                    <Sparkles size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Acesso Antecipado</span>
                  </div>

                  <p style={{ color: '#f1f3f4', fontSize: 18, fontWeight: 650, letterSpacing: '-0.3px', lineHeight: 1.3, marginBottom: 8 }}>
                    Queres criar um perfil pessoal?
                  </p>

                  <p style={{ color: 'rgba(239,239,239,0.60)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                    Ao criar uma conta, terás acesso em primeira mão a todas as novidades e poderás usar o teu login para usufruir dos serviços exclusivos da plataforma quando lançarmos.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                    {/* Opção 1: Sim, criar perfil com email e password */}
                    <button
                      type="button"
                      onClick={() => setStep('profile_form')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: 999,
                        background: '#dee054',
                        color: '#081DF4',
                        fontWeight: 700,
                        fontSize: 13.5,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'filter 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.06)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                    >
                      <span>Sim, quero criar perfil</span>
                    </button>

                    {/* Opção 2: Não, submeter apenas registo prioritário */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleFinalSubmit(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '11px 20px',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#f1f3f4',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : 'Apenas registar na lista'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 24px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239,239,239,0.35)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    ← Voltar aos dados
                  </button>
                </motion.div>
              )}

              {/* ── STEP 4: PROFILE FORM (Email e Senha) ── */}
              {step === 'profile_form' && (
                <motion.form
                  key="profile_form"
                  onSubmit={e => {
                    e.preventDefault()
                    handleFinalSubmit(true)
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ color: '#f1f3f4', fontSize: 16.5, fontWeight: 650, letterSpacing: '-0.2px' }}>
                      Cria o teu Perfil
                    </p>
                    <span style={{ fontSize: 11, color: '#dee054', fontWeight: 600 }}>
                      Passo 2 de 2
                    </span>
                  </div>

                  <p style={{ color: 'rgba(239,239,239,0.50)', fontSize: 12.5, lineHeight: 1.5, marginBottom: 16 }}>
                    Usa estes dados para aceder à tua conta Konecta.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
                    {/* Email */}
                    <div>
                      <label style={labelSt}>Email de Acesso</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="o-teu-email@exemplo.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          style={inputSt}
                          onFocus={e => (e.target.style.borderColor = 'rgba(222,224,84,0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                        />
                        <Mail size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                      </div>
                    </div>

                    {/* Senha */}
                    <div>
                      <label style={labelSt}>Palavra-passe (mínimo 6 caracteres)</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          style={inputSt}
                          onFocus={e => (e.target.style.borderColor = 'rgba(222,224,84,0.5)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                        />
                        <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: '#ff6b7a', fontSize: 12, marginBottom: 10, paddingLeft: 2 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: '#dee054',
                      color: '#081DF4',
                      fontWeight: 700,
                      fontSize: 14,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: 'none',
                      marginBottom: 8,
                      transition: 'filter 0.2s',
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.filter = 'brightness(1.06)')}
                    onMouseLeave={e => !loading && (e.currentTarget.style.filter = 'none')}
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : 'Confirmar & Criar Perfil'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('ask_profile')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 24px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239,239,239,0.35)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    ← Voltar
                  </button>
                </motion.form>
              )}

              {/* ── STEP 5: SUCCESS ── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'rgba(222,224,84,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <CheckCircle2 size={26} color="#dee054" />
                  </div>
                  <p
                    style={{
                      color: '#f1f3f4',
                      fontSize: 18,
                      fontWeight: 650,
                      letterSpacing: '-0.3px',
                      marginBottom: 8,
                    }}
                  >
                    Estás Konectado!
                  </p>
                  <p
                    style={{
                      color: 'rgba(239,239,239,0.55)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      marginBottom: 22,
                      maxWidth: 280,
                    }}
                  >
                    {email ? (
                      <>
                        O teu perfil com <strong className="text-white">{email}</strong> foi reservado com sucesso. Serás notificado para aceder em primeira mão!
                      </>
                    ) : (
                      'Foste registado na lista prioritária. Fica atento — serás um dos primeiros a receber acesso.'
                    )}
                  </p>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '11px 32px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f1f3f4',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      boxShadow: 'none',
                    }}
                  >
                    Concluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ── shared styles ── */
const labelSt: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(239,239,239,0.45)',
  marginBottom: 5,
  paddingLeft: 1,
}

const inputSt: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#f1f3f4',
  fontSize: 13.5,
  outline: 'none',
  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
  boxSizing: 'border-box',
}
