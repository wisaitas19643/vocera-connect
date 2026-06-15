import { supabase } from "@/lib/supabase";
<<<<<<< HEAD
import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import type { Campaign } from "@/components/vocera/CampaignCard";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

// Mirrors the new Supabase schema column names exactly
type DbContactRow = {
  id: string;
  full_name: string;
  phone: string;
  call_status: string;
};

type DbRow = {
  id: string;
  name: string;
  status: string;
  scheduled_start: string | null;
  total_contacts: number;
  completed_calls: number;
  contacts?: DbContactRow[];
};

// Splits a TIMESTAMPTZ string into the "dd/MM/yyyy" + "HH:mm" strings the app layer expects
function parseScheduledStart(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

// Combines "dd/MM/yyyy" + "HH:mm" back into an ISO string for the DB
function toScheduledStart(date: string, time: string): string | null {
  if (!date && !time) return null;
  const [day, month, year] = date.split("/").map(Number);
  const [hours, minutes] = (time || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function toApp(row: DbRow): Campaign {
  const { date, time } = parseScheduledStart(row.scheduled_start);
=======
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import type { Campaign } from "@/components/vocera/CampaignCard";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

// CampaignRow = DB row ของ campaigns + contacts ที่ join มาด้วย
type CampaignRow = Tables<"campaigns"> & {
  contacts?: Tables<"contacts">[];
};

// toApp — แปลง DB row → Campaign object ที่ UI ใช้
// DB:  { scheduled_start, total_contacts, completed_calls, full_name }
// UI:  { date, time, total, confirmed, percent, name }
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

>>>>>>> TN-Ford
  return {
    id: row.id,
    name: row.name,
    date,
    time,
<<<<<<< HEAD
    total: row.total_contacts ?? 0,
    confirmed: row.completed_calls ?? 0,
    percent: row.total_contacts
      ? Math.round((row.completed_calls / row.total_contacts) * 100)
      : 0,
    status: row.status,
=======
    total,
    confirmed,
    percent,
    status: row.status,
    script: row.script ?? undefined,
    voice_id: row.voice_id ?? undefined,
>>>>>>> TN-Ford
    contacts: (row.contacts ?? []).map((c) => ({
      id: c.id,
      name: c.full_name,
      phone: c.phone,
    })),
  };
}

// parseDateTimeToISO — แปลง "15/06/2026" + "09:00" → ISO timestamp
// คืน null ถ้าข้อมูลไม่ครบหรือผิดรูปแบบ
function parseDateTimeToISO(date: string, time: string): string | null {
  if (!date || date === "-" || !time) return null;
  const [dd, mm, yyyy] = date.split("/");
  if (!dd || !mm || !yyyy) return null;
  const iso = new Date(`${yyyy}-${mm}-${dd}T${time}`).toISOString();
  return iso;
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

<<<<<<< HEAD
export async function add(campaign: Campaign): Promise<void> {
=======
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
>>>>>>> TN-Ford
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insert: TablesInsert<"campaigns"> = {
    user_id: user.id,
<<<<<<< HEAD
    name: campaign.name,
    status: campaign.status ?? "draft",
    scheduled_start: toScheduledStart(campaign.date, campaign.time),
    // total_contacts and completed_calls start at 0 (DB default);
    // the sync triggers keep them up to date automatically
=======
    name: payload.name,
    status: "draft",
    scheduled_start: parseDateTimeToISO(payload.date, payload.time),
    script: payload.script,
    voice_id: payload.voice_id,
    voice_speed: payload.voice_speed,
    max_retries: payload.max_retries,
    total_contacts: payload.contacts.length,
>>>>>>> TN-Ford
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

<<<<<<< HEAD
  const newId = data.id;
  if (campaign.contacts && campaign.contacts.length > 0) {
    const { error: contactsError } = await supabase.from("contacts").insert(
      campaign.contacts.map((c) => ({
=======
  const newId = (data as Tables<"campaigns">).id;
  if (payload.contacts.length > 0) {
    await supabase.from("contacts").insert(
      payload.contacts.map((c): TablesInsert<"contacts"> => ({
>>>>>>> TN-Ford
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
<<<<<<< HEAD
    const { error } = await supabase.from("contacts").insert(
      contacts.map((c) => ({
=======
    await supabase.from("contacts").insert(
      contacts.map((c): TablesInsert<"contacts"> => ({
>>>>>>> TN-Ford
        campaign_id: id,
        full_name: c.name,
        phone: c.phone,
      })),
    );
    if (error) throw error;
  }
<<<<<<< HEAD
  // total_contacts is maintained by the sync trigger — no manual update needed
=======
  const update: TablesUpdate<"campaigns"> = { total_contacts: contacts.length };
  await supabase.from("campaigns").update(update).eq("id", id);
>>>>>>> TN-Ford
}

export async function update(
  id: string,
  fields: Partial<Pick<Campaign, "name" | "date" | "time" | "status">>,
): Promise<void> {
<<<<<<< HEAD
  const dbFields: TablesUpdate<"campaigns"> = {};

  if (fields.name !== undefined) dbFields.name = fields.name;
  if (fields.status !== undefined) dbFields.status = fields.status;

  if (fields.date !== undefined || fields.time !== undefined) {
    // Fetch the current scheduled_start so we don't lose whichever half wasn't changed
    const { data } = await supabase
      .from("campaigns")
      .select("scheduled_start")
      .eq("id", id)
      .single();
    const current = parseScheduledStart(data?.scheduled_start ?? null);
    dbFields.scheduled_start = toScheduledStart(
      fields.date ?? current.date,
      fields.time ?? current.time,
    );
  }

  const { error } = await supabase.from("campaigns").update(dbFields).eq("id", id);
=======
  const dbUpdate: TablesUpdate<"campaigns"> = {};

  if (fields.name !== undefined) dbUpdate.name = fields.name;
  if (fields.status !== undefined) dbUpdate.status = fields.status;

  // date + time ต้องมาคู่กันถึงจะ parse เป็น scheduled_start ได้
  if (fields.date !== undefined || fields.time !== undefined) {
    const iso = parseDateTimeToISO(fields.date ?? "", fields.time ?? "");
    if (iso) dbUpdate.scheduled_start = iso;
  }

  const { error } = await supabase.from("campaigns").update(dbUpdate).eq("id", id);
>>>>>>> TN-Ford
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
