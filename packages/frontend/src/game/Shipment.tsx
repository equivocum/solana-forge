// Shipment Component - Maps to Finalized Block
// // STAGE: shipment

import type { ShipmentRecord } from '@shared/types'

interface ShipmentProps {
  shipments: ShipmentRecord[]
}

export function Shipment({ shipments }: ShipmentProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
      <h3 className="text-lg font-semibold mb-4">
        <span className="text-green-400">Shipments</span>
        <span className="text-gray-400 text-sm ml-2">(Finalized Blocks)</span>
        <span className="ml-2 text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">FINALIZED</span>
      </h3>
      {shipments.length === 0 ? (
        <p className="text-gray-500">No shipments yet</p>
      ) : (
        <div className="space-y-2">
          {shipments.map(shipment => (
            <div key={shipment.id} className="p-2 bg-green-900/30 rounded">
              <div className="flex justify-between text-sm">
                <span>{shipment.id}</span>
                <span className="text-green-400">Quality: {shipment.quality}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* // STAGE: block_finalize - Shipment maps to finalized block */}
    </div>
  )
}
