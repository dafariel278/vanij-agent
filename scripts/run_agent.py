#!/usr/bin/env python3
"""
VANIJ Agent - Run Script
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.agent.trading_agent import VanijAgent


def main():
    print("=" * 50)
    print("  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗")
    print("  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝")
    print("  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗")
    print("  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║")
    print("  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║")
    print("  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝")
    print("=" * 50)
    print("  AI Trading Agent - Sanskrit for 'Trade'")
    print("=" * 50)
    print()
    
    agent = VanijAgent()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--single":
        print("Running single cycle...")
        result = agent.run_cycle()
        print(json.dumps(result, indent=2))
    else:
        interval = int(sys.argv[1]) if len(sys.argv) > 1 else 300
        print(f"Running continuous mode - cycle every {interval}s")
        agent.run(interval_seconds=interval)


if __name__ == "__main__":
    import json
    main()
