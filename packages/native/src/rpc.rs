// RPC Simulation Layer
// // STAGE: rpc_simulation

use napi_derive::napi;
use crate::types::*;

/// RPC simulation for transaction submission
#[napi]
pub struct RpcSimulator {
    transactions: Vec<String>,
    blocks: Vec<Block>,
}

#[napi]
impl RpcSimulator {
    #[napi(constructor)]
    pub fn new() -> Self {
        RpcSimulator {
            transactions: Vec::new(),
            blocks: Vec::new(),
        }
    }

    /// Submit a transaction
    #[napi]
    pub fn submit_transaction(&mut self, signature: String) -> ProcessResult {
        // Store transaction signature
        self.transactions.push(signature.clone());
        
        ProcessResult {
            success: true,
            signature: Some(signature),
            error: None,
            units_consumed: 0,
        }
    }

    /// Simulate a transaction
    #[napi]
    pub fn simulate_transaction(&self, tx_bytes: Vec<u8>) -> ProcessResult {
        // Mock simulation
        ProcessResult {
            success: true,
            signature: None,
            error: None,
            units_consumed: 150,
        }
    }

    /// Get recent blockhash
    #[napi]
    pub fn get_recent_blockhash(&self) -> String {
        format!("recent-blockhash-{}", self.blocks.len())
    }

    /// Get transaction count
    #[napi]
    pub fn get_transaction_count(&self) -> u64 {
        self.transactions.len() as u64
    }

    /// Get block by slot
    #[napi]
    pub fn get_block(&self, slot: u64) -> Option<Block> {
        self.blocks.iter().find(|b| b.slot == slot).cloned()
    }

    /// Add a block (called by validator)
    #[napi]
    pub fn add_block(&mut self, block: Block) {
        self.blocks.push(block);
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rpc_creation() {
        let rpc = RpcSimulator::new();
        assert_eq!(rpc.get_transaction_count(), 0);
    }

    #[test]
    fn test_submit_transaction() {
        let mut rpc = RpcSimulator::new();
        let result = rpc.submit_transaction("sig-123".to_string());
        
        assert!(result.success);
        assert_eq!(result.signature, Some("sig-123".to_string()));
        assert_eq!(rpc.get_transaction_count(), 1);
    }

    #[test]
    fn test_simulate_transaction() {
        let rpc = RpcSimulator::new();
        let result = rpc.simulate_transaction(vec![1, 2, 3]);
        
        assert!(result.success);
        assert_eq!(result.units_consumed, 150);
    }

    #[test]
    fn test_get_block() {
        let mut rpc = RpcSimulator::new();
        let block = Block {
            slot: 1,
            parent_slot: 0,
            blockhash: "hash-1".to_string(),
            transactions: vec![],
            signatures: vec![],
            commitment: "processed".to_string(),
            leader_id: "v1".to_string(),
        };
        
        rpc.add_block(block);
        assert!(rpc.get_block(1).is_some());
        assert!(rpc.get_block(2).is_none());
    }
}
