import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Gate4BlockFinalize } from '../../src/gates/gate4-block-finalize'

vi.mock('../../src/services/storage', () => ({
  createStorageService: () => ({
    getProgress: async () => ({ currentGate: 1, completedGates: [1], gateData: {} }),
    saveProgress: async () => {},
    getGameState: async () => ({}),
    saveGameState: async () => {},
  })
}))

describe('Gate 4: Block Finalize', () => {
  it('renders gate title', () => {
    render(<Gate4BlockFinalize onComplete={() => {}} />)
    expect(screen.getByText('Gate 4: Block Finalize')).toBeDefined()
  })

  it('produces 5 blocks on button click', () => {
    render(<Gate4BlockFinalize onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Produce Blocks'))
    expect(screen.getAllByText(/Slot.*Commitment: processed/)).toHaveLength(5)
  })

  it('track button disabled until blocks exist', () => {
    render(<Gate4BlockFinalize onComplete={() => {}} />)
    const trackBtn = screen.getByText('Track Finalization')
    expect(trackBtn.closest('button')?.disabled).toBe(true)
  })

  it('tracks finalization progression', async () => {
    vi.useFakeTimers()
    render(<Gate4BlockFinalize onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Produce Blocks'))

    await act(async () => {
      fireEvent.click(screen.getByText('Track Finalization'))
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(500)
        await Promise.resolve()
      }
    })

    expect(screen.getAllByText(/confirmed/)).toHaveLength(5)

    await act(async () => {
      fireEvent.click(screen.getByText('Track Finalization'))
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(500)
        await Promise.resolve()
      }
    })

    expect(screen.getAllByText(/finalized/)).toHaveLength(5)
    vi.useRealTimers()
  }, 15000)

  it('complete button appears after finalization', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<Gate4BlockFinalize onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Produce Blocks'))

    await act(async () => {
      fireEvent.click(screen.getByText('Track Finalization'))
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(500)
        await Promise.resolve()
      }
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Track Finalization'))
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(500)
        await Promise.resolve()
      }
    })

    expect(screen.getByText('Complete Gate 4')).toBeDefined()
    vi.useRealTimers()
  }, 15000)
})
