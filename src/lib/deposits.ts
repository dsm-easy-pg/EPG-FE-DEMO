import { useSyncExternalStore } from "react"

export interface Deposit {
  id: string
  depositor: string
  amount: number
  bank: string
  at: number
}

export const DEPOSIT_BANKS = [
  "토스뱅크",
  "카카오뱅크",
  "신한은행",
  "우리은행",
  "하나은행",
  "KB국민은행",
] as const

const AMOUNTS = [
  3000, 5000, 5000, 10000, 10000, 10000, 20000, 30000, 30000, 50000, 50000,
  100000, 150000, 300000,
]

const LETTERS = "abcdefghijklmnopqrstuvwxyz"
const DAY = 24 * 60 * 60 * 1000

let counter = 1000

function randomDepositor() {
  let s = ""
  for (let i = 0; i < 6; i += 1) {
    s += LETTERS[Math.floor(Math.random() * LETTERS.length)]
  }
  return s
}

function makeDeposit(at: number): Deposit {
  counter += 1
  return {
    id: `TX-${counter}`,
    depositor: randomDepositor(),
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    bank: DEPOSIT_BANKS[Math.floor(Math.random() * DEPOSIT_BANKS.length)],
    at,
  }
}

export function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function seed(): Deposit[] {
  const now = Date.now()
  const list: Deposit[] = []
  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const count = 4 + Math.floor(Math.random() * 4)
    const start = startOfDay(now - daysAgo * DAY)
    for (let i = 0; i < count; i += 1) {
      if (daysAgo === 0) {
        list.push(makeDeposit(start + Math.random() * (now - start)))
      } else {
        list.push(makeDeposit(start + Math.random() * DAY))
      }
    }
  }
  return list.sort((a, b) => b.at - a.at)
}

let deposits: Deposit[] = seed()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getDeposits() {
  return deposits
}

export function useDeposits() {
  return useSyncExternalStore(subscribe, getDeposits)
}

let simulatorRunning = false

export function startSimulator() {
  if (simulatorRunning) return
  simulatorRunning = true
  const tick = () => {
    window.setTimeout(
      () => {
        deposits = [makeDeposit(Date.now()), ...deposits]
        emit()
        tick()
      },
      6000 + Math.random() * 9000,
    )
  }
  tick()
}

export function dailyTotals(list: Deposit[], days = 7) {
  const now = Date.now()
  const buckets: { date: string; total: number; count: number }[] = []
  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo -= 1) {
    const start = startOfDay(now - daysAgo * DAY)
    const end = start + DAY
    const inDay = list.filter((d) => d.at >= start && d.at < end)
    const d = new Date(start)
    buckets.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
      total: inDay.reduce((sum, x) => sum + x.amount, 0),
      count: inDay.length,
    })
  }
  return buckets
}
