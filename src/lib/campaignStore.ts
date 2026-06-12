import { supabase } from "@/lib/supabase";
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
  return {
    id: row.id,
    name: row.name,
    date,
    time,
    total: row.total_contacts ?? 0,
    confirmed: row.completed_calls ?? 0,
    percent: row.total_contacts
      ? Math.round((row.completed_calls / row.total_contacts) * 100)
      : 0,
    status: row.status,
    contacts: (row.contacts ?? []).map((c) => ({
      id: c.id,
      name: c.full_name,
      phone: c.phone,
    })),
  };
}

export async function getAll(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, contacts(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbRow[]).map(toApp);
}

export async function getById(id: string): Promise<Campaign | undefined> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, contacts(*)")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return toApp(data as DbRow);
}

export async function add(campaign: Campaign): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insert: TablesInsert<"campaigns"> = {
    user_id: user.id,
    name: campaign.name,
    status: campaign.status ?? "draft",
    scheduled_start: toScheduledStart(campaign.date, campaign.time),
    // total_contacts and completed_calls start at 0 (DB default);
    // the sync triggers keep them up to date automatically
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  const newId = data.id;
  if (campaign.contacts && campaign.contacts.length > 0) {
    const { error: contactsError } = await supabase.from("contacts").insert(
      campaign.contacts.map((c) => ({
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
      contacts.map((c) => ({
        campaign_id: id,
        full_name: c.name,
        phone: c.phone,
      })),
    );
    if (error) throw error;
  }
  // total_contacts is maintained by the sync trigger — no manual update needed
}

export async function update(
  id: string,
  fields: Partial<Pick<Campaign, "name" | "date" | "time" | "status">>,
): Promise<void> {
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
  if (error) throw error;
}

export async function remove(id: string): Promise<void> {
  // contacts are deleted automatically via ON DELETE CASCADE
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
