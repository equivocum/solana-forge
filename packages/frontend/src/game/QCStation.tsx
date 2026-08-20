// QCStation Component - Maps to Voting
// // STAGE: qc_station

import type { QCStationState } from '@shared/types'

interface QCStationProps {
  state: QCStationState
}

export function QCStation({ state }: QCStationProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
      <h3 className="text-lg font-semibold mb-4">
        <span className="text-purple-400">QC Station</span>
        <span className="text-gray-400 text-sm ml-2">(Vote Tower)</span>
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Inspected:</span>
          <span>{state.inspectedCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Passed:</span>
          <span className="text-green-400">{state.passCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Failed:</span>
          <span className="text-red-400">{state.failCount}</span>
        </div>
      </div>
      {/* // DECISION: vote tower lockout=32 - QC Station tracks vote verification */}
    </div>
  )
}
