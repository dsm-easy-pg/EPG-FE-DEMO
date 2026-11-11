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
    <Table>
      <TableHeader>
        <TableRow>
          {showId && <TableHead className="w-28">거래 ID</TableHead>}
          <TableHead>입금자명</TableHead>
          <TableHead className="text-right">입금액</TableHead>
          <TableHead>은행</TableHead>
          <TableHead className="text-right">입금 시각</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((d) => (
          <TableRow key={d.id}>
            {showId && (
              <TableCell className="font-mono text-xs text-muted-foreground">
                {d.id}
              </TableCell>
            )}
            <TableCell className="font-mono">{d.depositor}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {won(d.amount)}
            </TableCell>
            <TableCell>{d.bank}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {time === "relative" ? timeAgo(d.at) : formatDateTime(d.at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
