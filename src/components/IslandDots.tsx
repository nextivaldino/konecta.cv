'use client'

import { useEffect, useState } from 'react'

// 10 Cape Verde islands with their names
const ISLANDS = [
  { name: 'Santo Antão', delay: 0, color: '#ff6f61' },
  { name: 'São Vicente', delay: 0.2, color: '#ffb347' },
  { name: 'Santa Luzia', delay: 0.4, color: '#ffdd57' },
  { name: 'São Nicolau', delay: 0.6, color: '#8fd14f' },
  { name: 'Sal', delay: 0.8, color: '#1e90ff' },
  { name: 'Boa Vista', delay: 1.0, color: '#6a5acd' },
  { name: 'Maio', delay: 1.2, color: '#a020f0' },
  { name: 'Santiago', delay: 1.4, color: '#ff1493' },
  { name: 'Fogo', delay: 1.6, color: '#ff4500' },
  { name: 'Brava', delay: 1.8, color: '#2e8b57' },
]

export default function IslandDots() {
  const [filled, setFilled] = useState<boolean[]>(new Array(10).fill(false))
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null)

  useEffect(() => {
    // Sequentially fill each dot
    const timers = ISLANDS.map((island, i) =>
      setTimeout(() => {
        setFilled(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, island.delay * 1000 + 800)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Island name tooltip */}
      <div
        className="text-xs tracking-widest uppercase transition-all duration-300"
        style={{
          color: '#dee054',
          opacity: hoveredIsland ? 1 : 0,
          minHeight: '16px',
        }}
      >
        {hoveredIsland || '‎'}
      </div>

      {/* Dots row */}
      <div className="flex items-center gap-3 md:gap-4">
        {ISLANDS.map((island, i) => (
          <div
            key={island.name}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredIsland(island.name)}
            onMouseLeave={() => setHoveredIsland(null)}
          >
            <div
              className="rounded-full transition-all duration-700"
              style={{
                width: 10,
                height: 10,
                backgroundColor: filled[i] ? '#dee054' : 'transparent',
                border: `1.5px solid ${filled[i] ? '#dee054' : '#efefef44'}`,
                transform: filled[i] ? 'scale(1)' : 'scale(0.6)',
                opacity: filled[i] ? 1 : 0.3,
                animation: filled[i]
                  ? `islandPulse ${2 + i * 0.3}s ease-in-out ${island.delay + 1.5}s infinite`
                  : 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
