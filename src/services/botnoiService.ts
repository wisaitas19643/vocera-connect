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
}
