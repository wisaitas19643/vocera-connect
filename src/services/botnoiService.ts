import { supabase } from "@/lib/supabase";

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

export async function makeCall(request: BotnoiCallRequest): Promise<BotnoiCallResult> {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase.functions.invoke("botnoi-outbound", {
    body: {
      phoneNumber: request.phoneNumber,
      script: request.script,
      voiceId: request.voiceId,
      campaignId: request.campaignId,
    },
  });

  if (error || !data?.outbound_id) {
    console.error("BOTNOI call failed:", error ?? data);
    return {
      callId: `error-${Date.now()}`,
      contactId: request.contactId,
      status: "missed",
      duration: 0,
      timestamp,
    };
  }

  return {
    callId: data.outbound_id,
    contactId: request.contactId,
    status: "pending",
    duration: 0,
    timestamp,
  };
}
