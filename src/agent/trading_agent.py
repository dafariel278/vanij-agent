"""
VANIJ Agent - Main Trading Agent
Connects Hermes AI + Kraken + ERC-8004
"""
import os
import json
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

from .hermes_client import HermesClient
from .risk_router import RiskRouter
from ..exchange.kraken_client import KrakenClient
from ..identity.erc8004_identity import ERC8004Identity

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - VANIJ - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VanijAgent:
    """VANIJ - AI Trading Agent with On-Chain Identity"""
    
    def __init__(self):
        load_dotenv()
        
        logger.info("Initializing VANIJ Agent...")
        
        # Initialize components
        self.ai = HermesClient()
        self.kraken = KrakenClient()
        self.risk = RiskRouter()
        self.identity = ERC8004Identity()
        
        self.name = "VANIJ"
        self.version = "1.0.0"
        self.is_running = False
        
        logger.info(f"{self.name} Agent v{self.version} initialized")
    
    def analyze_and_trade(self) -> dict:
        """Main trading cycle"""
        logger.info("Starting trading cycle...")
        
        # 1. Get market data
        market_data = self.kraken.get_market_data()
        logger.info(f"Market data: {len(market_data)} pairs")
        
        # 2. Get portfolio status
        portfolio = self.kraken.get_balance()
        logger.info(f"Portfolio: {portfolio}")
        
        # 3. Build context for AI
        context = {
            "market_data": market_data,
            "portfolio": portfolio,
            "timestamp": datetime.now().isoformat(),
            "agent_name": self.name
        }
        
        # 4. AI makes decision
        decision = self.ai.make_decision(context)
        logger.info(f"AI Decision: {decision}")
        
        # 5. Risk check
        if not self.risk.check_risk(decision):
            logger.warning("Risk check failed - trade rejected")
            return {"status": "rejected", "reason": "risk_check_failed"}
        
        # 6. Execute trade
        result = self.kraken.execute_trade(decision)
        logger.info(f"Trade result: {result}")
        
        # 7. Update on-chain reputation
        if result.get("success"):
            self.identity.record_trade(result)
        
        return result
    
    def run(self, interval_seconds: int = 300):
        """Run agent continuously"""
        self.is_running = True
        logger.info(f"Agent running - cycle every {interval_seconds}s (Ctrl+C to stop)")
        
        while self.is_running:
            try:
                self.analyze_and_trade()
                time.sleep(interval_seconds)
            except KeyboardInterrupt:
                logger.info("Shutting down...")
                self.is_running = False
            except Exception as e:
                logger.error(f"Error: {e}")
                time.sleep(60)
    
    def run_cycle(self):
        """Run single cycle"""
        return self.analyze_and_trade()
    
    def get_status(self) -> dict:
        """Get agent status"""
        return {
            "name": self.name,
            "version": self.version,
            "running": self.is_running,
            "ai_connected": self.ai.is_connected(),
            "kraken_connected": self.kraken.is_connected(),
            "identity_registered": self.identity.is_registered()
        }


if __name__ == "__main__":
    agent = VanijAgent()
    print(json.dumps(agent.get_status(), indent=2))
