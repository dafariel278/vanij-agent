"""
Main Trading Agent - Orchestrates Hermes AI + Kraken + ERC-8004
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

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TradingAgent:
    def __init__(self):
        self.hermes = HermesClient()
        self.kraken = KrakenClient()
        self.erc8004 = ERC8004Identity()
        self.risk_router = RiskRouter()
        
        self.wallet_address = self.erc8004.account.address if self.erc8004.account else None
        logger.info(f"Trading Agent initialized. Wallet: {self.wallet_address}")
        
    def get_market_data(self, pair: str = "XBTUSD") -> dict:
        """Fetch market data from Kraken"""
        try:
            ticker = self.kraken.get_ticker(pair)
            ohlc = self.kraken.get_ohlc(pair, interval=60)  # 1h candles
            balance = self.kraken.get_balance()
            
            return {
                "pair": pair,
                "ticker": ticker,
                "ohlc": ohlc[-10:],  # Last 10 candles
                "balance": balance,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return {}
    
    def get_portfolio(self) -> dict:
        """Get current portfolio state"""
        try:
            balance = self.kraken.get_balance()
            trade_balance = self.kraken.get_trade_balance()
            open_orders = self.kraken.get_open_orders()
            
            return {
                "balance": balance,
                "equity": trade_balance.get("eb", 0),
                "pnl": trade_balance.get("nl", 0),
                "open_orders": len(open_orders),
                "reputation": self.erc8004.get_reputation(self.wallet_address) if self.wallet_address else 0
            }
        except Exception as e:
            logger.error(f"Error fetching portfolio: {e}")
            return {}
    
    def execute_trade(self, decision: dict) -> dict:
        """Execute a trade decision through risk router"""
        # Validate with risk router
        portfolio = self.get_portfolio()
        risk_check = self.risk_router.validate_trade(decision, portfolio)
        
        if not risk_check["approved"]:
            logger.warning(f"Trade rejected: {risk_check['reason']}")
            return {"success": False, "reason": risk_check["reason"]}
        
        try:
            # Execute on Kraken
            result = self.kraken.place_order(
                pair=decision.get("pair", "XBTUSD"),
                type_=decision.get("action", "buy"),
                volume=risk_check["adjusted_amount"]
            )
            
            logger.info(f"Trade executed: {result}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Trade execution failed: {e}")
            return {"success": False, "reason": str(e)}
    
    def run_cycle(self):
        """Run one trading cycle"""
        logger.info("=== Trading Cycle Started ===")
        
        # 1. Get market data
        market_data = self.get_market_data()
        portfolio = self.get_portfolio()
        
        # 2. Ask Hermes for decision
        decision = self.hermes.analyze_market(market_data, portfolio)
        logger.info(f"Hermes decision: {decision}")
        
        # 3. Execute if approved
        if decision.get("action") != "hold":
            result = self.execute_trade(decision)
            
            # 4. Record to ERC-8004 if successful
            if result.get("success"):
                pnl_sats = int(portfolio.get("pnl", 0) * 100000)  # Convert to sats
                self.erc8004.record_trade(self.wallet_address, pnl_sats)
        
        logger.info("=== Trading Cycle Complete ===")
    
    def run(self, interval_seconds: int = 300):
        """Run trading agent continuously"""
        logger.info(f"Starting trading loop (interval: {interval_seconds}s)")
        
        while True:
            try:
                self.run_cycle()
                time.sleep(interval_seconds)
            except KeyboardInterrupt:
                logger.info("Trading agent stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in trading loop: {e}")
                time.sleep(60)  # Wait before retry


if __name__ == "__main__":
    agent = TradingAgent()
    agent.run(interval_seconds=300)  # Run every 5 minutes
