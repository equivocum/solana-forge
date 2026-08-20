// SimulationControls Component - Start/Pause/Resume buttons, speed slider, slow-motion toggle
// // STAGE: simulation_controls

interface SimulationControlsProps {
  status: 'idle' | 'running' | 'paused' | 'error'
  speed: number
  slowMotion: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onSpeedChange: (speed: number) => void
  onSlowMotionToggle: () => void
  onStep?: () => void
}

export function SimulationControls({
  status,
  speed,
  slowMotion,
  onStart,
  onPause,
  onResume,
  onSpeedChange,
  onSlowMotionToggle,
  onStep
}: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
      {/* Play/Pause buttons */}
      <div className="flex gap-2">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-medium"
          >
            Start
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-medium"
          >
            Pause
          </button>
        )}
        {status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
            >
              Resume
            </button>
            {onStep && (
              <button
                onClick={onStep}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-medium"
              >
                Step
              </button>
            )}
          </>
        )}
      </div>

      {/* Speed slider */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-300">Speed:</label>
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-300 w-12">{speed}x</span>
      </div>

      {/* Slow motion toggle */}
      <button
        onClick={onSlowMotionToggle}
        className={`px-4 py-2 rounded font-medium ${
          slowMotion
            ? 'bg-purple-600 hover:bg-purple-500'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
      >
        {slowMotion ? 'Slow Motion ON' : 'Slow Motion OFF'}
      </button>

      {/* Status indicator */}
      <div className="ml-auto flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'running' ? 'bg-green-500 animate-pulse' :
          status === 'paused' ? 'bg-yellow-500' :
          status === 'error' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
        <span className="text-sm text-gray-300 capitalize">{status}</span>
      </div>
    </div>
  )
}
