// QualityMetrics Component - Maps to Vote Tower/Lockout
// // STAGE: quality_metrics

interface QualityMetricsProps {
  voteTower: number[]
  lockout: number
  lastVoteSlot: number
}

export function QualityMetrics({ voteTower, lockout, lastVoteSlot }: QualityMetricsProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Quality Metrics (Vote Tower)</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Tower Depth:</span>
          <span>{voteTower.length}/32</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Lockout:</span>
          <span className="text-yellow-400">{lockout} slots</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Last Vote Slot:</span>
          <span>{lastVoteSlot}</span>
        </div>
        <div className="mt-4">
          <h4 className="text-sm text-gray-400 mb-2">Vote Tower Visualization:</h4>
          <div className="flex gap-1">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded ${
                  i < voteTower.length
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
                title={i < voteTower.length ? `Slot ${voteTower[i]}` : 'Empty'}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {voteTower.length}/32 votes committed
          </p>
        </div>
      </div>
      {/* // REF: vote_tower.rs - Quality Metrics maps to Vote Tower/Lockout */}
    </div>
  )
}
