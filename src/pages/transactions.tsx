import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Download, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { DepositTable } from "@/components/deposit-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { errorMessage } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import {
  getRemittanceCached,
  listRemittances,
  normalizeDateRange,
  parseDateTime,
  sortByLatest,
  todayParam,
  useRemittanceRows,
  type Remittance,
  type RemittanceFilters,
  type RemittanceRow,
} from "@/lib/remittances"

interface TransactionsState {
  loading: boolean
  error: string | null
  items: Remittance[]
  totalPages: number
  totalElements: number
  page: number
}

function exportCsv(rows: RemittanceRow[]) {
  const header = ["거래 ID", "입금자명", "금액", "상태", "입금 시각"]
  const body = rows.map((row) => [
    row.uuid,
    row.name,
    String(row.amount),
    row.checked ? "확인" : "대기",
    row.at === null ? "" : formatDateTime(row.at),
  ])
  const csv = [header, ...body]
    .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
    .join("\r\n")
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `deposits-${todayParam()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const minAmountParam = searchParams.get("minAmount") ?? ""
  const checkedParam = searchParams.get("checked") ?? "all"
  const pageParam = Math.max(0, Number(searchParams.get("page") ?? "0") || 0)

  const filters = useMemo<RemittanceFilters>(() => {
    const minAmount = Number(minAmountParam)
    return {
      ...normalizeDateRange(from || undefined, to || undefined),
      minAmount:
        minAmountParam && Number.isFinite(minAmount) && minAmount > 0
          ? minAmount
          : undefined,
      isChecked:
        checkedParam === "checked"
          ? true
          : checkedParam === "unchecked"
            ? false
            : undefined,
    }
  }, [from, to, minAmountParam, checkedParam])

  const [state, setState] = useState<TransactionsState>({
    loading: true,
    error: null,
    items: [],
    totalPages: 0,
    totalElements: 0,
    page: 0,
  })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const firstPage = await listRemittances(filters, 0)
        const totalPages = firstPage.totalPages
        const safePage =
          totalPages === 0 ? 0 : Math.min(pageParam, totalPages - 1)

        const apiPage = totalPages === 0 ? 0 : totalPages - 1 - safePage
        const result =
          apiPage === 0
            ? firstPage
            : await listRemittances(filters, apiPage)

        if (cancelled) return
        setState({
          loading: false,
          error: null,
          items: result.content,
          totalPages,
          totalElements: result.totalElements,
          page: safePage,
        })
      } catch (error) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage(error),
        }))
      }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))
    load()
    const interval = window.setInterval(load, 15000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [filters, pageParam])

  const { rows } = useRemittanceRows(state.items)
  const displayRows = useMemo(() => sortByLatest([...rows].reverse()), [rows])

  const exportAllCsv = async () => {
    if (exporting || state.totalElements === 0) return
    setExporting(true)
    try {
      const firstPage = await listRemittances(filters, 0)
      if (firstPage.totalPages === 0) {
        toast("내려받을 내역이 없습니다")
        return
      }

      const pages = await Promise.all(
        Array.from({ length: firstPage.totalPages }, (_, index) =>
          index === 0 ? Promise.resolve(firstPage) : listRemittances(filters, index),
        ),
      )
      const items = pages.flatMap((page) => page.content)
      const rowsWithTime = await Promise.all(
        items.map(async (item) => {
          try {
            const detail = await getRemittanceCached(item.uuid)
            return { ...item, at: parseDateTime(detail.created_date) }
          } catch {
            return { ...item, at: null }
          }
        }),
      )

      exportCsv(sortByLatest([...rowsWithTime].reverse()))
      toast.success(`CSV 파일을 내려받았습니다 (${rowsWithTime.length}건)`)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  const setFilter = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value && value !== "all") {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        next.delete("page")
        return next
      },
      { replace: true },
    )
  }

  const setPage = (page: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (page > 0) {
          next.set("page", String(page))
        } else {
          next.delete("page")
        }
        return next
      },
      { replace: true },
    )
  }

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const hasFilters =
    Boolean(from) ||
    Boolean(to) ||
    Boolean(minAmountParam) ||
    checkedParam !== "all"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.045em] md:text-[34px]">
          입금 내역
        </h1>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>입금 내역을 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>거래 내역</CardTitle>
          <CardDescription>
            총 {state.totalElements.toLocaleString("ko-KR")}건
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllCsv}
              disabled={exporting || state.totalElements === 0}
            >
              <Download className="size-3.5" />
              {exporting ? "내려받는 중" : "CSV로 내려받기"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-5 px-0">
          <div className="mx-6 flex flex-wrap items-end gap-3 rounded-2xl bg-background p-4 ring-1 ring-border/60">
            <div className="space-y-1.5">
              <Label htmlFor="from" className="text-xs text-muted-foreground">
                시작일
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(event) => setFilter("from", event.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs text-muted-foreground">
                종료일
              </Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(event) => setFilter("to", event.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="minAmount"
                className="text-xs text-muted-foreground"
              >
                최소 금액
              </Label>
              <Input
                id="minAmount"
                type="number"
                min={1}
                step={1000}
                inputMode="numeric"
                placeholder="0"
                value={minAmountParam}
                onChange={(event) =>
                  setFilter("minAmount", event.target.value)
                }
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                확인 상태
              </Label>
              <Select
                value={checkedParam}
                onValueChange={(value) => setFilter("checked", value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="checked">확인</SelectItem>
                  <SelectItem value="unchecked">대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                필터 초기화
              </Button>
            )}
          </div>

          {state.loading && state.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              입금 내역을 불러오는 중입니다.
            </div>
          ) : (
            <DepositTable deposits={displayRows} showId />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 px-6">
            <p className="text-xs text-muted-foreground">
              {state.totalPages === 0
                ? "0 / 0"
                : `${state.page + 1} / ${state.totalPages}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(state.page - 1)}
                disabled={state.loading || state.page <= 0}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(state.page + 1)}
                disabled={
                  state.loading ||
                  state.totalPages === 0 ||
                  state.page >= state.totalPages - 1
                }
              >
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
