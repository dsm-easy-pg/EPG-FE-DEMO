export interface AuthUser {
  username: string
}

interface StoredUser extends AuthUser {
  password: string
}

const usersKey = "easypg.users"
const sessionKey = "easypg.session"

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(usersKey)
  if (!raw) {
    const demo: StoredUser[] = [{ username: "demo", password: "demo1234" }]
    localStorage.setItem(usersKey, JSON.stringify(demo))
    return demo
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as StoredUser[]
  } catch {
    localStorage.removeItem(usersKey)
  }
  return []
}

export function getCurrentUser(): AuthUser | null {
  const username = localStorage.getItem(sessionKey)
  return username ? { username } : null
}

export function login(username: string, password: string) {
  const user = loadUsers().find((u) => u.username === username)
  if (!user || user.password !== password) {
    return { ok: false as const, error: "아이디 또는 비밀번호가 올바르지 않습니다." }
  }
  localStorage.setItem(sessionKey, username)
  return { ok: true as const }
}

export function signup(username: string, password: string) {
  if (username.length < 4) {
    return { ok: false as const, error: "아이디는 4자 이상으로 입력해 주세요." }
  }
  if (password.length < 8) {
    return { ok: false as const, error: "비밀번호는 8자 이상으로 입력해 주세요." }
  }
  const users = loadUsers()
  if (users.some((u) => u.username === username)) {
    return { ok: false as const, error: "이미 사용 중인 아이디입니다." }
  }
  users.push({ username, password })
  localStorage.setItem(usersKey, JSON.stringify(users))
  localStorage.setItem(sessionKey, username)
  return { ok: true as const }
}

export function logout() {
  localStorage.removeItem(sessionKey)
}
