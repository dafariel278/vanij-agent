"""
Kraken Exchange Client - Trading execution layer
"""
import os
import time
import krakenex
from typing import Dict, List, Optional


class KrakenClient:
    def __init__(self, api_key: str = None, api_secret: str = None, testnet: bool = False):
        self.api_key = api_key or os.getenv("KRAKEN_API_KEY")
        self.api_secret = api_secret or os.getenv("KRAKEN_API_SECRET")
        self.testnet = testnet or os.getenv("KRAKEN_TESTNET", "false").lower() == "true"
        
        self.client = krakenex.API(self.api_key, self.api_secret)
        self.base_url = "https://api.kraken.com"
        
    def get_balance(self) -> Dict[str, float]:
        """Get account balances"""
        response = self.client.query_private("Balance")
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return {k: float(v) for k, v in response["result"].items()}
    
    def get_ticker(self, pair: str) -> Dict:
        """Get ticker info for a pair"""
        response = self.client.query_public("Ticker", {"pair": pair})
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]
    
    def get_ohlc(self, pair: str, interval: int = 60) -> List:
        """Get OHLC data"""
        response = self.client.query_public("OHLC", {"pair": pair, "interval": interval})
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]
    
    def place_order(self, pair: str, type_: str, volume: float, price: float = None) -> Dict:
        """Place an order"""
        order = {
            "pair": pair,
            "type": type_,  # buy or sell
            "ordertype": "limit" if price else "market",
            "volume": str(volume),
        }
        if price:
            order["price"] = str(price)
            
        response = self.client.query_private("AddOrder", order)
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]
    
    def get_open_orders(self) -> List[Dict]:
        """Get open orders"""
        response = self.client.query_private("OpenOrders")
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]["open"]
    
    def cancel_order(self, txid: str) -> bool:
        """Cancel an order"""
        response = self.client.query_private("CancelOrder", {"txid": txid})
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return True
    
    def get_trade_balance(self) -> Dict:
        """Get trade balance (equity, PnL, etc)"""
        response = self.client.query_private("TradeBalance")
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]
    
    def get_recent_trades(self, pair: str) -> List:
        """Get recent trades for a pair"""
        response = self.client.query_public("Trades", {"pair": pair})
        if response["error"]:
            raise Exception(f"Kraken error: {response['error']}")
        return response["result"]
