"""
VANIJ Agent - AI Trading Agent with On-Chain Identity
Vanij (वणिज) - Sanskrit for "trade, commerce"
"""
from .agent import VanijAgent, HermesClient, RiskRouter
from .exchange import KrakenClient
from .identity import ERC8004Identity

__all__ = ["VanijAgent", "HermesClient", "RiskRouter", "KrakenClient", "ERC8004Identity"]
