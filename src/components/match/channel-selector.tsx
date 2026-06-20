"use client";

import { Radio, Tv } from "lucide-react";
import { useTranslation } from "@/components/layout/language-provider";

export interface StreamChannel {
  id: string;
  name: string;
  quality: string;
  url: string;
}

interface ChannelSelectorProps {
  channels: StreamChannel[];
  selectedChannel: StreamChannel;
  onSelectChannel: (channel: StreamChannel) => void;
}

export function ChannelSelector({
  channels,
  selectedChannel,
  onSelectChannel,
}: ChannelSelectorProps) {
  const { t } = useTranslation();

  return (
    <div style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline-soft)", backgroundColor: "var(--card-muted)" }}>
        <div className="flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.14px" }}>
          <Radio className="h-4 w-4" style={{ color: "var(--foreground)" }} />
          <span>{t("chooseBroadcastChannel")}</span>
        </div>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px", letterSpacing: "-0.13px" }}>
          {t("switchChannelsDesc")}
        </p>
      </div>
      <div style={{ padding: "16px" }}>
        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            const isActive = selectedChannel.id === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className="flex items-center gap-3.5 p-3.5 text-left transition-all duration-200 cursor-pointer"
                style={{
                  borderRadius: "15px",
                  border: `1px solid ${isActive ? "var(--foreground)" : "var(--border)"}`,
                  backgroundColor: isActive ? "var(--secondary)" : "var(--card)",
                  boxShadow: isActive ? "0 0 0 1px var(--hairline-soft)" : "none",
                }}
              >
                <div
                  className="p-2.5 shrink-0 flex items-center justify-center"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: isActive ? "var(--foreground)" : "var(--secondary)",
                  }}
                >
                  <Tv className="h-4 w-4" style={{ color: isActive ? "var(--background)" : "var(--muted-foreground)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate" style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.14px" }}>
                      {channel.name}
                    </p>
                    {isActive && (
                      <span
                        style={{
                          fontSize: "8px",
                          fontWeight: 700,
                          backgroundColor: "var(--foreground)",
                          color: "var(--background)",
                          padding: "1px 5px",
                          borderRadius: "4px",
                        }}
                      >
                        {t("activeChannel")}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>{channel.quality}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
