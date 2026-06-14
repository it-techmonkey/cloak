import type { ScannerTicket } from "@/app/venuescanner/types";

export type BackupState =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string }
  | { status: "results"; message: string; tickets: ScannerTicket[] }
  | { status: "action"; message: string; ticket?: ScannerTicket; intent?: "activation" | "checkout" };

export const initialBackupState: BackupState = { message: "", status: "idle" };
