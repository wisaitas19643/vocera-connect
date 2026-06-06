// TODO: BOTNOI API — Remove this constant when using real API
const MOCK_CALL_DURATION_MS = 3000;

export interface BotnoiCallRequest {
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  contactName: string;
  script: string;
  voiceId: string;
}

export interface BotnoiCallResult {
  callId: string;
  contactId: string;
  status: "confirmed" | "rejected" | "missed" | "pending";
  duration: number;
  timestamp: string;
}

// TODO: BOTNOI API — Replace entire function body with real BOTNOI API call
export async function makeCall(request: BotnoiCallRequest): Promise<BotnoiCallResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rand = Math.random();
      let status: BotnoiCallResult["status"];
      if (rand < 0.5) status = "confirmed";
      else if (rand < 0.7) status = "rejected";
      else if (rand < 0.9) status = "missed";
      else status = "pending";

      resolve({
        callId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        contactId: request.contactId,
        status,
        duration: MOCK_CALL_DURATION_MS,
        timestamp: new Date().toISOString(),
      });
    }, MOCK_CALL_DURATION_MS);
  });
}
