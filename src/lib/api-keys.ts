import { request } from "@/lib/api"

export type ExpDay = "DAY_30" | "DAY_90" | "DAY_365" | "DAY_999"

export interface ApiKey {
  id: number
  name: string
  expDate: string
}

export interface CreatedApiKey extends ApiKey {
  key: string
}

export const EXP_DAY_OPTIONS: { value: ExpDay; label: string }[] = [
  { value: "DAY_30", label: "30일" },
  { value: "DAY_90", label: "90일" },
  { value: "DAY_365", label: "1년" },
  { value: "DAY_999", label: "999일" },
]

export function getKeys() {
  return request<{ keys: ApiKey[] }>("/api/key").then((data) => data.keys)
}

export function createKey(name: string, expDay: ExpDay) {
  return request<CreatedApiKey>("/api/key", {
    method: "POST",
    body: { name, expDay },
  })
}

export function deleteKey(keyId: number) {
  return request<void>(`/api/key/${keyId}`, { method: "DELETE" })
}

export function isExpired(key: ApiKey) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`
  return key.expDate < today
}
