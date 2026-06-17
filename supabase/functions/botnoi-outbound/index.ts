import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOTNOI_VB = "https://api-voice.botnoi.ai/api/voicebot";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CallRequest {
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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+66" + digits.slice(1);
  if (digits.startsWith("66")) return "+" + digits;
  return digits;
}

function botnoiHeaders(apiKey: string) {
  return {
    "botnoi-token": apiKey,
    "Content-Type": "application/json",
    "accept": "application/json",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const botnoiApiKey = Deno.env.get("BOTNOI_API_KEY");
    if (!botnoiApiKey) {
      return new Response(
        JSON.stringify({ error: "BOTNOI_API_KEY secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ใช้ API key จาก user_settings ถ้ามี ไม่งั้นใช้ secret
    const { data: settings } = await supabase
      .from("user_settings")
      .select("api_key")
      .eq("user_id", user.id)
      .single();

    const apiKey = (settings?.api_key as string | null) || botnoiApiKey;

    const body = await req.json() as CallRequest;
    const phone = normalizePhone(body.phoneNumber);

    const greeting = body.script?.trim() ||
      "สวัสดีครับ นี่คือระบบแจ้งเตือนอัตโนมัติจาก Ringo โทรมาเพื่อยืนยันการเข้าร่วมงานของคุณ คุณสะดวกไปร่วมงานไหมครับ";

    const confirmMsg = body.confirmMessage?.trim() ||
      "ขอบคุณมากครับ ได้รับการยืนยันเรียบร้อยแล้ว แล้วพบกันในงานครับ สวัสดีครับ";

    const declineMsg = body.declineMessage?.trim() ||
      "รับทราบครับ ขอบคุณที่แจ้งให้ทราบ หากเปลี่ยนใจสามารถติดต่อกลับได้เลยครับ สวัสดีครับ";

    const fallbackMsg = body.fallbackMessage?.trim() ||
      "ขออภัยด้วยครับ เดี๋ยวจะติดต่อกลับใหม่อีกครั้งนะครับ ขอบคุณครับ สวัสดีครับ";

    // Step 1: Create template
    const tmplRes = await fetch(`${BOTNOI_VB}/confirm/create_template`, {
      method: "POST",
      headers: botnoiHeaders(apiKey),
      body: JSON.stringify({
        message:          greeting,
        confirm_message:  confirmMsg,
        decline_message:  declineMsg,
        fallback_message: fallbackMsg,
        org_name:         body.campaignId === "manual" ? "Ringo" : body.campaignId,
        speaker_id:       body.voiceId || "5",
      }),
    });

    const tmplData = await tmplRes.json() as Record<string, unknown>;
    if (!tmplRes.ok) {
      return new Response(
        JSON.stringify({ error: `สร้าง template ไม่สำเร็จ: ${JSON.stringify(tmplData)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const templateId = String(tmplData.template_id);

    // รอ 2 วินาที ให้ BOTNOI สร้าง TTS เสร็จก่อนโทร
    await new Promise((r) => setTimeout(r, 2000));

    // Step 2: Make the call
    const callRes = await fetch(`${BOTNOI_VB}/confirm/call`, {
      method: "POST",
      headers: botnoiHeaders(apiKey),
      body: JSON.stringify({
        "Tel. Number":      phone,
        "Appointment Date": "-",
        "Appointment Time": "-",
        "template_id":      templateId,
      }),
    });

    const callData = await callRes.json() as Record<string, unknown>;
    if (!callRes.ok) {
      return new Response(
        JSON.stringify({ error: `โทรไม่สำเร็จ: ${JSON.stringify(callData)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        callId:    String(callData.outbound_id ?? `call-${Date.now()}`),
        contactId: body.contactId,
        status:    "pending",
        duration:  0,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
