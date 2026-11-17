import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
  Check,
  ChevronRight,
  Download,
  LayoutDashboard,
  Smartphone,
  Terminal,
  Trash2,
} from "lucide-react"
import { AuthModal, type AuthMode } from "@/components/auth-modal"
import { Brand } from "@/components/brand"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { won } from "@/lib/format"
import {
  ANDROID_RELEASE_URL,
  ANDROID_RELEASE_VERSION,
  API_BASE_URL,
} from "@/lib/links"

const STEPS = [
  {
    title: "키를 발급합니다",
    description:
      "대시보드에서 이름과 유효기간을 정해 API 키를 만듭니다. 키는 발급할 때 한 번만 보입니다.",
  },
  {
    title: "앱을 연결합니다",
    description:
      "EPG Android 앱을 설치하고 발급 화면의 QR 코드를 스캔합니다. 알림 접근 권한을 허용하면 준비가 끝납니다.",
  },
  {
    title: "입금을 확인합니다",
    description:
      "키로 입금 내역과 확인 여부를 조회합니다. 결제 서버는 원하는 시점에 바로 확인할 수 있습니다.",
  },
]

const FEED = [
  { name: "김민수", amount: 12000, time: "방금 전", checked: true },
  { name: "이서연", amount: 50000, time: "3분 전", checked: true },
  { name: "박준호", amount: 10000, time: "12분 전", checked: false },
  { name: "최지우", amount: 30000, time: "28분 전", checked: true },
]

const WEEK = [34, 48, 41, 62, 55, 78, 68]
const DAYS = ["월", "화", "수", "목", "금", "토", "일"]

const CURL = `curl -X POST ${API_BASE_URL}/api/rem/v1 \\
  -H "X-Api-Key: epg-..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 12000}'`

const RESPONSE = `{
  "success": true,
  "data": {
    "uuid": "ab1783fe9ce24683a50871cadecb788a",
    "name": "CCATPB",
    "amount": 12000
  },
  "error": null
}`

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl bg-background p-3.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-[1040px] animate-rise rise-4 md:mt-20">
      <div className="surface-shadow overflow-hidden rounded-[28px] border border-white/80 bg-card">
        <div className="flex h-14 items-center gap-2.5 border-b border-border/70 px-4 md:px-5">
          <img
            src="/easy-pg-logo.png"
            alt=""
            aria-hidden="true"
            className="h-6 w-auto max-w-none shrink-0 object-contain"
          />
          <span className="text-sm font-medium">입금 현황</span>
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            easypg.app / dashboard
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" />
            15초마다 갱신
          </span>
          <span className="grid size-7 place-items-center rounded-full bg-secondary text-[10px] font-semibold">
            EP
          </span>
        </div>
        <div className="grid lg:grid-cols-[1.55fr_1fr]">
          <div className="p-4 md:p-6 lg:border-r lg:border-border/70">
            <div className="grid grid-cols-3 gap-2 md:gap-2.5">
              <StatCard label="누적 입금" value="₩1,248,000" hint="+12.4%" />
              <StatCard label="확인 대기" value="₩32,000" hint="2건" />
              <StatCard label="오늘 입금" value="₩184,000" hint="9건" />
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">최근 입금</p>
                <span className="text-[10px] text-muted-foreground">
                  전체 내역
                </span>
              </div>
              <div className="mt-2.5 divide-y divide-border/70 rounded-2xl bg-background/70 px-3.5">
                {FEED.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 py-3"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-muted-foreground">
                      {item.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-medium tabular-nums">
                      {won(item.amount)}
                    </span>
                    <Badge
                      variant={item.checked ? "success" : "outline"}
                      className="h-5 px-2 text-[10px]"
                    >
                      {item.checked ? "확인" : "대기"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border/70 p-4 md:p-6 lg:border-t-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">이번 주 입금</p>
              <span className="font-mono text-[10px] text-muted-foreground">
                7일
              </span>
            </div>
            <p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] tabular-nums">
              ₩294,000
            </p>
            <div className="mt-5 flex h-28 items-end gap-2">
              {WEEK.map((height, index) => (
                <div
                  key={DAYS[index]}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={
                      index === WEEK.length - 1
                        ? "w-full rounded-t-md bg-primary"
                        : "w-full rounded-t-md bg-primary/18"
                    }
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {DAYS[index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-primary p-3.5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bell className="size-3.5" />
                <span className="text-[11px] font-medium">알림 연결됨</span>
                <ChevronRight className="ml-auto size-3.5" />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-primary-foreground/75">
                새 입금 알림을 받으면 서버가 자동으로 기록합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-4 hidden items-center gap-3 rounded-2xl bg-card px-4 py-3 soft-shadow ring-1 ring-border/80 sm:flex">
        <span className="grid size-8 place-items-center rounded-full bg-success/10 text-success">
          <Bell className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-medium">새 입금 알림</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            김민수 {won(12000)}
          </p>
        </div>
        <Badge variant="success" className="ml-2 h-5 px-2 text-[10px]">
          확인
        </Badge>
      </div>
      <div className="absolute top-24 -right-3 hidden items-center gap-2 rounded-full bg-card px-3 py-2 soft-shadow ring-1 ring-border/80 xl:flex">
        <span className="size-1.5 rounded-full bg-success" />
        <span className="font-mono text-[10px] font-medium">200 OK</span>
      </div>
    </div>
  )
}

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[260px] rounded-[38px] border-[7px] border-[#101116] bg-[#101116] p-1.5 shadow-[0_32px_80px_-32px_rgba(0,0,0,.55)]">
      <div className="overflow-hidden rounded-[30px] bg-background px-3.5 pt-3 pb-5">
        <div className="flex items-center justify-between px-1 text-[9px] font-medium text-muted-foreground">
          <span>9:41</span>
          <span className="h-1 w-10 rounded-full bg-foreground/85" />
          <span>100%</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <img
            src="/easy-pg-logo.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto max-w-none shrink-0 object-contain"
          />
          <div>
            <p className="text-[11px] font-semibold">EPG Android</p>
            <p className="text-[9px] text-muted-foreground">알림 연결됨</p>
          </div>
          <Badge variant="success" className="ml-auto h-5 px-2 text-[9px]">
            실행 중
          </Badge>
        </div>
        <div className="mt-4 space-y-2">
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border/80">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-[#ffe812] text-[10px] font-bold text-[#3b2f00]">
                K
              </span>
              <span className="text-[10px] font-medium">국민은행</span>
              <span className="ml-auto text-[9px] text-muted-foreground">
                지금
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium">입금 12,000원</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              김민수님이 입금했습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-card p-3 ring-1 ring-border/80">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-[#0046ff] text-[9px] font-bold text-white">
                T
              </span>
              <span className="text-[10px] font-medium">토스뱅크</span>
              <span className="ml-auto text-[9px] text-muted-foreground">
                3분 전
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium">입금 50,000원</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              이서연님이 입금했습니다.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary px-3 py-2.5 text-primary-foreground">
          <Smartphone className="size-3.5" />
          <span className="text-[10px] font-medium">서버로 전달되었습니다</span>
          <Check className="ml-auto size-3.5" />
        </div>
      </div>
    </div>
  )
}

function ApiPreview() {
  return (
    <div className="soft-shadow overflow-hidden rounded-[28px] bg-[#15161b] text-white ring-1 ring-white/5">
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[10px] text-white/45">
          POST /api/rem/v1
        </span>
        <span className="ml-auto rounded-full bg-white/8 px-2 py-1 font-mono text-[9px] text-white/50">
          cURL
        </span>
      </div>
      <pre className="overflow-x-auto px-5 py-5 font-mono text-[11px] leading-6 text-white/70">
        <code>{CURL}</code>
      </pre>
      <div className="border-t border-white/8 px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#4ed4a1]" />
          <span className="font-mono text-[10px] text-[#4ed4a1]">200 OK</span>
          <span className="ml-auto font-mono text-[10px] text-white/35">
            application/json
          </span>
        </div>
        <pre className="overflow-x-auto font-mono text-[11px] leading-5 text-white/55">
          <code>{RESPONSE}</code>
        </pre>
      </div>
    </div>
  )
}

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
      />

      <main>
        <section className="relative overflow-hidden">
          <div className="hero-aura pointer-events-none absolute inset-x-0 top-0 h-[680px]" />
          <div className="relative mx-auto max-w-[1200px] px-5 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="mx-auto max-w-[820px] text-center">
              <p className="eyebrow animate-rise">BANK TRANSFER API</p>
              <h1 className="mt-5 animate-rise rise-1 text-[44px] leading-[1.04] font-medium tracking-[-0.055em] text-balance md:text-[68px]">
                무통장 입금을,
                <br />
                알림으로 확인합니다.
              </h1>
              <p className="mx-auto mt-6 max-w-[560px] animate-rise rise-2 text-[16px] leading-7 text-muted-foreground md:text-[18px] md:leading-8">
                휴대폰에 도착한 입금 알림을 서버가 읽고, 결제가 들어왔는지
                API로 알려줍니다. PG 계약 없이 시작하세요.
              </p>
              <div className="mt-8 flex animate-rise rise-3 flex-col items-center justify-center gap-2 sm:flex-row">
                <Button size="lg" onClick={() => setAuthMode("signup")}>
                  무료로 시작하기
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/docs">API 문서 보기</Link>
                </Button>
              </div>
              <p className="mt-4 animate-rise rise-3 text-xs text-muted-foreground">
                API 키를 발급하면 바로 테스트할 수 있습니다.
              </p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/45">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-border/70 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["입금 알림 수신", "은행 앱의 알림을 읽습니다"],
              ["15초 자동 갱신", "대시보드가 최신 상태를 유지합니다"],
              [`Android ${ANDROID_RELEASE_VERSION}`, "GitHub Releases에서 배포합니다"],
            ].map(([title, detail]) => (
              <div key={title} className="py-5 sm:px-7 sm:py-6">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-24">
          <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="eyebrow">HOW IT WORKS</p>
              <h2 className="mt-4 text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[48px]">
                알림 하나로,
                <br />
                입금 확인이 끝납니다.
              </h2>
              <p className="mx-auto mt-5 max-w-[520px] text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                은행 앱의 입금 알림을 서버로 보내고, 키로 조회할 수 있는
                상태로 만듭니다. 결제 서버는 필요한 순간에 바로 확인합니다.
              </p>
            </div>
            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-3xl bg-card p-6 ring-1 ring-border/80 md:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium text-primary">
                      0{index + 1}
                    </span>
                    <span className="grid size-8 place-items-center rounded-full bg-primary/8 text-primary">
                      {index === 0 ? (
                        <LayoutDashboard className="size-4" />
                      ) : index === 1 ? (
                        <Terminal className="size-4" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </span>
                  </div>
                  <h3 className="mt-8 text-[19px] font-semibold tracking-[-0.03em]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="api"
          className="scroll-mt-24 border-y border-border/70 bg-card/45"
        >
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">DEVELOPER API</p>
              <h2 className="mt-4 text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[48px]">
                코드 몇 줄이면
                <br />
                충분합니다.
              </h2>
              <p className="mt-5 max-w-[480px] text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                키를 헤더에 담아 요청하면 입금 내역과 확인 여부를 JSON으로
                돌려줍니다. 복잡한 인증이나 웹훅 설정은 필요 없습니다.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "X-Api-Key 헤더 하나로 인증",
                  "입금 생성, UUID 조회, 이름 조회",
                  "success, data, error로 통일된 응답",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/docs">
                    API 문서 읽기
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setAuthMode("signup")}>
                  키 발급
                </Button>
              </div>
            </div>
            <ApiPreview />
          </div>
        </section>

        <section id="install" className="scroll-mt-24">
          <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
            <div className="grid items-center gap-12 overflow-hidden rounded-[32px] bg-foreground px-6 py-10 text-background md:px-12 md:py-14 lg:grid-cols-[1fr_320px] lg:gap-8">
              <div>
                <p className="eyebrow text-[#97a9ff]">ANDROID APP</p>
                <h2 className="mt-4 text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[46px]">
                  입금 알림을 보내는 앱.
                </h2>
                <p className="mt-5 max-w-[480px] text-sm leading-6 text-white/60 md:text-base md:leading-7">
                  앱을 설치하고 알림 접근 권한을 허용하면, 휴대폰에 도착한 입금
                  알림이 서버로 전달됩니다. 연결은 대시보드의 QR 코드로
                  끝납니다.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-foreground hover:bg-white/90"
                  >
                    <a
                      href={ANDROID_RELEASE_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="size-4" />
                      {ANDROID_RELEASE_VERSION} 내려받기
                    </a>
                  </Button>
                  <span className="font-mono text-[10px] text-white/40">
                    GitHub Releases에서만 배포합니다
                  </span>
                </div>
                <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
                  {["APK 다운로드", "알림 접근 권한 허용", "QR 코드로 연결"].map(
                    (item, index) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-white/70"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-[9px] text-white/60">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ),
                  )}
                </ol>
              </div>
              <PhonePreview />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="mx-auto max-w-[1200px] px-5 py-20 text-center md:py-28">
          <p className="eyebrow text-[#97a9ff]">GET STARTED</p>
          <h2 className="mx-auto mt-5 max-w-[720px] text-[36px] leading-[1.04] font-medium tracking-[-0.05em] text-balance md:text-[56px]">
            키 하나로,
            <br />
            입금 확인을 시작하세요.
          </h2>
          <p className="mx-auto mt-5 max-w-[500px] text-sm leading-6 text-white/55 md:text-base">
            API 키를 발급하고 Android 앱을 연결하면 바로 입금 확인을 테스트할
            수 있습니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90"
              onClick={() => setAuthMode("signup")}
            >
              무료로 시작하기
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/15 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a
                href={ANDROID_RELEASE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Android 앱 설치
              </a>
            </Button>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <Brand className="text-background" />
            <div className="flex flex-wrap items-center gap-5">
              <Link
                to="/docs"
                className="transition-colors hover:text-white"
              >
                API 문서
              </Link>
              <a
                href={ANDROID_RELEASE_URL}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                Android 앱
              </a>
              <span>원화 입금 확인 API</span>
            </div>
            <span className="font-mono text-[10px]">EASY-PG © 2026</span>
          </div>
        </div>
      </footer>

      <AuthModal
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthMode(null)}
      />
    </div>
  )
}
