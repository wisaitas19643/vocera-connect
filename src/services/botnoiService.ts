<<<<<<< HEAD
import { supabase } from "@/lib/supabase";

=======
>>>>>>> TN-Boss
export interface BotnoiCallRequest {
  campaignId: string;
  contactId: string;
  phoneNumber: string;
  contactName: string;
  script: string;
  voiceId: string;
  confirmMessage?: string;
  declineMessage?: string;
  fallbackMessage?: string;
}

export interface BotnoiCallResult {
  callId: string;
  contactId: string;
  status: "confirmed" | "rejected" | "missed" | "pending";
  duration: number;
  timestamp: string;
}

export async function makeCall(request: BotnoiCallRequest): Promise<BotnoiCallResult> {
<<<<<<< HEAD
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
=======
  const { supabase } = await import("@/lib/supabase");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("ไม่ได้ล็อกอิน");

  const { data, error } = await supabase.functions.invoke<BotnoiCallResult>(
    "botnoi-outbound",
    {
      body: request,
      headers: { Authorization: `Bearer ${session.access_token}` },
    },
  );

  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่ได้รับข้อมูลจาก Edge Function");

  return data;
>>>>>>> TN-Boss
}
