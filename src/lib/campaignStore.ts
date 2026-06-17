import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import type { Campaign } from "@/components/vocera/CampaignCard";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

// CampaignRow = DB row ของ campaigns + contacts ที่ join มาด้วย
type CampaignRow = Tables<"campaigns"> & {
  contacts?: Tables<"contacts">[];
};

// toApp — แปลง DB row → Campaign object ที่ UI ใช้
function toApp(row: CampaignRow): Campaign {
  let date = "-";
  let time = "-";
  if (row.scheduled_start) {
    const d = new Date(row.scheduled_start);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    date = `${dd}/${mm}/${yyyy}`;
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    time = `${hh}:${min}`;
  }

  const total = row.total_contacts;
  const confirmed = row.completed_calls;
  const percent = total > 0 ? parseFloat(((confirmed / total) * 100).toFixed(1)) : 0;

  return {
    id: row.id,
    name: row.name,
    date,
    time,
    total,
    confirmed,
    percent,
    status: row.status,
    script: row.script ?? undefined,
    voice_id: row.voice_id ?? undefined,
    contacts: (row.contacts ?? []).map((c) => ({
      id: c.id,
      name: c.full_name,
      phone: c.phone,
    })),
  };
}

// parseDateTimeToISO — แปลง "15/06/2026" + "09:00" → ISO timestamp
function parseDateTimeToISO(date: string, time: string): string | null {
  if (!date || date === "-" || !time) return null;
  const [dd, mm, yyyy] = date.split("/");
  if (!dd || !mm || !yyyy) return null;
  return new Date(`${yyyy}-${mm}-${dd}T${time}`).toISOString();
}

export async function getAll(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, contacts(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CampaignRow[]).map(toApp);
}

export async function getById(id: string): Promise<Campaign | undefined> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, contacts(*)")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return toApp(data as CampaignRow);
}

export type CreateCampaignPayload = {
  name: string;
  date: string;
  time: string;
  contacts: RunnerContact[];
  script: string;
  voice_id: string;
  voice_speed: number;
  max_retries: number;
};

export async function add(payload: CreateCampaignPayload): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ไม่ได้ล็อกอิน กรุณาเข้าสู่ระบบใหม่");

  const insert: TablesInsert<"campaigns"> = {
    user_id: user.id,
    name: payload.name,
    status: "draft",
    scheduled_start: parseDateTimeToISO(payload.date, payload.time),
    script: payload.script,
    voice_id: payload.voice_id,
    voice_speed: payload.voice_speed,
    max_retries: payload.max_retries,
    total_contacts: payload.contacts.length,
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  const newId = (data as Tables<"campaigns">).id;
  if (payload.contacts.length > 0) {
    const { error: contactsError } = await supabase.from("contacts").insert(
      payload.contacts.map((c): TablesInsert<"contacts"> => ({
        campaign_id: newId,
        full_name: c.name,
        phone: c.phone,
      })),
    );
    if (contactsError) throw contactsError;
  }
}

export async function updateContacts(id: string, contacts: RunnerContact[]): Promise<void> {
  await supabase.from("contacts").delete().eq("campaign_id", id);
  if (contacts.length > 0) {
    const { error } = await supabase.from("contacts").insert(
      contacts.map((c): TablesInsert<"contacts"> => ({
        campaign_id: id,
        full_name: c.name,
        phone: c.phone,
      })),
    );
    if (error) throw error;
  }
  const update: TablesUpdate<"campaigns"> = { total_contacts: contacts.length };
  await supabase.from("campaigns").update(update).eq("id", id);
}

export async function update(
  id: string,
  fields: Partial<Pick<Campaign, "name" | "date" | "time" | "status">>,
): Promise<void> {
  const dbUpdate: TablesUpdate<"campaigns"> = {};

  if (fields.name !== undefined) dbUpdate.name = fields.name;
  if (fields.status !== undefined) dbUpdate.status = fields.status;

  if (fields.date !== undefined || fields.time !== undefined) {
    const iso = parseDateTimeToISO(fields.date ?? "", fields.time ?? "");
    if (iso) dbUpdate.scheduled_start = iso;
  }

  const { error } = await supabase.from("campaigns").update(dbUpdate).eq("id", id);
  if (error) throw error;
}

export async function remove(id: string): Promise<void> {
  // contacts are deleted automatically via ON DELETE CASCADE
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ใช้สร้าง temp id ฝั่ง client — DB จะสร้าง UUID จริงให้เอง
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
