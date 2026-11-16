import { useEffect, useState } from "react"
import { Copy, Plus, Trash2, TriangleAlert } from "lucide-react"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { errorMessage } from "@/lib/api"
import {
  createKey,
  deleteKey,
  EXP_DAY_OPTIONS,
  getKeys,
  isExpired,
  type ApiKey,
  type CreatedApiKey,
  type ExpDay,
} from "@/lib/api-keys"
import { formatDateValue } from "@/lib/format"

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [name, setName] = useState("")
  const [expDay, setExpDay] = useState<ExpDay>("DAY_90")
  const [issuing, setIssuing] = useState(false)
  const [issued, setIssued] = useState<CreatedApiKey | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = async () => {
    try {
      const next = await getKeys()
      setKeys(next)
      setError(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleIssueOpenChange = (open: boolean) => {
    if (issuing) return
    setIssueOpen(open)
    if (!open) {
      setIssued(null)
      setName("")
      setExpDay("DAY_90")
    }
  }

  const handleIssue = async () => {
    const trimmed = name.trim()
    if (!trimmed || issuing) return

    setIssuing(true)
    try {
      const created = await createKey(trimmed, expDay)
      setIssued(created)
      toast.success("API 키를 발급했습니다")
      await refresh()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setIssuing(false)
    }
  }

  const copySecret = async (secret: string) => {
    try {
      await navigator.clipboard.writeText(secret)
      toast.success("API 키를 복사했습니다")
    } catch {
      toast.error("클립보드 복사에 실패했습니다")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return

    setDeleting(true)
    try {
      await deleteKey(deleteTarget.id)
      setKeys((prev) => prev.filter((key) => key.id !== deleteTarget.id))
      toast("API 키를 삭제했습니다")
      setDeleteTarget(null)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            API 키
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            서비스와 Android 앱을 연결할 API 키를 관리합니다.
          </p>
        </div>
        <Button onClick={() => setIssueOpen(true)}>
          <Plus className="size-4" />
          키 발급
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>API 키를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>발급된 API 키</CardTitle>
            <CardDescription>총 {keys.length}개</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                API 키를 불러오는 중…
              </div>
            ) : keys.length > 0 ? (
              <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">이름</TableHead>
                    <TableHead className="px-4">ID</TableHead>
                    <TableHead className="px-4">만료일</TableHead>
                    <TableHead className="px-4">상태</TableHead>
                    <TableHead className="w-12 pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => {
                    const expired = isExpired(key)
                    return (
                      <TableRow key={key.id}>
                        <TableCell className="py-3 pl-6 font-medium">
                          {key.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          #{key.id}
                        </TableCell>
                        <TableCell
                          className={
                            expired
                              ? "px-4 py-3 tabular-nums text-destructive"
                              : "px-4 py-3 tabular-nums"
                          }
                        >
                          {formatDateValue(key.expDate)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {expired ? (
                            <Badge variant="destructive">만료</Badge>
                          ) : (
                            <Badge variant="secondary">활성</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 pr-6">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(key)}
                            aria-label={`${key.name} 키 삭제`}
                          >
                            <Trash2 className="size-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                발급된 API 키가 없습니다.
              </div>
            )}
            <p className="px-6 text-xs leading-relaxed text-muted-foreground">
              API 키 원문은 발급 시에만 확인할 수 있습니다. 유출된 키는 삭제 후
              다시 발급하세요.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={issueOpen} onOpenChange={handleIssueOpenChange}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto overscroll-contain sm:max-w-md">
          {!issued ? (
            <>
              <DialogHeader>
                <DialogTitle>API 키 발급</DialogTitle>
                <DialogDescription>
                  이름과 유효기간을 입력해 키를 발급합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">이름</Label>
                  <Input
                    id="keyName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="예: 커머스 프로젝트"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity">유효기간</Label>
                  <Select
                    value={expDay}
                    onValueChange={(value) => setExpDay(value as ExpDay)}
                  >
                    <SelectTrigger id="validity" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXP_DAY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleIssueOpenChange(false)}
                  disabled={issuing}
                >
                  취소
                </Button>
                <Button
                  onClick={handleIssue}
                  disabled={!name.trim() || issuing}
                >
                  {issuing ? "발급 중…" : "발급"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>API 키가 발급되었습니다</DialogTitle>
                <DialogDescription>
                  QR 코드를 Android 앱에서 스캔해 기기를 연결하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-3">
                  <QRCode value={issued.key} size={168} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>API 키</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">
                    {issued.key}
                  </code>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => copySecret(issued.key)}
                    aria-label="API 키 복사"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <Alert>
                <TriangleAlert />
                <AlertTitle>이 키는 다시 확인할 수 없습니다</AlertTitle>
                <AlertDescription>
                  창을 닫기 전에 안전한 곳에 복사해 두세요. 분실 시 키를 삭제하고
                  다시 발급해야 합니다.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button onClick={() => handleIssueOpenChange(false)}>
                  확인
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API 키를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} 키가 삭제되면 이 키로 연결된 기기와 API 요청이
              즉시 중단됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중…" : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
