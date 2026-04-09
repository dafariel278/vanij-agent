# VANIJ - Trustless AI Trading Agent

> **V**erifiable **A**utonomous **N**etwork **I**ntelligent **J**udge

AI Trading Agent yang menggabungkan **Kraken CLI** untuk eksekusi trading dan **ERC-8004** untuk identity, reputation, dan validation layer.

## 🏆 Why VANIJ is Different

| Feature | Description |
|---------|-------------|
| **Trustless Identity** | On-chain agent identity via ERC-8004 |
| **Verifiable Execution** | Every trade attested and auditable |
| **Reputation Building** | Automatic trust score from trading outcomes |
| **Risk Guardrails** | On-chain circuit breakers, position limits |
| **Multi-Strategy AI** | Arbitrage, sentiment, correlation trading |
| **Cross-Market Analysis** | Multi-asset correlation detection |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VANIJ Agent                             │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Strategy Layer │  │  Risk Layer   │  │ Trust Layer   │   │
│  │ - Arbitrage   │  │ - Position    │  │ - ERC-8004    │   │
│  │ - Sentiment   │  │   Limits      │  │ - Attestation  │   │
│  │ - Correlation │  │ - Stop Loss   │  │ - Reputation  │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Kraken CLI Integration                    │ │
│  │  - Market Data  - Order Execution  - Paper Trading    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/dafariel278/vanij-agent.git
cd vanij-agent

# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Run agent
bun run start
```

## 🔑 Required Setup

### 1. Kraken API Keys
1. Go to [Kraken API Settings](https://www.kraken.com/u/security/api)
2. Create new API key with **Read-Only** permissions (for leaderboard verification)
3. Add to `.env` file

### 2. ERC-8004 Identity
1. Deploy agent identity on testnet/L2
2. Register on [early.surge.xyz](https://early.surge.xyz)
3. Claim sandbox capital

### 3. Environment Variables

```env
# Kraken
KRAKEN_API_KEY=your_api_key
KRAKEN_API_SECRET=your_api_secret

# ERC-8004 (testnet)
AGENT_WALLET_PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.infura.io/v3/your_key
IDENTITY_REGISTRY_ADDRESS=0x...

# Risk Parameters
MAX_POSITION_SIZE_USD=1000
MAX_DAILY_LOSS_USD=100
MAX_LEVERAGE=2
```

## 🚀 Quick Start

```bash
# Paper trading mode (no real money)
bun run start:paper

# Live trading (requires real API keys)
bun run start:live

# Run tests
bun run test

# Build for production
bun run build
```

## 📊 Trading Strategies

### 1. Arbitrage Hunter
Detects price discrepancies across markets and executes risk-free arbitrage.

### 2. Sentiment Fusion
Combines on-chain metrics with social sentiment analysis for directional trades.

### 3. Correlation Trading
Identifies correlated assets and trades when correlation breaks down.

### 4. Risk-Adaptive Position Sizing
Adjusts position size based on volatility, win rate, and drawdown.

## 🔐 Risk Management

| Guardrail | Default |
|-----------|---------|
| Max Position Size | $1,000 USD |
| Max Daily Loss | $100 USD |
| Max Leverage | 2x |
| Circuit Breaker | 5% drawdown |
| Position Timeout | 24 hours |

## 📈 Performance Tracking

VANIJ automatically:
- Logs all trades on-chain via ERC-8004
- Builds reputation score from PnL
- Emits validation artifacts for each decision
- Publishes to hackathon leaderboard

## 🧪 Testing

```bash
# Run all tests
bun test

# Run specific strategy test
bun test tests/arbitrage.test.ts

# Run with coverage
bun test --coverage
```

## 📝 Hackathon Submission Checklist

- [ ] Public GitHub repository
- [ ] Demo video (3-5 minutes)
- [ ] Slide presentation
- [ ] README with setup instructions
- [ ] Live demo URL
- [ ] Project registered at early.surge.xyz
- [ ] Kraken API key submitted for leaderboard
- [ ] ERC-8004 identity deployed

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

This project is for the Lablab.ai AI Trading Agents hackathon.

---

Built with ❤️ for the AI Trading Agents Hackathon 2026
