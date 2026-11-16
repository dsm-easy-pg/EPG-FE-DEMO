import {
  clearSession,
  errorMessage,
  getAccessToken,
  getStoredUsername,
  request,
  startSession,
} from "@/lib/api"

export interface AuthUser {
  username: string
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string }

export function getCurrentUser(): AuthUser | null {
  const username = getStoredUsername()
  if (!username || !getAccessToken()) return null
  return { username }
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResult> {
  try {
    const data = await request<{ accessToken: string }>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    })
    startSession(data.accessToken, username)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: errorMessage(error) }
  }
}

export async function signup(
  username: string,
  password: string,
): Promise<AuthResult> {
  try {
    await request("/api/auth/signup", {
      method: "POST",
      body: { username, password },
      auth: false,
    })
  } catch (error) {
    return { ok: false, error: errorMessage(error) }
  }
  return login(username, password)
}

export async function logout() {
  try {
    await request("/api/auth/logout", { method: "POST" })
  } catch {
    // The local session is cleared even if the server call fails.
  } finally {
    clearSession()
  }
}

export async function withdraw() {
  await request("/api/auth/withdraw", { method: "DELETE" })
  clearSession()
}
