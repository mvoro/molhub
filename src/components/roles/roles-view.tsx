import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, SignpostIcon, StarIcon } from "@hugeicons/core-free-icons"

import { RoleCard } from "@/components/roles/role-card"
import { RoleDetailsContent } from "@/components/roles/role-details-sheet"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetDescription, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { AppMenu, AppMenuContent, AppMenuRadioGroup, AppMenuRadioItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROLE_CATEGORIES, type Role, type RoleCategoryId } from "@/data/roles"
import { useRoles } from "@/hooks/use-roles"
import { ICON_STROKE } from "@/lib/icons"
import { searchRoles } from "@/lib/roles"

export type RolesViewProps = { open: boolean; onOpenChange: (open: boolean) => void; onStart: (role: Role, prompt?: string) => void }

// Returning from a chat keeps this browsing session, without persisting filters across reloads.
const catalogSession = { tab: "all", category: "all" as RoleCategoryId | "all", scrollTop: 0 }

export function RolesView({ open, onOpenChange, onStart }: RolesViewProps) {
  const { favorites, toggleFavorite } = useRoles()
  const [tab, setTab] = React.useState(catalogSession.tab)
  const [category, setCategory] = React.useState<RoleCategoryId | "all">(catalogSession.category)
  const [detail, setDetail] = React.useState<Role | null>(null)
  const [categoryOpen, setCategoryOpen] = React.useState(false)
  const [previousOpen, setPreviousOpen] = React.useState(open)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const detailsOpener = React.useRef<string | null>(null)

  // Reopening starts at the catalogue; keep the current screen during the closing animation.
  if (open !== previousOpen) {
    setPreviousOpen(open)
    if (open) {
      setDetail(null)
      setCategoryOpen(false)
    }
  }

  React.useLayoutEffect(() => {
    if (detail || !open || !scrollRef.current) return
    scrollRef.current.scrollTop = catalogSession.scrollTop
    if (detailsOpener.current) {
      const opener = scrollRef.current.querySelector<HTMLElement>(`[data-role-open="${detailsOpener.current}"]`)
        ?? scrollRef.current.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
      opener?.focus({ preventScroll: true })
    }
  }, [detail, open])

  React.useEffect(() => {
    catalogSession.tab = tab
    catalogSession.category = category
  }, [tab, category])

  const roles = searchRoles("", { category, favoriteIds: favorites, favoritesOnly: tab === "favorites" })
  const isEmptyFavorites = tab === "favorites" && favorites.length === 0
  const selectedCategory = ROLE_CATEGORIES.find((item) => item.id === category)

  const reset = () => {
    setCategory("all")
    setTab("all")
  }
  const openRole = (role: Role) => {
    detailsOpener.current = role.id
    setDetail(role)
  }

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent className={detail ? "md:max-w-[680px]" : "h-[85dvh] md:max-w-[1080px]"} onOpenAutoFocus={() => { if (scrollRef.current) scrollRef.current.scrollTop = catalogSession.scrollTop }}>
        {detail ? (
          <RoleDetailsContent key={detail.id} role={detail} onBack={() => setDetail(null)} backLabel="Назад к ролям" onStart={onStart} />
        ) : (
          <>
            <AppSheetHeader>
              <AppSheetTitle>Роли</AppSheetTitle>
              <AppSheetDescription className="max-w-xl">Помощники для работы, творчества и повседневных задач. Выберите роль и начните с вашей идеи.</AppSheetDescription>
            </AppSheetHeader>
            <AppSheetBody ref={scrollRef} data-vaul-no-drag="" onScroll={(event) => { catalogSession.scrollTop = event.currentTarget.scrollTop }} className="pb-6">
              <Tabs value={tab} onValueChange={setTab} className="gap-0">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <TabsList aria-label="Каталог ролей">
                    <TabsTrigger value="all">Все роли</TabsTrigger>
                    <TabsTrigger value="favorites">
                      <HugeiconsIcon icon={StarIcon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
                      Избранные
                    </TabsTrigger>
                  </TabsList>
                  <AppMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <AppMenuTrigger asChild>
                      <Button variant="secondary" aria-label={`Категория роли: ${selectedCategory?.label ?? "Все категории"}`} className="h-9 w-full min-w-[164px] justify-between gap-4 rounded-full px-4 font-normal md:w-auto">
                        {selectedCategory?.label ?? "Все категории"}
                        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground" />
                      </Button>
                    </AppMenuTrigger>
                    <AppMenuContent align="start" data-vaul-no-drag="" aria-label="Категории ролей">
                      <AppMenuRadioGroup value={category} onValueChange={(value) => setCategory(value as RoleCategoryId | "all")}>
                        {[{ id: "all" as const, label: "Все категории" }, ...ROLE_CATEGORIES].map((item) => (
                          <AppMenuRadioItem key={item.id} value={item.id}>{item.label}</AppMenuRadioItem>
                        ))}
                      </AppMenuRadioGroup>
                    </AppMenuContent>
                  </AppMenu>
                </div>

                <TabsContent value={tab}>
                  {roles.length > 0 ? (
                    <>
                      {selectedCategory && <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{selectedCategory.description}</p>}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {roles.map((role) => <RoleCard key={role.id} role={role} favorite={favorites.includes(role.id)} onFavorite={() => toggleFavorite(role.id)} onOpen={() => openRole(role)} onStart={() => onStart(role)} />)}
                      </div>
                    </>
                  ) : (
                    <Empty className="min-h-[280px] py-12">
                      <EmptyHeader>
                        <EmptyMedia variant="icon"><HugeiconsIcon icon={isEmptyFavorites ? StarIcon : SignpostIcon} strokeWidth={ICON_STROKE} /></EmptyMedia>
                        <EmptyTitle className="text-base">{isEmptyFavorites ? "Ваши любимые роли будут здесь" : "Роли не найдены"}</EmptyTitle>
                        <EmptyDescription>{isEmptyFavorites ? "Нажмите на звезду рядом с ролью, чтобы быстро вернуться к ней." : "В этой категории пока нет избранных ролей. Выберите другую категорию или откройте все роли."}</EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button type="button" variant="secondary" className="h-10 rounded-full px-4" onClick={reset}>{isEmptyFavorites ? "Посмотреть все роли" : "Сбросить фильтры"}</Button>
                      </EmptyContent>
                    </Empty>
                  )}
                </TabsContent>
              </Tabs>
            </AppSheetBody>
          </>
        )}
      </AppSheetContent>
    </AppSheet>
  )
}
