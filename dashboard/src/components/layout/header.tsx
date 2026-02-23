"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./sidebar";
import { DateRangePicker } from "./date-range-picker";

export function Header() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <MobileSidebar />
      <div className="flex-1" />
      <DateRangePicker />
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
    </header>
  );
}
