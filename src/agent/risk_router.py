"""
Risk Router - Circuit breakers, position limits, leverage controls
"""
import os
from datetime import datetime, timedelta
from typing import Dict, Optional


class RiskRouter:
    def __init__(
        self,
        max_position_size: float = None,
        max_leverage: float = None,
        max_daily_loss: float = None,
        circuit_breaker_threshold: int = None
    ):
        self.max_position_size = max_position_size or float(os.getenv("MAX_POSITION_SIZE", 1000))
        self.max_leverage = max_leverage or float(os.getenv("MAX_LEVERAGE", 2))
        self.max_daily_loss = max_daily_loss or float(os.getenv("MAX_DAILY_LOSS", 100))
        self.circuit_breaker_threshold = circuit_breaker_threshold or int(os.getenv("CIRCUIT_BREAKER_THRESHOLD", 5))
        
        self.daily_loss = 0.0
        self.daily_reset = datetime.now()
        self.consecutive_losses = 0
        self.circuit_breaker_active = False
        
    def reset_daily(self):
        """Reset daily counters"""
        now = datetime.now()
        if now.date() > self.daily_reset.date():
            self.daily_loss = 0.0
            self.daily_reset = now
            self.consecutive_losses = 0
            
    def validate_trade(self, trade: Dict, portfolio: Dict) -> Dict:
        """
        Validate trade against risk parameters.
        Returns: {approved: bool, reason: str, adjusted_amount: float}
        """
        self.reset_daily()
        
        # Check circuit breaker
        if self.circuit_breaker_active:
            return {
                "approved": False,
                "reason": "Circuit breaker active - too many consecutive losses",
                "adjusted_amount": 0
            }
            
        # Check position size
        amount = trade.get("amount", 0)
        if amount > self.max_position_size:
            return {
                "approved": False,
                "reason": f"Position size {amount} exceeds max {self.max_position_size}",
                "adjusted_amount": self.max_position_size
            }
            
        # Check leverage
        leverage = trade.get("leverage", 1)
        if leverage > self.max_leverage:
            return {
                "approved": False,
                "reason": f"Leverage {leverage}x exceeds max {self.max_leverage}x",
                "adjusted_amount": amount  # Still approved but leverage capped
            }
            
        # Check daily loss limit
        if self.daily_loss >= self.max_daily_loss:
            return {
                "approved": False,
                "reason": f"Daily loss {self.daily_loss} exceeds max {self.max_daily_loss}",
                "adjusted_amount": 0
            }
            
        return {
            "approved": True,
            "reason": "Trade approved",
            "adjusted_amount": amount
        }
    
    def record_trade_result(self, pnl: float):
        """Record trade result for risk tracking"""
        if pnl < 0:
            self.daily_loss += abs(pnl)
            self.consecutive_losses += 1
            if self.consecutive_losses >= self.circuit_breaker_threshold:
                self.circuit_breaker_active = True
        else:
            self.consecutive_losses = 0
            
    def reset_circuit_breaker(self):
        """Manually reset circuit breaker (e.g., new day)"""
        self.circuit_breaker_active = False
        self.consecutive_losses = 0
