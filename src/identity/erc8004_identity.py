"""
ERC-8004 Agent Identity & Reputation
"""
import os
from web3 import Web3
from typing import Dict, Optional


# ERC-8004 Identity Interface (simplified)
ERC8004_ABI = [
    {
        "inputs": [],
        "name": "registerAgent",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "recordTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "getReputation",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "int256"}],
        "name": "updateScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]


class ERC8004Identity:
    def __init__(self, rpc_url: str = None, private_key: str = None, contract_address: str = None):
        self.rpc_url = rpc_url or os.getenv("ERC8004_RPC_URL")
        self.private_key = private_key or os.getenv("WALLET_PRIVATE_KEY")
        self.contract_address = contract_address or os.getenv("ERC8004_CONTRACT_ADDRESS", "0x00000000000000000000000000000000008004")
        
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.account = self.w3.eth.account.from_key(private_key) if private_key else None
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.contract_address),
            abi=ERC8004_ABI
        ) if private_key else None
    
    def is_registered(self, address: str) -> bool:
        """Check if agent is registered"""
        try:
            score = self.contract.functions.getReputation(Web3.to_checksum_address(address)).call()
            return True
        except:
            return False
    
    def register(self) -> str:
        """Register agent identity on-chain"""
        if not self.account:
            raise Exception("No wallet configured")
            
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        tx = self.contract.functions.registerAgent().build_transaction({
            "from": self.account.address,
            "nonce": nonce,
            "gas": 200000,
            "gasPrice": self.w3.eth.gas_price
        })
        
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
    
    def record_trade(self, agent_address: str, pnl_sats: int) -> str:
        """Record a trade for reputation tracking"""
        if not self.account:
            raise Exception("No wallet configured")
            
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        tx = self.contract.functions.recordTrade(
            Web3.to_checksum_address(agent_address),
            pnl_sats  # Sats = basis points for precision
        ).build_transaction({
            "from": self.account.address,
            "nonce": nonce,
            "gas": 100000,
            "gasPrice": self.w3.eth.gas_price
        })
        
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
    
    def get_reputation(self, address: str) -> int:
        """Get agent reputation score"""
        try:
            return self.contract.functions.getReputation(Web3.to_checksum_address(address)).call()
        except:
            return 0
    
    def attest_validator(self, validator_address: str, score: int) -> str:
        """Validator attestation"""
        if not self.account:
            raise Exception("No wallet configured")
            
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        tx = self.contract.functions.updateScore(
            Web3.to_checksum_address(validator_address),
            score
        ).build_transaction({
            "from": self.account.address,
            "nonce": nonce,
            "gas": 100000,
            "gasPrice": self.w3.eth.gas_price
        })
        
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
