import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Check, Copy, Download, Terminal } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  ANDROID_RELEASE_URL,
  ANDROID_RELEASE_VERSION,
  API_BASE_URL,
} from "@/lib/links"

const BASE_URL = API_BASE_URL

const TOC = [
  { id: "overview", label: "개요" },
  { id: "app-install", label: "Android 앱" },
  { id: "quickstart", label: "빠른 시작" },
  { id: "auth", label: "인증" },
  { id: "response", label: "공통 응답" },
  { id: "create-remittance", label: "입금 생성" },
  { id: "check-uuid", label: "UUID 확인" },
  { id: "check-name", label: "입금자명 확인" },
  { id: "get-checked", label: "확인 여부 조회" },
  { id: "get-detail", label: "입금 상세 조회" },
  { id: "errors", label: "오류 코드" },
]

const CURL_CREATE = `curl -X POST ${BASE_URL}/api/rem/v1 \\
  -H "X-Api-Key: epg-..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 12000}'`

const CURL_CHECK_UUID = `curl -X POST ${BASE_URL}/api/rem/v1/uuid/{uuid} \\
  -H "X-Api-Key: epg-..."`

const CURL_CHECK_NAME = `curl -X POST "${BASE_URL}/api/rem/v1/name/{name}" \\
  -H "X-Api-Key: epg-..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 12000}'`

const CURL_GET_CHECKED = `curl ${BASE_URL}/api/rem/v1/{uuid} \\
  -H "X-Api-Key: epg-..."`

const CURL_GET_DETAIL = `curl ${BASE_URL}/api/rem/v1/detail/{uuid} \\
  -H "X-Api-Key: epg-..."`

const JS_QUICKSTART = `const baseUrl = "${BASE_URL}"
const apiKey = "epg-..."

const response = await fetch(baseUrl + "/api/rem/v1", {
  method: "POST",
  headers: {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 12000 }),
})

const body = await response.json()

if (!body.success) {
  throw new Error(body.error.code + ": " + body.error.message)
}

console.log(body.data.uuid, body.data.name, body.data.amount)`

const RESPONSE_SUCCESS = `{
  "success": true,
  "data": {
    "uuid": "ab1783fe9ce24683a50871cadecb788a",
    "name": "CCATPB",
    "amount": 12000
  },
  "error": null
}`

const RESPONSE_VOID = `{
  "success": true,
  "data": null,
  "error": null
}`

const RESPONSE_CHECKED = `{
  "success": true,
  "data": {
    "checked": true
  },
  "error": null
}`

const RESPONSE_DETAIL = `{
  "success": true,
  "data": {
    "id": 2072,
    "amount": 7000,
    "checked": false,
    "name": "CCATPB",
    "uuid": "ab1783fe9ce24683a50871cadecb788a",
    "created_date": "2026-11-16T08:00:00",
    "checked_date": null
  },
  "error": null
}`

const RESPONSE_ERROR = `{
  "success": false,
  "data": null,
  "error": {
    "status": 404,
    "code": "REMITTANCE_NOT_FOUND",
    "message": "송금을 찾을 수 없습니다.",
    "timestamp": "2026-11-16T08:00:00Z"
  }
}`

const RESPONSE_VALIDATION_ERROR = `{
  "success": false,
  "data": null,
  "error": {
    "status": 400,
    "code": "NOT_VALID_DTO_ERR",
    "message": "유효하지 않은 요청입니다.",
    "details": [
      {
        "field": "amount",
        "message": "금액은 양수만 입력 가능합니다."
      }
    ],
    "timestamp": "2026-11-16T08:00:00Z"
  }
}`

const ERRORS = [
  ["400", "NOT_VALID_DTO_ERR", "본문 형식이나 금액이 올바르지 않음"],
  ["403", "FORBIDDEN", "다른 계정의 입금에 접근"],
  ["404", "KEY_NOT_FOUND", "존재하지 않는 API 키"],
  ["404", "REMITTANCE_NOT_FOUND", "UUID 또는 입금자명에 해당하는 입금 없음"],
  ["500", "INTERNAL_SERVER_ERR", "처리 중 예외 발생"],
]

type Field = [name: string, meta: string, description: string]

function Method({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-semibold",
        method === "GET"
          ? "bg-success/10 text-success"
          : "bg-primary/10 text-primary",
      )}
    >
      {method}
    </span>
  )
}

function CodeBlock({
  code,
  language = "bash",
  label,
}: {
  code: string
  language?: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("복사했습니다")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("복사에 실패했습니다")
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[#15161b] text-white ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="text-[11px] text-white/45">{label ?? language}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          aria-label="코드 복사"
          className="text-white/50 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[11px] leading-6 text-white/65">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function FieldList({ items }: { items: Field[] }) {
  return (
    <dl className="divide-y divide-border/70 rounded-2xl bg-background/60 px-4">
      {items.map(([name, meta, description]) => (
        <div
          key={name}
          className="grid gap-1 py-3 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)] sm:gap-4"
        >
          <div>
            <dt className="text-xs font-medium">{name}</dt>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{meta}</p>
          </div>
          <dd className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DocSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-5">
      <div className="space-y-2">
        <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.03em]">
          {title}
        </h2>
        {description && (
          <p className="max-w-[680px] text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Endpoint({
  method,
  path,
  description,
  params,
  request,
  response,
  note,
  example,
}: {
  method: "GET" | "POST"
  path: string
  description: string
  params: Field[]
  request?: { fields: Field[]; code: string }
  response: string
  note?: string
  example: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/80">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border/70 px-5 py-4">
        <Method method={method} />
        <code className="break-all text-sm">{path}</code>
      </div>
      <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:p-6">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">파라미터</p>
            <FieldList items={params} />
          </div>
          {request && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">요청 본문</p>
              <FieldList items={request.fields} />
            </div>
          )}
          {note && (
            <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
          )}
        </div>
        <div className="space-y-3">
          {request && (
            <CodeBlock code={request.code} language="json" label="요청" />
          )}
          <CodeBlock code={response} language="json" label="응답" />
          <CodeBlock code={example} language="bash" label="cURL" />
        </div>
      </div>
    </div>
  )
}

export default function Docs() {
  const [activeId, setActiveId] = useState(TOC[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    )

    TOC.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-svh bg-background">
      <div className="hero-aura pointer-events-none absolute inset-x-0 top-0 h-[460px]" />
      <SiteHeader variant="docs" />

      <div className="relative mx-auto max-w-[1200px] px-5 py-12 md:py-16">
        <header className="max-w-[720px]">
          <h1 className="text-[42px] leading-[1.03] font-medium tracking-[-0.05em] md:text-[56px]">
            API 문서
          </h1>
          <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-muted-foreground md:text-base md:leading-8">
            사용자 API 키로 호출할 수 있는 입금 확인 API만 정리했습니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <code className="rounded-full bg-card px-3.5 py-2 text-[11px] ring-1 ring-border/80">
              Base URL {BASE_URL}
            </code>
            <code className="rounded-full bg-card px-3.5 py-2 text-[11px] ring-1 ring-border/80">
              X-Api-Key
            </code>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/app/keys">API 키 발급</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#quickstart">
                <Terminal className="size-4" />
                빠른 시작
              </a>
            </Button>
          </div>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <nav
              className="sticky top-28 border-l border-border/80"
              aria-label="문서 목차"
            >
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "block border-l-2 py-1.5 pl-3 text-[13px] transition-colors",
                    activeId === item.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 space-y-14">
            <DocSection
              id="overview"
              title="개요"
              description="모든 엔드포인트는 /api/rem/v1 아래에 있고 JSON으로 요청과 응답을 주고받습니다."
            >
              <FieldList
                items={[
                  ["Base URL", "요청 주소", BASE_URL],
                  ["인증 헤더", "필수", "X-Api-Key: epg-..."],
                  ["요청 형식", "JSON", "application/json"],
                  ["금액 단위", "KRW", "원 단위 정수"],
                  ["uuid", "32자리", "하이픈 없는 문자열"],
                  ["name", "6자리", "영문 대문자 입금자명"],
                ]}
              />
            </DocSection>

            <DocSection
              id="app-install"
              title="Android 앱"
              description="휴대폰 입금 알림을 서버로 보내는 앱입니다. 키를 발급한 뒤 QR 코드로 기기를 연결합니다."
            >
              <div className="space-y-5 rounded-3xl bg-card p-5 ring-1 ring-border/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    EPG-ANDROID {ANDROID_RELEASE_VERSION}
                  </p>
                  <Button size="sm" asChild>
                    <a
                      href={ANDROID_RELEASE_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="size-3.5" />
                      릴리스 페이지
                    </a>
                  </Button>
                </div>
                <FieldList
                  items={[
                    ["설치", ANDROID_RELEASE_VERSION, "릴리스 페이지에서 APK를 내려받아 설치합니다."],
                    ["권한", "알림 접근", "앱에서 알림 접근 권한을 허용합니다."],
                    ["연결", "QR 코드", "발급 화면의 QR 코드를 스캔합니다."],
                  ]}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  연결이 끝나면 앱이 감지한 입금 알림이 이 계정으로 전달됩니다.
                </p>
              </div>
            </DocSection>

            <DocSection
              id="quickstart"
              title="빠른 시작"
              description="키를 발급한 뒤 입금을 생성하고 응답의 uuid를 저장하세요."
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <CodeBlock code={CURL_CREATE} language="bash" label="cURL" />
                <CodeBlock
                  code={JS_QUICKSTART}
                  language="javascript"
                  label="JavaScript"
                />
              </div>
              <CodeBlock code={RESPONSE_SUCCESS} language="json" label="응답" />
            </DocSection>

            <DocSection
              id="auth"
              title="인증"
              description="발급받은 API 키를 모든 요청의 X-Api-Key 헤더에 담아 전달합니다."
            >
              <div className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-border/80">
                <FieldList
                  items={[
                    ["발급", "API 키 페이지", "이름과 유효기간을 지정해 키를 만듭니다."],
                    ["보관", "원문 키", "원문은 발급 시에만 표시됩니다."],
                    ["전달", "X-Api-Key", "모든 요청 헤더에 포함합니다."],
                  ]}
                />
                <CodeBlock
                  code="X-Api-Key: epg-..."
                  language="http"
                  label="헤더"
                />
              </div>
            </DocSection>

            <DocSection
              id="response"
              title="공통 응답"
              description="응답은 success, data, error 세 필드를 가진 envelope 형식입니다."
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <CodeBlock code={RESPONSE_SUCCESS} language="json" label="성공" />
                <CodeBlock code={RESPONSE_ERROR} language="json" label="실패" />
              </div>
              <FieldList
                items={[
                  ["success", "boolean · 항상", "요청 성공 여부"],
                  ["data", "object | null", "엔드포인트별 응답 데이터"],
                  ["error", "object | null", "status, code, message, timestamp"],
                ]}
              />
              <CodeBlock
                code={RESPONSE_VALIDATION_ERROR}
                language="json"
                label="본문 검증 실패"
              />
            </DocSection>

            <DocSection
              id="create-remittance"
              title="입금 생성"
              description="감지한 입금을 새 레코드로 등록합니다."
            >
              <Endpoint
                method="POST"
                path="/api/rem/v1"
                description="금액을 전달하면 uuid와 name이 자동 생성됩니다."
                params={[
                  ["X-Api-Key", "string · 필수", "대시보드에서 발급한 API 키"],
                  ["Content-Type", "string · 필수", "application/json"],
                ]}
                request={{
                  fields: [["amount", "integer · 필수", "1 이상의 입금 금액"]],
                  code: `{\n  "amount": 12000\n}`,
                }}
                response={RESPONSE_SUCCESS}
                note="amount가 없거나 0 이하이면 400 NOT_VALID_DTO_ERR가 반환됩니다."
                example={CURL_CREATE}
              />
            </DocSection>

            <DocSection
              id="check-uuid"
              title="UUID 확인"
              description="입금 UUID를 기준으로 확인 상태를 true로 변경합니다."
            >
              <Endpoint
                method="POST"
                path="/api/rem/v1/uuid/{uuid}"
                description="이미 확인된 입금에 다시 요청해도 성공합니다."
                params={[
                  ["X-Api-Key", "string · 필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string · 필수", "입금 생성 시 받은 UUID"],
                ]}
                response={RESPONSE_VOID}
                note="다른 계정의 키로 접근하면 403 FORBIDDEN이 반환됩니다."
                example={CURL_CHECK_UUID}
              />
            </DocSection>

            <DocSection
              id="check-name"
              title="입금자명 확인"
              description="자동 생성된 입금자명을 기준으로 확인 상태를 true로 변경합니다."
            >
              <Endpoint
                method="POST"
                path="/api/rem/v1/name/{name}"
                description="name은 6자리 랜덤 값이라 중복될 수 있습니다. 정확한 처리가 필요하면 UUID를 사용하세요."
                params={[
                  ["X-Api-Key", "string · 필수", "대시보드에서 발급한 API 키"],
                  ["name", "string · 필수", "입금 생성 응답의 name"],
                  ["Content-Type", "string · 필수", "application/json"],
                ]}
                request={{
                  fields: [["amount", "integer · 필수", "확인할 입금 금액"]],
                  code: `{\n  "amount": 12000\n}`,
                }}
                response={RESPONSE_VOID}
                example={CURL_CHECK_NAME}
              />
            </DocSection>

            <DocSection
              id="get-checked"
              title="확인 여부 조회"
              description="UUID로 입금이 확인되었는지 여부만 조회합니다."
            >
              <Endpoint
                method="GET"
                path="/api/rem/v1/{uuid}"
                description="결제 서버가 확인 여부만 빠르게 확인할 때 사용합니다."
                params={[
                  ["X-Api-Key", "string · 필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string · 필수", "조회할 입금 UUID"],
                ]}
                response={RESPONSE_CHECKED}
                example={CURL_GET_CHECKED}
              />
            </DocSection>

            <DocSection
              id="get-detail"
              title="입금 상세 조회"
              description="금액, 입금자명, 확인 상태와 시각 정보를 조회합니다."
            >
              <Endpoint
                method="GET"
                path="/api/rem/v1/detail/{uuid}"
                description="확인 여부와 함께 입금 상세 정보가 필요할 때 사용합니다."
                params={[
                  ["X-Api-Key", "string · 필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string · 필수", "조회할 입금 UUID"],
                ]}
                response={RESPONSE_DETAIL}
                example={CURL_GET_DETAIL}
              />
            </DocSection>

            <DocSection
              id="errors"
              title="오류 코드"
              description="HTTP 상태 코드와 error.code를 함께 확인하세요."
            >
              <div className="divide-y divide-border/70 rounded-2xl bg-card px-4 ring-1 ring-border/80">
                {ERRORS.map(([status, code, description]) => (
                  <div
                    key={code}
                    className="grid gap-1 py-3 sm:grid-cols-[64px_minmax(0,190px)_minmax(0,1fr)] sm:gap-4"
                  >
                    <span className="text-xs font-medium">{status}</span>
                    <code className="text-xs text-primary">{code}</code>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card p-5 ring-1 ring-border/80">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">키를 아직 발급하지 않았나요?</p>
                    <p className="text-xs text-muted-foreground">
                      대시보드에서 바로 발급하고 QR 코드로 기기를 연결할 수
                      있습니다.
                    </p>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to="/app/keys">키 발급</Link>
                </Button>
              </div>
            </DocSection>
          </main>
        </div>
      </div>
    </div>
  )
}
