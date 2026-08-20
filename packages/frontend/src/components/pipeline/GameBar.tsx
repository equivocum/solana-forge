// GameBar - Manufacturing metaphor visualization
// Shows Factory(Validator), Conveyor(PoH), QC Station(Vote), Shipment(Block) as the pipeline runs

import { useState, useEffect, useRef } from 'react'

// // STAGE: game_bar
interface GameBarProps {
  activeStage: string
  isRunning: boolean
}

interface ConveyorItem {
  id: string
  position: number
}

export function GameBar({ activeStage, isRunning }: GameBarProps) {
  const [conveyorItems, setConveyorItems] = useState<ConveyorItem[]>([])
  const [tickCount, setTickCount] = useState(0)
  const [hashChain, setHashChain] = useState<string[]>([])
  const [factoryEfficiency, setFactoryEfficiency] = useState(0)
  const [inspectedCount, setInspectedCount] = useState(0)
  const [shipments, setShipments] = useState(0)
  const animRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)

  // // STAGE: game_poh_animation
  // PoH tick animation (conveyor)
  useEffect(() => {
    if (!isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= 400) {
        lastTickRef.current = timestamp
        setTickCount(p => p + 1)

        const hash = `0x${Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`
        setHashChain(prev => [...prev.slice(-7), hash])

        // Move conveyor items
        setConveyorItems(prev =>
          prev
            .map(item => ({ ...item, position: item.position + 1 }))
            .filter(item => item.position < 8)
        )
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [isRunning])

  // // STAGE: game_stage_effects
  // React to stage changes
  useEffect(() => {
    if (activeStage === 'wallet' || activeStage === 'rpc') {
      setConveyorItems(prev => [...prev, { id: `tx-${Date.now()}`, position: 0 }])
      setFactoryEfficiency(p => Math.min(p + 10, 100))
    }
    if (activeStage === 'tbft') {
      setInspectedCount(p => p + 1)
    }
    if (activeStage === 'finalize') {
      setShipments(p => p + 1)
    }
  }, [activeStage])

  // // STAGE: game_bar_render
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-6">
        {/* Factory (Validator) */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🏭</span>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Factory</p>
            <p className="text-xs text-yellow-400 font-mono">{factoryEfficiency}%</p>
          </div>
        </div>

        {/* Separator */}
        <div className="text-gray-600">→</div>

        {/* Conveyor (PoH) */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚙️</span>
            <p className="text-[10px] text-gray-500 uppercase">Conveyor (PoH)</p>
            {isRunning && (
              <span className="text-[8px] bg-blue-600 px-1.5 py-0.5 rounded text-white">TICK {tickCount}</span>
            )}
          </div>
          {/* Conveyor belt visualization */}
          <div className="flex items-center gap-0.5 h-6 bg-gray-900 rounded px-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => {
              const item = conveyorItems.find(item => item.position === i)
              return (
                <div
                  key={i}
                  className={`w-5 h-4 rounded-sm text-[8px] flex items-center justify-center transition-all duration-200 ${
                    item ? 'bg-blue-500 text-white' : 'bg-gray-800'
                  }`}
                >
                  {item ? '📦' : ''}
                </div>
              )
            })}
          </div>
          {/* Hash chain */}
          <div className="flex gap-0.5 mt-1">
            {hashChain.slice(-6).map((hash, i) => (
              <span key={i} className="text-[8px] font-mono text-blue-400/60">
                {hash.slice(2, 6)}
              </span>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="text-gray-600">→</div>

        {/* QC Station (Vote Tower) */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">QC Station</p>
            <p className="text-xs text-purple-400 font-mono">{inspectedCount} votes</p>
          </div>
        </div>

        {/* Separator */}
        <div className="text-gray-600">→</div>

        {/* Shipment (Finalized Block) */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🚚</span>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Shipment</p>
            <p className="text-xs text-green-400 font-mono">{shipments} blocks</p>
          </div>
        </div>
      </div>
    </div>
  )
}
