async function saveCall(callData) {
  const backendUrl =
    process.env.BACKEND_API_URL || "http://localhost:8000";

  const params = new URLSearchParams({
    call_sid: callData.callSid,
    duration: String(callData.duration || 0),
    transcript: callData.transcript || "",
    outcome: callData.outcome || "completed"
  });

  try {
    const response = await fetch(
      `${backendUrl}/calls/?${params.toString()}`,
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend returned ${response.status} ${response.statusText}`
      );
    }

    const savedCall = await response.json();

    console.log("Call saved to Renovo backend:", callData.callSid);

    return savedCall;
  } catch (error) {
    console.error(
      "Failed to save call to Renovo backend:",
      error.message
    );

    return null;
  }
}

async function saveLead(leadData) {
  const backendUrl =
    process.env.BACKEND_API_URL || "http://localhost:8000";

  const params = new URLSearchParams({
    name: leadData.name,
    contact: leadData.contact,
    call_sid: leadData.callSid,
    quote: String(leadData.quote ?? 0),
    status: leadData.status || "new"
  });

  try {
    const response = await fetch(
      `${backendUrl}/leads/?${params.toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData.jobDetails || {})
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend returned ${response.status} ${response.statusText}`
      );
    }

    const savedLead = await response.json();

    console.log("Lead saved to Renovo backend:", savedLead.lead_id);

    return savedLead;
  } catch (error) {
    console.error(
      "Failed to save lead to Renovo backend:",
      error.message
    );

    return null;
  }
}

module.exports = {
  saveCall,
  saveLead
};

