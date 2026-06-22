import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  applyNodeChanges,
  type Node,
  type NodeChange,
  type NodeProps,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2, Save, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useUpdateFlowScript,
  useDeleteFlowScript,
  type FlowScript,
} from "@/lib/flowStore";
import { VoicePicker, type Speaker } from "@/components/vocera/VoicePicker";

export type FlowKey = "greeting" | "confirm" | "decline" | "unsure";

export interface FlowData {
  greeting: string;
  confirm: string;
  decline: string;
  unsure: string;
  speaker_id: string;
}

export const DEFAULT_FLOW: FlowData = {
  greeting:
    "สวัสดีค่ะ ติดต่อจาก {ชื่องาน} ต้องการสอบถามการเข้าร่วมงานในวันที่ {วันที่} เวลา {เวลา} ไม่ทราบว่าคุณ {ชื่อ} ยืนยันเข้าร่วมได้ไหมคะ",
  confirm: "ขอบคุณค่ะ ในนามผู้จัดงาน {ชื่องาน} ขอบพระคุณที่เข้ามาร่วมงาน สวัสดีค่ะ",
  decline:
    "รับทราบค่ะ ขอบคุณที่สละเวลา หากเปลี่ยนใจสามารถติดต่อกลับได้นะคะ สวัสดีค่ะ",
  unsure:
    "รับทราบค่ะ หากอยากทราบรายละเอียดเพิ่มเติม เราพร้อมให้ข้อมูลนะคะ สวัสดีค่ะ",
  speaker_id: "5",
};

export function parseFlow(content: string): FlowData {
  try {
    const j = JSON.parse(content);
    if (j && typeof j === "object" && "greeting" in j) {
      return { ...DEFAULT_FLOW, ...j } as FlowData;
    }
  } catch {
    if (content?.trim()) return { ...DEFAULT_FLOW, greeting: content };
  }
  return DEFAULT_FLOW;
}

const FALLBACK_SPEAKERS: Speaker[] = [
  {
    speaker_id: "2",
    eng_name: "Bow",
    thai_name: "โบ",
    image: "",
    audio: "",
    voice_style: ["น่ารัก"],
    eng_voice_style: ["Cute"],
    age_style: "วัยเด็ก",
    eng_age_style: "Child",
    gender: "ผู้หญิง",
    eng_gender: "Female",
    available_language: ["th"],
    price: 1,
  },
  {
    speaker_id: "5",
    eng_name: "Alan",
    thai_name: "อลัน",
    image: "",
    audio: "",
    voice_style: ["มั่นใจ"],
    eng_voice_style: ["Confident"],
    age_style: "วัยผู้ใหญ่",
    eng_age_style: "Adult",
    gender: "ผู้ชาย",
    eng_gender: "Male",
    available_language: ["th"],
    price: 1,
  },
];

const NODE_META: Record<
  FlowKey,
  { title: string; borderClass: string; dotClass: string; subtitle: string }
> = {
  greeting: {
    title: "ประโยคทักทาย",
    borderClass: "border-brand-700",
    dotClass: "bg-brand-700",
    subtitle: "ข้อความเปิด",
  },
  confirm: {
    title: "ลูกค้ายืนยัน",
    borderClass: "border-emerald-500",
    dotClass: "bg-emerald-500",
    subtitle: "เมื่อตอบยืนยัน",
  },
  decline: {
    title: "ลูกค้าปฏิเสธ",
    borderClass: "border-rose-500",
    dotClass: "bg-rose-500",
    subtitle: "เมื่อตอบปฏิเสธ",
  },
  unsure: {
    title: "ไม่มีการตอบสนอง",
    borderClass: "border-amber-500",
    dotClass: "bg-amber-500",
    subtitle: "Fallback",
  },
};

type ScriptNodeData = {
  flowKey: FlowKey;
  text: string;
  onChange: (v: string) => void;
  onPlay: () => void;
  isPlaying: boolean;
  showTopHandle: boolean;
  showBottomHandle: boolean;
};

function ScriptNode({ data }: NodeProps) {
  const d = data as unknown as ScriptNodeData;
  const meta = NODE_META[d.flowKey];
  return (
    <div
      className={cn(
        "w-72 rounded-xl border-2 bg-white p-3 shadow-card space-y-2",
        meta.borderClass,
      )}
    >
      {d.showTopHandle && (
        <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", meta.dotClass)} />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-gray-800">{meta.title}</div>
            <div className="text-[10px] text-gray-400">{meta.subtitle}</div>
          </div>
        </div>
        <button
          type="button"
          className="nodrag inline-flex h-7 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 text-xs text-gray-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
          onClick={d.onPlay}
          disabled={d.isPlaying}
        >
          {d.isPlaying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
          เล่นเสียง
        </button>
      </div>
      <textarea
        value={d.text}
        onChange={(e) => d.onChange(e.target.value)}
        rows={4}
        className="nodrag nopan nowheel w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700 outline-none focus:border-brand-700"
        placeholder="พิมพ์ข้อความ..."
      />
      <div className="text-[10px] text-gray-400 text-right">{d.text.length} ตัวอักษร</div>
      {d.showBottomHandle && (
        <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
      )}
    </div>
  );
}

const NODE_TYPES = { script: ScriptNode };

// Binary tree layout:
//        greeting (root)
//        /             \
//   confirm           decline
//                         \
//                        unsure (fallback)
const POSITIONS: Record<FlowKey, { x: number; y: number }> = {
  greeting: { x: 160, y: 0 },
  confirm: { x: 0, y: 280 },
  decline: { x: 320, y: 280 },
  unsure: { x: 320, y: 540 },
};

interface Props {
  script: FlowScript;
}

export function ScriptFlowBuilder({ script }: Props) {
  const initial = useMemo(() => parseFlow(script.content), [script.content]);
  const [name, setName] = useState(script.name);
  const [flow, setFlow] = useState<FlowData>(initial);
  const [playing, setPlaying] = useState<FlowKey | null>(null);
  const [positions, setPositions] = useState(POSITIONS);
  const [speakers, setSpeakers] = useState<Speaker[]>(FALLBACK_SPEAKERS);

  const update = useUpdateFlowScript();
  const del = useDeleteFlowScript();

  useEffect(() => {
    fetch("/speakers.json")
      .then((r) => r.json())
      .then((d) => {
        const list: Speaker[] = Array.isArray(d) ? d : d.speakers;
        if (list?.length > 0) setSpeakers(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setName(script.name);
    setFlow(parseFlow(script.content));
  }, [script.id, script.name, script.content]);

  const dirty =
    name !== script.name ||
    JSON.stringify(flow) !== JSON.stringify(parseFlow(script.content));

  const handlePlay = useCallback(async (key: FlowKey, text: string) => {
    if (!text.trim()) return toast.error("ข้อความว่าง");
    setPlaying(key);
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "th-TH";
      u.onend = () => setPlaying(null);
      u.onerror = () => setPlaying(null);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setTimeout(() => setPlaying((p) => (p === key ? null : p)), 15_000);
    } catch {
      setPlaying(null);
      toast.error("ไม่สามารถเล่นเสียงได้");
    }
  }, []);

  const nodes: Node[] = useMemo(() => {
    const make = (key: FlowKey, showTop: boolean, showBottom: boolean): Node => ({
      id: key,
      type: "script",
      position: positions[key],
      width: 288,
      height: 220,
      data: {
        flowKey: key,
        text: flow[key],
        onChange: (v: string) => setFlow((f) => ({ ...f, [key]: v })),
        onPlay: () => handlePlay(key, flow[key]),
        isPlaying: playing === key,
        showTopHandle: showTop,
        showBottomHandle: showBottom,
      } as unknown as Record<string, unknown>,
    });
    return [
      make("greeting", false, true),
      make("confirm", true, false),
      make("decline", true, true),
      make("unsure", true, false),
    ];
  }, [flow, playing, positions, handlePlay]);

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "g-c",
        source: "greeting",
        target: "confirm",
        animated: true,
        label: "ตอบยืนยัน",
        style: { stroke: "#10b981" },
        labelStyle: { fontSize: 11, fontWeight: 700, fill: "#10b981" },
        labelBgStyle: { fill: "#f0fdf4" },
      },
      {
        id: "g-d",
        source: "greeting",
        target: "decline",
        animated: true,
        label: "ตอบปฏิเสธ",
        style: { stroke: "#f43f5e" },
        labelStyle: { fontSize: 11, fontWeight: 700, fill: "#f43f5e" },
        labelBgStyle: { fill: "#fff1f2" },
      },
      {
        id: "d-u",
        source: "decline",
        target: "unsure",
        animated: true,
        label: "ไม่ตอบ",
        style: { stroke: "#f59e0b" },
        labelStyle: { fontSize: 11, fontWeight: 700, fill: "#f59e0b" },
        labelBgStyle: { fill: "#fffbeb" },
      },
    ],
    [],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setPositions((prev) => {
        const next = { ...prev };
        for (const c of applyNodeChanges(changes, nodes)) {
          if (
            c.position &&
            (c.id === "greeting" || c.id === "confirm" || c.id === "decline" || c.id === "unsure")
          ) {
            next[c.id as FlowKey] = c.position;
          }
        }
        return next;
      });
    },
    [nodes],
  );

  const handleSave = () => {
    update.mutate(
      { id: script.id, name: name.trim() || "ไม่มีชื่อ", content: JSON.stringify(flow) },
      {
        onSuccess: () => toast.success("บันทึก Flow แล้ว"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card space-y-4">
      {/* Name + Save + Delete */}
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อสคริปต์ เช่น สคริปต์งานแต่งงาน"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || update.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-900 disabled:opacity-40"
        >
          {update.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          บันทึก
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`ลบสคริปต์ "${script.name}"?`)) {
              del.mutate(script.id, {
                onSuccess: () => toast.success("ลบสคริปต์แล้ว"),
                onError: (e: Error) => toast.error(e.message),
              });
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
          title="ลบ"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Voice selector */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-2.5">
        <span className="shrink-0 text-sm font-medium text-brand-700 whitespace-nowrap">
          เสียง BOTNOI
        </span>
        <VoicePicker
          value={flow.speaker_id ?? "5"}
          onChange={(v) => setFlow((f) => ({ ...f, speaker_id: v }))}
          speakers={speakers}
        />
      </div>

      {/* Binary Tree Flow */}
      <div className="h-[620px] rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
