import { useEffect, useRef, useState } from "react";
import { Check, Mic, Pause, Play, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Speaker {
  speaker_id: string;
  eng_name: string;
  thai_name: string;
  image: string;
  audio: string;
  voice_style: string[];
  eng_voice_style: string[];
  age_style: string;
  eng_age_style: string;
  gender: string;
  eng_gender: string;
  available_language: string[];
  price: number;
}

type GenderFilter = "all" | "ผู้หญิง" | "ผู้ชาย";

interface VoicePickerProps {
  value: string;
  onChange: (speakerId: string) => void;
  speakers: Speaker[];
}

export function VoicePicker({ value, onChange, speakers }: VoicePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selected = speakers.find((s) => s.speaker_id === value);

  useEffect(() => {
    if (!open) stopAudio();
  }, [open]);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(null);
  }

  function togglePlay(e: React.MouseEvent, speaker: Speaker) {
    e.stopPropagation();
    if (playing === speaker.speaker_id) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio(speaker.audio);
    audioRef.current = audio;
    setPlaying(speaker.speaker_id);
    audio.play().catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
  }

  function handleSelect(speaker: Speaker) {
    onChange(speaker.speaker_id);
    stopAudio();
    setOpen(false);
  }

  const filtered = speakers.filter((s) => {
    const q = search.toLowerCase();
    const matchName = s.thai_name.includes(search) || s.eng_name.toLowerCase().includes(q);
    const matchGender = gender === "all" || s.gender === gender;
    return matchName && matchGender;
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors hover:bg-brand-50",
          "border-gray-200 hover:border-brand-300",
        )}
      >
        {selected ? (
          <>
            <img
              src={selected.image}
              alt={selected.eng_name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://api.dicebear.com/9.x/bottts/svg?seed=" + selected.speaker_id;
              }}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight text-gray-800">
                {selected.thai_name}
              </div>
              <div className="text-xs text-gray-400">
                {selected.eng_name} · {selected.gender === "ผู้หญิง" ? "หญิง" : "ชาย"} ·{" "}
                {selected.voice_style[0] ?? ""}
              </div>
            </div>
            <Mic className="ml-auto h-4 w-4 shrink-0 text-brand-700" />
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">เลือกเสียง BOTNOI...</span>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col gap-3 p-4">
          <DialogHeader className="shrink-0 pb-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4 text-brand-700" />
              เลือกเสียง BOTNOI
              <span className="ml-auto text-xs font-normal text-gray-400">
                {filtered.length} / {speakers.length} เสียง
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex shrink-0 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อนักพากย์..."
                className="h-9 pl-8 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1">
              {(["all", "ผู้หญิง", "ผู้ชาย"] as GenderFilter[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    gender === g
                      ? "bg-brand-700 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300",
                  )}
                >
                  {g === "all" ? "ทั้งหมด" : g === "ผู้หญิง" ? "หญิง" : "ชาย"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {filtered.length === 0 && (
              <div className="col-span-3 py-12 text-center text-sm text-gray-400">
                ไม่พบเสียงที่ค้นหา
              </div>
            )}
            {filtered.map((speaker) => {
              const isSelected = speaker.speaker_id === value;
              const isPlaying = playing === speaker.speaker_id;
              return (
                <div
                  key={speaker.speaker_id}
                  onClick={() => handleSelect(speaker)}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3 transition-all hover:shadow-md",
                    isSelected
                      ? "border-brand-700 bg-brand-50 shadow-sm"
                      : "border-gray-200 hover:border-brand-300",
                  )}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <img
                      src={speaker.image}
                      alt={speaker.eng_name}
                      className="h-10 w-10 shrink-0 rounded-full border object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://api.dicebear.com/9.x/bottts/svg?seed=" + speaker.speaker_id;
                      }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-800">
                        {speaker.thai_name}
                      </div>
                      <div className="truncate text-xs text-gray-400">{speaker.eng_name}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {speaker.gender === "ผู้หญิง" ? "หญิง" : "ชาย"}
                    </Badge>
                    {speaker.voice_style.slice(0, 2).map((style) => (
                      <Badge key={style} variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {style}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant={isPlaying ? "default" : "outline"}
                    className="h-7 w-full gap-1 text-xs"
                    onClick={(e) => togglePlay(e, speaker)}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3" />
                        หยุด
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        ฟังตัวอย่าง
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
