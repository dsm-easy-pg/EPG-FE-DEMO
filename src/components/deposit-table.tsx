import type { Deposit } from "@/lib/deposits"
import { formatDateTime, timeAgo, won } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DepositTableProps {
  deposits: Deposit[]
  showId?: boolean
  time?: "relative" | "absolute"
}

export function DepositTable({
  deposits,
  showId = false,
  time = "absolute",
}: DepositTableProps) {
  if (deposits.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        조건에 맞는 입금 내역이 없습니다.
      </div>
    )
  }

  return (
    <Table className="min-w-[520px]">
      <TableHeader>
        <TableRow>
          {showId && <TableHead className="pl-6">거래 ID</TableHead>}
          <TableHead className={showId ? "px-4" : "pl-6"}>입금자명</TableHead>
          <TableHead className="px-4 text-right">입금액</TableHead>
          <TableHead className="px-4">은행</TableHead>
          <TableHead className="pr-6 text-right">입금 시각</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((d) => (
          <TableRow key={d.id}>
            {showId && (
              <TableCell className="py-3 pl-6 font-mono text-xs text-muted-foreground">
                {d.id}
              </TableCell>
            )}
            <TableCell className={showId ? "px-4 py-3" : "py-3 pl-6 font-mono"}>
              {d.depositor}
            </TableCell>
            <TableCell className="px-4 py-3 text-right font-medium tabular-nums">
              {won(d.amount)}
            </TableCell>
            <TableCell className="px-4 py-3">{d.bank}</TableCell>
            <TableCell className="py-3 pr-6 text-right tabular-nums text-muted-foreground">
              {time === "relative" ? timeAgo(d.at) : formatDateTime(d.at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
