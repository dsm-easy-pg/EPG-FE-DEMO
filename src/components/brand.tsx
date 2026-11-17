import { cn } from "cn"

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/easy-pg-logo.png"
        alt=""
        aria-hidden="true"
        className="-mr-1 h-9 w-auto max-w-none shrink-0 object-contain"
      />
      <span className="text-[17px] font-semibold tracking-[-0.035em]">
        EASY-PG
      </span>
    </span>
  )
}
