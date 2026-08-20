// Solana Learn Native Module - Entry Point
// // STAGE: native_module_entry

#![deny(clippy::all)]

mod simulation;
mod validator;
mod rpc;
mod poh;

use napi_derive::napi;
use napi::JsUint8Array;

pub use simulation::*;
pub use validator::*;
pub use rpc::*;
pub use poh::*;

// Re-export types for TypeScript
pub use types::*;

pub mod types {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ValidatorConfig {
        pub id: String,
        pub stake: u64,
        pub is_leader: bool,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ProcessResult {
        pub success: bool,
        pub signature: Option<String>,
        pub error: Option<String>,
        pub units_consumed: u64,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct PohTick {
        pub slot: u64,
        pub hash: String,
        pub tick_height: u64,
        pub ticks_per_slot: u64,
        pub hash_chain: Vec<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ValidatorState {
        pub id: String,
        pub slot: u64,
        pub transactions_processed: u64,
        pub blocks_produced: u64,
        pub votes_cast: u64,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Block {
        pub slot: u64,
        pub parent_slot: u64,
        pub blockhash: String,
        pub transactions: Vec<String>,
        pub signatures: Vec<String>,
        pub commitment: String,
        pub leader_id: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Vote {
        pub validator_id: String,
        pub slot: u64,
        pub lockout: u64,
        pub hash: String,
    }
}

/// Initialize the native module
#[napi]
pub fn init() -> String {
    "Solana Learn Native Module initialized".to_string()
}
