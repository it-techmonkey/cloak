import { headers } from "next/headers";
import TicketPage from "@/components/ticket/TicketPage";
import TicketUnavailablePage from "@/components/ticket/TicketUnavailablePage";
import { getPublicTicketByCode, getPublicTicketByToken } from "@/lib/tickets";

type SearchParams = Promise<{
  code?: string | string[];
  token?: string | string[];
}>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const token = getParam(params.token);
  const code = getParam(params.code);
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  if (token) {
    const result = await getPublicTicketByToken(token);

    if (result.ticket) {
      return (
        <TicketPage
          ticket={{
            ...result.ticket,
            qrValue: `${origin}/ticket?token=${encodeURIComponent(token)}`,
          }}
        />
      );
    }

    return <TicketUnavailablePage reason={result.status} />;
  }

  if (code) {
    const result = await getPublicTicketByCode(code);

    if (result.ticket) {
      return (
        <TicketPage
          ticket={{
            ...result.ticket,
            qrValue: `${origin}/ticket?code=${encodeURIComponent(result.ticket.ticketId)}`,
          }}
        />
      );
    }

    return <TicketUnavailablePage reason={result.status} />;
  }

  return <TicketUnavailablePage reason="invalid" />;
}
