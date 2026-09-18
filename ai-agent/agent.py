import os

from anthropic import AsyncAnthropic
from fastapi import FastAPI
from pydantic import BaseModel

import conversation_manager as convo
from prompts import SYSTEM_PROMPT
from tools import TOOL_HANDLERS, TOOLS

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

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


async def run_turn(call_sid: str, user_text: str) -> MessageOut:
    convo.append_message(call_sid, "user", user_text)

    while True:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=convo.get_messages(call_sid),
        )

        if response.stop_reason != "tool_use":
            reply_text = "".join(
                block.text for block in response.content if block.type == "text"
            )
            convo.append_message(call_sid, "assistant", response.content)
            session = convo.get_session(call_sid)
            return MessageOut(
                reply=reply_text,
                factors=session["factors"],
                quote=session["quote"],
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
    """
    One turn of the conversation: caller's transcribed text in, Claude's
    reply text out (to be spoken back via TTS), plus the factors/quote
    collected so far for this call_sid.
    """
    return await run_turn(payload.call_sid, payload.text)


@app.post("/agent/end/{call_sid}", tags=["Agent"])
def end_call(call_sid: str):
    convo.end_session(call_sid)
    return {"status": "ended", "call_sid": call_sid}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
