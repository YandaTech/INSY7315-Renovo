# Renovo AI Agent (Haiku branch)

Text-based conversation agent: Claude Haiku collects job factors from the
caller's transcribed speech, calls the `get_quote` tool against
`mcp-pricing-server`, and returns a spoken reply.

Voice pipeline on this branch: Twilio **ConversationRelay** does the
speech-to-text/text-to-speech, so `voice-bridge` only ever sends and receives
plain text over the WebSocket. This agent never touches raw audio.

## Run

```
pip install -e .
export ANTHROPIC_API_KEY=...
export PRICING_SERVER_URL=http://localhost:8001/mcp/pricing   # mcp-pricing-server
python agent.py
```

Serves on `http://localhost:8002`.

## API

`POST /agent/message` `{"call_sid": "...", "text": "caller's utterance"}`
-> `{"reply": "...", "factors": {...}, "quote": {...} | null}`

`POST /agent/end/{call_sid}` clears the in-memory session for that call.

## Files

- `prompts.py` — Renovo system prompt
- `tools.py` — `get_quote` tool schema + handler (calls mcp-pricing-server)
- `conversation_manager.py` — per-call-SID message history, collected
  factors, and last quote
- `agent.py` — Claude Haiku conversation loop + FastAPI HTTP service
