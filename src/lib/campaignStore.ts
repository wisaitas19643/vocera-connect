// campaignStore.ts — ตู้เก็บข้อมูลแคมเปญ ใช้ localStorage เก็บข้อมูลถาวรใน browser

import type { Campaign } from "@/components/vocera/CampaignCard";
import type { RunnerContact } from "@/hooks/useCampaignRunner";

// KEY ที่ใช้เก็บใน localStorage — เหมือนชื่อ "ลิ้นชัก"
const STORAGE_KEY = "vocera_campaigns";

// contacts mock สำหรับแคมเปญเริ่มต้น (3 แคมเปญ hardcoded เดิม)
const defaultContacts: Record<string, RunnerContact[]> = {
  "1": [
    { id: "c1-1", name: "กฤษฎา มานะธรรม",  phone: "081-234-5678" },
    { id: "c1-2", name: "พงศกร รัตนสิริ",   phone: "089-111-2233" },
    { id: "c1-3", name: "ชนากานต์ ใจดี",    phone: "082-555-7788" },
    { id: "c1-4", name: "อรทัย ศรีสุข",     phone: "086-222-3344" },
    { id: "c1-5", name: "ธนกร สุขเกษม",     phone: "084-987-6543" },
    { id: "c1-6", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211" },
  ],
  "2": [
    { id: "c2-1", name: "วิภาวี ตั้งใจ",       phone: "088-321-9988" },
    { id: "c2-2", name: "เกียรติศักดิ์ พรชัย", phone: "085-654-3210" },
    { id: "c2-3", name: "สมชาย ใจกล้า",        phone: "083-444-5566" },
    { id: "c2-4", name: "อาทิตย์ ส่องแสง",     phone: "082-101-2020" },
  ],
  "3": [
    { id: "c3-1", name: "ปวีณา วงศ์วิทย์",  phone: "081-998-1122" },
    { id: "c3-2", name: "ธนกร สุขเกษม",     phone: "084-987-6543" },
    { id: "c3-3", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211" },
    { id: "c3-4", name: "สมหมาย ดีใจ",      phone: "090-123-4567" },
    { id: "c3-5", name: "รัตนา สดใส",       phone: "091-234-5678" },
  ],
};

// แคมเปญเริ่มต้น — ใช้ seed ครั้งแรกที่เปิดแอป
const defaultCampaigns: Campaign[] = [
  { id: "1", name: "ประชุมผู้ถือหุ้น ประจำปี 2026", date: "12/04/2026", time: "10:45", total: 300,  confirmed: 180, percent: 75,    status: "กำลังดำเนินงาน", contacts: defaultContacts["1"] },
  { id: "2", name: "อบรมพนักงานใหม่ รุ่นที่ 12",    date: "13/04/2026", time: "11:00", total: 125,  confirmed: 90,  percent: 80,    status: "กำลังดำเนินงาน", contacts: defaultContacts["2"] },
  { id: "3", name: "สัมมนาเทคโนโลยี AI",            date: "12/04/2026", time: "10:45", total: 1000, confirmed: 250, percent: 39.52, status: "กำลังดำเนินงาน", contacts: defaultContacts["3"] },
];

// อ่าน campaigns ทั้งหมดจาก localStorage
// ถ้ายังไม่มีข้อมูล (ครั้งแรก) → ใส่ค่า default แล้ว return
export function getAll(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // ครั้งแรกที่เปิดแอป — seed ข้อมูลเริ่มต้นลง localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCampaigns));
      return defaultCampaigns;
    }
    // JSON.parse แปลง string กลับเป็น array of objects
    return JSON.parse(raw) as Campaign[];
  } catch {
    // ถ้า parse ไม่ได้ (data เสีย) → return default
    return defaultCampaigns;
  }
}

// เพิ่มแคมเปญใหม่เข้าไปใน localStorage
export function add(campaign: Campaign): void {
  const current = getAll();
  // รวม array เดิม + campaign ใหม่
  const updated = [...current, campaign];
  // JSON.stringify แปลง array เป็น string เพื่อเก็บใน localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// สร้าง ID ใหม่ที่ไม่ซ้ำกัน โดยใช้ timestamp + random string
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
