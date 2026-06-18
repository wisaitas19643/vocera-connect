import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOTNOI_API_KEY = Deno.env.get("BOTNOI_API_KEY") ?? "";
const BOTNOI_BASE = "https://api-voice.botnoi.ai/api/voicebot";


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { phoneNumber, script, voiceId, campaignId } = await req.json();

    if (!phoneNumber || !script) {
      return json({ error: "phoneNumber and script are required" }, 400);
    }

    // ดึง event date/time จาก campaign ใน Supabase
    let eventDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");
    let eventTime = "00:00";
    let confirmMessage = "ขอบคุณค่ะ ยืนยันเรียบร้อยแล้วค่ะ";
    let declineMessage = "ขอบคุณค่ะ รับทราบค่ะ";
    let fallbackMessage = "ขอบคุณค่ะ";
    let orgName = "Ringo";

    if (campaignId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: camp } = await supabase
        .from("campaigns")
        .select("scheduled_start, user_id")
        .eq("id", campaignId)
        .single();

      if (camp?.scheduled_start) {
        const d = new Date(camp.scheduled_start);
        eventDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        eventTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      }

      if (camp?.user_id) {
        const [{ data: settings }, { data: profile }] = await Promise.all([
          supabase
            .from("user_settings")
            .select("confirm_response, reject_response, unclear_response")
            .eq("user_id", camp.user_id)
            .single(),
          supabase
            .from("profiles")
            .select("org_name")
            .eq("id", camp.user_id)
            .single(),
        ]);

        if (settings?.confirm_response) confirmMessage = settings.confirm_response;
        if (settings?.reject_response) declineMessage = settings.reject_response;
        if (settings?.unclear_response) fallbackMessage = settings.unclear_response;
        if (profile?.org_name) orgName = profile.org_name;
      }
    }

    const speakerId = voiceId ?? "41";

    // ── Step 1: สร้าง Template ──
    const tplRes = await fetch(`${BOTNOI_BASE}/confirm/create_template`, {
      method: "POST",
      headers: { "botnoi-token": BOTNOI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: script,
        confirm_message: confirmMessage,
        decline_message: declineMessage,
        fallback_message: fallbackMessage,
        org_name: orgName,
        speaker_id: speakerId,
      }),
    });

    if (!tplRes.ok) {
      const err = await tplRes.text();
      console.error("create_template failed:", err);
      return json({ error: `Template error: ${err}` }, 500);
    }

    const { template_id } = await tplRes.json();

    // รอให้ BOTNOI สร้างเสียง TTS เสร็จก่อนโทร
    await new Promise((r) => setTimeout(r, 2000));

    // ── Step 2: ส่งสาย ──
    const callRes = await fetch(`${BOTNOI_BASE}/confirm/call`, {
      method: "POST",
      headers: { "botnoi-token": BOTNOI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        "Tel. Number": phoneNumber,
        "Appointment Date": eventDate,
        "Appointment Time": eventTime,
        template_id,
      }),
    });

    if (!callRes.ok) {
      const err = await callRes.text();
      console.error("confirm/call failed:", err);
      return json({ error: `Call error: ${err}` }, 500);
    }

    const callData = await callRes.json();
    return json({ outbound_id: callData.outbound_id, template_id });

  } catch (e) {
    console.error("Edge function error:", e);
    return json({ error: String(e) }, 500);
  }
});
