#!/usr/bin/env python3
"""
Backtest trading strategy using historical Kraken data
"""
import sys
sys.path.insert(0, 'src')

from exchange.kraken_client import KrakenClient
from agent.risk_router import RiskRouter
import json

def backtest(pair="XBTUSD", days=30):
    print(f"Backtesting {pair} for {days} days...")
    
    kraken = KrakenClient()
    risk = RiskRouter()
    
    # Get OHLC data
    ohlc = kraken.get_ohlc(pair, interval=1440)  # Daily
    
    # Simple backtest: buy when price > SMA, sell when < SMA
    prices = [float(c[4]) for c in ohlc]  # close prices
    
    capital = 10000
    position = 0
    trades = []
    
    for i in range(20, len(prices)):  # Need 20 days for SMA
        sma = sum(prices[i-20:i]) / 20
        current_price = prices[i]
        
        if current_price > sma and position == 0:
            position = capital / current_price
            capital = 0
            trades.append({"action": "BUY", "price": current_price, "day": i})
        elif current_price < sma and position > 0:
            capital = position * current_price
            position = 0
            trades.append({"action": "SELL", "price": current_price, "day": i})
    
    # Final value
    final_value = capital + position * prices[-1]
    pnl = final_value - 10000
    pnl_pct = (pnl / 10000) * 100
    
    print(f"\nBacktest Results:")
    print(f"  Starting: $10,000")
    print(f"  Final: ${final_value:,.2f}")
    print(f"  PnL: ${pnl:,.2f} ({pnl_pct:.2f}%)")
    print(f"  Trades: {len(trades)}")
    
    # Risk metrics
    risk_max = risk.max_position_size
    print(f"\nRisk Settings Used:")
    print(f"  Max Position: ${risk_max}")
    print(f"  Max Leverage: {risk.max_leverage}x")
    print(f"  Max Daily Loss: ${risk.max_daily_loss}")

if __name__ == "__main__":
    backtest()
