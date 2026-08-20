// Validator State Management
// // STAGE: validator_state

use napi_derive::napi;
use crate::types::*;

/// Validator state and operations
#[napi]
pub struct Validator {
    id: String,
    stake: u64,
    is_leader: bool,
    vote_tower: Vec<u64>,
    last_vote_slot: u64,
    blocks_produced: u64,
    votes_cast: u64,
}

#[napi]
impl Validator {
    #[napi(constructor)]
    pub fn new(id: String, stake: Option<u64>, is_leader: Option<bool>) -> Self {
        Validator {
            id,
            stake: stake.unwrap_or(1_000_000),
            is_leader: is_leader.unwrap_or(false),
            vote_tower: Vec::new(),
            last_vote_slot: 0,
            blocks_produced: 0,
            votes_cast: 0,
        }
    }

    /// Cast a vote on a slot
    #[napi]
    pub fn cast_vote(&mut self, slot: u64) -> Vote {
        // Add to vote tower (max depth 32)
        self.vote_tower.push(slot);
        if self.vote_tower.len() > 32 {
            self.vote_tower.remove(0);
        }
        
        self.last_vote_slot = slot;
        self.votes_cast += 1;
        
        let lockout = self.calculate_lockout(slot);
        
        Vote {
            validator_id: self.id.clone(),
            slot,
            lockout,
            hash: format!("vote-hash-{}", slot),
        }
    }

    /// Calculate lockout for a vote
    fn calculate_lockout(&self, slot: u64) -> u64 {
        // Lockout doubles with each vote in the tower
        // Minimum lockout is 32 slots
        let tower_index = self.vote_tower.iter().position(|&s| s == slot);
        match tower_index {
            Some(idx) => {
                let base_lockout = 32u64;
                base_lockout * 2u64.pow(idx as u32)
            }
            None => 32
        }
    }

    /// Produce a block if this validator is leader
    #[napi]
    pub fn produce_block(&mut self, slot: u64) -> Option<Block> {
        if !self.is_leader {
            return None;
        }
        
        self.blocks_produced += 1;
        
        Some(Block {
            slot,
            parent_slot: slot.saturating_sub(1),
            blockhash: format!("blockhash-{}", slot),
            transactions: vec![],
            signatures: vec![],
            commitment: "processed".to_string(),
            leader_id: self.id.clone(),
        })
    }

    /// Get validator info
    #[napi]
    pub fn get_info(&self) -> ValidatorState {
        ValidatorState {
            id: self.id.clone(),
            slot: self.last_vote_slot,
            transactions_processed: 0,
            blocks_produced: self.blocks_produced,
            votes_cast: self.votes_cast,
        }
    }

    /// Get vote tower
    #[napi]
    pub fn get_vote_tower(&self) -> Vec<u64> {
        self.vote_tower.clone()
    }

    /// Check if slot is finalized (in vote tower)
    #[napi]
    pub fn is_slot_finalized(&self, slot: u64) -> bool {
        self.vote_tower.contains(&slot)
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validator_creation() {
        let validator = Validator::new("v1".to_string(), None, None);
        assert_eq!(validator.id, "v1");
        assert_eq!(validator.stake, 1_000_000);
        assert!(!validator.is_leader);
    }

    #[test]
    fn test_cast_vote() {
        let mut validator = Validator::new("v1".to_string(), None, Some(true));
        let vote = validator.cast_vote(10);
        
        assert_eq!(vote.validator_id, "v1");
        assert_eq!(vote.slot, 10);
        assert!(vote.lockout >= 32);
        assert_eq!(validator.votes_cast, 1);
    }

    #[test]
    fn test_vote_tower_depth() {
        let mut validator = Validator::new("v1".to_string(), None, None);
        
        // Cast 35 votes (more than tower depth of 32)
        for i in 0..35 {
            validator.cast_vote(i);
        }
        
        // Tower should only keep last 32
        assert!(validator.vote_tower.len() <= 32);
    }

    #[test]
    fn test_produce_block_as_leader() {
        let mut validator = Validator::new("v1".to_string(), None, Some(true));
        let block = validator.produce_block(5);
        
        assert!(block.is_some());
        assert_eq!(block.unwrap().slot, 5);
        assert_eq!(validator.blocks_produced, 1);
    }

    #[test]
    fn test_produce_block_not_leader() {
        let mut validator = Validator::new("v1".to_string(), None, Some(false));
        let block = validator.produce_block(5);
        
        assert!(block.is_none());
        assert_eq!(validator.blocks_produced, 0);
    }

    #[test]
    fn test_is_slot_finalized() {
        let mut validator = Validator::new("v1".to_string(), None, None);
        validator.cast_vote(10);
        
        assert!(validator.is_slot_finalized(10));
        assert!(!validator.is_slot_finalized(11));
    }
}
