'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedKonectaLogo from '@/components/AnimatedKonectaLogo'
import KonectaModal from '@/components/KonectaModal'
import { ArrowUpRight } from 'lucide-react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="riddle-grid-bg relative flex flex-col items-center justify-between min-h-screen w-full select-none px-4 py-8 overflow-x-hidden">
      
      {/* Barra Superior Minimalista Neo-Brutalista (Link Admin no canto) */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#FFD027] border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            KONECTA.CV
          </div>
        </div>

        <a
          href="/admin"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-black bg-white text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <span>Admin</span>
          <ArrowUpRight size={14} />
        </a>
      </header>

      {/* Centro: Logo com animação pura no centro (SEM card e SEM sombra na logo) + Botão Konecta-te */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center my-auto py-12 gap-10">
        
        {/* Logo limpo com animação pura vetorial */}
        <div className="w-[300px] sm:w-[460px] md:w-[560px] lg:w-[640px]">
          <AnimatedKonectaLogo />
        </div>

        {/* Botão de ação sugestivo Konecta-te estilo Neo-Brutalism */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96, y: 2 }}
          className="flex items-center justify-center gap-4 px-12 py-5 min-h-[58px] rounded-[14px] bg-[#A2E435] border-[3px] border-black text-black font-extrabold text-base uppercase tracking-wider shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
        >
          <span className="w-3 h-3 self-center rounded-full border-2 border-black bg-[#FFD027] animate-bounce flex-shrink-0" />
          <span className="leading-none">Konecta-te Agora →</span>
        </motion.button>
      </div>

      {/* Footer limpo */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] font-semibold gap-3 z-10 pt-4 border-t-2 border-black/10 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span>© 2026 Konecta Cabo Verde</span>
        </div>
        <div className="flex items-center gap-3">
          <span>10 Ilhas</span>
          <span>·</span>
          <span>Diáspora</span>
        </div>
      </footer>

      {/* Modal */}
      <KonectaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
