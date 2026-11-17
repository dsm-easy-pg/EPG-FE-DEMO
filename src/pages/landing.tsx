import { useState } from "react"
import { Link } from "react-router-dom"
import { Download, Smartphone } from "lucide-react"
import { AuthModal, type AuthMode } from "@/components/auth-modal"
import { Brand } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { timeAgo, won } from "@/lib/format"
import { ANDROID_RELEASE_URL, ANDROID_RELEASE_VERSION } from "@/lib/links"

const STEPS = [
  {
    title: "키 발급",
    description: "대시보드에서 이름과 유효기간을 정해 API 키를 만듭니다.",
  },
  {
    title: "앱 연결",
    description:
      "EPG Android 앱을 설치하고, 발급 화면에 나온 QR 코드를 스캔합니다.",
  },
  {
    title: "결제 확인",
    description:
      "키로 입금 내역과 확인 여부를 조회해 결제를 마무리합니다.",
  },
]

const INSTALL_STEPS = [
  "릴리스 페이지에서 APK 다운로드",
  "설치 후 알림 접근 권한 허용",
  "대시보드 키 발급 화면에서 QR 스캔",
]

const FEED_SAMPLE = [
  { name: "hxqkdp", amount: 12000, checked: true, at: Date.now() - 2 * 60 * 1000 },
  { name: "mvrtsa", amount: 50000, checked: true, at: Date.now() - 9 * 60 * 1000 },
  { name: "plkwbz", amount: 10000, checked: false, at: Date.now() - 24 * 60 * 1000 },
  { name: "qndjfl", amount: 30000, checked: true, at: Date.now() - 47 * 60 * 1000 },
  { name: "tksmwp", amount: 5000, checked: false, at: Date.now() - 88 * 60 * 1000 },
  { name: "vbnxcz", amount: 100000, checked: true, at: Date.now() - 130 * 60 * 1000 },
]

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const feedTotal = FEED_SAMPLE.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
          <Brand />
          <nav className="ml-7 hidden items-center gap-5 sm:flex">
            <a
              href="#how"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              작동 방식
            </a>
            <a
              href="#install"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              앱 설치
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
            <Button onClick={() => setAuthMode("signup")}>키 발급 받기</Button>
          </div>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[minmax(0,1fr)_420px] md:px-6 md:py-24">
          <div>
            <h1 className="max-w-xl text-4xl leading-[1.18] font-semibold tracking-[-0.04em] text-balance md:text-[52px]">
              무통장 입금을,
              <br />
              알림으로 확인합니다.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              휴대폰에 도착한 입금 알림을 서버가 읽고, 결제가 들어왔는지
              알려줍니다. PG 계약이나 정산 수수료 없이 쓸 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => setAuthMode("signup")}>
                키 발급 받기
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={ANDROID_RELEASE_URL} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                  Android 앱 설치
                </a>
              </Button>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Android {ANDROID_RELEASE_VERSION} / GitHub Releases
            </p>
          </div>

          <div className="relative">
            <div className="rounded-xl bg-card ring-1 ring-border">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">입금 알림</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    최근 2시간
                  </p>
                </div>
                <Badge variant="outline">예시</Badge>
              </div>
              <ul className="rule-double divide-y">
                {FEED_SAMPLE.map((d) => (
                  <li
                    key={d.name}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {timeAgo(d.at)}
                    </span>
                    <span className="flex-1 truncate font-mono">{d.name}</span>
                    <span className="font-medium tabular-nums">
                      {won(d.amount)}
                    </span>
                    <span
                      className={
                        d.checked
                          ? "w-7 shrink-0 text-right text-xs font-semibold text-stamp"
                          : "w-7 shrink-0 text-right text-xs text-muted-foreground"
                      }
                    >
                      {d.checked ? "확인" : "대기"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="rule-double flex items-center justify-between px-5 py-4">
                <span className="text-xs text-muted-foreground">합계</span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {won(feedTotal)}
                </span>
              </div>
            </div>
            <span className="stamp absolute -right-3 -bottom-3 bg-card px-2.5 py-1.5 text-sm">
              확인
            </span>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-14 border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            작동 방식
          </h2>
          <ol className="mt-7 divide-y border-t">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid items-baseline gap-1.5 py-5 sm:grid-cols-[72px_160px_1fr] sm:gap-6"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {index + 1}단계
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

      <section id="install" className="scroll-mt-14 border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="rounded-xl bg-foreground px-6 py-8 text-background md:px-9 md:py-10">
            <div className="grid items-start gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4" />
                  <span className="font-mono text-xs text-background/70">
                    EPG-ANDROID {ANDROID_RELEASE_VERSION}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  입금 알림을 보내는 앱
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-background/70">
                  앱을 설치하고 알림 접근 권한을 허용하면, 휴대폰에 도착한 입금
                  알림이 서버로 전달됩니다. 연결은 대시보드의 QR 코드로
                  끝납니다.
                </p>
                <ol className="mt-6 grid gap-2 text-sm sm:grid-cols-3">
                  {INSTALL_STEPS.map((step, index) => (
                    <li key={step} className="flex gap-2 text-background/80">
                      <span className="font-mono text-xs text-background/50">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="md:pt-1">
                <Button
                  size="lg"
                  asChild
                  className="bg-background text-foreground hover:bg-background/90"
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
                <p className="mt-3 text-xs text-background/50">
                  GitHub Releases에서만 배포합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-12 md:px-6">
          <p className="text-base font-medium">
            키를 발급하면 바로 입금 확인 API를 테스트할 수 있습니다.
          </p>
          <Button size="lg" onClick={() => setAuthMode("signup")}>
            시작하기
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:px-6">
          <span className="font-mono">EASY-PG</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/docs" className="hover:text-foreground">
              API 문서
            </Link>
            <a
              href={ANDROID_RELEASE_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Android 앱
            </a>
            <span>원화 입금 확인 API</span>
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
