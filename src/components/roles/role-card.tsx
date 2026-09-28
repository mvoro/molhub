import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ROLE_CATEGORIES, type Role } from "@/data/roles"
import { ICON_STROKE } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function RoleAvatar({ role, className }: { role: Role; className?: string }) {
  return <img src={role.image} alt="" width={56} height={56} loading="lazy" className={cn("size-12 shrink-0 rounded-2xl bg-muted object-cover", className)} />
}

export function RoleFavoriteButton({ role, favorite, onToggle, inSheet = false }: {
  role: Role
  favorite: boolean
  onToggle: () => void
  inSheet?: boolean
}) {
  const label = favorite ? "Убрать из избранного" : "Добавить в избранное"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button" variant="ghost" size="icon-lg"
          aria-label={`${label}: ${role.name}`} aria-pressed={favorite} onClick={onToggle}
          className={cn("shrink-0 rounded-[10px] text-muted-foreground", favorite && "text-primary hover:text-primary", inSheet && "size-11 rounded-full")}
        >
          <HugeiconsIcon icon={StarIcon} strokeWidth={ICON_STROKE} className={cn("size-[18px]!", favorite && "fill-current")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function RoleCard({ role, favorite, onFavorite, onOpen, onStart }: {
  role: Role
  favorite: boolean
  onFavorite: () => void
  onOpen: () => void
  onStart: () => void
}) {
  const category = ROLE_CATEGORIES.find((item) => item.id === role.group)
  return (
    <Card className="relative isolate gap-0 rounded-2xl bg-muted/45 p-0 ring-0 has-[[data-role-open]:hover]:bg-muted has-[[data-role-open]:focus-visible]:ring-2 has-[[data-role-open]:focus-visible]:ring-ring">
      <Button
        type="button" variant="ghost" onClick={onOpen}
        data-role-open={role.id}
        aria-label={`Подробнее о роли «${role.name}»`}
        className="absolute inset-0 size-full rounded-2xl hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0 active:scale-100"
      />
      <CardContent className="pointer-events-none flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <RoleAvatar role={role} />
          <div className="pointer-events-auto relative z-10">
            <RoleFavoriteButton role={role} favorite={favorite} onToggle={onFavorite} />
          </div>
        </div>
        <div className="-mx-1 flex-1 px-1 py-1 text-left">
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="text-base font-medium leading-snug">{role.name}</span>
            <span className="line-clamp-2 min-h-10 text-sm leading-5 font-normal text-muted-foreground">{role.description}</span>
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="truncate text-xs text-muted-foreground">{category?.label}</span>
          <Button type="button" variant="secondary" size="sm" className="pointer-events-auto relative z-10 shrink-0 rounded-full px-3" onClick={onStart} aria-label={`Начать чат с ролью «${role.name}»`}>
            Начать чат
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={ICON_STROKE} data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
