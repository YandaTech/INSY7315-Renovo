import os
import re

from dotenv import load_dotenv

# Must run before the local imports below - tools.py reads env at import time.
load_dotenv()

from anthropic import AsyncAnthropic
from fastapi import FastAPI
from pydantic import BaseModel

import conversation_manager as convo
from prompts import SYSTEM_PROMPT
from tools import TOOL_HANDLERS, TOOLS

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

# TTS reads this aloud, so strip markdown Claude might still slip in.
_MARKDOWN_CHARS = re.compile(r"[*_#`~]")


def strip_markdown_for_speech(text: str) -> str:
    return re.sub(r"\s+", " ", _MARKDOWN_CHARS.sub("", text)).strip()

client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

app = FastAPI(
    title="Renovo AI Agent",
    description="Claude Haiku conversation loop that collects job factors and quotes calls.",
    version="1.0.0",
)


class MessageIn(BaseModel):
    call_sid: str
    text: str


class MessageOut(BaseModel):
    reply: str
    factors: dict
    quote: dict | None = None
    end_call: bool = False


async def run_turn(call_sid: str, user_text: str) -> MessageOut:
    convo.append_message(call_sid, "user", user_text)
    should_end_call = False
    reply_parts: list[str] = []

    while True:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=convo.get_messages(call_sid),
        )

        # Text can arrive in the same response as a tool_use block (e.g. a
        # goodbye alongside end_call), so collect it from every turn.
        reply_parts.extend(
            block.text for block in response.content if block.type == "text"
        )

        if response.stop_reason != "tool_use":
            convo.append_message(call_sid, "assistant", response.content)
            session = convo.get_session(call_sid)
            return MessageOut(
                reply=strip_markdown_for_speech(" ".join(reply_parts)),
                factors=session["factors"],
                quote=session["quote"],
                end_call=should_end_call,
            )

        convo.append_message(call_sid, "assistant", response.content)

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue

            handler = TOOL_HANDLERS[block.name]
            result = await handler(block.input)

            if block.name == "get_quote":
                convo.update_factors(call_sid, block.input)
                convo.set_quote(call_sid, result)
            elif block.name == "end_call":
                should_end_call = True

            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                }
            )

        convo.append_message(call_sid, "user", tool_results)


@app.post("/agent/message", response_model=MessageOut, tags=["Agent"])
async def handle_message(payload: MessageIn):
    return await run_turn(payload.call_sid, payload.text)


@app.post("/agent/end/{call_sid}", tags=["Agent"])
def end_call(call_sid: str):
    convo.end_session(call_sid)
    return {"status": "ended", "call_sid": call_sid}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
