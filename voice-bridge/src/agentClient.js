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

module.exports = {
  sendToAgent,
  endAgentSession
};
