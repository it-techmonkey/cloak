"use client";

import { useRef, useState } from "react";
import { submitQueryResponse } from "@/app/venuedashboard/actions";
import type { VenueApprovalStatus } from "@/lib/venue-dashboard";

export default function ApprovalBanner({
  approvalStatus,
  queryMessage,
  venueId,
}: {
  approvalStatus: VenueApprovalStatus;
  queryMessage: string | null;
  venueId: string | null;
}) {
  if (approvalStatus === "approved") return null;

  if (approvalStatus === "suspended") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-800">Venue suspended</p>
        <p className="mt-1 text-sm text-red-700">
          Your venue has been suspended by the platform team. Please contact support to resolve
          this.
        </p>
      </div>
    );
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-800">Application not approved</p>
        <p className="mt-1 text-sm text-red-700">
          Your venue registration was not approved. Please contact support if you believe this is
          an error.
        </p>
      </div>
    );
  }

  // pending — with or without a query
  const isQueried = Boolean(queryMessage);

  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        isQueried ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
            isQueried ? "bg-amber-500" : "bg-foreground"
          }`}
        >
          {isQueried ? "?" : "i"}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${isQueried ? "text-amber-900" : "text-foreground"}`}>
            {isQueried ? "Information requested" : "Awaiting approval"}
          </p>
          <p className={`mt-1 text-sm ${isQueried ? "text-amber-800" : "text-muted"}`}>
            {isQueried
              ? "The platform team has a query about your application. Please review and respond below."
              : "Your venue application is under review. You'll be able to use all features once approved. Approvals typically complete within one business day."}
          </p>

          {isQueried && queryMessage && venueId && (
            <QueryResponseForm queryMessage={queryMessage} venueId={venueId} />
          )}
        </div>
      </div>
    </div>
  );
}

function QueryResponseForm({
  queryMessage,
  venueId,
}: {
  queryMessage: string;
  venueId: string;
}) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Only show the original query (strip any prior venue response appended by the action)
  const displayQuery = queryMessage.split("\n\n— Venue response:")[0].trim();

  return (
    <div className="mt-4 space-y-3">
      {/* Query message box */}
      <div className="rounded-lg border border-amber-200 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          Query from platform team
        </p>
        <p className="mt-1.5 text-sm text-foreground">{displayQuery}</p>
      </div>

      {!open ? (
        <button
          className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-200"
          onClick={() => setOpen(true)}
          type="button"
        >
          Respond to query
        </button>
      ) : (
        <form action={submitQueryResponse} className="space-y-3">
          <input name="venueId" type="hidden" value={venueId} />

          <textarea
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            name="responseText"
            placeholder="Provide the requested information or clarification…"
            required
            rows={4}
          />

          {/* File attachment */}
          <div>
            <input
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              name="attachment"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              ref={fileRef}
              type="file"
            />
            <button
              className="flex items-center gap-2 text-xs font-medium text-amber-800 hover:text-amber-900"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {fileName ? fileName : "Attach a file (optional)"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              type="submit"
            >
              Send response
            </button>
            <button
              className="text-sm text-muted hover:text-foreground"
              onClick={() => setOpen(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

