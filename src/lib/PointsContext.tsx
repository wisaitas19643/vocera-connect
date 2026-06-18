import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "./supabase";

interface PointsContextValue {
  pointsBalance: number | null;
}

const PointsContext = createContext<PointsContextValue>({ pointsBalance: null });

export function PointsProvider({ userId, children }: { userId: string | undefined; children: ReactNode }) {
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setPointsBalance(data.points_balance);
      });
  }, [userId]);

  return (
    <PointsContext.Provider value={{ pointsBalance }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}
