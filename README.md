# VANIJ AGENT

**AI Trading Agent — Kraken + ERC-8004 Identity | lablab.ai AI Trading Agents Hackathon**

> *Vanij (वणिज) — Sanskrit for "trade, commerce"*

## Overview

An AI-powered trading agent that combines:
- **Hermes 70B** (Nous Research) as the AI brain
- **Kraken CLI** for exchange execution
- **ERC-8004** for on-chain agent identity and reputation

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Hermes 70B     │────▶│  Risk Router  │────▶│ Kraken CLI  │
│  (AI Brain)     │     │  (Limits)     │     │ (Execution) │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                                            │
        └──────────────────┬─────────────────────────┘
                           ▼
                   ┌──────────────────┐
                   │   ERC-8004       │
                   │   Identity       │
                   │   On-Chain       │
                   └──────────────────┘
```

## Strategy

| Component | Description |
|-----------|-------------|
| **AI Brain** | Hermes 70B analyzes market data, identifies patterns, makes trading decisions |
| **Risk Router** | Enforces position limits, max leverage, daily loss caps, circuit breakers |
| **Execution** | Kraken CLI executes trades with precision |
| **Identity** | ERC-8004 provides on-chain agent identity and verifiable reputation |

## Risk Management

- Position size limits
- Max leverage enforcement (configurable)
- Daily loss caps with automatic trading halt
- Circuit breakers on consecutive losses
- Drawdown monitoring

## Setup

```bash
# Clone
git clone https://github.com/buffedgecko/vanij-agent.git
cd vanij-agent

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
python scripts/run_agent.py
```

## Environment Variables

```env
HERMES_API_KEY=          # Nous Research Hermes API key
HERMES_BASE_URL=         # Hermes endpoint (default provided)
KRAKEN_API_KEY=          # Kraken API key
KRAKEN_API_SECRET=       # Kraken API secret
ERC8004_RPC_URL=         # Ethereum RPC URL
WALLET_PRIVATE_KEY=      # Wallet for on-chain identity
MAX_POSITION_SIZE=1000   # Max position in USD
MAX_LEVERAGE=2           # Max leverage allowed
MAX_DAILY_LOSS=100       # Daily loss limit
```

## Scripts

| Script | Purpose |
|--------|---------|
| `run_agent.py` | Start the trading agent |
| `setup_identity.py` | Register agent on ERC-8004 |
| `backtest.py` | Backtest strategy on historical data |

## Stack

- **AI**: Hermes 70B (Nous Research)
- **Exchange**: Kraken
- **Blockchain**: ERC-8004 (Ethereum)
- **Language**: Python 3.11+

## License

MIT
