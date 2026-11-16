'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedKonectaLogo from '@/components/AnimatedKonectaLogo'
import KonectaModal from '@/components/KonectaModal'
import { ArrowUpRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="riddle-grid-bg relative flex flex-col items-center justify-between min-h-screen w-full select-none px-4 py-8 overflow-x-hidden">
      
      {/* Top Banner / Ticker Pill (Riddle UI Style) */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-3">
          <div className="riddle-badge bg-[#FFD027]">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>KONECTA.CV</span>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Design System · Riddle Neo-Brutalism
          </span>
        </div>

        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black bg-white text-xs font-bold shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <span>Admin</span>
          <ArrowUpRight size={12} />
        </a>
      </header>

      {/* Hero Container (Riddle UI Feature Frame) */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto py-8">
        
        {/* Floating Accent Badges (Neo-Brutalism Stickers) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="riddle-badge bg-[#B286FD]"
          >
            <Sparkles size={13} />
            <span>Cabo Verde Tech</span>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="riddle-badge bg-[#A2E435]"
          >
            <Zap size={13} />
            <span>10 Ilhas Conectadas</span>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="riddle-badge bg-[#22D2ED]"
          >
            <ShieldCheck size={13} />
            <span>Acesso Antecipado</span>
          </motion.div>
        </div>

        {/* Outer Neo-Brutalist Frame around Logo */}
        <div 
          className="w-full max-w-3xl p-8 sm:p-14 bg-white border-[3px] border-black rounded-[24px] shadow-[8px_8px_0px_#000] flex flex-col items-center relative overflow-hidden"
        >
          {/* Decorative Corner Tabs (Riddle Style) */}
          <div className="absolute top-4 left-4 flex gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-black bg-[#E2442F]" />
            <span className="w-3 h-3 rounded-full border-2 border-black bg-[#FFD027]" />
            <span className="w-3 h-3 rounded-full border-2 border-black bg-[#11A365]" />
          </div>

          <div className="absolute top-4 right-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#78716C] border-2 border-black px-2 py-0.5 rounded-md bg-[#F5F5F4]">
            v1.0 Neo
          </div>

          {/* Logo container */}
          <div className="w-[280px] sm:w-[420px] md:w-[500px] mt-4 mb-6">
            <AnimatedKonectaLogo />
          </div>

          <p className="text-center text-sm sm:text-base font-medium text-[#78716C] max-w-lg mb-8 leading-relaxed">
            A plataforma digital que aproxima oportunidades, talentos e comunidades em todo o arquipélago.
          </p>

          {/* Neo-Brutalist Call-To-Action Button */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            className="flex items-center gap-3 px-8 py-4 rounded-[14px] bg-[#A2E435] border-[3px] border-black text-black font-extrabold text-base uppercase tracking-wider shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
          >
            <span className="w-3 h-3 rounded-full border-2 border-black bg-[#FFD027] animate-bounce" />
            <span>Konecta-te Agora →</span>
          </motion.button>
        </div>
      </div>

      {/* Footer minimal info (Riddle UI style) */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] font-semibold gap-3 z-10 pt-4 border-t-2 border-black/10">
        <div className="flex items-center gap-2">
          <span>© 2026 Konecta Cabo Verde</span>
          <span>·</span>
          <span className="px-2 py-0.5 bg-[#FFD027] text-black border border-black rounded text-[10px] font-bold">
            NEO-BRUTALISM
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Santiago</span>
          <span>·</span>
          <span>São Vicente</span>
          <span>·</span>
          <span>Sal & Diáspora</span>
        </div>
      </footer>

      {/* Modal */}
      <KonectaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  )
}
