import { useEffect, useState } from "react"
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  ArrowDownLeft,
  Download,
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
import { ANDROID_RELEASE_URL, ANDROID_RELEASE_VERSION } from "@/lib/links"

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
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-60 flex-col rounded-[28px] bg-card p-3 ring-1 ring-border/80 md:flex">
        <div className="flex h-14 items-center px-3">
          <NavLink to="/app">
            <Brand />
          </NavLink>
        </div>
        <nav className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-2.5 rounded-full px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <a
            href={ANDROID_RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-full bg-background px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="size-4" />
            <span className="flex-1">Android 앱</span>
            <span className="font-mono text-[10px]">
              {ANDROID_RELEASE_VERSION}
            </span>
          </a>
          <div className="rounded-2xl bg-background p-3">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {user.username.slice(0, 2).toLowerCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {user.username}
                </div>
                <div className="text-[11px] text-muted-foreground">계정</div>
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
              className="mt-2 w-full text-left text-[11px] text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-[272px]">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur md:hidden">
          <div className="flex h-14 items-center gap-2 px-4">
            <NavLink to="/app">
              <Brand />
            </NavLink>
            <div className="ml-auto flex items-center gap-0.5">
              <Button variant="ghost" size="icon-sm" asChild>
                <a
                  href={ANDROID_RELEASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Android 앱 다운로드"
                >
                  <Download className="size-4" />
                </a>
              </Button>
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
            </div>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground",
                    isActive && "bg-primary text-primary-foreground",
                  )
                }
              >
                <item.icon className="size-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-8 md:py-10">
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
