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
import { getCurrentUser, login } from "@/lib/auth"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (getCurrentUser()) {
      navigate("/app", { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = login(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    toast(`${username}님, 로그인되었습니다`)
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
            <CardTitle className="font-heading text-lg">로그인</CardTitle>
            <CardDescription>알림결제 계정으로 로그인합니다.</CardDescription>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                로그인
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              계정이 없나요?{" "}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link to="/signup">회원가입</Link>
              </Button>
            </p>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          데모 계정: demo / demo1234
        </p>
      </div>
    </div>
  )
}
