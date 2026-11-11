import { cn } from "cn"

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-[13px] font-semibold text-background">
        ₩
      </span>
      <span className="text-[15px] font-semibold tracking-tight">EASY-PG</span>
    </span>
  )
}
