export interface ApiKey {
  id: string
  name: string
  maskedKey: string
  createdAt: number
  expiresAt: number
}

const storageKey = "easypg.keys"

const DAY = 24 * 60 * 60 * 1000

function defaultKeys(): ApiKey[] {
  const now = Date.now()
  return [
    {
      id: "k_seed_main",
      name: "메인 서비스",
      maskedKey: "ak_live_5f2c91…",
      createdAt: now - 40 * DAY,
      expiresAt: now + 50 * DAY,
    },
    {
      id: "k_seed_old",
      name: "테스트 환경",
      maskedKey: "ak_live_0ab34d…",
      createdAt: now - 200 * DAY,
      expiresAt: now - 5 * DAY,
    },
  ]
}

export function loadKeys(): ApiKey[] {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    const seeded = defaultKeys()
    localStorage.setItem(storageKey, JSON.stringify(seeded))
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as ApiKey[]
  } catch {
    localStorage.removeItem(storageKey)
  }
  return []
}

export function saveKeys(keys: ApiKey[]) {
  localStorage.setItem(storageKey, JSON.stringify(keys))
}

export function isExpired(key: ApiKey) {
  return key.expiresAt < Date.now()
}

export function issueKey(name: string, validDays: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const secret =
    "ak_live_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  const now = Date.now()
  const key: ApiKey = {
    id: `k_${now.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
    name,
    maskedKey: `${secret.slice(0, 14)}…`,
    createdAt: now,
    expiresAt: now + validDays * DAY,
  }
  return { key, secret }
}
