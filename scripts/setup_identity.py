#!/usr/bin/env python3
"""
VANIJ Agent - Setup ERC-8004 Identity
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.identity.erc8004_identity import ERC8004Identity


def main():
    print("=" * 50)
    print("  VANIJ - ERC-8004 Identity Setup")
    print("=" * 50)
    print()
    
    identity = ERC8004Identity()
    
    # Check if already registered
    if identity.is_registered():
        print("✓ Agent already registered on ERC-8004")
        print(f"  Agent ID: {identity.get_agent_id()}")
        print(f"  Reputation: {identity.get_reputation()}")
    else:
        print("→ Registering new agent...")
        tx_hash = identity.register()
        print(f"✓ Registered! TX: {tx_hash}")
    
    print()
    print("Identity Info:")
    print(f"  Address: {identity.get_address()}")
    print(f"  Chain: Ethereum")


if __name__ == "__main__":
    main()
