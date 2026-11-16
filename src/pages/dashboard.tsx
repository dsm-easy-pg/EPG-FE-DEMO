import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DepositTable } from "@/components/deposit-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { errorMessage } from "@/lib/api"
import { won } from "@/lib/format"
import {
  dateParamLabel,
  daysAgoParam,
  getRemittanceMetric,
  listRemittances,
  sortByLatest,
  useRemittanceRows,
  type Remittance,
} from "@/lib/remittances"

const chartConfig = {
  total: { label: "입금액", color: "var(--foreground)" },
} satisfies ChartConfig

interface DashboardState {
  loading: boolean
  error: string | null
  totalAmount: number
  totalCount: number
  pendingAmount: number
  pendingCount: number
  daily: { date: string; total: number; count: number }[]
  recent: Remittance[]
}

function emptyDaily() {
  return Array.from({ length: 7 }, (_, index) => ({
    date: dateParamLabel(daysAgoParam(6 - index)),
    total: 0,
    count: 0,
  }))
}

function initialiseState(): DashboardState {
  return {
    loading: true,
    error: null,
    totalAmount: 0,
    totalCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    daily: emptyDaily(),
    recent: [],
  }
}

async function loadRecent() {
  const firstPage = await listRemittances({}, 0)
  if (firstPage.totalPages <= 1) {
    return [...firstPage.content].reverse().slice(0, 6)
  }

  const lastPage = await listRemittances({}, firstPage.totalPages - 1)
  const pages = [lastPage]
  if (lastPage.content.length < 6 && firstPage.totalPages > 2) {
    const previousPage = await listRemittances({}, firstPage.totalPages - 2)
    pages.unshift(previousPage)
  }
  return pages.flatMap((page) => page.content).reverse().slice(0, 6)
}

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>(initialiseState)
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        daysAgoParam(weekOffset * 7 + (6 - index)),
      ),
    [weekOffset],
  )
  const rangeLabel = `${dateParamLabel(weekDays[0])} ~ ${dateParamLabel(weekDays[6])}`

  useEffect(() => {
    let cancelled = false
    const days = weekDays

    const load = async () => {
      try {
        const [total, pending, daily, recent] = await Promise.all([
          getRemittanceMetric({}),
          getRemittanceMetric({ isChecked: false }),
          Promise.all(
            days.map((day) =>
              getRemittanceMetric({ startDate: day, endDate: day }),
            ),
          ),
          loadRecent(),
        ])
        if (cancelled) return

        setState({
          loading: false,
          error: null,
          totalAmount: total.totalAmount,
          totalCount: total.totalCount,
          pendingAmount: pending.totalAmount,
          pendingCount: pending.totalCount,
          daily: days.map((day, index) => ({
            date: dateParamLabel(day),
            total: daily[index].totalAmount,
            count: daily[index].totalCount,
          })),
          recent,
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

    load()
    const interval = window.setInterval(load, 15000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [weekDays])

  const { rows } = useRemittanceRows(state.recent)
  const recentRows = useMemo(() => sortByLatest(rows).slice(0, 6), [rows])
  const average =
    state.totalCount > 0 ? Math.round(state.totalAmount / state.totalCount) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          휴대폰에서 감지된 입금 알림을 실시간으로 확인합니다.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>데이터를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>총 입금액</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {state.loading ? "—" : won(state.totalAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">전체 누적</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>입금 건수</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {state.loading
                ? "—"
                : `${state.totalCount.toLocaleString("ko-KR")}건`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">전체 누적</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>확인 대기</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {state.loading ? "—" : won(state.pendingAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {state.loading
                ? "—"
                : `${state.pendingCount.toLocaleString("ko-KR")}건`}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>평균 입금액</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {state.loading ? "—" : won(average)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">건당 평균</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>최근 7일 입금액</CardTitle>
            <CardDescription>{rangeLabel} · 7일 합계</CardDescription>
            <CardAction className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset((offset) => offset + 1)}
              >
                <ChevronLeft className="size-3.5" />
                이전 7일
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setWeekOffset((offset) => Math.max(0, offset - 1))
                }
                disabled={weekOffset === 0}
              >
                다음 7일
                <ChevronRight className="size-3.5" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <BarChart data={state.daily} margin={{ top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v) =>
                    typeof v === "number" && v >= 10000
                      ? `${Math.round(v / 10000)}만`
                      : v
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => won(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>최근 입금 내역</CardTitle>
            <CardAction className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 font-normal">
                <span className="size-1.5 animate-pulse rounded-full bg-foreground" />
                실시간
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/transactions">
                  전체 보기
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {state.loading && state.recent.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                입금 내역을 불러오는 중…
              </div>
            ) : (
              <DepositTable deposits={recentRows} time="relative" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
