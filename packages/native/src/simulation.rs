// Simulation Core Logic
// // STAGE: simulation_core

use napi_derive::napi;
use sha2::{Sha256, Digest};
use crate::types::*;

/// Simulation engine state
#[napi]
pub struct SimulationEngine {
    slot: u64,
    tick_rate: u64,
    speed_multiplier: f64,
    slow_motion: bool,
    transactions_processed: u64,
    blocks_produced: u64,
}

#[napi]
impl SimulationEngine {
    #[napi(constructor)]
    pub fn new(tick_rate: Option<u64>, speed_multiplier: Option<f64>) -> Self {
        SimulationEngine {
            slot: 0,
            tick_rate: tick_rate.unwrap_or(400),
            speed_multiplier: speed_multiplier.unwrap_or(1.0),
            slow_motion: false,
            transactions_processed: 0,
            blocks_produced: 0,
        }
    }

    /// Process a transaction and return result
    #[napi]
    pub fn process_transaction(&mut self, tx_bytes: Vec<u8>) -> ProcessResult {
        // Simulate transaction processing
        // In real implementation, this would use solana-runtime
        self.transactions_processed += 1;
        
        let mut hasher = Sha256::new();
        hasher.update(&tx_bytes);
        let hash = format!("{:x}", hasher.finalize());
        let signature = hash[..64].to_string();
        
        ProcessResult {
            success: true,
            signature: Some(signature),
            error: None,
            units_consumed: 150,
        }
    }

    /// Produce a block for the given slot
    #[napi]
    pub fn produce_block(&mut self, slot: u64) -> Option<Block> {
        // Simulate block production
        // In real implementation, this would use solana-ledger
        self.blocks_produced += 1;
        
        let mut hasher = Sha256::new();
        hasher.update(slot.to_le_bytes());
        let blockhash = format!("{:x}", hasher.finalize());
        
        Some(Block {
            slot,
            parent_slot: slot.saturating_sub(1),
            blockhash,
            transactions: vec![],
            signatures: vec![],
            commitment: "processed".to_string(),
            leader_id: "validator-1".to_string(),
        })
    }

    /// Get current PoH tick
    #[napi]
    pub fn get_poh_tick(&self) -> PohTick {
        let mut hasher = Sha256::new();
        hasher.update(self.slot.to_le_bytes());
        let hash = format!("{:x}", hasher.finalize());
        
        let mut hash_chain = Vec::new();
        for i in 0..5 {
            let mut h = Sha256::new();
            h.update((self.slot.saturating_sub(i)).to_le_bytes());
            hash_chain.push(format!("{:x}", h.finalize()));
        }
        
        PohTick {
            slot: self.slot,
            hash,
            tick_height: self.slot * 64,
            ticks_per_slot: 64,
            hash_chain,
        }
    }

    /// Get validator state
    #[napi]
    pub fn get_validator_state(&self) -> ValidatorState {
        ValidatorState {
            id: "validator-1".to_string(),
            slot: self.slot,
            transactions_processed: self.transactions_processed,
            blocks_produced: self.blocks_produced,
            votes_cast: 0,
        }
    }

    /// Advance to next slot (tick)
    #[napi]
    pub fn tick(&mut self) -> u64 {
        self.slot += 1;
        self.slot
    }

    /// Get current slot
    #[napi]
    pub fn get_slot(&self) -> u64 {
        self.slot
    }

    /// Set speed multiplier
    #[napi]
    pub fn set_speed_multiplier(&mut self, multiplier: f64) {
        self.speed_multiplier = multiplier.clamp(0.25, 4.0);
    }

    /// Enable/disable slow motion
    #[napi]
    pub fn set_slow_motion(&mut self, enabled: bool) {
        self.slow_motion = enabled;
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simulation_engine_creation() {
        let engine = SimulationEngine::new(None, None);
        assert_eq!(engine.slot, 0);
        assert_eq!(engine.tick_rate, 400);
        assert_eq!(engine.speed_multiplier, 1.0);
    }

    #[test]
    fn test_process_transaction() {
        let mut engine = SimulationEngine::new(None, None);
        let tx_bytes = vec![1, 2, 3, 4, 5];
        let result = engine.process_transaction(tx_bytes);
        
        assert!(result.success);
        assert!(result.signature.is_some());
        assert_eq!(result.units_consumed, 150);
        assert_eq!(engine.transactions_processed, 1);
    }

    #[test]
    fn test_produce_block() {
        let mut engine = SimulationEngine::new(None, None);
        let block = engine.produce_block(1);
        
        assert!(block.is_some());
        let block = block.unwrap();
        assert_eq!(block.slot, 1);
        assert_eq!(block.parent_slot, 0);
        assert_eq!(engine.blocks_produced, 1);
    }

    #[test]
    fn test_tick() {
        let mut engine = SimulationEngine::new(None, None);
        assert_eq!(engine.tick(), 1);
        assert_eq!(engine.tick(), 2);
        assert_eq!(engine.get_slot(), 2);
    }

    #[test]
    fn test_speed_multiplier() {
        let mut engine = SimulationEngine::new(None, None);
        engine.set_speed_multiplier(2.0);
        assert_eq!(engine.speed_multiplier, 2.0);
        
        engine.set_speed_multiplier(0.1); // Below minimum
        assert_eq!(engine.speed_multiplier, 0.25);
        
        engine.set_speed_multiplier(10.0); // Above maximum
        assert_eq!(engine.speed_multiplier, 4.0);
    }

    #[test]
    fn test_poh_tick() {
        let engine = SimulationEngine::new(None, None);
        let tick = engine.get_poh_tick();
        
        assert_eq!(tick.slot, 0);
        assert_eq!(tick.ticks_per_slot, 64);
        assert!(!tick.hash.is_empty());
        assert_eq!(tick.hash_chain.len(), 5);
    }
}
