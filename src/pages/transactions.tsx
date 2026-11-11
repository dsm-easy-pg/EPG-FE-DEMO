import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import { toast } from "sonner"
import { DepositTable } from "@/components/deposit-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEPOSIT_BANKS, useDeposits, type Deposit } from "@/lib/deposits"
import { formatDateTime } from "@/lib/format"

function exportCsv(rows: Deposit[]) {
  const header = ["거래 ID", "입금자명", "금액", "은행", "입금 시각"]
  const body = rows.map((d) => [
    d.id,
    d.depositor,
    String(d.amount),
    d.bank,
    formatDateTime(d.at),
  ])
  const csv = [header, ...body]
    .map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
    .join("\r\n")
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "deposits.csv"
  a.click()
  URL.revokeObjectURL(url)
  toast.success("CSV 파일을 내보냈습니다")
}

export default function Transactions() {
  const deposits = useDeposits()
  const [query, setQuery] = useState("")
  const [bank, setBank] = useState("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deposits.filter((d) => {
      const matchesQuery = d.depositor.toLowerCase().includes(q)
      const matchesBank = bank === "all" || d.bank === bank
      return matchesQuery && matchesBank
    })
  }, [deposits, query, bank])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          입금 내역
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          휴대폰 알림으로 감지된 입금 이벤트를 확인합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 거래</CardTitle>
          <CardDescription>
            총 {filtered.length.toLocaleString("ko-KR")}건
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv(filtered)}
            >
              <Download className="size-3.5" />
              CSV 내보내기
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-wrap items-center gap-2 px-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="입금자명 검색"
                className="w-52 pl-8"
              />
            </div>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="전체 은행" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 은행</SelectItem>
                {DEPOSIT_BANKS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DepositTable deposits={filtered} showId />
        </CardContent>
      </Card>
    </div>
  )
}
