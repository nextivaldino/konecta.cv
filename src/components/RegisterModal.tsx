'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const ISLANDS = [
  'Santo Antão', 'São Vicente', 'Santa Luzia', 'São Nicolau',
  'Sal', 'Boa Vista', 'Maio', 'Santiago', 'Fogo', 'Brava',
]

const GENDER_OPTIONS = [
  { value: 'homem', label: 'Homem' },
  { value: 'mulher', label: 'Mulher' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
]

type Step = 'intro' | 'form' | 'success'

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('intro')
  const [name, setName] = useState('')
  const [island, setIsland] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Por favor, insere o teu nome.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), island, gender }),
      })
      if (!res.ok) throw new Error('Erro ao registar')
      setStep('success')
    } catch {
      setError('Algo correu mal. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(8, 29, 244, 0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{
          backgroundColor: '#efefef',
          border: '1px solid rgba(222, 224, 84, 0.3)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* INTRO STEP */}
        {step === 'intro' && (
          <div className="flex flex-col gap-6 text-center">
            <div
              className="text-3xl font-bold"
              style={{ color: '#081df4' }}
            >
              ✦
            </div>
            <div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: '#081df4' }}
              >
                Estás prestes a fazer parte de algo especial.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
                O Konecta está a nascer. Um espaço feito para Cabo Verde —
                para as nossas ilhas, as nossas histórias e a nossa gente.
                Junta-te aos primeiros.
              </p>
            </div>
            <button
              onClick={() => setStep('form')}
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{ backgroundColor: '#081df4', color: '#dee054' }}
            >
              Quero participar
            </button>
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Talvez mais tarde
            </button>
          </div>
        )}

        {/* FORM STEP */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold" style={{ color: '#081df4' }}>
                Conta-nos um pouco sobre ti
              </h2>
              <p className="text-xs text-gray-400 mt-1">Tudo é opcional, menos o teu nome.</p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#081df4' }}>
                Nome *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="O teu nome"
                maxLength={80}
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  borderColor: '#081df4',
                  color: '#081df4',
                  backgroundColor: 'transparent',
                }}
              />
            </div>

            {/* Island */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#081df4' }}>
                Ilha
              </label>
              <select
                value={island}
                onChange={e => setIsland(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none appearance-none"
                style={{ borderColor: '#081df4', color: island ? '#081df4' : '#888', backgroundColor: '#efefef' }}
              >
                <option value="">Selecciona a tua ilha</option>
                {ISLANDS.map(isl => (
                  <option key={isl} value={isl} style={{ color: '#081df4' }}>{isl}</option>
                ))}
                <option value="diaspora" style={{ color: '#081df4' }}>Diáspora</option>
              </select>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#081df4' }}>
                Género
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GENDER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(gender === opt.value ? '' : opt.value)}
                    className="py-2 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: gender === opt.value ? '#081df4' : 'transparent',
                      color: gender === opt.value ? '#dee054' : '#081df4',
                      border: `1px solid #081df4`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#081df4', color: '#dee054' }}
            >
              {loading ? 'A registar…' : 'Entrar na lista'}
            </button>
          </form>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="flex flex-col gap-6 text-center">
            <div className="text-4xl">🌊</div>
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#081df4' }}>
                Bem-vindo(a) ao Konecta!
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
                Estás na lista. Quando o Konecta lançar, serás um dos primeiros a saber.
                Algo incrível está a chegar das ilhas.
              </p>
            </div>
            <div
              className="text-xs tracking-widest uppercase font-light"
              style={{ color: '#081df4' }}
            >
              • • •
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase"
              style={{ backgroundColor: '#081df4', color: '#dee054' }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
