// Gate 3 Test: Validator Process - Tests the actual Gate3 component
// // STAGE: gate3_test

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Gate3ValidatorProcess } from '../../src/gates/gate3-validator-process'

vi.mock('../../src/services/storage', () => ({
  createStorageService: () => ({
    getProgress: async () => ({ currentGate: 1, completedGates: [1], gateData: {} }),
    saveProgress: async () => {},
    getGameState: async () => ({}),
    saveGameState: async () => {},
  })
}))

describe('Gate 3: Validator Process', () => {
  it('renders gate title', () => {
    render(<Gate3ValidatorProcess onComplete={() => {}} />)
    expect(screen.getByText('Gate 3: Validator Process')).toBeDefined()
  })

  it('start button enables validator', () => {
    render(<Gate3ValidatorProcess onComplete={() => {}} />)
    const startBtn = screen.getByText('Start Validator')
    fireEvent.click(startBtn)
    expect(screen.getByText('Validator Running')).toBeDefined()
  })

  it('process button disabled until validator starts', () => {
    render(<Gate3ValidatorProcess onComplete={() => {}} />)
    const processBtn = screen.getByText('Process Transaction')
    expect(processBtn.closest('button')?.disabled).toBe(true)
  })

  it('produces block after processing transaction', () => {
    render(<Gate3ValidatorProcess onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Start Validator'))
    fireEvent.click(screen.getByText('Process Transaction'))
    expect(screen.getByText(/Produced Blocks/)).toBeDefined()
  })

  it('cast vote disabled until block exists', () => {
    render(<Gate3ValidatorProcess onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Start Validator'))
    const voteBtn = screen.getByText('Cast Vote')
    expect(voteBtn.closest('button')?.disabled).toBe(true)
  })

  it('complete button appears after vote', () => {
    const onComplete = vi.fn()
    render(<Gate3ValidatorProcess onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Start Validator'))
    fireEvent.click(screen.getByText('Process Transaction'))
    fireEvent.click(screen.getByText('Cast Vote'))
    expect(screen.getByText('Complete Gate 3')).toBeDefined()
  })
})
