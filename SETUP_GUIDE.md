# VANIJ Agent Setup Guide

## 🔑 Step 1: Kraken API Key (Required for Trading Challenge)

1. Login ke Kraken: https://www.kraken.com/sign-in
2. Pergi ke Settings → API
3. Klik "Add API Key"
4. Set permissions:
   - ✅ Query (required for leaderboard)
   - ✅ Trade & Read (optional, for live trading)
   - ❌ Withdraw Funds (NOT needed)
5. Copy API Key dan Secret ke `.env`:

```
KRAKEN_API_KEY=your_api_key_here
KRAKEN_API_SECRET=your_api_secret_here
```

---

## 🌐 Step 2: ERC-8004 Identity (Required for ERC-8004 Challenge)

### Option A: Quick Deploy via Remix (Recommended)

1. Buka https://remix.ethereum.org
2. Buat file baru: `ERC8004Identity.sol`
3. Copy contract dari `contracts/ERC8004Identity.sol`
4. Compile dengan Solidity 0.8.20
5. Deploy ke Sepolia testnet
6. Copy alamat contract ke `.env`:

```
IDENTITY_REGISTRY_ADDRESS=0x...
```

### Option B: Get Testnet ETH First

Wallet address: `0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23`

Faucets (pilih salah satu):
- https://faucets.chain.link/sepolia (0.5 ETH)
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

Setelah dapat ETH, jalankan:
```bash
cd vanij-agent
bun run scripts/deploy-hardhat.ts
```

---

## 🚀 Step 3: Run Agent

### Paper Trading Mode (Testing)
```bash
bun run start:paper
```

### Live Mode (Real Trading)
```bash
bun run start:live
```

---

## 📊 Quick Start Without Full Setup

Jika belum punya Kraken API key atau testnet ETH, agent bisa dijalankan dalam mode simulasi:

```bash
bun run dev
```

Agent akan:
- Generate simulated market data
- Test strategy logic
- Validate risk management
- Output trade signals (tanpa eksekusi real)

---

## 🔐 Security Notes

- **NEVER** commit `.env` ke git
- **NEVER** share private key
- Gunakan read-only API key untuk Kraken
- Testnet ETH tidak memiliki nilai real
