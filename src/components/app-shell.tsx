import { useEffect, useRef, useState } from "react"
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  ArrowDownLeft,
  KeyRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Brand } from "@/components/brand"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser, logout } from "@/lib/auth"
import { startSimulator, useDeposits } from "@/lib/deposits"
import { won } from "@/lib/format"

const NAV_ITEMS = [
  { to: "/app", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/app/transactions", label: "입금 내역", icon: ArrowDownLeft, end: false },
  { to: "/app/keys", label: "API 키", icon: KeyRound, end: false },
]

export function AppShell() {
  const [user] = useState(() => getCurrentUser())
  const navigate = useNavigate()
  const deposits = useDeposits()
  const prevCount = useRef(deposits.length)

  useEffect(() => {
    startSimulator()
  }, [])

  useEffect(() => {
    if (deposits.length > prevCount.current) {
      const latest = deposits[0]
      toast("입금 알림이 감지되었습니다", {
        description: `${latest.depositor} ${won(latest.amount)} (${latest.bank})`,
      })
    }
    prevCount.current = deposits.length
  }, [deposits])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-5">
          <NavLink to="/app">
            <Brand />
          </NavLink>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <Separator className="mb-3" />
          <div className="flex items-center gap-2 px-2 pb-1">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-medium">
                {user.username.slice(0, 2).toLowerCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.username}</div>
              <div className="text-xs text-muted-foreground">개발자 계정</div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="로그아웃"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4 md:hidden">
          <NavLink to="/app">
            <Brand />
          </NavLink>
          <nav className="ml-auto flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground",
                    isActive && "bg-muted text-foreground",
                  )
                }
              >
                <item.icon className="size-4" />
                <span className="hidden xs:inline">{item.label}</span>
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="로그아웃"
            >
              <LogOut className="size-4" />
            </Button>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
