import { useState } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Check,
  Copy,
  Download,
  Terminal,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  { id: "check-uuid", label: "UUID로 확인" },
  { id: "check-name", label: "입금자명으로 확인" },
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
  -H "X-Api-Key: epg-..."`

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

function Method({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 font-mono text-[10px] font-semibold",
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
}: {
  code: string
  language?: string
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
    <div className="overflow-hidden rounded-3xl bg-[#15161b] text-white ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] text-white/40">
          {language}
        </span>
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
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[11px] leading-6 text-white/65">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-5">
      <div>
        <h2 className="font-heading text-[30px] leading-tight font-semibold tracking-[-0.04em] md:text-[34px]">
          {title}
        </h2>
        {description && (
          <p className="mt-2.5 max-w-[640px] text-[15px] leading-7 text-muted-foreground">
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
  children,
}: {
  method: "GET" | "POST"
  path: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-background px-3.5 py-3 ring-1 ring-border/60">
        <Method method={method} />
        <code className="break-all font-mono text-sm">{path}</code>
      </div>
      {children}
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[15px] font-semibold tracking-[-0.02em]">{children}</h3>
  )
}

function ParamTable({
  rows,
}: {
  rows: [name: string, type: string, required: string, description: string][]
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-3">이름</TableHead>
            <TableHead>타입</TableHead>
            <TableHead>필수</TableHead>
            <TableHead className="pr-3">설명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([name, type, required, description]) => (
            <TableRow key={name}>
              <TableCell className="pl-3 font-mono text-xs whitespace-nowrap">
                {name}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {type}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {required}
              </TableCell>
              <TableCell className="pr-3 text-xs leading-relaxed text-muted-foreground">
                {description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function Docs() {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="hero-aura pointer-events-none absolute inset-x-0 top-0 h-[460px]" />
      <SiteHeader variant="docs" />

      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <nav
            className="sticky top-28 rounded-3xl bg-card p-3 ring-1 ring-border/80"
            aria-label="문서 목차"
          >
            <p className="px-3 py-2 font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground">
              CONTENTS
            </p>
            <div className="space-y-0.5">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-full px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 space-y-16">
          <section>
            <h1 className="text-[42px] leading-[1.03] font-medium tracking-[-0.05em] md:text-[56px]">
              EASY-PG API
            </h1>
            <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-muted-foreground md:text-base md:leading-8">
              API 키로 접근할 수 있는 입금 확인 API 명세입니다. 세션 로그인이
              필요한 대시보드 내부 API는 공개하지 않습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <code className="rounded-full bg-card px-3.5 py-2 font-mono text-[11px] ring-1 ring-border/80">
                Base URL {BASE_URL}
              </code>
              <code className="rounded-full bg-card px-3.5 py-2 font-mono text-[11px] ring-1 ring-border/80">
                X-Api-Key
              </code>
              <code className="rounded-full bg-card px-3.5 py-2 font-mono text-[11px] ring-1 ring-border/80">
                application/json
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
          </section>

          <Section
            id="overview"
            title="개요"
            description="모든 엔드포인트는 JSON을 사용하며 /api/rem/v1 아래에 있습니다."
          >
            <div className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/80">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Base URL
                  </p>
                  <code className="mt-1 block font-mono text-xs">
                    {BASE_URL}
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    인증 헤더
                  </p>
                  <code className="mt-1 block font-mono text-xs">
                    X-Api-Key: epg-...
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    요청 형식
                  </p>
                  <code className="mt-1 block font-mono text-xs">
                    application/json
                  </code>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    금액 단위
                  </p>
                  <p className="mt-1 text-xs">대한민국 원(KRW), 정수</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <code className="font-mono">uuid</code>는 하이픈이 없는 32자리
                문자열이고, <code className="font-mono">name</code>은 입금자
                식별을 위해 생성되는 영문 대문자 6자리 문자열입니다.
              </p>
            </div>
          </Section>

          <Section
            id="app-install"
            title="Android 앱"
            description="휴대폰 입금 알림을 서버로 보내는 앱입니다. 키를 발급한 뒤 QR 코드로 기기를 연결합니다."
          >
            <div className="space-y-5 rounded-3xl bg-card p-6 ring-1 ring-border/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">
                    EPG-ANDROID {ANDROID_RELEASE_VERSION}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    APK는 GitHub Releases에서만 배포합니다.
                  </p>
                </div>
                <Button size="sm" asChild>
                  <a
                    href={ANDROID_RELEASE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="size-3.5" />
                    릴리스 페이지 열기
                  </a>
                </Button>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    1
                  </span>
                  <span className="text-muted-foreground">
                    릴리스 페이지에서 {ANDROID_RELEASE_VERSION} APK를
                    내려받아 설치합니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    2
                  </span>
                  <span className="text-muted-foreground">
                    앱을 열고 알림 접근 권한을 허용합니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    3
                  </span>
                  <span className="text-muted-foreground">
                    대시보드에서 키를 발급하고, 발급 화면의 QR 코드를 앱으로
                    스캔합니다.
                  </span>
                </li>
              </ol>
              <p className="text-xs leading-relaxed text-muted-foreground">
                연결이 끝나면 앱이 감지한 입금 알림이 이 계정으로 전달됩니다.
                키를 삭제하면 연결된 기기의 전송도 함께 중단됩니다.
              </p>
            </div>
          </Section>

          <Section
            id="quickstart"
            title="빠른 시작"
            description="API 키를 발급한 뒤 입금을 생성하고 응답의 uuid를 저장하세요."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <CodeBlock code={CURL_CREATE} language="bash" />
              <CodeBlock code={JS_QUICKSTART} language="javascript" />
            </div>
            <CodeBlock code={RESPONSE_SUCCESS} language="json" />
          </Section>

          <Section
            id="auth"
            title="인증"
            description="모든 요청에 대시보드에서 발급한 API 키를 X-Api-Key 헤더로 전달합니다."
          >
            <div className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/80">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    1
                  </span>
                  <span className="text-muted-foreground">
                    대시보드의 API 키 페이지에서 이름과 유효기간을 지정해 키를
                    발급합니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    2
                  </span>
                  <span className="text-muted-foreground">
                    발급 응답의 원문 키를 안전하게 보관합니다. 원문은 발급 시에만
                    표시됩니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    3
                  </span>
                  <span className="text-muted-foreground">
                    모든 API 요청에{" "}
                    <code className="font-mono text-xs">X-Api-Key</code> 헤더를
                    포함합니다.
                  </span>
                </li>
              </ol>
              <CodeBlock
                code={`X-Api-Key: epg-0b742824e4864f3983a1d6094ede4c86`}
                language="http"
              />
            </div>
          </Section>

          <Section
            id="response"
            title="공통 응답"
            description="모든 응답은 success, data, error 세 필드를 가진 envelope 형식입니다."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <SubHeading>성공</SubHeading>
                <CodeBlock code={RESPONSE_SUCCESS} language="json" />
              </div>
              <div className="space-y-2">
                <SubHeading>실패</SubHeading>
                <CodeBlock code={RESPONSE_ERROR} language="json" />
              </div>
            </div>
            <div className="space-y-3 rounded-3xl bg-card p-6 ring-1 ring-border/80">
              <ParamTable
                rows={[
                  ["success", "boolean", "항상", "요청 성공 여부"],
                  ["data", "object | null", "성공 시", "엔드포인트별 응답 데이터"],
                  [
                    "error",
                    "object | null",
                    "실패 시",
                    "status, code, message, timestamp를 포함한 오류 정보",
                  ],
                ]}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                요청 본문 검증에 실패하면 <code className="font-mono">error</code>{" "}
                객체에 <code className="font-mono">details</code> 배열이 추가됩니다.
              </p>
              <CodeBlock code={RESPONSE_VALIDATION_ERROR} language="json" />
            </div>
          </Section>

          <Section
            id="create-remittance"
            title="입금 생성"
            description="감지한 입금을 새 레코드로 등록합니다."
          >
            <Endpoint method="POST" path="/api/rem/v1">
              <ParamTable
                rows={[
                  [
                    "X-Api-Key",
                    "string",
                    "필수",
                    "대시보드에서 발급한 API 키",
                  ],
                  [
                    "Content-Type",
                    "string",
                    "필수",
                    "application/json",
                  ],
                ]}
              />
              <SubHeading>요청 본문</SubHeading>
              <ParamTable
                rows={[
                  [
                    "amount",
                    "integer",
                    "필수",
                    "입금 금액. 1 이상의 정수",
                  ],
                ]}
              />
              <CodeBlock
                code={`{
  "amount": 12000
}`}
                language="json"
              />
              <SubHeading>응답</SubHeading>
              <ParamTable
                rows={[
                  ["uuid", "string", "항상", "생성된 입금의 고유 식별자"],
                  ["name", "string", "항상", "자동 생성된 입금자명(영문 6자리)"],
                  ["amount", "integer", "항상", "등록된 입금 금액"],
                ]}
              />
              <CodeBlock code={RESPONSE_SUCCESS} language="json" />
              <SubHeading>예시</SubHeading>
              <CodeBlock code={CURL_CREATE} language="bash" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                amount가 없거나 0 이하이면 400{" "}
                <code className="font-mono">NOT_VALID_DTO_ERR</code>가
                반환됩니다.
              </p>
            </Endpoint>
          </Section>

          <Section
            id="check-uuid"
            title="UUID로 확인"
            description="입금 UUID를 기준으로 확인 상태를 true로 변경합니다."
          >
            <Endpoint method="POST" path="/api/rem/v1/uuid/{uuid}">
              <ParamTable
                rows={[
                  ["X-Api-Key", "string", "필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string", "필수", "입금 생성 시 받은 UUID"],
                ]}
              />
              <SubHeading>응답</SubHeading>
              <CodeBlock
                code={`{
  "success": true,
  "data": null,
  "error": null
}`}
                language="json"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                이미 확인된 입금에 다시 요청해도 성공합니다. 다른 계정의 키로
                접근하면 403 <code className="font-mono">FORBIDDEN</code>이
                반환됩니다.
              </p>
              <SubHeading>예시</SubHeading>
              <CodeBlock code={CURL_CHECK_UUID} language="bash" />
            </Endpoint>
          </Section>

          <Section
            id="check-name"
            title="입금자명으로 확인"
            description="자동 생성된 입금자명을 기준으로 확인 상태를 true로 변경합니다."
          >
            <Endpoint method="POST" path="/api/rem/v1/name/{name}">
              <ParamTable
                rows={[
                  ["X-Api-Key", "string", "필수", "대시보드에서 발급한 API 키"],
                  [
                    "name",
                    "string",
                    "필수",
                    "입금 생성 응답의 name(영문 대문자 6자리)",
                  ],
                ]}
              />
              <SubHeading>응답</SubHeading>
              <CodeBlock
                code={`{
  "success": true,
  "data": null,
  "error": null
}`}
                language="json"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                입금자명은 6자리 랜덤 값이라 중복될 수 있습니다. 정확한 처리가
                필요하면 UUID 엔드포인트를 사용하세요.
              </p>
              <SubHeading>예시</SubHeading>
              <CodeBlock code={CURL_CHECK_NAME} language="bash" />
            </Endpoint>
          </Section>

          <Section
            id="get-checked"
            title="확인 여부 조회"
            description="UUID로 입금이 확인되었는지 여부만 조회합니다."
          >
            <Endpoint method="GET" path="/api/rem/v1/{uuid}">
              <ParamTable
                rows={[
                  ["X-Api-Key", "string", "필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string", "필수", "조회할 입금 UUID"],
                ]}
              />
              <SubHeading>응답</SubHeading>
              <ParamTable
                rows={[
                  ["checked", "boolean", "항상", "확인 처리 여부"],
                ]}
              />
              <CodeBlock
                code={`{
  "success": true,
  "data": {
    "checked": true
  },
  "error": null
}`}
                language="json"
              />
              <SubHeading>예시</SubHeading>
              <CodeBlock code={CURL_GET_CHECKED} language="bash" />
            </Endpoint>
          </Section>

          <Section
            id="get-detail"
            title="입금 상세 조회"
            description="입금 금액, 입금자명, 확인 상태와 시각 정보를 조회합니다."
          >
            <Endpoint method="GET" path="/api/rem/v1/detail/{uuid}">
              <ParamTable
                rows={[
                  ["X-Api-Key", "string", "필수", "대시보드에서 발급한 API 키"],
                  ["uuid", "string", "필수", "조회할 입금 UUID"],
                ]}
              />
              <SubHeading>응답</SubHeading>
              <ParamTable
                rows={[
                  ["id", "integer", "항상", "내부 입금 ID"],
                  ["amount", "integer", "항상", "입금 금액"],
                  ["checked", "boolean", "항상", "확인 처리 여부"],
                  ["name", "string", "항상", "입금자명(영문 6자리)"],
                  ["uuid", "string", "항상", "입금 UUID"],
                  [
                    "created_date",
                    "string | null",
                    "항상",
                    "생성 시각(ISO-8601, nullable)",
                  ],
                  [
                    "checked_date",
                    "string | null",
                    "항상",
                    "마지막 변경 시각(ISO-8601, nullable)",
                  ],
                ]}
              />
              <CodeBlock
                code={`{
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
}`}
                language="json"
              />
              <SubHeading>예시</SubHeading>
              <CodeBlock code={CURL_GET_DETAIL} language="bash" />
            </Endpoint>
          </Section>

          <Section
            id="errors"
            title="오류 코드"
            description="HTTP 상태 코드와 error.code를 함께 확인하세요."
          >
            <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3">HTTP</TableHead>
                    <TableHead>code</TableHead>
                    <TableHead>message</TableHead>
                    <TableHead className="pr-3">설명</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["400", "NOT_VALID_DTO_ERR", "유효하지 않은 요청입니다.", "본문 형식이나 금액이 올바르지 않음"],
                    ["403", "FORBIDDEN", "권한이 없습니다.", "다른 계정의 입금에 접근"],
                    ["404", "KEY_NOT_FOUND", "키를 찾을 수 없습니다.", "존재하지 않는 API 키"],
                    ["404", "REMITTANCE_NOT_FOUND", "송금을 찾을 수 없습니다.", "UUID 또는 입금자명에 해당하는 입금 없음"],
                    ["500", "INTERNAL_SERVER_ERR", "서버 측 오류가 발생했습니다.", "처리 중 예외 발생"],
                  ].map(([status, code, message, description]) => (
                    <TableRow key={code}>
                      <TableCell className="pl-3 font-mono text-xs">
                        {status}
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {code}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {message}
                      </TableCell>
                      <TableCell className="pr-3 text-xs text-muted-foreground">
                        {description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card p-6 ring-1 ring-border/80">
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
          </Section>
        </main>
      </div>
    </div>
  )
}
