async function sendToAgent(callSid, text) {
  const agentUrl =
    process.env.AI_AGENT_URL || "http://localhost:8002";

  try {
    const response = await fetch(`${agentUrl}/agent/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ call_sid: callSid, text })
    });

    if (!response.ok) {
      throw new Error(
        `Agent returned ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to reach AI agent:", error.message);

    return {
      reply:
        "Sorry, I'm having trouble right now. Please try calling back shortly.",
      factors: {},
      quote: null
    };
  }
}

function endAgentSession(callSid) {
  const agentUrl =
    process.env.AI_AGENT_URL || "http://localhost:8002";

  return fetch(`${agentUrl}/agent/end/${callSid}`, { method: "POST" }).catch(
    (error) => {
      console.error("Failed to end AI agent session:", error.message);
    }
  );
}

const AGENT_FAILURE_REPLY =
  "Sorry, I'm having trouble right now. Please try calling back shortly.";

// Streams the agent's reply: onText(chunk) is called as Claude writes, so
// speech can start before the full reply exists. Resolves with the same
// shape as sendToAgent once the turn is done.
async function streamFromAgent(callSid, text, onText) {
  const agentUrl =
    process.env.AI_AGENT_URL || "http://localhost:8002";
  let reply = "";

  try {
    const response = await fetch(`${agentUrl}/agent/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ call_sid: callSid, text })
    });

    if (!response.ok) {
      throw new Error(
        `Agent returned ${response.status} ${response.statusText}`
      );
    }

    const decoder = new TextDecoder();
    let buffered = "";

    for await (const chunk of response.body) {
      buffered += decoder.decode(chunk, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        if (event.type === "text") {
          reply += event.text;
          onText(event.text);
        } else if (event.type === "done") {
          return {
            reply: reply.trim(),
            factors: event.factors,
            quote: event.quote,
            end_call: event.end_call
          };
        }
      }
    }

    throw new Error("Agent stream ended without a final event");
  } catch (error) {
    console.error("Failed to stream from AI agent:", error.message);

    // Only apologise if nothing has been said yet this turn.
    if (!reply) {
      onText(AGENT_FAILURE_REPLY);
    }

    return {
      reply: reply || AGENT_FAILURE_REPLY,
      factors: {},
      quote: null
    };
  }
}

module.exports = {
  sendToAgent,
  streamFromAgent,
  endAgentSession
};
