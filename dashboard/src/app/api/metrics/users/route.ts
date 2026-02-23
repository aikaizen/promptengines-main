import { NextRequest, NextResponse } from "next/server";
import { getMetricsAdapterContext } from "@/lib/metrics/adapters";
import { isValid, parseISO } from "date-fns";

function parseDateRange(from: string, to: string) {
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  if (!isValid(fromDate) || !isValid(toDate)) {
    throw new Error("Invalid date range. Use YYYY-MM-DD for from/to.");
  }
  return { from: fromDate, to: toDate };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!appId || !from || !to) {
    return NextResponse.json(
      { error: "Missing required parameters: appId, from, to" },
      { status: 400 }
    );
  }

  let dateRange;
  try {
    dateRange = parseDateRange(from, to);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid date range.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const { adapter, app, client } = getMetricsAdapterContext(appId);
    const result = await adapter.fetchUsers({ app, client, dateRange });
    return NextResponse.json(result);
  } catch (error) {
    console.error("User metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user metrics" },
      { status: 500 }
    );
  }
}
