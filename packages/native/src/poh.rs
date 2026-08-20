// PoH Hash Chain Simulation
// // STAGE: poh_chain

use napi_derive::napi;
use sha2::{Sha256, Digest};
use crate::types::*;

/// Proof of History hash chain
#[napi]
pub struct PohChain {
    current_hash: String,
    slot: u64,
    tick_height: u64,
    ticks_per_slot: u64,
    hash_chain: Vec<String>,
}

#[napi]
impl PohChain {
    #[napi(constructor)]
    pub fn new(ticks_per_slot: Option<u64>) -> Self {
        let initial_hash = "0".repeat(64);
        PohChain {
            current_hash: initial_hash.clone(),
            slot: 0,
            tick_height: 0,
            ticks_per_slot: ticks_per_slot.unwrap_or(64),
            hash_chain: vec![initial_hash],
        }
    }

    /// Generate next PoH tick
    #[napi]
    pub fn tick(&mut self) -> PohTick {
        // Hash the current hash to get next hash
        let mut hasher = Sha256::new();
        hasher.update(self.current_hash.as_bytes());
        self.current_hash = format!("{:x}", hasher.finalize());
        
        self.tick_height += 1;
        
        // Update slot if we've completed all ticks
        if self.tick_height % self.ticks_per_slot == 0 {
            self.slot += 1;
        }
        
        // Maintain hash chain (last 5 hashes)
        self.hash_chain.push(self.current_hash.clone());
        if self.hash_chain.len() > 5 {
            self.hash_chain.remove(0);
        }
        
        PohTick {
            slot: self.slot,
            hash: self.current_hash.clone(),
            tick_height: self.tick_height,
            ticks_per_slot: self.ticks_per_slot,
            hash_chain: self.hash_chain.clone(),
        }
    }

    /// Get current hash
    #[napi]
    pub fn get_current_hash(&self) -> String {
        self.current_hash.clone()
    }

    /// Get current slot
    #[napi]
    pub fn get_slot(&self) -> u64 {
        self.slot
    }

    /// Get tick height
    #[napi]
    pub fn get_tick_height(&self) -> u64 {
        self.tick_height
    }

    /// Reset chain (for fork scenarios)
    #[napi]
    pub fn reset(&mut self, from_hash: String, from_slot: u64) {
        self.current_hash = from_hash;
        self.slot = from_slot;
        self.tick_height = from_slot * self.ticks_per_slot;
        self.hash_chain = vec![self.current_hash.clone()];
    }

    /// Verify hash chain integrity
    #[napi]
    pub fn verify_chain(&self) -> bool {
        // In a real implementation, this would verify the entire chain
        // For now, just check that hash chain is not empty
        !self.hash_chain.is_empty()
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_poh_chain_creation() {
        let chain = PohChain::new(None);
        assert_eq!(chain.slot, 0);
        assert_eq!(chain.tick_height, 0);
        assert_eq!(chain.ticks_per_slot, 64);
    }

    #[test]
    fn test_tick() {
        let mut chain = PohChain::new(None);
        let tick = chain.tick();
        
        assert_eq!(tick.slot, 0);
        assert_eq!(tick.tick_height, 1);
        assert!(!tick.hash.is_empty());
        assert_eq!(tick.hash_chain.len(), 2); // Initial + first tick
    }

    #[test]
    fn test_slot_progression() {
        let mut chain = PohChain::new(Some(2)); // 2 ticks per slot
        
        // First tick
        chain.tick();
        assert_eq!(chain.slot, 0);
        
        // Second tick - should advance slot
        chain.tick();
        assert_eq!(chain.slot, 1);
    }

    #[test]
    fn test_hash_chain_maintenance() {
        let mut chain = PohChain::new(None);
        
        // Add 7 ticks
        for _ in 0..7 {
            chain.tick();
        }
        
        // Should only keep last 5 hashes
        assert!(chain.hash_chain.len() <= 5);
    }

    #[test]
    fn test_reset() {
        let mut chain = PohChain::new(None);
        
        // Advance some ticks
        for _ in 0..10 {
            chain.tick();
        }
        
        // Reset to earlier state
        chain.reset("new-hash".to_string(), 5);
        
        assert_eq!(chain.current_hash, "new-hash");
        assert_eq!(chain.slot, 5);
        assert_eq!(chain.hash_chain, vec!["new-hash"]);
    }
}
