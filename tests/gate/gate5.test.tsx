import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Gate5ForkResolution } from '../../src/gates/gate5-fork-resolution'

vi.mock('../../src/services/storage', () => ({
  createStorageService: () => ({
    getProgress: async () => ({ currentGate: 1, completedGates: [1], gateData: {} }),
    saveProgress: async () => {},
    getGameState: async () => ({}),
    saveGameState: async () => {},
  })
}))

describe('Gate 5: Fork Resolution', () => {
  it('renders gate title', () => {
    render(<Gate5ForkResolution onComplete={() => {}} />)
    expect(screen.getByText('Gate 5: Fork Resolution')).toBeDefined()
  })

  it('creates two competing forks', () => {
    render(<Gate5ForkResolution onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Create Forks'))
    expect(screen.getByText('fork-1')).toBeDefined()
    expect(screen.getByText('fork-2')).toBeDefined()
  })

  it('shows winning fork indicator', () => {
    render(<Gate5ForkResolution onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Create Forks'))
    expect(screen.getByText('✓ Winning')).toBeDefined()
  })

  it('resolve button disabled until forks exist', () => {
    render(<Gate5ForkResolution onComplete={() => {}} />)
    const resolveBtn = screen.getByText('Resolve Forks')
    expect(resolveBtn.closest('button')?.disabled).toBe(true)
  })

  it('resolves forks via voting', async () => {
    vi.useFakeTimers()
    render(<Gate5ForkResolution onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Create Forks'))

    await act(async () => {
      fireEvent.click(screen.getByText('Resolve Forks'))
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    expect(screen.getByText('Resolved')).toBeDefined()
    vi.useRealTimers()
  })

  it('heals partition to single chain', async () => {
    vi.useFakeTimers()
    render(<Gate5ForkResolution onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Create Forks'))

    await act(async () => {
      fireEvent.click(screen.getByText('Resolve Forks'))
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Heal Partition'))
      await Promise.resolve()
    })

    expect(screen.queryByText('fork-2')).toBeNull()
    vi.useRealTimers()
  })

  it('complete button appears after healing', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<Gate5ForkResolution onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Create Forks'))

    await act(async () => {
      fireEvent.click(screen.getByText('Resolve Forks'))
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Heal Partition'))
      await Promise.resolve()
    })

    expect(screen.getByText('Complete Gate 5')).toBeDefined()
    vi.useRealTimers()
  })
})
