import ccxt from "ccxt";

const kraken = new ccxt.kraken({
  apiKey: "xP58dXOGBKWbBOgThGV8D/0XcteEFTXWVKGOTHLLc1PFe5w6VgL62+/B",
  secret: "pUzZrVvyvwuuhMc1MwMu8BtXTmxZs7C8w8qAgj1suuiOZKARyKHKr80n+mC5nqMEkgqe+7TpF0PwYre0638Mcg==",
  enableRateLimit: true,
});

async function test() {
  console.log("🔐 Testing Kraken API with CCXT...\n");

  try {
    // Test public
    console.log("📡 Fetching server time...");
    const time = await kraken.fetchTime();
    console.log(`✅ Server time: ${new Date(time).toISOString()}\n`);

    // Test private - balance
    console.log("📡 Fetching account balance...");
    const balance = await kraken.fetchBalance();
    
    console.log("✅ API Connection Successful!\n");
    console.log("💰 Balances:");
    
    let hasBalance = false;
    for (const [currency, amount] of Object.entries(balance.total)) {
      if (Number(amount) > 0) {
        hasBalance = true;
        console.log(`   ${currency}: ${amount}`);
      }
    }
    
    if (!hasBalance) {
      console.log("   (No balances - account may be empty)");
    }
    
    console.log("\n🎉 VANIJ Agent ready to trade!");
    
  } catch (error: any) {
    console.log("❌ Error:", error.message);
    
    if (error.message.includes("Invalid key")) {
      console.log("\n⏳ Kraken API keys need 5-10 minutes to activate after creation.");
      console.log("   Please wait a few more minutes and try again.");
    }
  }
}

test();
