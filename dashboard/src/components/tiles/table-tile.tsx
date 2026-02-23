import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TileWrapper } from "./tile-wrapper";

interface Column {
  key: string;
  label: string;
  format?: (value: unknown) => string;
  align?: "left" | "center" | "right";
}

interface TableTileProps {
  title: string;
  description?: string;
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  error?: string;
  className?: string;
}

export function TableTile({
  title,
  description,
  columns,
  data,
  loading,
  error,
  className,
}: TableTileProps) {
  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.align === "right" ? "text-right" : ""}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={col.align === "right" ? "text-right" : ""}
                  >
                    {col.format
                      ? col.format(row[col.key])
                      : String(row[col.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TileWrapper>
  );
}
