#!/usr/bin/env python3
"""
Setup & register ERC-8004 identity
"""
import sys
sys.path.insert(0, 'src')

from identity.erc8004_identity import ERC8004Identity
from web3 import Web3

def main():
    print("ERC-8004 Identity Setup")
    print("=" * 40)
    
    identity = ERC8004Identity()
    
    if not identity.account:
        print("ERROR: No wallet configured. Set WALLET_PRIVATE_KEY in .env")
        sys.exit(1)
    
    print(f"Wallet: {identity.account.address}")
    print(f"Contract: {identity.contract_address}")
    
    # Check if already registered
    if identity.is_registered(identity.account.address):
        print("Agent is already registered!")
        score = identity.get_reputation(identity.account.address)
        print(f"Reputation score: {score}")
    else:
        print("Registering agent...")
        tx_hash = identity.register()
        print(f"Registration tx: {tx_hash}")
        print("Wait for confirmation, then check reputation")

if __name__ == "__main__":
    main()
