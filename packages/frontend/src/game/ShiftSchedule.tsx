// ShiftSchedule Component - Maps to Leader Schedule
// // STAGE: shift_schedule

interface ShiftScheduleProps {
  leaderSchedule: Record<string, number[]>
  currentLeader: string
  nextLeader: string
}

export function ShiftSchedule({ leaderSchedule, currentLeader, nextLeader }: ShiftScheduleProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Shift Schedule (Leader Schedule)</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Current Leader:</span>
          <span className="text-green-400 font-mono">{currentLeader}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Next Leader:</span>
          <span className="text-blue-400 font-mono">{nextLeader}</span>
        </div>
        <div className="mt-4">
          <h4 className="text-sm text-gray-400 mb-2">Leader Slots:</h4>
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(leaderSchedule).map(([validator, slots]) => (
              <div key={validator} className="text-xs">
                <span className="text-gray-500">{validator}:</span>
                <span className="ml-1 text-gray-300">{slots.length} slots</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* // REF: leader_schedule.rs - Shift maps to Leader Schedule */}
    </div>
  )
}
