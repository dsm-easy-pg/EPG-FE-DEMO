import { useEffect, useRef, useState } from "react"
import { request } from "@/lib/api"

export interface Remittance {
  uuid: string
  amount: number
  checked: boolean
  name: string
}

export interface RemittanceDetail extends Remittance {
  id: number
  created_date: string | null
  checked_date: string | null
}

export interface RemittanceRow extends Remittance {
  at: number | null
}

export interface RemittanceFilters {
  startDate?: string
  endDate?: string
  minAmount?: number
  isChecked?: boolean
}

export interface RemittancePage {
  content: Remittance[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface RemittanceMetric {
  totalCount: number
  totalAmount: number
}

export const DAY_MS = 24 * 60 * 60 * 1000

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function formatDateParam(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayParam() {
  return formatDateParam(new Date())
}

export function daysAgoParam(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateParam(date)
}

export function dateParamLabel(value: string) {
  const [, month, day] = value.split("-")
  return month && day ? `${month}.${day}` : value
}

export function parseDateTime(value?: string | null) {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function toQuery(filters: RemittanceFilters) {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    minAmount: filters.minAmount,
    isChecked: filters.isChecked,
  }
}

export function listRemittances(
  filters: RemittanceFilters = {},
  page = 0,
) {
  return request<RemittancePage>("/api/rem", {
    query: { ...toQuery(filters), page },
  })
}

export function getRemittanceMetric(filters: RemittanceFilters = {}) {
  return request<RemittanceMetric>("/api/rem/metric", {
    query: toQuery(filters),
  })
}

export function getRemittance(uuid: string) {
  return request<RemittanceDetail>(`/api/rem/${uuid}`)
}

const detailCache = new Map<string, RemittanceDetail>()

export async function getRemittanceCached(uuid: string) {
  const cached = detailCache.get(uuid)
  if (cached) return cached
  const detail = await getRemittance(uuid)
  detailCache.set(uuid, detail)
  return detail
}

export function useRemittanceRows(items: Remittance[]) {
  const key = items.map((item) => item.uuid).join("|")
  const [times, setTimes] = useState<Record<string, number | null>>({})
  const [loadedKey, setLoadedKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const uuids = key ? key.split("|") : []
    const cachedTimes: Record<string, number | null> = {}
    const missing: string[] = []

    for (const uuid of uuids) {
      const cached = detailCache.get(uuid)
      if (cached) {
        cachedTimes[uuid] = parseDateTime(cached.created_date)
      } else {
        missing.push(uuid)
      }
    }

    if (missing.length === 0) {
      setTimes(cachedTimes)
      setLoadedKey(key)
      return
    }

    Promise.all(
      missing.map(async (uuid) => {
        try {
          const detail = await getRemittanceCached(uuid)
          return [uuid, parseDateTime(detail.created_date)] as const
        } catch {
          return [uuid, null] as const
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      const next = { ...cachedTimes }
      for (const [uuid, at] of entries) next[uuid] = at
      setTimes(next)
      setLoadedKey(key)
    })

    return () => {
      cancelled = true
    }
  }, [key])

  const ready = loadedKey === key

  return {
    loading: items.length > 0 && !ready,
    rows: items.map<RemittanceRow>((item) => ({
      ...item,
      at: ready ? (times[item.uuid] ?? null) : null,
    })),
  }
}

export function sortByLatest(rows: RemittanceRow[]) {
  return [...rows].sort((a, b) => {
    if (a.at === null && b.at === null) return 0
    if (a.at === null) return 1
    if (b.at === null) return -1
    return b.at - a.at
  })
}

export function usePolling(callback: () => void, intervalMs: number) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  })

  useEffect(() => {
    const id = window.setInterval(() => saved.current(), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
}

export function normalizeDateRange(startDate?: string, endDate?: string) {
  const start = startDate || endDate
  const end = endDate || startDate
  if (!start || !end) return {}
  return { startDate: start, endDate: end }
}
