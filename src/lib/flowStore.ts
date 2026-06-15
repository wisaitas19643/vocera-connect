import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FlowScript {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

const LS_KEY = "ringo_flow_scripts";

function lsGet(): FlowScript[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function lsSet(scripts: FlowScript[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(scripts));
}

export const useFlowScripts = () =>
  useQuery({ queryKey: ["flow-scripts"], queryFn: async () => lsGet() });

export const useCreateFlowScript = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; content: string }): Promise<FlowScript> => {
      const row: FlowScript = {
        id: crypto.randomUUID(),
        name: payload.name,
        content: payload.content,
        created_at: new Date().toISOString(),
      };
      lsSet([...lsGet(), row]);
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flow-scripts"] }),
  });
};

export const useUpdateFlowScript = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; name: string; content: string }): Promise<void> => {
      lsSet(
        lsGet().map((s) =>
          s.id === payload.id ? { ...s, name: payload.name, content: payload.content } : s,
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flow-scripts"] }),
  });
};

export const useDeleteFlowScript = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      lsSet(lsGet().filter((s) => s.id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flow-scripts"] }),
  });
};
