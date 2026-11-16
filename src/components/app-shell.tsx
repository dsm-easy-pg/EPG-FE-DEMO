import { useEffect, useState } from "react"
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  ArrowDownLeft,
  KeyRound,
  LayoutDashboard,
  LogOut,
  UserX,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Brand } from "@/components/brand"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UNAUTHORIZED_EVENT, errorMessage } from "@/lib/api"
import { getCurrentUser, logout, withdraw } from "@/lib/auth"

const NAV_ITEMS = [
  { to: "/app", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/app/transactions", label: "입금 내역", icon: ArrowDownLeft, end: false },
  { to: "/app/keys", label: "API 키", icon: KeyRound, end: false },
]

export function AppShell() {
  const [user] = useState(() => getCurrentUser())
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleUnauthorized = () => navigate("/", { replace: true })
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [navigate])

  if (!user) {
    return <Navigate to="/" replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const handleWithdraw = async () => {
    if (withdrawing) return
    setWithdrawing(true)
    try {
      await withdraw()
      toast.success("회원 탈퇴가 완료되었습니다")
      navigate("/")
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setWithdrawing(false)
      setWithdrawOpen(false)
    }
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
          <div className="flex items-center gap-2 pb-1">
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
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            className="mt-2 w-full text-left text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            회원 탈퇴
          </button>
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
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWithdrawOpen(true)}
              aria-label="회원 탈퇴"
            >
              <UserX className="size-4" />
            </Button>
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

      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원 탈퇴를 진행할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              계정과 발급한 API 키, 입금 내역이 더 이상 조회되지 않습니다. 이
              작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleWithdraw}
              disabled={withdrawing}
            >
              {withdrawing ? "처리 중…" : "탈퇴"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
