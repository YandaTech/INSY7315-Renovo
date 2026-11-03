// The backend only accepts new calls and leads from a logged-in admin or a
// service presenting the shared SERVICE_API_KEY.
function serviceHeaders(extra = {}) {
  return { "X-Service-Key": process.env.SERVICE_API_KEY || "", ...extra };
}

async function saveCall(callData) {
  const backendUrl =
    process.env.BACKEND_API_URL || "http://localhost:8000";

  // Sent in the body so the transcript never appears in a URL
  const body = {
    call_sid: callData.callSid,
    duration: callData.duration || 0,
    transcript: callData.transcript || "",
    outcome: callData.outcome || "completed"
  };

  try {
    const response = await fetch(`${backendUrl}/calls/`, {
      method: "POST",
      headers: serviceHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body)
    });

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

  // Sent in the body so the caller's name and number never appear in a URL
  const body = {
    name: leadData.name,
    contact: leadData.contact,
    call_sid: leadData.callSid,
    job_details: leadData.jobDetails || {},
    // null means "no quote yet"; never default to R0.
    quote: leadData.quote ?? null,
    status: leadData.status || "new"
  };

  try {
    const response = await fetch(`${backendUrl}/leads/`, {
      method: "POST",
      headers: serviceHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body)
    });

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

