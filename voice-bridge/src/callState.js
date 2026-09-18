const activeCalls = new Map();

function createCall(callSid, initialData = {}) {
  const call = {
    callSid,
    status: "active",
    startedAt: new Date(),
    ...initialData
  };

  activeCalls.set(callSid, call);

  return call;
}

function getCall(callSid) {
  return activeCalls.get(callSid);
}

function updateCall(callSid, updates = {}) {
  const existingCall = activeCalls.get(callSid);

  if (!existingCall) {
    return null;
  }

  const updatedCall = {
    ...existingCall,
    ...updates
  };

  activeCalls.set(callSid, updatedCall);

  return updatedCall;
}

function removeCall(callSid) {
  return activeCalls.delete(callSid);
}

module.exports = {
  createCall,
  getCall,
  updateCall,
  removeCall
};



