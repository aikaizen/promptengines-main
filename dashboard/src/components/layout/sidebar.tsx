"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { useApps } from "@/hooks/use-apps";

const navigation = [
  { name: "Overview", href: "/", icon: "LayoutDashboard" },
];

const appNavigation = [
  { name: "Overview", href: "", icon: "BarChart3" },
  { name: "Finance", href: "/finance", icon: "DollarSign" },
  { name: "Growth", href: "/growth", icon: "TrendingUp" },
  { name: "Engagement", href: "/engagement", icon: "Activity" },
  { name: "Reliability", href: "/reliability", icon: "Shield" },
  { name: "Users", href: "/users", icon: "Users" },
];

function SidebarContent() {
  const pathname = usePathname();
  const { apps } = useApps();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            PE
          </div>
          <span className="text-sm">PromptEngines</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                size="sm"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Apps
        </p>

        {apps.map((app) => (
          <div key={app.id} className="mb-3">
            <Link href={`/app/${app.id}`}>
              <Button
                variant={
                  pathname === `/app/${app.id}` ? "secondary" : "ghost"
                }
                className={cn(
                  "w-full justify-start text-sm font-medium",
                  app.status === "coming_soon" && "opacity-50"
                )}
                size="sm"
                disabled={app.status === "coming_soon"}
              >
                <span
                  className={cn(
                    "mr-2 h-2 w-2 rounded-full",
                    app.status === "active" ? "bg-green-500" : "bg-muted"
                  )}
                />
                {app.name}
              </Button>
            </Link>

            {app.status === "active" &&
              pathname?.startsWith(`/app/${app.id}`) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {appNavigation.map((section) => {
                    const href = `/app/${app.id}${section.href}`;
                    return (
                      <Link key={href} href={href}>
                        <Button
                          variant={pathname === href ? "secondary" : "ghost"}
                          className="w-full justify-start text-xs"
                          size="sm"
                        >
                          {section.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div onClick={() => setOpen(false)}>
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
