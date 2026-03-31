# AI Trading Agent

**Kraken + ERC-8004 Identity | lablab.ai AI Trading Agents Hackathon**

## Overview

An AI-powered trading agent that combines:
- **Hermes 70B** (Nous Research) as the AI brain
- **Kraken CLI** for exchange execution
- **ERC-8004** for on-chain agent identity and reputation

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Hermes 70B     │────▶│  Risk Router │────▶│ Kraken CLI  │
│  (AI Brain)      │     │  (Limits)    │     │ (Execution) │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                                           │
        │           ┌──────────────┐                │
        └──────────▶│ ERC-8004     │◀───────────────┘
                    │ Identity     │
                    │ + Reputation │
                    └──────────────┘
```

## Features

- **AI Decision Making**: Hermes 70B analyzes market conditions
- **Risk Management**: Position limits, max leverage, circuit breakers
- **On-Chain Identity**: ERC-8004 compliant agent identity
- **Reputation System**: Trustless validation and scoring

## Setup

```bash
# Clone repo
git clone https://github.com/buffedgecko/ai-trading-agents.git
cd ai-trading-agents

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
python src/agent/trading_agent.py
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HERMES_API_KEY` | Nous Research Hermes API key |
| `KRAKEN_API_KEY` | Kraken API key |
| `KRAKEN_API_SECRET` | Kraken API secret |
| `WALLET_PRIVATE_KEY` | Wallet for ERC-8004 identity |

## Challenges

- ✅ **Kraken Challenge**: Net PnL optimization
- ✅ **ERC-8004 Challenge**: Risk-adjusted returns + identity/reputation

## License

MIT
