import json
import os
import re
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv

# Must run before the local imports below - tools.py reads env at import time.
load_dotenv()

import httpx
from anthropic import AsyncAnthropic
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import conversation_manager as convo
from prompts import build_system_prompt
from tools import PRICING_SERVER_URL, TOOL_HANDLERS, TOOLS, quote_succeeded

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

# TTS reads this aloud, so strip markdown Claude might still slip in.
_MARKDOWN_CHARS = re.compile(r"[*_#`~]")


def strip_markdown_for_speech(text: str) -> str:
    return _MARKDOWN_CHARS.sub("", text)


client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Built at startup from the pricing server's travel zones, so the agent's
# suburb guide matches what staff configured.
system_prompt = build_system_prompt(None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global system_prompt
    try:
        async with httpx.AsyncClient() as http:
            response = await http.get(f"{PRICING_SERVER_URL}/rules", timeout=10.0)
            response.raise_for_status()
            system_prompt = build_system_prompt(response.json())
            print("Loaded travel zones from the pricing server")
    except httpx.HTTPError as exc:
        print(f"Using built-in travel zones; pricing rules unavailable: {exc}")
    yield


app = FastAPI(
    title="Renovo AI Agent",
    description="Claude Haiku conversation loop that collects job factors and quotes calls.",
    version="1.1.0",
    lifespan=lifespan,
)


class MessageIn(BaseModel):
    call_sid: str
    text: str


class MessageOut(BaseModel):
    reply: str
    factors: dict
    quote: dict | None = None
    end_call: bool = False


async def stream_turn(call_sid: str, user_text: str) -> AsyncIterator[dict]:
    """
    Runs one caller turn, yielding {"type": "text", "text": ...} as Claude
    writes the reply (so speech can start straight away), then a final
    {"type": "done", ...} with the collected factors, quote and end_call.
    """
    convo.append_message(call_sid, "user", user_text)
    should_end_call = False
    spoke_already = False

    while True:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=1024,
            system=system_prompt,
            tools=TOOLS,
            messages=convo.get_messages(call_sid),
        ) as stream:
            # Text before and after a tool call arrives in separate requests;
            # keep a space between them so the words don't run together.
            started_this_request = False
            async for text in stream.text_stream:
                text = strip_markdown_for_speech(text)
                if not text:
                    continue
                if spoke_already and not started_this_request:
                    text = " " + text.lstrip()
                started_this_request = True
                spoke_already = True
                yield {"type": "text", "text": text}

            response = await stream.get_final_message()

        convo.append_message(call_sid, "assistant", response.content)

        if response.stop_reason != "tool_use":
            session = convo.get_session(call_sid)
            yield {
                "type": "done",
                "factors": session["factors"],
                "quote": session["quote"],
                "end_call": should_end_call,
            }
            return

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue

            handler = TOOL_HANDLERS[block.name]
            result = await handler(block.input)

            if block.name == "get_quote":
                convo.update_factors(call_sid, block.input)
                # A failed lookup leaves the call unquoted, so no R0 lead or SMS.
                if quote_succeeded(result):
                    convo.set_quote(call_sid, result)
            elif block.name == "end_call":
                should_end_call = True

            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                    "is_error": result.get("status") == "error",
                }
            )

        convo.append_message(call_sid, "user", tool_results)


async def run_turn(call_sid: str, user_text: str) -> MessageOut:
    parts: list[str] = []
    async for event in stream_turn(call_sid, user_text):
        if event["type"] == "text":
            parts.append(event["text"])
        else:
            return MessageOut(
                reply=re.sub(r"\s+", " ", "".join(parts)).strip(),
                factors=event["factors"],
                quote=event["quote"],
                end_call=event["end_call"],
            )


@app.post("/agent/message", response_model=MessageOut, tags=["Agent"])
async def handle_message(payload: MessageIn):
    return await run_turn(payload.call_sid, payload.text)


@app.post("/agent/stream", tags=["Agent"])
async def handle_stream(payload: MessageIn):
    """Same as /agent/message, but streams newline-delimited JSON events."""

    async def events():
        async for event in stream_turn(payload.call_sid, payload.text):
            yield json.dumps(event) + "\n"

    return StreamingResponse(events(), media_type="application/x-ndjson")


@app.post("/agent/end/{call_sid}", tags=["Agent"])
def end_call(call_sid: str):
    convo.end_session(call_sid)
    return {"status": "ended", "call_sid": call_sid}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
