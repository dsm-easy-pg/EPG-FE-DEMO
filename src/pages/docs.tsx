import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  KeyRound,
  ShieldCheck,
  Terminal,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Brand } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BASE_URL = "https://epg-core.dsmhs.kr"

const TOC = [
  { id: "overview", label: "개요" },
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
        "inline-flex h-5 items-center rounded px-1.5 font-mono text-[11px] font-semibold",
        method === "GET"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-sky-500/10 text-sky-700 dark:text-sky-400",
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
    <div className="overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          aria-label="코드 복사"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
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
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
        <Method method={method} />
        <code className="break-all font-mono text-sm">{path}</code>
      </div>
      {children}
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold tracking-tight">{children}</h3>
  )
}

function ParamTable({
  rows,
}: {
  rows: [name: string, type: string, required: string, description: string][]
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
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
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
          <Link to="/">
            <Brand />
          </Link>
          <span className="ml-3 hidden text-sm text-muted-foreground sm:inline">
            API 문서
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">홈</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/keys">
                <KeyRound className="size-3.5" />
                API 키
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:py-14">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              목차
            </p>
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-14">
          <section>
            <Badge variant="outline" className="font-normal">
              <ShieldCheck className="size-3.5" />
              API Key 인증
            </Badge>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              EASY-PG API
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              API 키로 접근할 수 있는 입금 확인 API 명세입니다. 세션 로그인이
              필요한 대시보드 내부 API는 공개하지 않습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <code className="rounded-md border bg-muted/50 px-2 py-1 font-mono">
                Base URL {BASE_URL}
              </code>
              <code className="rounded-md border bg-muted/50 px-2 py-1 font-mono">
                X-Api-Key
              </code>
              <code className="rounded-md border bg-muted/50 px-2 py-1 font-mono">
                application/json
              </code>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/app/keys">
                  API 키 발급
                  <ArrowRight className="size-4" />
                </Link>
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
            <div className="space-y-4 rounded-xl border bg-card p-5">
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
            <div className="space-y-4 rounded-xl border bg-card p-5">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
                    1
                  </span>
                  <span className="text-muted-foreground">
                    대시보드의 API 키 페이지에서 이름과 유효기간을 지정해 키를
                    발급합니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
                    2
                  </span>
                  <span className="text-muted-foreground">
                    발급 응답의 원문 키를 안전하게 보관합니다. 원문은 발급 시에만
                    표시됩니다.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
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
            <div className="space-y-3 rounded-xl border bg-card p-5">
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
            <div className="overflow-hidden rounded-xl border">
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
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">API 키가 필요하신가요?</p>
                  <p className="text-xs text-muted-foreground">
                    대시보드에서 바로 발급하고 QR 코드로 기기를 연결할 수
                    있습니다.
                  </p>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link to="/app/keys">
                  API 키 발급
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
