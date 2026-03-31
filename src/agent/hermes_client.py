"""
Hermes AI Client - Connects to Nous Research Hermes 70B
"""
import os
import json
import requests
from typing import Dict, List, Optional


class HermesClient:
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or os.getenv("HERMES_API_KEY")
        self.base_url = base_url or os.getenv("HERMES_BASE_URL", "https://gateway.nousresearch.llaminator.io/v1")
        self.model = " Nous-Hermes-2-Mixtral-8x7B-DPO"  # or the 70B model
        
    def chat(self, messages: List[Dict], tools: List[Dict] = None) -> str:
        """Send chat completion request to Hermes"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048
        }
        
        if tools:
            payload["tools"] = tools
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"Hermes API error: {response.status_code} - {response.text}")
            
        return response.json()["choices"][0]["message"]
    
    def analyze_market(self, market_data: Dict, portfolio: Dict) -> Dict:
        """Analyze market and return trading decision"""
        system_prompt = """You are an expert crypto trading agent. Analyze the market data and portfolio, 
        then decide on a trade. Return JSON with: action (buy/sell/hold), asset, amount, reasoning."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Market data: {json.dumps(market_data)}\nPortfolio: {json.dumps(portfolio)}"}
        ]
        
        response = self.chat(messages)
        return json.loads(response["content"])
    
    def validate_trade(self, trade: Dict, risk_params: Dict) -> Dict:
        """Validate if a trade is within risk parameters"""
        system_prompt = """Validate this trade against risk parameters. 
        Return JSON: {{"approved": bool, "reason": string, "adjusted_amount": float}}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Trade: {json.dumps(trade)}\nRisk params: {json.dumps(risk_params)}"}
        ]
        
        response = self.chat(messages)
        return json.loads(response["content"])
