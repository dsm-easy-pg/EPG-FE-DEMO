import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DepositTable } from "@/components/deposit-table"
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
import {
  dailyTotals,
  startOfDay,
  useDeposits,
} from "@/lib/deposits"
import { won } from "@/lib/format"

const chartConfig = {
  total: { label: "입금액", color: "var(--foreground)" },
} satisfies ChartConfig

export default function Dashboard() {
  const deposits = useDeposits()
  const [now] = useState(() => Date.now())

  const stats = useMemo(() => {
    const todayStart = startOfDay(now)
    const today = deposits.filter((d) => d.at >= todayStart)
    const total = deposits.reduce((sum, d) => sum + d.amount, 0)
    return {
      todayAmount: today.reduce((sum, d) => sum + d.amount, 0),
      todayCount: today.length,
      totalAmount: total,
      count: deposits.length,
      average: deposits.length > 0 ? Math.round(total / deposits.length) : 0,
    }
  }, [deposits, now])

  const daily = useMemo(() => dailyTotals(deposits), [deposits])

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>오늘 입금액</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {won(stats.todayAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              오늘 {stats.todayCount}건
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>총 입금액</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {won(stats.totalAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">최근 7일 누적</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>입금 건수</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {stats.count.toLocaleString("ko-KR")}건
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">최근 7일</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>평균 입금액</CardDescription>
            <CardTitle className="text-2xl tabular-nums tracking-tight">
              {won(stats.average)}
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
            <CardTitle>일별 입금액</CardTitle>
            <CardDescription>최근 7일동안 감지된 입금액 합계</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <BarChart data={daily} margin={{ top: 8, bottom: 0 }}>
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
            <DepositTable deposits={deposits.slice(0, 6)} time="relative" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
