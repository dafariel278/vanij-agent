import * as crypto from "crypto";

const API_KEY = "xP58dXOGBKWbBOgThGV8D/0XcteEFTXWVKGOTHLLc1PFe5w6VgL62+/B";
const API_SECRET = "pUzZrVvyvwuuhMc1MwMu8BtXTmxZs7C8w8qAgj1suuiOZKARyKHKr80n+mC5nqMEkgqe+7TpF0PwYre0638Mcg==";

function getKrakenSignature(urlPath: string, data: string): string {
  const secretBuffer = Buffer.from(API_SECRET, 'base64');
  const hash = crypto.createHash('sha256');
  hash.update(data);
  const hashedData = hash.digest();
  
  const hmac = crypto.createHmac('sha512', secretBuffer);
  hmac.update(urlPath);
  hmac.update(hashedData);
  
  return hmac.digest('base64');
}

async function testKrakenConnection() {
  console.log("🔐 Testing Kraken API Connection...\n");

  // Test public endpoint first
  console.log("📡 Testing public endpoint...");
  try {
    const publicResp = await fetch("https://api.kraken.com/0/public/Time");
    const publicData = await publicResp.json();
    if (publicData.result) {
      console.log("✅ Public API: Connected");
      console.log(`   Server Time: ${new Date(publicData.result.unixtime * 1000).toISOString()}`);
    }
  } catch (e) {
    console.log("❌ Public API failed");
    return;
  }

  // Test private endpoint - Get Account Balance
  console.log("\n📡 Testing private endpoint (Account Balance)...");
  const endpoint = "/0/private/Balance";
  const nonce = Date.now().toString().padEnd(14, '0');
  const postData = `nonce=${nonce}`;
  const signature = getKrakenSignature(endpoint, postData);
  
  try {
    const response = await fetch("https://api.kraken.com" + endpoint, {
      method: "POST",
      headers: {
        "API-Key": API_KEY,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "VANIJ-Agent/1.0",
      },
      body: postData,
    });
    
    const data = await response.json();
    
    if (data.error && data.error.length > 0) {
      console.log("❌ API Error:", data.error[0]);
      
      if (data.error[0].includes("Invalid key")) {
        console.log("\n⚠️  Possible issues:");
        console.log("   - API Key not yet active (wait 5 minutes after creation)");
        console.log("   - API Key permissions not set correctly");
      }
      return;
    }
    
    console.log("✅ API Key Valid!");
    console.log("\n💰 Account Balances:");
    
    const balances = data.result || {};
    let hasBalance = false;
    
    for (const [asset, balance] of Object.entries(balances)) {
      const bal = Number(balance);
      if (bal > 0) {
        hasBalance = true;
        console.log(`   ${asset}: ${bal.toFixed(8)}`);
      }
    }
    
    if (!hasBalance) {
      console.log("   (No balances found - account may be empty or using different assets)");
    }
    
    console.log("\n🎉 Kraken API ready for VANIJ Agent!");
    
  } catch (error) {
    console.log("❌ Request failed:", error);
  }
}

testKrakenConnection();
