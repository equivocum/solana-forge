// Main App Component - Solana Validator Architecture Explorer
// // STAGE: app_entry

import { useState, useCallback } from 'react'
import { ArchitectureView } from './components/architecture'
import { useAnnotations } from './hooks/useAnnotations'

type ViewMode = 'pipeline' | 'layered'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline')
  const [isSimulating, setIsSimulating] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [simSpeed, setSimSpeed] = useState(1)
  const [slowMotion, setSlowMotion] = useState(false)
  const [simStep, setSimStep] = useState(0)

  const { addAnnotation } = useAnnotations()

  const handleSimStart = useCallback(() => {
    setIsSimulating(true)
    setTourActive(true)
    setSimStep(0)
    addAnnotation('STAGE', 'Guided Tour started — watching transaction flow through Solana validator', 'simulation', 1)
  }, [addAnnotation])

  const handleSimPause = useCallback(() => {
    setIsSimulating(false)
  }, [])

  const handleSimResume = useCallback(() => {
    setIsSimulating(true)
  }, [])

  const handleSimReset = useCallback(() => {
    setIsSimulating(false)
    setTourActive(false)
    setSimStep(0)
  }, [])

  const handleSimStepChange = useCallback((step: number) => {
    setSimStep(step)
  }, [])

  const handleSimNext = useCallback(() => {
    setSimStep(s => Math.min(s + 1, 17))
  }, [])

  const handleSimBack = useCallback(() => {
    setSimStep(s => Math.max(s - 1, 0))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* // STAGE: app_header */}
      <header className="px-6 py-3 border-b border-gray-700 bg-gray-800/50 backdrop-blur flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-green-400">Solana</span> Validator Architecture
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'pipeline' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Pipeline Flow
              </button>
              <button
                onClick={() => setViewMode('layered')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'layered' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Layered
              </button>
            </div>

            {/* Simulation controls */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              {!tourActive ? (
                <button
                  onClick={handleSimStart}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md text-xs font-medium text-white"
                >
                  ▶ Guided Tour
                </button>
              ) : (
                <>
                  {!isSimulating ? (
                    <button
                      onClick={handleSimResume}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md text-xs font-medium text-white"
                    >
                      ▶ Resume
                    </button>
                  ) : (
                    <button
                      onClick={handleSimPause}
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-md text-xs font-medium text-white"
                    >
                      ⏸ Pause
                    </button>
                  )}
                  <button
                    onClick={handleSimReset}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-md text-xs font-medium text-white"
                  >
                    ↺ Reset
                  </button>
                </>
              )}

              {/* Speed control */}
              <div className="flex items-center gap-1 px-2">
                <span className="text-[10px] text-gray-400">Speed:</span>
                {[0.5, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      simSpeed === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Slow motion toggle */}
              <button
                onClick={() => setSlowMotion(p => !p)}
                className={`px-2 py-1 rounded text-[10px] ${
                  slowMotion ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🐢 Slow
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* // STAGE: app_main */}
      <main className="p-4 flex-1 flex flex-col min-h-0">
        <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0">
          <ArchitectureView
            viewMode={viewMode}
            isSimulating={isSimulating}
            tourActive={tourActive}
            simSpeed={simSpeed}
            slowMotion={slowMotion}
            simStep={simStep}
            onSimStepChange={handleSimStepChange}
            onPause={handleSimPause}
            onNext={handleSimNext}
            onBack={handleSimBack}
            onResume={handleSimResume}
          />
        </div>
      </main>
    </div>
  )
}

export default App
