import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, signup } from "@/lib/auth"

export default function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/app", { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    const result = signup(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    toast("회원가입이 완료되었습니다")
    navigate("/app")
  }

  return (
    <div className="grid min-h-svh place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex justify-center">
          <Brand />
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">회원가입</CardTitle>
            <CardDescription>
              계정을 만들고 API 키를 발급해 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  4자 이상, 영문 소문자와 숫자를 사용할 수 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">8자 이상 입력해 주세요.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">비밀번호 확인</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                가입하기
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              이미 계정이 있나요?{" "}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link to="/login">로그인</Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
