import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "@/lib/auth"

export type AuthMode = "login" | "signup"

interface AuthModalProps {
  mode: AuthMode | null
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
}

function AuthForm({
  mode,
  onModeChange,
  onClose,
}: {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError(null)

    if (mode === "signup" && password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    setSubmitting(true)
    const result =
      mode === "login"
        ? await login(username, password)
        : await signup(username, password)

    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    toast.success(
      mode === "signup" ? "회원가입이 완료되었습니다" : "로그인되었습니다",
    )
    onClose()
    navigate("/app")
    setSubmitting(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "signup" ? "회원가입" : "로그인"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-username">아이디</Label>
          <Input
            id="auth-username"
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={submitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">비밀번호</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />
        </div>
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="auth-confirm">비밀번호 확인</Label>
            <Input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={submitting}
              required
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting
            ? "처리 중…"
            : mode === "signup"
              ? "가입하기"
              : "로그인"}
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            이미 계정이 있나요?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => onModeChange("login")}
            >
              로그인
            </button>
          </>
        ) : (
          <>
            계정이 없나요?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => onModeChange("signup")}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </>
  )
}

export function AuthModal({ mode, onModeChange, onClose }: AuthModalProps) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {mode && (
          <AuthForm key={mode} mode={mode} onModeChange={onModeChange} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
