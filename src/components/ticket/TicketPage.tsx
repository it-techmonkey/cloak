"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import TicketDetails from "./TicketDetails";
import { useAuth } from "@/components/auth/AuthProvider";
import type { PublicTicketItem } from "@/lib/tickets";
import type { WalletConfig } from "@/lib/wallet";

const VenueLocationMap = dynamic(() => import("./VenueLocationMap"), { ssr: false });

export type TicketView = {
  dbId: string;
  email: string;
  expiresAt: string;
  guestName: string;
  itemCount: number;
  itemDescription: string | null;
  itemType: string | null;
  items: PublicTicketItem[];
  mobile: string;
  qrValue: string;
  status?: "pending_activation" | "active" | "partially_collected" | "collected" | "cancelled" | "expired";
  storageLocation: string | null;
  ticketId: string;
  venueAddress: string | null;
  venueId: string;
  venueName: string;
};

function StatusPill({ status }: { status: TicketView["status"] }) {
  const map: Record<
    NonNullable<TicketView["status"]>,
    { label: string; cls: string }
  > = {
    pending_activation:    { label: "Awaiting activation", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    active:                { label: "Items stored",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    partially_collected:   { label: "Partially collected", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    collected:             { label: "Collected",           cls: "bg-zinc-100 text-zinc-500 border-zinc-200" },
    cancelled:          { label: "Cancelled",            cls: "bg-red-50 text-red-600 border-red-200" },
    expired:            { label: "Expired",              cls: "bg-red-50 text-red-600 border-red-200" },
  };
  const s = status ?? "pending_activation";
  const { label, cls } = map[s];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function useCountdown(expiresAt: string) {
  const getSecondsLeft = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(getSecondsLeft), 1000);
    return () => clearInterval(id);
  });

  return secondsLeft;
}

function ExpiryCountdown({ expiresAt, status }: { expiresAt: string; status: TicketView["status"] }) {
  const secondsLeft = useCountdown(expiresAt);

  // No expiry = far future year (9999) — skip countdown
  if (new Date(expiresAt).getFullYear() >= 9000) return null;
  if (status === "collected" || status === "partially_collected" || status === "cancelled" || status === "expired") return null;

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  const display = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;

  const urgencyClass =
    secondsLeft <= 15 * 60
      ? "text-red-600 border-red-200 bg-red-50"
      : secondsLeft <= 60 * 60
        ? "text-amber-600 border-amber-200 bg-amber-50"
        : "text-muted border-line bg-panel";

  return (
    <div className={`flex items-center justify-between rounded-lg border px-3.5 py-3 ${urgencyClass}`}>
      <span className="text-xs font-semibold uppercase tracking-wide">Ticket expires in</span>
      <span className="font-mono text-sm font-bold tabular-nums">{display}</span>
    </div>
  );
}

export default function TicketPage({
  ticket: initial,
  qrCard,
  walletParam,
  wallet,
}: {
  ticket: TicketView;
  qrCard: ReactNode;
  walletParam: string;
  wallet: WalletConfig;
}) {
  const [ticket, setTicket] = useState<TicketView>(initial);

  useEffect(() => {
    const supabase = createClient();

    async function refreshItems() {
      const { data } = await supabase
        .from("ticket_items")
        .select("id, label, storage_location, collected_at")
        .eq("ticket_id", initial.dbId)
        .order("added_at", { ascending: true });
      if (data) {
        setTicket((prev) => ({
          ...prev,
          items: data.map((r) => ({
            id: r.id,
            label: r.label,
            storageLocation: r.storage_location ?? null,
            collected: r.collected_at !== null,
          })),
        }));
      }
    }

    const channel = supabase
      .channel(`ticket:${initial.dbId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
          filter: `id=eq.${initial.dbId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setTicket((prev) => ({
            ...prev,
            status: (row.status as TicketView["status"]) ?? prev.status,
            storageLocation: (row.storage_location as string | null) ?? null,
            itemType: (row.item_type as string | null) ?? prev.itemType,
            itemCount: typeof row.item_count === "number" ? row.item_count : prev.itemCount,
            itemDescription: (row.item_description as string | null) ?? null,
          }));
          void refreshItems();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ticket_items",
          filter: `ticket_id=eq.${initial.dbId}`,
        },
        () => { void refreshItems(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.dbId]);

  const { user, openAuthModal } = useAuth();

  const isActive = ticket.status === "active";
  const isCollected = ticket.status === "collected";
  const isExpired = ticket.status === "expired";
  const isCancelled = ticket.status === "cancelled";
  const isClosed = isCollected || isExpired || isCancelled;

  const description = isCollected
    ? "Your items have been returned. This ticket is now closed."
    : isExpired
      ? "This ticket expired before it was activated at the counter."
      : isCancelled
        ? "This ticket has been cancelled and is no longer valid."
        : isActive
          ? "Your items are stored. Show this QR code or fallback code at the counter to collect."
          : "Show this QR code or fallback code at the selected venue counter to activate storage.";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-6 sm:max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-foreground"
              href="/"
            >
              Cloak
            </Link>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusPill status={ticket.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
          {user ? (
            <Link
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-xs font-bold text-white transition hover:bg-zinc-700"
              href="/account"
              title="My account"
            >
              {(user.user_metadata?.full_name as string | undefined)
                ?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                ?? user.email?.[0]?.toUpperCase()
                ?? "?"}
            </Link>
          ) : (
            <button
              className="shrink-0 rounded-xl border border-line bg-panel px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-zinc-50"
              onClick={() => openAuthModal("signin")}
              title="Sign in"
              type="button"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Expiry countdown */}
        <ExpiryCountdown expiresAt={ticket.expiresAt} status={ticket.status} />

        {/* Collected celebration state */}
        {isCollected && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</span>
            <div>
              <p className="font-semibold text-emerald-800">Thanks for using Cloak</p>
              <p className="mt-1 text-sm text-emerald-700">Your items have been safely returned. See you next time!</p>
            </div>
          </div>
        )}

        {/* Items list — when active, partially collected, or collected */}
        {(isActive || ticket.status === "partially_collected" || isCollected) && (ticket.items.length > 0 || ticket.itemType) ? (
          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <p className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
              {isCollected ? "Items returned" : "Stored items"}
            </p>
            <div className="divide-y divide-line">
              {ticket.items.length > 0
                ? ticket.items.map((item) => (
                    <ItemRow
                      collected={item.collected}
                      key={item.id}
                      label={item.label}
                      slot={item.storageLocation}
                    />
                  ))
                : parseItemLines(ticket.itemDescription, ticket.itemType ?? "", ticket.itemCount).map(
                    (line, i) => (
                      <ItemRow collected={isCollected} key={i} label={line.label} slot={null} />
                    ),
                  )}
            </div>
            {extractNotes(ticket.itemDescription) ? (
              <p className="border-t border-line px-4 py-3 text-xs leading-5 text-muted">
                {extractNotes(ticket.itemDescription)}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* QR card — rendered server-side, passed as a child */}
        {qrCard}

        <TicketDetails ticket={ticket} />

        {/* Venue map — helps guest find the venue */}
        {ticket.venueAddress && !isClosed && (
          <VenueLocationMap
            address={ticket.venueAddress}
            venueName={ticket.venueName}
          />
        )}

        {!isClosed ? (
          <div className="grid gap-2">
            {wallet.appleEnabled ? (
              <a
                className="flex items-center justify-between rounded-xl border border-line bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                download={`cloak-ticket.pkpass`}
                href={`/api/wallet/apple?${walletParam}`}
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 814 1000">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-150.3-96.8C67.3 716.9 24 599 24 481.3c0-170.7 111.4-261.1 221-261.1 75.8 0 138.3 43.4 186.9 43.4 46.3 0 118.5-48.8 208.3-48.8 31.5 0 134.4 2.6 204.4 99.4zm-340.2-168c31.5-37.1 54.2-88.8 54.2-140.5 0-7.1-.6-14.3-1.9-20.1-51.5 1.9-112.3 34.2-149.1 75.8-28.5 32.4-55.1 83.5-55.1 135.8 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 46.3 0 102.9-31.1 136.4-70.4z" />
                  </svg>
                  Add to Apple Wallet
                </span>
                <svg className="h-4 w-4 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <button
                className="flex cursor-not-allowed items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-muted"
                disabled
                type="button"
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5 opacity-40" fill="currentColor" viewBox="0 0 814 1000">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-150.3-96.8C67.3 716.9 24 599 24 481.3c0-170.7 111.4-261.1 221-261.1 75.8 0 138.3 43.4 186.9 43.4 46.3 0 118.5-48.8 208.3-48.8 31.5 0 134.4 2.6 204.4 99.4zm-340.2-168c31.5-37.1 54.2-88.8 54.2-140.5 0-7.1-.6-14.3-1.9-20.1-51.5 1.9-112.3 34.2-149.1 75.8-28.5 32.4-55.1 83.5-55.1 135.8 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 46.3 0 102.9-31.1 136.4-70.4z" />
                  </svg>
                  Add to Apple Wallet
                </span>
                <span className="text-xs text-muted/60">Not configured</span>
              </button>
            )}

            {wallet.googleEnabled ? (
              <a
                className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-foreground transition hover:bg-zinc-50"
                href={`/api/wallet/google?${walletParam}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Add to Google Wallet
                </span>
                <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <button
                className="flex cursor-not-allowed items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-muted"
                disabled
                type="button"
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5 opacity-40" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Add to Google Wallet
                </span>
                <span className="text-xs text-muted/60">Not configured</span>
              </button>
            )}
          </div>
        ) : null}

      </main>
    </div>
  );
}

function ItemRow({
  slot,
  label,
  collected,
}: {
  slot: string | null;
  label: string;
  collected: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${collected ? "opacity-50" : ""}`}>
      {slot ? (
        <span className="shrink-0 rounded-lg bg-foreground px-2.5 py-1 font-mono text-xs font-bold text-white">
          {slot}
        </span>
      ) : (
        <span className="shrink-0 w-7" />
      )}
      <span className={`flex-1 text-sm text-foreground ${collected ? "line-through" : ""}`}>
        {label}
      </span>
      {collected && <span className="shrink-0 text-xs text-emerald-600">Returned</span>}
    </div>
  );
}

function extractNotes(description: string | null): string | null {
  if (!description) return null;
  const idx = description.indexOf("\n");
  if (idx === -1) return null;
  const notes = description.slice(idx + 1).trim();
  return notes || null;
}

function parseItemLines(
  description: string | null,
  fallbackType: string,
  fallbackCount: number,
): Array<{ label: string; count: number }> {
  if (!description) return [{ label: fallbackType, count: fallbackCount }];
  const firstLine = description.split("\n")[0];
  const parts = firstLine.split(",").map((s) => s.trim());
  const parsed: Array<{ label: string; count: number }> = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)[×x]\s*(.+)$/i);
    if (match) parsed.push({ count: parseInt(match[1], 10), label: match[2].trim() });
  }
  return parsed.length > 0 ? parsed : [{ label: fallbackType, count: fallbackCount }];
}

