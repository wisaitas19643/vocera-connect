import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { makeCall, type BotnoiCallResult } from "@/services/botnoiService";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/lib/database.types";

export type RunnerStatus = "idle" | "running" | "paused" | "completed";

export interface RunnerContact {
  id: string;
  name: string;
  phone: string;
}

interface UseCampaignRunnerReturn {
  status: RunnerStatus;
  currentIndex: number;
  currentContact: RunnerContact | null;
  results: BotnoiCallResult[];
  progress: number;
  startCampaign: () => void;
  pauseCampaign: () => void;
  resumeCampaign: () => void;
  stopCampaign: () => void;
  callSingle: (contact: RunnerContact) => void;
}

export function useCampaignRunner(
  campaignId: string,
  contacts: RunnerContact[],
  script: string,
  voiceId: string,
): UseCampaignRunnerReturn {
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<BotnoiCallResult[]>([]);

  const statusRef = useRef<RunnerStatus>("idle");
  const currentIndexRef = useRef(0);
  const pauseRequestedRef = useRef(false);

  const mergeResult = useCallback((result: BotnoiCallResult) => {
    setResults((prev) => [
      ...prev.filter((r) => r.contactId !== result.contactId),
      result,
    ]);
  }, []);

  const saveCallResult = useCallback(
    (result: BotnoiCallResult) => {
      const endedAt = result.timestamp;
      const startedAt = new Date(
        new Date(endedAt).getTime() - result.duration,
      ).toISOString();

      const log: TablesInsert<"call_logs"> = {
        campaign_id: campaignId,
        contact_id: result.contactId,
        call_id: result.callId,
        status: result.status,
        duration_seconds: Math.round(result.duration / 1000),
        started_at: startedAt,
        ended_at: endedAt,
      };

      supabase
        .from("call_logs")
        .insert(log)
        .then(({ error }) => {
          if (error) console.error("call_logs insert failed:", error.message);
        });

      supabase
        .from("contacts")
        .update({ call_status: result.status, last_called_at: endedAt })
        .eq("id", result.contactId)
        .then(({ error }) => {
          if (error) console.error("contacts update failed:", error.message);
        });
    },
    [campaignId],
  );

  const runLoop = useCallback(
    async (startIdx: number) => {
      for (let i = startIdx; i < contacts.length; i++) {
        if (statusRef.current !== "running") break;

        currentIndexRef.current = i;
        setCurrentIndex(i);

        // TODO: BOTNOI API — makeCall triggers the real outbound call via BOTNOI Voice API
        const result = await makeCall({
          campaignId,
          contactId: contacts[i].id,
          phoneNumber: contacts[i].phone,
          contactName: contacts[i].name,
          script,
          voiceId,
        });

        mergeResult(result);
        saveCallResult(result);

        if (pauseRequestedRef.current) {
          pauseRequestedRef.current = false;
          statusRef.current = "paused";
          setStatus("paused");
          return;
        }
      }

      if (statusRef.current === "running") {
        statusRef.current = "completed";
        setStatus("completed");
        // TODO: BOTNOI API — completion webhook/event may come from real API instead
        toast.success(`✅ รันแคมเปญเสร็จสิ้น — โทรครบ ${contacts.length} คนแล้ว`);
      }
    },
    [campaignId, contacts, script, voiceId, mergeResult, saveCallResult],
  );

  const startCampaign = useCallback(() => {
    statusRef.current = "running";
    currentIndexRef.current = 0;
    pauseRequestedRef.current = false;
    setStatus("running");
    setCurrentIndex(0);
    setResults([]);
    runLoop(0);
  }, [runLoop]);

  const pauseCampaign = useCallback(() => {
    pauseRequestedRef.current = true;
  }, []);

  const resumeCampaign = useCallback(() => {
    statusRef.current = "running";
    pauseRequestedRef.current = false;
    setStatus("running");
    runLoop(currentIndexRef.current + 1);
  }, [runLoop]);

  const stopCampaign = useCallback(() => {
    statusRef.current = "idle";
    pauseRequestedRef.current = false;
    currentIndexRef.current = 0;
    setStatus("idle");
    setCurrentIndex(0);
    setResults([]);
  }, []);

  const callSingle = useCallback(
    (contact: RunnerContact) => {
      // TODO: BOTNOI API — triggers a single on-demand call via BOTNOI Voice API
      makeCall({
        campaignId,
        contactId: contact.id,
        phoneNumber: contact.phone,
        contactName: contact.name,
        script,
        voiceId,
      }).then((result) => {
        mergeResult(result);
        saveCallResult(result);
      });
    },
    [campaignId, script, voiceId, mergeResult, saveCallResult],
  );

  const currentContact =
    status === "running" ? (contacts[currentIndex] ?? null) : null;

  const progress =
    contacts.length === 0
      ? 0
      : Math.round((results.length / contacts.length) * 100);

  return {
    status,
    currentIndex,
    currentContact,
    results,
    progress,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
    callSingle,
  };
}
