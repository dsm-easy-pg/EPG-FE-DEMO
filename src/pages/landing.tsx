import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Check, Download } from "lucide-react"
import { AuthModal, type AuthMode } from "@/components/auth-modal"
import { Brand } from "@/components/brand"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ANDROID_RELEASE_URL, API_BASE_URL } from "@/lib/links"

const STEPS = [
  {
    title: "API 키 발급",
    description: "이름과 유효기간을 정해 키를 만듭니다. 키는 발급 시 한 번만 보입니다.",
  },
  {
    title: "앱 연결",
    description: "앱을 설치하고 QR 코드를 스캔한 뒤 알림 권한을 허용합니다.",
  },
  {
    title: "입금 조회",
    description: "키로 내역과 확인 여부를 조회합니다.",
  },
]

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

function ApiPreview() {
  return (
    <div className="soft-shadow overflow-hidden rounded-[28px] bg-card ring-1 ring-border/80">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-[10px] font-medium text-primary">
            POST
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            /api/rem/v1
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          cURL
        </span>
      </div>
      <pre className="overflow-x-auto bg-[#15161b] px-5 py-5 font-mono text-[11px] leading-6 text-white/70">
        <code>{CURL}</code>
      </pre>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <span className="font-mono text-[10px] text-muted-foreground">응답</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          200 · application/json
        </span>
      </div>
      <pre className="overflow-x-auto border-t border-border/70 px-5 py-4 font-mono text-[11px] leading-5 text-muted-foreground">
        <code>{RESPONSE}</code>
      </pre>
    </div>
  )
}

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((node) => node.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    )

    targets.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="min-h-svh bg-background">
      <SiteHeader
        onLogin={() => setAuthMode("login")}
        onSignup={() => setAuthMode("signup")}
      />

      <main>
        <section className="relative overflow-hidden">
          <div className="hero-aura pointer-events-none absolute inset-x-0 top-0 h-[680px]" />
          <div className="relative mx-auto max-w-[1200px] px-5 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="mx-auto max-w-[820px] text-center">
              <h1 className="animate-rise rise-1 text-[44px] leading-[1.04] font-medium tracking-[-0.055em] text-balance md:text-[68px]">
                수수료 없는
                <br />
                무통장 입금 API
              </h1>
              <p className="mx-auto mt-6 max-w-[560px] animate-rise rise-2 text-[16px] leading-7 text-muted-foreground md:text-[18px] md:leading-8">
                휴대폰에 도착한 입금 알림을 서버가 읽고, 결제가 들어왔는지
                API로 알려줍니다. PG 계약 없이, 수수료 없이 시작하세요.
              </p>
              <div className="mt-8 flex animate-rise rise-3 flex-col items-center justify-center gap-2 sm:flex-row">
                <Button size="lg" onClick={() => setAuthMode("signup")}>
                  무료로 시작하기
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/docs">API 문서 보기</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto mt-14 max-w-[1040px] animate-rise rise-4 md:mt-20">
              <div className="surface-shadow overflow-hidden rounded-[24px] bg-card ring-1 ring-border/80">
                <img
                  src="/dashboard-preview.gif"
                  alt="EASY-PG 대시보드의 입금 현황 화면"
                  className="block w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24">
          <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
            <div data-reveal className="mx-auto max-w-[720px] text-center">
              <h2 className="text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[48px]">
                휴대폰 알림 기반의
                <br />
                입금 확인
              </h2>
              <p className="mx-auto mt-5 max-w-[520px] text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                은행 앱의 입금 알림을 감지해 서버에 전송.
              </p>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
              {STEPS.map((step, index) => (
                <article
                  key={step.title}
                  data-reveal
                  style={{ transitionDelay: `${index * 130}ms` }}
                  className="md:border-l md:px-8 first:md:border-l-0 first:md:pl-0"
                >
                  <span className="block h-px w-8 bg-primary" aria-hidden="true" />
                  <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.03em]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[300px] text-sm leading-6 text-muted-foreground">
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
            <div data-reveal>
              <h2 className="text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[48px]">
                전용 API 제공
              </h2>
              <p className="mt-5 max-w-[480px] text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                API 키 기반의 입금 내역 Polling API
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "X-Api-Key 헤더 하나로 인증",
                  "입금 생성, 입금 상태 조회",
                  "한국 리전을 통한 빠른 응답",
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
                  <Link to="/docs">API 문서</Link>
                </Button>
                <Button variant="outline" onClick={() => setAuthMode("signup")}>
                  지금 시작하기
                </Button>
              </div>
            </div>
            <div data-reveal style={{ transitionDelay: "140ms" }}>
              <ApiPreview />
            </div>
          </div>
        </section>

        <section id="install" className="scroll-mt-24">
          <div className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
            <div data-reveal className="grid items-center gap-12 overflow-hidden rounded-[28px] bg-foreground px-6 py-10 text-background md:px-12 md:py-14">
              <div>
                <h2 className="text-[34px] leading-[1.08] font-medium tracking-[-0.045em] text-balance md:text-[46px]">
                  전용 앱 설치
                </h2>
                <p className="mt-5 max-w-[560px] text-sm leading-6 text-white/60 md:text-base md:leading-7">
                  안드로이드 입금 감지를 위해서 어플리케이션을 설치해 주세요.
                  어플리케이션이 없으면 동작하지 않습니다.
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
                      앱 다운받기
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div data-reveal className="mx-auto max-w-[1200px] px-5 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-[720px] text-[36px] leading-[1.04] font-medium tracking-[-0.05em] text-balance md:text-[56px]">
            수수료 없이,
            <br />
            결제 시스템을 연동하세요.
          </h2>
          <p className="mx-auto mt-5 max-w-[500px] text-sm leading-6 text-white/55 md:text-base">
            PG사 없이, 수수료 없이, Polling API 하나만으로 결제 시스템을 내
            서비스에 붙여보세요.
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
