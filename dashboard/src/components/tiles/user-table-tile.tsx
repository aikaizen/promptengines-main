"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UserSummary } from "@/types/metrics";

interface UserTableTileProps {
  title: string;
  description?: string;
  users: UserSummary[];
  appId: string;
  loading?: boolean;
  className?: string;
}

type SortKey = keyof Pick<
  UserSummary,
  "email" | "joinedAt" | "lastActive" | "revenue" | "cost" | "margin" | "marginPercent" | "generations"
>;
type SortDir = "asc" | "desc";
type TabFilter = "all" | "profitable" | "unprofitable" | "free" | "recent";

const PAGE_SIZE = 50;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const funnelLabels: Record<string, string> = {
  signed_up: "Signed Up",
  onboarded: "Onboarded",
  first_gen: "First Gen",
  purchased: "Purchased",
  retained: "Retained",
};

export function UserTableTile({
  title,
  description,
  users,
  appId,
  loading,
  className,
}: UserTableTileProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...users];

    // Tab filter
    switch (tab) {
      case "profitable":
        result = result.filter((u) => u.profitability === "profitable");
        break;
      case "unprofitable":
        result = result.filter(
          (u) => u.profitability === "unprofitable" || u.profitability === "marginal"
        );
        break;
      case "free":
        result = result.filter((u) => u.plan === "free");
        break;
      case "recent":
        result = result.filter((u) => {
          const joined = new Date(u.joinedAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joined >= thirtyDaysAgo;
        });
        break;
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    });

    return result;
  }, [users, tab, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "profitable", label: "Profitable" },
    { key: "unprofitable", label: "Unprofitable" },
    { key: "free", label: "Free" },
    { key: "recent", label: "Recent" },
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Tabs + Search */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex gap-1 flex-wrap">
                {tabs.map((t) => (
                  <Button
                    key={t.key}
                    variant={tab === t.key ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setTab(t.key);
                      setPage(0);
                    }}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Search email or name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="sm:ml-auto sm:max-w-xs h-8 text-xs"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      User{sortIndicator("email")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("revenue")}
                    >
                      Revenue{sortIndicator("revenue")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("cost")}
                    >
                      Cost{sortIndicator("cost")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("margin")}
                    >
                      Margin{sortIndicator("margin")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("marginPercent")}
                    >
                      Margin %{sortIndicator("marginPercent")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("generations")}
                    >
                      Gens{sortIndicator("generations")}
                    </TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageData.map((user) => (
                      <TableRow
                        key={user.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          user.profitability === "profitable" &&
                            "bg-green-50/50 dark:bg-green-950/20",
                          user.profitability === "unprofitable" &&
                            "bg-red-50/50 dark:bg-red-950/20"
                        )}
                      >
                        <TableCell>
                          <Link
                            href={`/app/${appId}/users/${user.id}`}
                            className="block"
                          >
                            <div className="font-medium text-sm">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(user.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(user.cost)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            user.margin >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {formatCurrency(user.margin)}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.marginPercent > 0
                            ? `${user.marginPercent.toFixed(1)}%`
                            : user.marginPercent === 0
                              ? "0%"
                              : `${user.marginPercent.toFixed(0)}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.generations.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {funnelLabels[user.funnelStage] || user.funnelStage}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.profitability === "profitable"
                                ? "default"
                                : user.profitability === "marginal"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {user.profitability}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}-
                  {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
