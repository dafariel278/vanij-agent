#!/usr/bin/env python3
"""
Run the trading agent
"""
import sys
sys.path.insert(0, 'src')

from agent.trading_agent import TradingAgent

if __name__ == "__main__":
    print("Starting AI Trading Agent...")
    agent = TradingAgent()
    
    # Run single cycle for testing
    if len(sys.argv) > 1 and sys.argv[1] == "--single":
        agent.run_cycle()
    else:
        agent.run(interval_seconds=300)
