"use client";

import { useState, useEffect } from "react";
import { WorldCupData } from "@/lib/types";

export function useWorldCupData() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = () => {
      fetch("/api/worldcup", { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch matches");
          return res.json();
        })
        .then((d: WorldCupData) => {
          if (active) {
            setData(d);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            setError(err.message);
            setLoading(false);
          }
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds for real-time updates

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
