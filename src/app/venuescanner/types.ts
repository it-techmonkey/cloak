import type { Database } from "@/lib/supabase/database.types";

type TicketStatus = Database["public"]["Tables"]["tickets"]["Row"]["status"];

export type TicketItemView = {
  id: string;
  label: string;
  quantity: number;
  notes: string | null;
  storageLocation: string | null;
  collected: boolean;
};

export type ScannerTicket = {
  expiresAt: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  id: string;
  itemCount: number;
  itemDescription: string | null;
  itemType: string | null;
  items: TicketItemView[];
  publicCode: string;
  status: TicketStatus;
  storageLocation: string | null;
  venueId: string;
  venueName: string;
};

export type ScannerState =
  | {
      message: "";
      status: "idle";
    }
  | {
      message: string;
      status: "error";
      ticket?: ScannerTicket;
    }
  | {
      message: string;
      status: "success";
      ticket?: ScannerTicket;
    }
  | {
      intent: "activation";
      message: string;
      status: "ready";
      ticket: ScannerTicket;
    }
  | {
      intent: "checkout";
      message: string;
      status: "ready";
      ticket: ScannerTicket;
    };

export const initialScannerState: ScannerState = {
  message: "",
  status: "idle",
};
