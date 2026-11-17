import { cn } from "cn"

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-[2px] bg-foreground font-mono text-[12px] font-bold text-background">
        ₩
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.04em]">EASY-PG</span>
    </span>
  )
}
