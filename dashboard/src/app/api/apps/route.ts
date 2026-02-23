import { NextResponse } from "next/server";
import { getAllApps } from "@/lib/app-registry";

export async function GET() {
  const apps = getAllApps().map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    icon: app.icon,
    color: app.color,
    status: app.status,
  }));

  return NextResponse.json({ apps });
}
