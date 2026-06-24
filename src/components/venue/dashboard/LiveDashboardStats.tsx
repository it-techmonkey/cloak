"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import VenueStats from "./VenueStats";

type Tone = "blue" | "green" | "warning" | "danger" | "neutral";
type Stat = { helper?: string; label: string; value: string; tone: Tone };

export type LiveCounts = {
  pending: number;
  stored: number;
  collected: number;
  today: number;
  forgotten: number;
  capacity: number;
  hangerCapacity: number;
  bagCapacity: number;
  hangerStored: number;
  bagStored: number;
};

function buildStats(counts: LiveCounts): Stat[] {
  const totalUsed = counts.stored;
  const totalCapacity = counts.hangerCapacity + counts.bagCapacity || counts.capacity;
  const utilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
  return [
    { helper: "Tickets created today", label: "Today", value: String(counts.today), tone: "neutral" },
    { helper: "Waiting at counter", label: "Pending", value: String(counts.pending), tone: "warning" },
    { helper: "Currently stored", label: "Stored", value: String(counts.stored), tone: "green" },
    { helper: "Returned today", label: "Collected", value: String(counts.collected), tone: "blue" },
    { helper: "Expired before activation", label: "Forgotten", value: String(counts.forgotten), tone: "danger" },
    {
      helper: "Active storage use",
      label: "Capacity",
      value: `${utilization}%`,
      tone: utilization >= 90 ? "danger" : utilization >= 70 ? "warning" : "blue",
    },
  ];
}

function CapacityBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(Math.round((used / total) * 100), 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-line bg-panel px-5 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted">
          {used} / {total}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{total - used} slots available</p>
    </div>
  );
}

function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
          {count}
        </span>
        <p className="text-sm font-medium text-amber-900">
          {count === 1
            ? "1 guest is waiting at the counter to activate their pass."
            : `${count} guests are waiting at the counter to activate their passes.`}
        </p>
      </div>
      <Link
        className="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
        href="/venuescanner"
      >
        Open scanner
      </Link>
    </div>
  );
}

export default function LiveDashboardStats({
  initialCounts,
  showCapacityBar,
  venueId,
}: {
  initialCounts: LiveCounts;
  showCapacityBar: boolean;
  venueId: string | null;
}) {
  const [counts, setCounts] = useState<LiveCounts>(initialCounts);

  useEffect(() => {
    if (!venueId) return;

    const supabase = createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    async function refresh() {
      const now = new Date().toISOString();
      const today = todayStart.toISOString();

      const [pending, storedTickets, collected, all, forgotten, occupiedItems] = await Promise.all([
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId!)
          .eq("status", "pending_activation"),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId!)
          .in("status", ["active", "partially_collected"]),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId!)
          .eq("status", "collected")
          .gte("collected_at", today),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId!)
          .gte("created_at", today),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId!)
          .eq("status", "pending_activation")
          .lt("expires_at", now),
        // Fetch active/partial ticket IDs to join against ticket_items
        supabase
          .from("tickets")
          .select("id")
          .eq("venue_id", venueId!)
          .in("status", ["active", "partially_collected"]),
      ]);

      const activeIds = (occupiedItems.data ?? []).map((t) => t.id);
      let hangerStored = 0;
      let bagStored = 0;

      if (activeIds.length > 0) {
        const { data: itemRows } = await supabase
          .from("ticket_items")
          .select("storage_location")
          .in("ticket_id", activeIds)
          .not("storage_location", "is", null)
          .is("collected_at", null);
        hangerStored = (itemRows ?? []).filter((i) => i.storage_location?.startsWith("H-")).length;
        bagStored = (itemRows ?? []).filter((i) => i.storage_location?.startsWith("B-")).length;
      }

      setCounts((prev) => ({
        ...prev,
        bagStored,
        hangerStored,
        pending: pending.count ?? prev.pending,
        stored: storedTickets.count ?? prev.stored,
        collected: collected.count ?? prev.collected,
        today: all.count ?? prev.today,
        forgotten: forgotten.count ?? prev.forgotten,
      }));
    }

    const channel = supabase
      .channel(`dashboard:${venueId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `venue_id=eq.${venueId}` },
        () => { refresh(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  const showHanger = showCapacityBar && counts.hangerCapacity > 0;
  const showBag = showCapacityBar && counts.bagCapacity > 0;
  const showLegacy = showCapacityBar && !showHanger && !showBag && counts.capacity > 0;

  return (
    <>
      <PendingAlert count={counts.pending} />
      <VenueStats stats={buildStats(counts)} />
      {showHanger && (
        <CapacityBar label="Hanger slots in use" used={counts.hangerStored} total={counts.hangerCapacity} />
      )}
      {showBag && (
        <CapacityBar label="Bag slots in use" used={counts.bagStored} total={counts.bagCapacity} />
      )}
      {showLegacy && (
        <CapacityBar label="Cloak slots in use" used={counts.stored} total={counts.capacity} />
      )}
    </>
  );
}

