"use client";

import { useState, useEffect } from "react";
import { WorldCupData } from "@/lib/types";

export function useWorldCupData() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/worldcup")
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

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
