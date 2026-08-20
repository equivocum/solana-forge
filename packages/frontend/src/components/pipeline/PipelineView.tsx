// PipelineView - Main orchestrator for the Solana transaction pipeline visualization
// Shows the complete lifecycle: Wallet -> RPC -> Turbine -> Sealevel -> PoH -> TBFT -> Block -> Finalize

import { useState, useCallback, useRef, useEffect } from 'react'
import { Pipeline } from './Pipeline'
import { StageDetail } from './StageDetail'
import { AnnotationFeed } from './AnnotationFeed'
import { SimulationControls } from '../SimulationControls'
import { GameBar } from './GameBar'
import { useAnnotations } from '../../hooks/useAnnotations'
import { useProgress } from '../../hooks/useProgress'
import type { AnnotationType } from '@shared/types'

// // STAGE: pipeline_stages
export type PipelineStageId =
  | 'wallet'
  | 'rpc'
  | 'turbine'
  | 'sealevel'
  | 'poh'
  | 'tbft'
  | 'block'
  | 'finalize'

export interface PipelineStageInfo {
  id: PipelineStageId
  label: string
  solanaComponent: string
  metaphor: string
  icon: string
  description: string
  detail: string
}

// // STAGE: pipeline_stage_definitions
export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 'wallet',
    label: 'Wallet',
    solanaComponent: 'Client',
    metaphor: 'Raw Material',
    icon: '🔑',
    description: 'Create and sign transaction',
    detail: 'The user creates a transaction specifying the recipient, amount, and fee payer. The transaction is signed using Ed25519 cryptography — the private key never leaves the wallet. The signature proves ownership without revealing the key.'
  },
  {
    id: 'rpc',
    label: 'RPC Node',
    solanaComponent: 'RPC Validator',
    metaphor: 'Receiving Dock',
    icon: '📡',
    description: 'Validate, simulate, forward',
    detail: 'The RPC node receives the signed transaction, validates its format, checks the recent blockhash, simulates execution to estimate compute units, and forwards it to the current leader validator. Preflight checks catch errors before consensus.'
  },
  {
    id: 'turbine',
    label: 'Turbine',
    solanaComponent: 'Turbine Protocol',
    metaphor: 'Conveyor Belt',
    icon: '🌪️',
    description: 'Break into shreds, propagate',
    detail: 'Transactions are broken into 64KB shreds and distributed via erasure coding across the validator network. Turbine uses a tree-based propagation structure (similar to BitTorrent) to efficiently distribute data without overwhelming any single node.'
  },
  {
    id: 'sealevel',
    label: 'Sealevel',
    solanaComponent: 'Sealevel Runtime',
    metaphor: 'Assembly Line',
    icon: '⚡',
    description: 'Parallel execution',
    detail: 'Sealevel executes transactions in parallel by analyzing which accounts each transaction reads/writes. Non-overlapping account access allows simultaneous execution across multiple cores. This is what gives Solana its 65,000+ TPS throughput.'
  },
  {
    id: 'poh',
    label: 'PoH',
    solanaComponent: 'Proof of History',
    metaphor: 'Clock/Timestamp',
    icon: '⏱️',
    description: 'SHA-256 hash chain, ordering',
    detail: 'Proof of History is a verifiable delay function (VDF) using SHA-256. Each hash incorporates the previous hash, creating an unbreakable chronological chain. This proves that transactions happened in a specific order without requiring validators to communicate timestamps.'
  },
  {
    id: 'tbft',
    label: 'TBFT',
    solanaComponent: 'Tower BFT',
    metaphor: 'QC Station',
    icon: '🗼',
    description: 'Vote tower, consensus',
    detail: 'Tower BFT is Solana\'s consensus mechanism based on Proof of Stake. Validators vote on blocks using a "vote tower" with lockout periods (doubling from 2 to 32 slots). A block is confirmed when 2/3+ of stake has voted for it. Slashing conditions prevent double-voting.'
  },
  {
    id: 'block',
    label: 'Block Prod',
    solanaComponent: 'Block Production',
    metaphor: 'Packaging',
    icon: '📦',
    description: 'Assemble block, leader produces',
    detail: 'The leader validator assembles confirmed transactions into a block, creating a Merkle tree of transaction signatures. The block header includes the parent hash, PoH hash, and metadata. The block is broadcast to all validators for verification.'
  },
  {
    id: 'finalize',
    label: 'Finalize',
    solanaComponent: 'Commitment Levels',
    metaphor: 'Shipment',
    icon: '✅',
    description: 'Processed → Confirmed → Finalized',
    detail: 'Finalization progresses through three commitment levels: Processed (tx executed by this node), Confirmed (1/3+ stake voted), Finalized (2/3+ stake voted, ~31 slots / ~62 seconds). Once finalized, the transaction is irreversible and can be trusted as permanent.'
  }
]

// // STAGE: pipeline_view
interface PipelineViewProps {
  onStageSelect?: (stageId: PipelineStageId) => void
}

export function PipelineView({ onStageSelect }: PipelineViewProps) {
  const [activeStage, setActiveStage] = useState<PipelineStageId>('wallet')
  const [completedStages, setCompletedStages] = useState<PipelineStageId[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [slowMotion, setSlowMotion] = useState(false)
  const [txPosition, setTxPosition] = useState(0) // 0-7 index into stages

  const { annotations, addAnnotation } = useAnnotations()
  const { } = useProgress()
  const intervalRef = useRef<number | null>(null)

  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === activeStage)

  // // STAGE: pipeline_annotation_emitter
  const emitAnnotation = useCallback(
    (type: AnnotationType, content: string, sourceRef: string) => {
      addAnnotation(type, content, sourceRef, currentStageIndex + 1)
    },
    [addAnnotation, currentStageIndex]
  )

  // // STAGE: pipeline_stage_annotations
  // Annotations for each stage transition
  const stageAnnotations: Record<PipelineStageId, Array<{ type: AnnotationType; content: string; ref: string }>> = {
    wallet: [
      { type: 'STAGE', content: 'User creates transaction with recipient, amount, and fee payer', ref: 'services/transaction.ts' },
      { type: 'HOW', content: 'Ed25519 signing: private key signs message bytes, produces 64-byte signature', ref: 'services/crypto.ts' },
      { type: 'BYTES', content: 'Public key: 32 bytes, Signature: 64 bytes, Transaction: ~200 bytes', ref: 'services/crypto.ts' },
    ],
    rpc: [
      { type: 'STAGE', content: 'RPC node receives transaction, validates format and blockhash', ref: 'services/rpc.ts' },
      { type: 'DECISION', content: 'Preflight simulation checks if tx will succeed before forwarding', ref: 'services/rpc.ts' },
      { type: 'WHY', content: 'Recent blockhash expires after ~60s, preventing replay attacks', ref: 'services/rpc.ts' },
    ],
    turbine: [
      { type: 'STAGE', content: 'Transaction broken into 64KB shreds with erasure coding', ref: 'turbine/shred_distribution.rs' },
      { type: 'HOW', content: 'Tree-based propagation: leader sends to root nodes, which fan out to children', ref: 'turbine/cluster_info.rs' },
      { type: 'BYTES', content: 'Each shred: 64KB data + 32 bytes coding shred for recovery', ref: 'turbine/shred.rs' },
    ],
    sealevel: [
      { type: 'STAGE', content: 'Sealevel analyzes account locks for parallel execution', ref: 'sealevel/program_runtime.rs' },
      { type: 'DECISION', content: 'Transactions with non-overlapping accounts execute in parallel across cores', ref: 'sealevel/runtime.rs' },
      { type: 'HOW', content: 'Compute budget: 200K units per instruction, max 1.4M per transaction', ref: 'sealevel/compute_budget.rs' },
    ],
    poh: [
      { type: 'STAGE', content: 'PoH generator produces SHA-256 hash chain at ~400ms per tick', ref: 'poh/poh_recorder.rs' },
      { type: 'WHY', content: 'Hash chain proves chronological order without validator communication', ref: 'poh/poh_service.rs' },
      { type: 'BYTES', content: 'Each tick: SHA-256(previous_hash + recent_hash) = 32 bytes', ref: 'poh/hash.rs' },
    ],
    tbft: [
      { type: 'STAGE', content: 'Validators vote on blocks using Tower BFT with lockout periods', ref: 'consensus/vote.rs' },
      { type: 'DECISION', content: 'Lockout doubles: 2→4→8→16→32 slots. Vote for fork requires unlocking earlier votes', ref: 'consensus/lockout.rs' },
      { type: 'WHY', content: '2/3 supermajority needed for confirmation. Slashing prevents double-voting', ref: 'consensus/fork_choice.rs' },
    ],
    block: [
      { type: 'STAGE', content: 'Leader assembles confirmed transactions into block with Merkle tree', ref: 'blockstore/blockstore.rs' },
      { type: 'HOW', content: 'Merkle root of transaction signatures enables efficient batch verification', ref: 'blockstore/merkle.rs' },
      { type: 'BYTES', content: 'Block header: 80 bytes (parent_hash, PoH_hash, metadata)', ref: 'blockstore/header.rs' },
    ],
    finalize: [
      { type: 'STAGE', content: 'Transaction progresses through three commitment levels', ref: 'rpc/commitment.rs' },
      { type: 'DECISION', content: 'Processed(0) → Confirmed(1/3 stake) → Finalized(2/3 stake, ~62s)', ref: 'rpc/commitment.rs' },
      { type: 'WHY', content: 'Finalized blocks are irreversible. 2/3 supermajority makes reversal economically infeasible', ref: 'consensus/finality.rs' },
    ],
  }

  // // STAGE: pipeline_simulation
  // Advance to next stage
  const advanceStage = useCallback(() => {
    setTxPosition(prev => {
      const next = prev + 1
      if (next >= PIPELINE_STAGES.length) {
        // Pipeline complete
        setIsRunning(false)
        return prev
      }

      const nextStage = PIPELINE_STAGES[next]
      setActiveStage(nextStage.id)
      setCompletedStages(p => [...p, PIPELINE_STAGES[prev].id])

      // Emit annotations for the new stage
      const stageAnns = stageAnnotations[nextStage.id]
      if (stageAnns) {
        stageAnns.forEach((ann, i) => {
          setTimeout(() => {
            emitAnnotation(ann.type, ann.content, ann.ref)
          }, i * 300) // Stagger annotations
        })
      }

      return next
    })
  }, [emitAnnotation, stageAnnotations])

  // // STAGE: pipeline_timer
  // Auto-advance when running
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const baseInterval = 2000 // 2 seconds per stage
    const interval = slowMotion ? baseInterval * 4 : baseInterval / speed

    intervalRef.current = window.setInterval(() => {
      advanceStage()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, speed, slowMotion, advanceStage])

  const handleStart = useCallback(() => {
    // Reset to beginning
    setTxPosition(0)
    setActiveStage('wallet')
    setCompletedStages([])
    setIsRunning(true)
    emitAnnotation('STAGE', 'Transaction lifecycle begins — creating and signing transaction', 'pipeline.tsx')
  }, [emitAnnotation])

  const handlePause = useCallback(() => setIsRunning(false), [])
  const handleResume = useCallback(() => setIsRunning(true), [])

  const handleStep = useCallback(() => {
    advanceStage()
  }, [advanceStage])

  const handleStageClick = useCallback((stageId: PipelineStageId) => {
    setActiveStage(stageId)
    onStageSelect?.(stageId)
  }, [onStageSelect])

  const activeStageInfo = PIPELINE_STAGES.find(s => s.id === activeStage)!

  return (
    <div className="flex flex-col h-full">
      {/* // STAGE: pipeline_header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Solana Transaction Pipeline</h2>
        <p className="text-sm text-gray-400">
          Watch a transaction flow through every stage of the Solana blockchain
        </p>
      </div>

      {/* // STAGE: pipeline_visualization */}
      {/* Pipeline with transaction bubble */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <Pipeline
          stages={PIPELINE_STAGES}
          activeStage={activeStage}
          completedStages={completedStages}
          txPosition={txPosition}
          onStageClick={handleStageClick}
        />
      </div>

      {/* // STAGE: game_metaphor_bar */}
      {/* Manufacturing metaphor visualization */}
      <div className="mb-4">
        <GameBar activeStage={activeStage} isRunning={isRunning} />
      </div>

      {/* // STAGE: pipeline_controls */}
      {/* Simulation controls */}
      <div className="mb-4">
        <SimulationControls
          status={isRunning ? 'running' : 'idle'}
          speed={speed}
          slowMotion={slowMotion}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onSpeedChange={setSpeed}
          onSlowMotionToggle={() => setSlowMotion(p => !p)}
          onStep={handleStep}
        />
      </div>

      {/* // STAGE: pipeline_detail_annotation */}
      {/* Detail panel + Annotation feed */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
          <StageDetail stage={activeStageInfo} />
        </div>
        <div className="bg-gray-800 rounded-lg p-4 overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Live Annotations</h3>
          <div className="flex-1 overflow-auto">
            <AnnotationFeed annotations={annotations} />
          </div>
        </div>
      </div>
    </div>
  )
}
