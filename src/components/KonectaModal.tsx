'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2, ChevronDown, Check } from 'lucide-react'

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
  const [step, setStep] = useState<'prompt' | 'form' | 'success'>('prompt')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedIsland, setSelectedIsland] = useState('')
  const [selectedConcelho, setSelectedConcelho] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedIsland, setExpandedIsland] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Indica o teu nome completo.')
    if (!phone.trim()) return setError('Indica o teu número de telefone.')
    if (!selectedIsland) return setError('Seleciona a tua ilha.')
    setLoading(true)
    setError('')
    try {
      const fullLocation = selectedConcelho
        ? `${selectedIsland} (${selectedConcelho})`
        : selectedIsland

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), island: fullLocation }),
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          {/* Backdrop with clean blur + animated drawing lines of the K logo in the blue background */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
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
                {/* Linha desenhando a barra vertical */}
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

                {/* Linha desenhando o arco do K */}
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

          {/* Card - flat, minimal/no shadow, 50% reduced border-radius (14px) */}
          <motion.div
            layout
            style={{
              position: 'relative',
              width: 400,
              maxWidth: '92vw',
              borderRadius: 14,
              background: '#0a0e26',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'none',
              padding: '24px 24px 20px',
              overflow: 'hidden', // manter o K watermark contido no card
              boxSizing: 'border-box',
            }}
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Efeito de background sutil com o K da logo em marca d'água */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
              animate={{ opacity: 0.045, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                right: -25,
                bottom: -35,
                width: 220,
                height: 330,
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none',
              }}
            >
              <svg
                viewBox="0 0 436.752 665.228"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%' }}
              >
                <rect x="0" y="0" width="144.634" height="586.476" fill="#dee054" />
                <path
                  d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z"
                  fill="#efefef"
                />
              </svg>
            </motion.div>

            {/* Top row: Animated K logo + close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <KMark />

              <button
                onClick={handleClose}
                aria-label="Fechar"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%', // redondo
                  background: 'rgba(255, 59, 48, 0.20)', // vermelho estilo Apple/macOS
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

            {/* Content switch */}
            <AnimatePresence mode="wait">
              {/* ── PROMPT ── */}
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
                      color: '#efefef',
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
                      marginBottom: 36, // dá espaço para respirar e desce o botão
                    }}
                  >
                    Queres Konectar-se para poderes receber algumas novidades em breve e participar em algo especial?
                  </p>

                  {/* Botão Konecta estilo pílula com bolinhas animadas */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
                        borderRadius: 999, // pílula
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
                                '#ff6b6b', // Santo Antão
                                '#ffb347', // São Vicente
                                '#2196f3', // Sal
                                '#00bcd4', // Santiago
                                '#ff9800', // Fogo
                                '#9c27b0', // Boa Vista
                                '#00e676', // Brava
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

              {/* ── FORM ── */}
              {step === 'form' && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <p
                    style={{
                      color: '#efefef',
                      fontSize: 16.5,
                      fontWeight: 650,
                      letterSpacing: '-0.2px',
                      marginBottom: 16,
                    }}
                  >
                    Os teus dados
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
                    {/* Nome */}
                    <div>
                      <label style={labelSt}>Nome completo</label>
                      <input
                        type="text"
                        required
                        placeholder="O teu nome"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputSt}
                        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.35)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label style={labelSt}>Número de telefone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+238 9XX XX XX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={inputSt}
                        onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.35)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                    </div>

                    {/* Selector de Ilhas + Concelhos */}
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
                            ? 'rgba(222,224,84,0.5)'
                            : 'rgba(255,255,255,0.12)',
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
                              <span style={{ color: '#efefef', fontSize: 14.5, fontWeight: 550 }}>
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

                      {/* Dropdown com Ilhas & Concelhos */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
                            transition={{ duration: 0.16 }}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: 5,
                              zIndex: 60,
                              background: '#0c1130',
                              border: '1px solid rgba(255,255,255,0.14)',
                              borderRadius: 8,
                              maxHeight: 220,
                              overflowY: 'auto',
                              padding: '6px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                            }}
                          >
                            {ILHAS_CV.map(i => {
                              const isIslandActive = selectedIsland === i.name
                              const isSubExpanded = expandedIsland === i.name

                              return (
                                <div key={i.name} style={{ marginBottom: 2 }}>
                                  {/* Linha da Ilha */}
                                  <div
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 10px',
                                      borderRadius: 6,
                                      background: isIslandActive
                                        ? 'rgba(222,224,84,0.12)'
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
                                      {/* Nome da ilha com tamanho maior */}
                                      <span
                                        style={{
                                          color: isIslandActive ? '#dee054' : '#efefef',
                                          fontSize: 14.5,
                                          fontWeight: isIslandActive ? 600 : 500,
                                          letterSpacing: '-0.1px',
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
                                          color: 'rgba(239,239,239,0.35)',
                                          padding: '2px 6px',
                                          borderRadius: 4,
                                          background: 'rgba(255,255,255,0.05)',
                                        }}
                                      >
                                        {i.concelhos.length} conc.
                                      </span>
                                    </div>
                                  </div>

                                  {/* Lista de Concelhos expandíveis */}
                                  <AnimatePresence>
                                    {isSubExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.16 }}
                                        style={{
                                          overflow: 'hidden',
                                          paddingLeft: 22,
                                          paddingTop: 3,
                                          paddingBottom: 3,
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
                                                padding: '5px 8px',
                                                borderRadius: 4,
                                                background: isConcSelected
                                                  ? 'rgba(222,224,84,0.18)'
                                                  : 'transparent',
                                                border: 'none',
                                                color: isConcSelected ? '#dee054' : 'rgba(239,239,239,0.75)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'background 0.15s, color 0.15s',
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
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '11px 20px',
                      borderRadius: 999, // estilo pílula
                      background: '#dee054',
                      color: '#081DF4',
                      fontWeight: 700,
                      fontSize: 13.5,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      boxShadow: 'none',
                      marginBottom: 7,
                      transition: 'filter 0.2s',
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.filter = 'brightness(1.06)')}
                    onMouseLeave={e => !loading && (e.currentTarget.style.filter = 'none')}
                  >
                    {loading ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      'Confirmar Konexão'
                    )}
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
                      borderRadius: 999, // estilo pílula
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

              {/* ── SUCCESS ── */}
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
                    paddingTop: 4,
                    paddingBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(222,224,84,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <CheckCircle2 size={22} color="#dee054" />
                  </div>
                  <p
                    style={{
                      color: '#efefef',
                      fontSize: 16.5,
                      fontWeight: 650,
                      letterSpacing: '-0.3px',
                      marginBottom: 6,
                    }}
                  >
                    Estás Konectado!
                  </p>
                  <p
                    style={{
                      color: 'rgba(239,239,239,0.50)',
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      marginBottom: 18,
                      maxWidth: 260,
                    }}
                  >
                    Foste registado na lista prioritária. Fica atento — serás um dos primeiros a receber acesso.
                  </p>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 999, // estilo pílula
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#efefef',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      boxShadow: 'none',
                    }}
                  >
                    Feito
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
  fontSize: 9.5,
  fontWeight: 500,
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'rgba(239,239,239,0.38)',
  marginBottom: 5,
  paddingLeft: 1,
}

const inputSt: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 12px',
  borderRadius: 7,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#efefef',
  fontSize: 13.5,
  outline: 'none',
  transition: 'border-color 0.18s',
  boxSizing: 'border-box',
}
