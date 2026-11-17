import { useState } from "react"
import { Link } from "react-router-dom"
import { AuthModal, type AuthMode } from "@/components/auth-modal"
import { Brand } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { timeAgo, won } from "@/lib/format"

const STEPS = [
  {
    title: "API 키 발급",
    description: "가입 후 이름과 유효기간을 정해 API 키를 발급합니다.",
  },
  {
    title: "기기 연결",
    description:
      "발급 모달에 표시된 QR 코드를 Android 앱에서 스캔하면 폰이 계정에 연결됩니다.",
  },
  {
    title: "입금 확인",
    description:
      "API 키로 입금 내역과 확인 여부를 조회해 결제를 검증합니다.",
  },
]

const FEED_SAMPLE = [
  { name: "hxqkdp", amount: 12000, at: Date.now() - 2 * 60 * 1000 },
  { name: "mvrtsa", amount: 50000, at: Date.now() - 9 * 60 * 1000 },
  { name: "plkwbz", amount: 10000, at: Date.now() - 24 * 60 * 1000 },
  { name: "qndjfl", amount: 30000, at: Date.now() - 47 * 60 * 1000 },
  { name: "tksmwp", amount: 5000, at: Date.now() - 88 * 60 * 1000 },
  { name: "vbnxcz", amount: 100000, at: Date.now() - 130 * 60 * 1000 },
]

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
          <Brand />
          <nav className="ml-6 hidden items-center gap-5 sm:flex">
            <a
              href="#how"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              작동 방식
            </a>
            <Link
              to="/docs"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              API 문서
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={() => setAuthMode("login")}>
              로그인
            </Button>
            <Button onClick={() => setAuthMode("signup")}>시작하기</Button>
          </div>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[minmax(0,1fr)_400px] md:px-6 md:py-20">
          <div>
            <h1 className="font-heading text-4xl leading-[1.15] font-semibold tracking-tight text-balance md:text-5xl">
              EASY-PG
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              PG사 연동 없이 수수료 없이 무통장 입금 결제!
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setAuthMode("signup")}>
                시작하기
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#how">작동 방식</a>
              </Button>
            </div>
          </div>

          <div>
            <div className="rounded-xl border bg-background">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-sm font-medium">입금 피드</span>
                <Badge variant="outline" className="font-normal">
                  예시
                </Badge>
              </div>
              <ul className="divide-y">
                {FEED_SAMPLE.map((d) => (
                  <li
                    key={d.name}
                    className="feed-row flex items-center gap-4 px-4 py-3 text-sm"
                  >
                    <span className="w-16 shrink-0 font-mono">{d.name}</span>
                    <span className="flex-1 text-muted-foreground">
                      입금 감지
                    </span>
                    <span className="font-medium tabular-nums">
                      {won(d.amount)}
                    </span>
                    <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {timeAgo(d.at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-14 border-b">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            작동 방식
          </h2>
          <ol className="mt-6 divide-y border-t">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid items-baseline gap-1.5 py-5 sm:grid-cols-[64px_180px_1fr] sm:gap-6"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-14 md:px-6">
          <p className="text-base font-medium">
            가입하면 바로 키를 발급하고 입금 확인 API를 테스트할 수 있습니다.
          </p>
          <Button size="lg" onClick={() => setAuthMode("signup")}>
            시작하기
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:px-6">
          <span>EASY-PG</span>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-foreground">
              API 문서
            </Link>
            <span>휴대폰 입금 알림 기반 결제 확인 API</span>
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
