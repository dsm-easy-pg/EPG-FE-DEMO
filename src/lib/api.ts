const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://epg-core.dsmhs.kr"

const TOKEN_KEY = "easypg.accessToken"
const USERNAME_KEY = "easypg.username"

export const UNAUTHORIZED_EVENT = "easypg:unauthorized"

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  error: unknown
}

interface ApiErrorBody {
  status?: number
  code?: string
  message?: string
}

function readError(value: unknown): ApiErrorBody | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  return {
    status: typeof record.status === "number" ? record.status : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function startSession(accessToken: string, username: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USERNAME_KEY, username)
}

export function updateAccessToken(accessToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return "요청을 처리하지 못했습니다."
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!query) return `${API_BASE}${path}`
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  const search = params.toString()
  return `${API_BASE}${path}${search ? `?${search}` : ""}`
}

async function tryReissue() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/reissue`, {
      method: "POST",
      credentials: "include",
    })
    if (!response.ok) return false
    const payload = (await response.json()) as ApiEnvelope<{
      accessToken?: string
    }>
    const token = payload?.data?.accessToken
    if (!payload?.success || !token) return false
    updateAccessToken(token)
    return true
  } catch {
    return false
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
  auth?: boolean
  retry?: boolean
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, auth = true, retry = true } = options

  const headers = new Headers()
  if (body !== undefined) headers.set("Content-Type", "application/json")
  const token = getAccessToken()
  if (auth && token) headers.set("Authorization", `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
    })
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다.", 0)
  }

  if (response.status === 401 && auth && retry && token) {
    const reissued = await tryReissue()
    if (reissued) return request<T>(path, { ...options, retry: false })
    clearSession()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const envelope = payload as { error?: unknown } | null
    const apiError = readError(envelope?.error)
    throw new ApiError(
      apiError?.message ?? "요청을 처리하지 못했습니다.",
      apiError?.status ?? response.status,
      apiError?.code,
    )
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>
    if (!envelope.success) {
      const apiError = readError(envelope.error)
      throw new ApiError(
        apiError?.message ?? "요청을 처리하지 못했습니다.",
        apiError?.status ?? response.status,
        apiError?.code,
      )
    }
    return envelope.data
  }

  return payload as T
}
