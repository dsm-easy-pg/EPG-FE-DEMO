import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

interface SiteHeaderProps {
  variant?: "landing" | "docs"
  onLogin?: () => void
  onSignup?: () => void
}

const LINK_CLASS =
  "rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"

export function SiteHeader({
  variant = "landing",
  onLogin,
  onSignup,
}: SiteHeaderProps) {
  const isDocs = variant === "docs"

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-6 px-5 md:h-[88px]">
        <Link to="/" aria-label="EASY-PG 홈" className="shrink-0">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {isDocs ? (
            <>
              <Link to="/" className={LINK_CLASS}>
                홈
              </Link>
              <Link
                to="/docs"
                className={cn(
                  LINK_CLASS,
                  "bg-card text-foreground shadow-[0_1px_2px_rgba(24,25,28,.05)]"
                )}
                aria-current="page"
              >
                API 문서
              </Link>
              <Link to="/#install" className={LINK_CLASS}>
                앱 설치
              </Link>
            </>
          ) : (
            <>
              <a href="#how" className={LINK_CLASS}>
                작동 방식
              </a>
              <a href="#api" className={LINK_CLASS}>
                API
              </a>
              <Link to="/docs" className={LINK_CLASS}>
                문서
              </Link>
              <a href="#install" className={LINK_CLASS}>
                앱
              </a>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {isDocs ? (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                <Link to="/">홈으로</Link>
              </Button>
              <Button asChild>
                <Link to="/app/keys">키 발급</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={onLogin}
              >
                로그인
              </Button>
              <Button onClick={onSignup}>무료로 시작</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
