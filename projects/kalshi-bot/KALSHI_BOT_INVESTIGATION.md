# Kalshi Trading Bot: Technical Requirements & Architecture

**Date:** March 4, 2026  
**Source:** docs.kalshi.com API documentation  
**Status:** Investigation complete

---

## What is Kalshi

Kalshi is a CFTC-regulated event contracts exchange. Users trade "yes/no" contracts on future events—everything from "Will it rain in NYC tomorrow?" to "Will the Fed raise rates by 25bps?" Contracts settle at $1.00 if the event occurs, $0.00 if it doesn't. Prices fluctuate between $0.00-$1.00 (0¢-100¢) based on market-implied probability.

Unlike sports betting, Kalshi is a financial exchange with order books, market makers, and regulated trading hours.

---

## API Architecture Overview

| Component | URL | Purpose |
|-----------|-----|---------|
| **REST API** | `https://api.elections.kalshi.com/trade-api/v2` | Order placement, market data, portfolio |
| **WebSocket** | `wss://api.elections.kalshi.com/trade-api/ws/v2` | Real-time data streaming |
| **Demo** | `*.kalshi.co` (instead of `kalshi.com`) | Paper trading environment |

**API Version:** 3.8.0 (documented)  
**Protocol:** REST + WebSocket  
**Auth:** RSA-PSS signed requests with API keys

---

## Authentication: The Hard Part

Kalshi uses **RSA-PSS request signing**—not simple Bearer tokens. Every request requires:

### Required Headers
```
KALSHI-ACCESS-KEY: <key_id>
KALSHI-ACCESS-TIMESTAMP: <unix_ms>
KALSHI-ACCESS-SIGNATURE: <rsa_pss_signature>
```

### Signature Generation
```
signature = RSA_PSS_SIGN(private_key, timestamp + method + path_without_query)
```

**Example (Python):**
```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64

def sign_pss_text(private_key, text: str) -> str:
    message = text.encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.DIGEST_LENGTH
        ),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

# Usage
msg_string = f"{timestamp}GET/trade-api/v2/portfolio/balance"
sig = sign_pss_text(private_key, msg_string)
```

**Key Generation:** Users generate RSA key pairs in the Kalshi web UI. Private key is shown once—Kalshi doesn't store it.

---

## Rate Limits

| Endpoint Type | Limit | Notes |
|---------------|-------|-------|
| **Public endpoints** | 200 req/min | No auth required |
| **Auth-required GET** | 200 req/min | Portfolio, orders, fills |
| **Non-GET (POST/PUT)** | 400 req/min | Order placement, cancellations |
| **Create order** | 200 req/min | Per-account limit |
| **Cancel order** | 400 req/min | Per-account limit |
| **WebSocket** | 1 conn/account | Reconnection backoff required |

**429 Response:** `{"message": "Rate limit exceeded", "seconds_to_reset": 21}`

---

## Core Trading Endpoints

### Market Data (Public)
```
GET /markets                    # List all markets (100-1000 per page)
GET /markets/{ticker}           # Single market details
GET /markets/{ticker}/candlesticks  # OHLC data (1min, 1hr, 1day)
GET /events                     # Event metadata
GET /series                     # Event series
```

**Market Object Key Fields:**
```json
{
  "ticker": "KXHARRIS24-LSV",
  "event_ticker": "KXHARRIS24",
  "market_type": "binary",           // or "scalar"
  "status": "open",                  // unopened, open, closed, settled
  "yes_bid_dollars": "0.5600",       // Best YES bid ($0.56)
  "yes_ask_dollars": "0.5800",       // Best YES ask ($0.58)
  "no_bid_dollars": "0.4200",        // Best NO bid
  "no_ask_dollars": "0.4400",        // Best NO ask
  "last_price_dollars": "0.5700",
  "volume_24h_fp": "1500.00",
  "open_interest_fp": "2500.00",
  "notional_value_dollars": "1.0000", // Contract settles at $1
  "close_time": "2024-11-05T23:59:00Z",
  "rules_primary": "This market resolves to YES if..."
}
```

### Portfolio & Orders (Authenticated)
```
GET  /portfolio/balance          # Account balance
GET  /portfolio/positions         # Open positions
GET  /portfolio/orders            # Active orders (cursor pagination)
GET  /portfolio/fills             # Trade history
POST /portfolio/orders           # Create order
DELETE /portfolio/orders/{id}    # Cancel order
```

### Order Creation
```json
POST /portfolio/orders
{
  "ticker": "KXHARRIS24-LSV",
  "side": "yes",                    // "yes" or "no"
  "type": "limit",                  // "limit" only (no market orders)
  "count": 10.00,                   // Contracts to buy (fixed-point, 2 decimals)
  "price": 0.5600,                  // Price in dollars (0.01-0.99)
  "client_order_id": "my-strat-001"  // Optional, for tracking
}
```

**Important:** Kalshi is **limit-order only**. No market orders. Prices in $0.01 increments (1¢ ticks).

---

## WebSocket Streaming

WebSocket provides real-time data without polling. Essential for low-latency bots.

### Connection
```python
import websockets

ws_url = "wss://api.elections.kalshi.com/trade-api/ws/v2"
headers = {
    "KALSHI-ACCESS-KEY": key_id,
    "KALSHI-ACCESS-SIGNATURE": signature,
    "KALSHI-ACCESS-TIMESTAMP": timestamp
}

async with websockets.connect(ws_url, additional_headers=headers) as ws:
    # Subscribe to channels
    await ws.send(json.dumps({
        "id": 1,
        "cmd": "subscribe",
        "params": {
            "channels": ["orderbook_delta"],
            "market_tickers": ["KXHARRIS24-LSV"]
        }
    }))
```

### Available Channels
| Channel | Auth Required | Description |
|---------|---------------|-------------|
| `ticker` | No | All market price updates |
| `trade` | No | Public trade feed |
| `orderbook_delta` | Yes | Order book changes for subscribed markets |
| `fill` | Yes | Your fills in real-time |
| `market_positions` | Yes | Your position updates |
| `market_lifecycle_v2` | No | Market open/close/settle events |
| `order_group_updates` | Yes | Complex order status |

**Message Format:**
```json
{
  "type": "orderbook_delta",
  "msg": {
    "market_ticker": "KXHARRIS24-LSV",
    "yes_bid": 0.56,
    "yes_ask": 0.58,
    // ... delta fields
    "client_order_id": "optional"  // Only if you caused the change
  }
}
```

---

## Bot Architecture Components

### 1. Authentication Manager
- Load RSA private key from secure storage
- Generate signed headers for each request
- Handle timestamp synchronization

### 2. Rate Limiter
- Track 200/400 req/min buckets
- Implement token bucket algorithm
- Queue requests when limits approached

### 3. Market Data Cache
- WebSocket connection for real-time updates
- REST fallback for historical data
- Candlestick aggregation (1min, 1hr, 1day)

### 4. Order Manager
- Order creation with client_order_id tracking
- Cancel/replace logic
- Fill confirmation via WebSocket
- Position reconciliation

### 5. Strategy Engine
- Signal generation from market data
- Risk management (position sizing, max exposure)
- Order book analysis (spread, depth)

### 6. Execution Engine
- Limit order placement
- Smart order routing (best bid/ask)
- Partial fill handling
- Retry logic with exponential backoff

---

## Technical Implementation Stack

### Recommended (Python)
```python
# Core dependencies
websockets          # WebSocket client (async)
cryptography        # RSA-PSS signing
aiohttp             # Async HTTP client
pandas              # Data analysis
numpy               # Numerical ops

# Optional
redis               # State/cache storage
sqlalchemy          # Trade logging
typer               # CLI interface
structlog           # Structured logging
```

### Alternative (Node.js)
```javascript
// Core dependencies
ws                  // WebSocket client
crypto              // Native RSA signing
axios               # HTTP client
```

### Example Bot Skeleton (Python)
```python
import asyncio
import websockets
import aiohttp
from cryptography.hazmat.primitives import serialization

class KalshiBot:
    def __init__(self, key_id: str, private_key_path: str):
        self.key_id = key_id
        with open(private_key_path, 'rb') as f:
            self.private_key = serialization.load_pem_private_key(f.read(), password=None)
        self.ws = None
        self.session = None
    
    def _sign_request(self, method: str, path: str) -> dict:
        timestamp = str(int(time.time() * 1000))
        msg = f"{timestamp}{method}{path.split('?')[0]}"
        # ... RSA-PSS signing ...
        return {
            "KALSHI-ACCESS-KEY": self.key_id,
            "KALSHI-ACCESS-SIGNATURE": signature,
            "KALSHI-ACCESS-TIMESTAMP": timestamp
        }
    
    async def connect_websocket(self):
        headers = self._sign_request("GET", "/trade-api/ws/v2")
        self.ws = await websockets.connect(
            "wss://api.elections.kalshi.com/trade-api/ws/v2",
            additional_headers=headers
        )
    
    async def place_order(self, ticker: str, side: str, count: float, price: float):
        path = "/trade-api/v2/portfolio/orders"
        headers = self._sign_request("POST", path)
        async with self.session.post(
            f"https://api.elections.kalshi.com{path}",
            headers=headers,
            json={"ticker": ticker, "side": side, "count": count, "price": price, "type": "limit"}
        ) as resp:
            return await resp.json()
```

---

## Regulatory & Practical Considerations

### CFTC Compliance
- Kalshi is CFTC-regulated (unlike offshore prediction markets)
- Position limits may apply to certain markets
- Market manipulation rules are enforced
- All trades are reported to regulators

### Trading Hours
- Markets have defined open/close times
- Some markets pause during high volatility
- Settlement can take hours after event resolution

### Fees
- Trading fees: ~0.5% per contract (check current schedule)
- No subscription fees for API access

### Risk Management
- **Max loss:** Contract value (1 contract = $1 max loss)
- **Margin:** Fully collateralized (no leverage)
- **Settlement delay:** Hours to days after event

---

## What It Takes: Implementation Checklist

### Phase 1: Infrastructure (1-2 days)
- [ ] RSA key generation and secure storage
- [ ] Request signing implementation
- [ ] Rate limiter (token bucket)
- [ ] Basic REST client with auth

### Phase 2: Market Data (1-2 days)
- [ ] WebSocket connection manager
- [ ] Order book reconstruction from deltas
- [ ] Market metadata caching
- [ ] Candlestick aggregation

### Phase 3: Trading Engine (2-3 days)
- [ ] Order placement with tracking
- [ ] Cancel/replace logic
- [ ] Fill notification handling
- [ ] Position reconciliation

### Phase 4: Strategy (varies)
- [ ] Signal generation logic
- [ ] Risk management (sizing, exposure limits)
- [ ] Backtesting framework (using historical API)
- [ ] Performance analytics

### Phase 5: Production (1-2 days)
- [ ] Demo environment testing
- [ ] Logging and monitoring
- [ ] Error handling and recovery
- [ ] Paper trading validation

---

## Estimated Time to MVP

| Scenario | Timeline | Notes |
|----------|----------|-------|
| **Simple market maker** | 3-5 days | Quote at bid/ask spread, no complex signals |
| **Trend-following bot** | 1-2 weeks | Technical indicators, basic risk management |
| **Arbitrage scanner** | 2-3 weeks | Cross-market analysis, execution timing |
| **ML prediction model** | 1-2 months | Feature engineering, model training, deployment |

---

## Key Challenges

1. **RSA signing complexity** — More involved than typical API keys
2. **Limit-order only** — No instant execution; must manage order book placement
3. **Low liquidity on niche markets** — Wide spreads, slow fills
4. **Settlement delays** — Tied up capital for hours/days
5. **WebSocket reliability** — Must handle reconnections gracefully
6. **CFTC compliance** — Position limits, wash trade rules

---

## Demo Environment

Kalshi provides a **demo environment** for testing:
- URL: `demo-api.kalshi.co` (REST), `demo-api.kalshi.co/trade-api/ws/v2` (WebSocket)
- No real money; play money balance
- Same API contract as production
- **Recommendation:** Build and test entirely in demo before touching production

---

## Summary

Building a Kalshi trading bot is **technically feasible but non-trivial**. The main friction points are:

1. **RSA-PSS authentication** — Requires cryptographic library integration
2. **Real-time data handling** — WebSocket management with reconnection logic
3. **Limit-order complexity** — No market orders; must optimize for fill probability
4. **Regulatory awareness** — CFTC-regulated exchange with compliance requirements

**Bottom line:** A functional bot is achievable in 1-2 weeks for an experienced developer. Production-ready with risk management and monitoring: 1-2 months.

---

## References

- **API Docs:** https://docs.kalshi.com
- **OpenAPI Spec:** https://docs.kalshi.com/openapi.yaml
- **LLM-Optimized Docs:** https://docs.kalshi.com/llms.txt
- **Demo Environment:** https://kalshi.com (create demo account)
- **Regulatory:** CFTC regulated; see Kalshi.com/compliance
