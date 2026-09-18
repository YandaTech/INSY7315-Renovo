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

module.exports = {
  saveCall
};

