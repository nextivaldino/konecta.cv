'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2 } from 'lucide-react'

const ILHAS_CV = [
  'Santo Antão','São Vicente','Santa Luzia','São Nicolau',
  'Sal','Boa Vista','Maio','Santiago','Fogo','Brava','Diáspora',
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
  const [island, setIsland] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTimeout(() => { setStep('prompt'); setError('') }, 350)
  }
  const handleClose = () => { onClose(); reset() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Indica o teu nome completo.')
    if (!phone.trim()) return setError('Indica o teu número de telefone.')
    if (!island) return setError('Seleciona a tua ilha.')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), island }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar.')
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Algo correu mal.')
    } finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">

          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,4,30,0.72)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            layout
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 380,
              borderRadius: 28,
              background: 'rgba(10, 14, 38, 0.98)',
              border: '0.5px solid rgba(255,255,255,0.09)',
              boxShadow: '0 2px 0 0.5px rgba(255,255,255,0.05) inset, 0 28px 56px rgba(0,0,0,0.65)',
              padding: '24px 24px 20px',
              overflow: 'hidden',
            }}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          >
            {/* Top row: K logo + close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              {/* K logo — inline SVG */}
              <svg width="22" height="32" viewBox="0 0 436.752 665.228" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="144.634" height="665.228" fill="#dee054"/>
                <path d="M336.26 55.242 L436.752 159.265 C383.275 210.927 349.215 283.729 349.215 365.506 C349.215 443.677 380.335 513.61 429.725 564.722 L325.716 665.228 C250.266 587.148 204.58 481.179 204.58 365.506 C204.58 244.504 254.572 134.158 336.26 55.242 Z" fill="#dee054"/>
              </svg>

              <button
                onClick={handleClose}
                aria-label="Fechar"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.10)',
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13} color="rgba(239,239,239,0.50)" />
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">

              {/* ── PROMPT ── */}
              {step === 'prompt' && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p style={{ color: '#efefef', fontSize: 20, fontWeight: 650, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 10 }}>
                    Konectar-se?
                  </p>
                  <p style={{ color: 'rgba(239,239,239,0.50)', fontSize: 13, lineHeight: 1.65, marginBottom: 24 }}>
                    Queres Konectar-se para poderes receber algumas novidades em breve e participar em algo especial?
                  </p>

                  <button
                    onClick={() => setStep('form')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 999,
                      background: '#dee054',
                      color: '#081DF4',
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: 10,
                      boxShadow: '0 4px 20px rgba(222,224,84,0.22)',
                    }}
                  >
                    Sim, quero participar →
                  </button>

                  <button
                    onClick={handleClose}
                    style={{
                      display: 'block', width: '100%',
                      padding: '10px 24px', borderRadius: 999,
                      background: 'transparent', border: 'none',
                      color: 'rgba(239,239,239,0.32)', fontSize: 13,
                      cursor: 'pointer',
                    }}
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p style={{ color: '#efefef', fontSize: 17, fontWeight: 650, letterSpacing: '-0.3px', marginBottom: 18 }}>
                    Os teus dados
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                    {/* Nome */}
                    <div>
                      <label style={labelSt}>Nome completo</label>
                      <input
                        type="text" required
                        placeholder="O teu nome"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inputSt}
                        onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.32)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.11)' }}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label style={labelSt}>Número de telefone</label>
                      <input
                        type="tel" required
                        placeholder="+238 9XX XX XX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={inputSt}
                        onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.32)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.11)' }}
                      />
                    </div>

                    {/* Ilha */}
                    <div>
                      <label style={labelSt}>De qual ilha estás a conectar?</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          required
                          value={island}
                          onChange={e => setIsland(e.target.value)}
                          className="custom-select"
                          style={{ ...inputSt, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', cursor: 'pointer', paddingRight: 36 }}
                          onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.32)' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.11)' }}
                        >
                          <option value="" disabled style={{ background: '#0a0e26' }}>Seleciona a tua ilha</option>
                          {ILHAS_CV.map(i => (
                            <option key={i} value={i} style={{ background: '#0a0e26', color: '#efefef' }}>{i}</option>
                          ))}
                        </select>
                        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(239,239,239,0.40)', fontSize: 10, pointerEvents: 'none' }}>▼</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: '#ff6b7a', fontSize: 12, marginBottom: 12, paddingLeft: 2 }}>{error}</p>
                  )}

                  <button
                    type="submit" disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '13px 24px',
                      borderRadius: 999,
                      background: '#dee054', color: '#081DF4',
                      fontWeight: 700, fontSize: 14,
                      border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      boxShadow: '0 4px 20px rgba(222,224,84,0.22)',
                      marginBottom: 8,
                    }}
                  >
                    {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirmar Konexão'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('prompt')}
                    style={{
                      display: 'block', width: '100%',
                      padding: '10px 24px', borderRadius: 999,
                      background: 'transparent', border: 'none',
                      color: 'rgba(239,239,239,0.30)', fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    ← Voltar
                  </button>
                </motion.form>
              )}

              {/* ── SUCCESS ── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 4, paddingBottom: 8 }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(222,224,84,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <CheckCircle2 size={26} color="#dee054" />
                  </div>
                  <p style={{ color: '#efefef', fontSize: 17, fontWeight: 650, letterSpacing: '-0.3px', marginBottom: 8 }}>
                    Estás Konectado!
                  </p>
                  <p style={{ color: 'rgba(239,239,239,0.48)', fontSize: 13, lineHeight: 1.65, marginBottom: 22, maxWidth: 260 }}>
                    Foste registado na lista prioritária. Fica atento — serás um dos primeiros a receber acesso.
                  </p>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '12px 32px', borderRadius: 999,
                      background: 'rgba(255,255,255,0.07)',
                      border: '0.5px solid rgba(255,255,255,0.12)',
                      color: '#efefef', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Feito
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Footer */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(239,239,239,0.16)', userSelect: 'none' }}>
                www.konecta.cv
              </span>
            </div>
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
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'rgba(239,239,239,0.35)',
  marginBottom: 6,
  paddingLeft: 2,
}

const inputSt: React.CSSProperties = {
  width: '100%',
  height: 46,
  padding: '0 14px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.055)',
  border: '0.5px solid rgba(255,255,255,0.11)',
  color: '#efefef',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.18s',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
  boxSizing: 'border-box',
}
