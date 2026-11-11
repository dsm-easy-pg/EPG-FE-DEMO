import { Link } from "react-router-dom"
import { BarChart3, BellRing, Webhook } from "lucide-react"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FEATURES = [
  {
    icon: BellRing,
    title: "휴대폰 알림 감지",
    description:
      "Android 기기에 설치된 은행 앱의 입금 알림을 감지해 입금 이벤트로 변환합니다.",
  },
  {
    icon: Webhook,
    title: "웹훅 전달",
    description:
      "감지된 입금은 등록한 웹훅 URL로 실시간으로 전달됩니다. 별도 서버 없이도 받아볼 수 있습니다.",
  },
  {
    icon: BarChart3,
    title: "입금 내역 관리",
    description:
      "입금액, 입금자명, 입금 시각을 대시보드에서 확인하고 CSV로 내보낼 수 있습니다.",
  },
]

const STEPS = [
  {
    title: "API 키 발급",
    description: "가입 후 이름과 유효기간을 정해 API 키를 발급합니다.",
  },
  {
    title: "기기 연결",
    description:
      "발급 모달에 표시된 QR 코드를 Android 앱에서 스캔해 기기를 연결합니다.",
  },
  {
    title: "웹훅 수신",
    description:
      "앱이 입금 알림을 감지하면 등록한 URL로 입금 이벤트를 전송합니다.",
  },
]

export default function Landing() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
          <Link to="/">
            <Brand />
          </Link>
          <nav className="ml-6 hidden items-center gap-5 sm:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              기능
            </a>
            <a
              href="#how"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              이용 방법
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              은행 앱 알림으로
              <br />
              입금을 확인하세요
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              휴대폰에 수신된 입금 알림을 감지해 웹훅으로 전달합니다. 사업자
              등록이나 PG 수수료 없이 입금 이벤트를 내 서비스에 연결하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#how">이용 방법 보기</a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>신한은행</CardTitle>
                  <span className="text-xs text-muted-foreground">방금 전</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
                  +30,000원
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">parkjhn</span> 입금
                </p>
              </CardContent>
            </Card>
            <div className="rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300">
              <div className="text-neutral-500">
                POST https://your-service.com/webhook
              </div>
              <pre className="mt-2 overflow-x-auto whitespace-pre">
{`{
  "type": "deposit",
  "depositor": "parkjhn",
  "amount": 30000,
  "bank": "shinhan",
  "at": "2026-11-11T12:56:00+09:00"
}`}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              감지된 입금 알림은 등록한 웹훅 URL로 전달됩니다.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-14 border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            PG 없이 갖추는 입금 확인
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            PG사 가입비와 수수료, 사업자 등록 없이 무통장입금 이벤트를 활용할 수
            있습니다.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="size-4 text-muted-foreground" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-14 border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            3단계로 시작합니다
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            계정을 만들고 기기를 연결하면 바로 입금 이벤트를 받아볼 수 있습니다.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border p-5">
                <span className="grid size-6 place-items-center rounded-md bg-muted text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 pb-16 pt-4 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-xl bg-neutral-950 p-8 text-neutral-50 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              지금 키를 발급하고 기기를 연결해 보세요
            </h2>
            <p className="mt-1.5 text-sm text-neutral-400">
              가입하면 바로 웹훅을 연결하고 입금 이벤트를 테스트할 수 있습니다.
            </p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/signup">무료로 시작하기</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:px-6">
          <span>알림결제</span>
          <span>휴대폰 입금 알림 기반 결제 알림 API</span>
        </div>
      </footer>
    </div>
  )
}
