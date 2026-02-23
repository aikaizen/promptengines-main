"use client";

import { useRouter, usePathname } from "next/navigation";
import { useApps } from "@/hooks/use-apps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppSwitcher({ currentAppId }: { currentAppId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { apps } = useApps();

  const appOptions = [...apps];
  if (!appOptions.some((app) => app.id === currentAppId)) {
    appOptions.unshift({
      id: currentAppId,
      name: currentAppId,
      description: "",
      icon: "",
      color: "",
      status: "active",
    });
  }

  function handleAppChange(appId: string) {
    // Get current sub-path (e.g., /finance, /growth)
    const currentPath = pathname?.replace(`/app/${currentAppId}`, "") || "";
    router.push(`/app/${appId}${currentPath}`);
  }

  return (
    <Select value={currentAppId} onValueChange={handleAppChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select app" />
      </SelectTrigger>
      <SelectContent>
        {appOptions.map((app) => (
          <SelectItem
            key={app.id}
            value={app.id}
            disabled={app.status !== "active"}
          >
            <span className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  app.status === "active" ? "bg-green-500" : "bg-muted"
                }`}
              />
              {app.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
