import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/components/vocera/CampaignCard";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

type DbRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  total: number;
  confirmed: number;
  percent: number;
  status: string;
  contacts?: { id: string; name: string; phone: string }[];
};

function toApp(row: DbRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    date: row.date ?? "",
    time: row.time ?? "",
    total: row.total ?? 0,
    confirmed: row.confirmed ?? 0,
    percent: row.percent ?? 0,
    status: row.status ?? "กำลังดำเนินงาน",
    contacts: (row.contacts ?? []).map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
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
  const { contacts, id: _ignored, ...rest } = campaign;
  const { data, error } = await supabase
    .from("campaigns")
    .insert(rest)
    .select()
    .single();
  if (error) throw error;
  const newId = (data as { id: string }).id;
  if (contacts && contacts.length > 0) {
    await supabase.from("contacts").insert(
      contacts.map((c) => ({ campaign_id: newId, name: c.name, phone: c.phone })),
    );
  }
}

export async function updateContacts(id: string, contacts: RunnerContact[]): Promise<void> {
  await supabase.from("contacts").delete().eq("campaign_id", id);
  if (contacts.length > 0) {
    await supabase.from("contacts").insert(
      contacts.map((c) => ({ campaign_id: id, name: c.name, phone: c.phone })),
    );
  }
  await supabase.from("campaigns").update({ total: contacts.length }).eq("id", id);
}

export async function update(
  id: string,
  fields: Partial<Pick<Campaign, "name" | "date" | "time" | "status">>,
): Promise<void> {
  const { error } = await supabase.from("campaigns").update(fields).eq("id", id);
  if (error) throw error;
}

export async function remove(id: string): Promise<void> {
  await supabase.from("contacts").delete().eq("campaign_id", id);
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
