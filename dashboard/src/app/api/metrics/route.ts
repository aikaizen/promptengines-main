import { NextRequest, NextResponse } from "next/server";
import { getActiveApps } from "@/lib/app-registry";
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
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!appId || !type || !from || !to) {
    return NextResponse.json(
      { error: "Missing required parameters: appId, type, from, to" },
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
    if (appId === "all") {
      const activeApps = getActiveApps();
      const allMetrics = await Promise.all(
        activeApps.map(async (app) => {
          try {
            const { adapter, client } = getMetricsAdapterContext(app.id);
            const growth = await adapter.fetchGrowth({ app, client, dateRange });
            const finance = await adapter.fetchFinance({ app, client, dateRange });
            return {
              appId: app.id,
              appName: app.name,
              name: app.name,
              status: app.status,
              growth,
              finance,
            };
          } catch {
            return {
              appId: app.id,
              appName: app.name,
              name: app.name,
              status: app.status,
              growth: null,
              finance: null,
            };
          }
        })
      );

      return NextResponse.json({ apps: allMetrics });
    }

    const { adapter, app, client } = getMetricsAdapterContext(appId);

    switch (type) {
      case "growth":
        return NextResponse.json(await adapter.fetchGrowth({ app, client, dateRange }));
      case "finance":
        return NextResponse.json(await adapter.fetchFinance({ app, client, dateRange }));
      case "engagement":
        return NextResponse.json(await adapter.fetchEngagement({ app, client, dateRange }));
      case "reliability":
        return NextResponse.json(await adapter.fetchReliability({ app, client, dateRange }));
      case "unit-economics":
        return NextResponse.json(await adapter.fetchUnitEconomics({ app, client, dateRange }));
      case "overview": {
        const [growth, finance, engagement, reliability, unitEconomics] = await Promise.all([
          adapter.fetchGrowth({ app, client, dateRange }),
          adapter.fetchFinance({ app, client, dateRange }),
          adapter.fetchEngagement({ app, client, dateRange }),
          adapter.fetchReliability({ app, client, dateRange }),
          adapter.fetchUnitEconomics({ app, client, dateRange }),
        ]);
        return NextResponse.json({ growth, finance, engagement, reliability, unitEconomics });
      }
      default:
        return NextResponse.json(
          { error: `Unknown metric type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
