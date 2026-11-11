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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === "login") {
      const result = login(username, password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      toast.success("로그인되었습니다")
      onClose()
      navigate("/app")
      return
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    const result = signup(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    toast.success("회원가입이 완료되었습니다")
    onClose()
    navigate("/app")
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
            onChange={(e) => setUsername(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">
          {mode === "signup" ? "가입하기" : "로그인"}
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
