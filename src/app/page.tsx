'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedKonectaLogo from '@/components/AnimatedKonectaLogo'
import KonectaModal from '@/components/KonectaModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main
      className="relative flex items-center justify-center min-h-screen w-full overflow-hidden select-none"
      style={{ backgroundColor: '#081DF4' }}
    >
      {/* Subtle radial ambient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,60,255,0.45) 0%, rgba(8,29,244,1) 70%)',
          opacity: 0.5,
        }}
      />

      {/* Centre group: logo + gap + pill button */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ gap: '72px' }}
      >
        {/* Logo */}
        <div className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px]">
          <AnimatedKonectaLogo />
        </div>

        {/* Konect-se pill */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 30px',
            borderRadius: '999px',
            backgroundColor: 'rgba(239,239,239,0.10)',
            border: '0.5px solid rgba(255,255,255,0.22)',
            color: '#efefef',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:
              '0 8px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18)',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#dee054',
              boxShadow: '0 0 8px #dee054',
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
              flexShrink: 0,
            }}
          />
          <span>Konect-se</span>
        </motion.button>
      </div>

      {/* Modal */}
      <KonectaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
