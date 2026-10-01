import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Cancel01Icon, Search01Icon, SignpostIcon, StarIcon } from "@hugeicons/core-free-icons"

import { RoleCard } from "@/components/roles/role-card"
import { RoleDetailsContent } from "@/components/roles/role-details-sheet"
import { AppSheet, AppSheetBody, AppSheetContent, AppSheetDescription, AppSheetHeader, AppSheetTitle } from "@/components/ui/app-sheet"
import { Button } from "@/components/ui/button"
import { AppMenu, AppMenuContent, AppMenuRadioGroup, AppMenuRadioItem, AppMenuTrigger } from "@/components/ui/app-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ROLE_CATEGORIES, type Role, type RoleCategoryId } from "@/data/roles"
import { useRoles } from "@/hooks/use-roles"
import { useIsMobile } from "@/hooks/use-mobile"
import { ICON_STROKE } from "@/lib/icons"
import { lastInput } from "@/lib/input-modality"
import { searchRoles } from "@/lib/roles"
import "./roles-search.css"

export type RolesViewProps = { open: boolean; onOpenChange: (open: boolean) => void; onStart: (role: Role, prompt?: string) => void }

// Returning from a chat keeps this browsing session, without persisting filters across reloads.
const catalogSession = { tab: "all", category: "all" as RoleCategoryId | "all", query: "", scrollTop: 0 }

export function RolesView({ open, onOpenChange, onStart }: RolesViewProps) {
  const mobile = useIsMobile()
  const { favorites, toggleFavorite } = useRoles()
  const [tab, setTab] = React.useState(catalogSession.tab)
  const [category, setCategory] = React.useState<RoleCategoryId | "all">(catalogSession.category)
  const [query, setQuery] = React.useState(catalogSession.query)
  const [searchOpen, setSearchOpen] = React.useState(Boolean(catalogSession.query))
  const [instantSearch, setInstantSearch] = React.useState(true)
  const [detail, setDetail] = React.useState<Role | null>(null)
  const [categoryOpen, setCategoryOpen] = React.useState(false)
  const [previousOpen, setPreviousOpen] = React.useState(open)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const allRolesTab = React.useRef<HTMLButtonElement>(null)
  const searchInput = React.useRef<HTMLInputElement>(null)
  const searchToggle = React.useRef<HTMLButtonElement>(null)
  const focusSearch = React.useRef(false)
  const searchId = React.useId()
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
    catalogSession.query = query
  }, [tab, category, query])

  React.useLayoutEffect(() => {
    // Only a deliberate reveal focuses the input, not returning from a role's details.
    if (searchOpen && focusSearch.current) {
      focusSearch.current = false
      searchInput.current?.focus({ preventScroll: true })
    }
  }, [searchOpen])

  const roles = searchRoles(query, { category, favoriteIds: favorites, favoritesOnly: tab === "favorites" })
  const hasQuery = Boolean(query.trim())
  const isEmptyFavorites = !hasQuery && tab === "favorites" && favorites.length === 0
  const selectedCategory = ROLE_CATEGORIES.find((item) => item.id === category)

  const resetScroll = () => {
    catalogSession.scrollTop = 0
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }
  const changeSearchOpen = (next: boolean) => {
    setInstantSearch(lastInput() === "keyboard")
    focusSearch.current = next
    setSearchOpen(next)
    if (next) {
      setCategoryOpen(false)
    } else {
      setQuery("")
      resetScroll()
      searchToggle.current?.focus({ preventScroll: true })
    }
  }
  const reset = () => {
    setQuery("")
    setCategory("all")
    setTab("all")
    resetScroll()
    allRolesTab.current?.focus({ preventScroll: true })
  }
  const openRole = (role: Role) => {
    detailsOpener.current = role.id
    setDetail(role)
  }

  return (
    <AppSheet open={open} onOpenChange={onOpenChange}>
      <AppSheetContent
        className={detail ? "md:max-w-[680px]" : "h-[85dvh] md:max-w-[1080px]"}
        onOpenAutoFocus={() => { if (scrollRef.current) scrollRef.current.scrollTop = catalogSession.scrollTop }}
        onEscapeKeyDown={(event) => {
          if (!detail && searchOpen && !categoryOpen) {
            event.preventDefault()
            changeSearchOpen(false)
          }
        }}
      >
        {detail ? (
          <RoleDetailsContent key={detail.id} role={detail} onBack={() => setDetail(null)} backLabel="Назад к ролям" onStart={onStart} />
        ) : (
          <>
            <AppSheetHeader>
              <AppSheetTitle>Роли</AppSheetTitle>
              <AppSheetDescription className="max-w-xl">Помощники для работы, творчества и повседневных задач. Выберите роль и начните с вашей идеи.</AppSheetDescription>
            </AppSheetHeader>
            <AppSheetBody ref={scrollRef} data-vaul-no-drag="" onScroll={(event) => { catalogSession.scrollTop = event.currentTarget.scrollTop }} className="-mt-1 pt-1 pb-6">
              <Tabs value={tab} onValueChange={(value) => { setTab(value); resetScroll() }} className="gap-0">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <TabsList aria-label="Каталог ролей">
                    <TabsTrigger ref={allRolesTab} value="all">Все роли</TabsTrigger>
                    <TabsTrigger value="favorites">
                      <HugeiconsIcon icon={StarIcon} strokeWidth={ICON_STROKE} data-icon="inline-start" />
                      Избранные
                    </TabsTrigger>
                  </TabsList>
                  <div className="roles-filters" data-search-open={searchOpen} data-instant={instantSearch}>
                    <div className="roles-search-field" id={searchId} inert={!searchOpen} aria-hidden={!searchOpen}>
                      <InputGroup className="h-9 rounded-full bg-muted/60">
                        <InputGroupAddon className="pl-3">
                          <HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} />
                        </InputGroupAddon>
                        <InputGroupInput
                          ref={searchInput}
                          value={query}
                          onChange={(event) => { setQuery(event.target.value); resetScroll() }}
                          placeholder="Найдите роль или задачу"
                          aria-label="Найдите роль или задачу"
                          data-vaul-no-drag=""
                          className="min-w-0 pr-4 text-base md:text-sm"
                        />
                      </InputGroup>
                    </div>
                    <Button
                      ref={searchToggle}
                      type="button"
                      variant="secondary"
                      size="icon-lg"
                      className="roles-search-toggle relative rounded-full active:scale-[0.97]"
                      aria-label={searchOpen ? "Закрыть поиск и очистить запрос" : "Найти роль"}
                      aria-expanded={searchOpen}
                      aria-controls={searchId}
                      onClick={() => changeSearchOpen(!searchOpen)}
                    >
                      <span className="roles-search-icon" aria-hidden="true"><HugeiconsIcon icon={Search01Icon} strokeWidth={ICON_STROKE} /></span>
                      <span className="roles-search-close-icon" aria-hidden="true"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} /></span>
                    </Button>
                    <div className="roles-filters-category" inert={mobile && searchOpen} aria-hidden={mobile && searchOpen}>
                      <AppMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <AppMenuTrigger asChild>
                          <Button variant="secondary" aria-label={`Категория роли: ${selectedCategory?.label ?? "Все категории"}`} className="h-9 w-full min-w-[164px] shrink-0 justify-between gap-4 rounded-full px-4 font-normal md:w-auto">
                            {selectedCategory?.label ?? "Все категории"}
                            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={ICON_STROKE} className="text-muted-foreground" />
                          </Button>
                        </AppMenuTrigger>
                        <AppMenuContent align="start" data-vaul-no-drag="" aria-label="Категории ролей">
                          <AppMenuRadioGroup value={category} onValueChange={(value) => { setCategory(value as RoleCategoryId | "all"); resetScroll() }}>
                            {[{ id: "all" as const, label: "Все категории" }, ...ROLE_CATEGORIES].map((item) => (
                              <AppMenuRadioItem key={item.id} value={item.id}>{item.label}</AppMenuRadioItem>
                            ))}
                          </AppMenuRadioGroup>
                        </AppMenuContent>
                      </AppMenu>
                    </div>
                  </div>
                </div>

                <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{hasQuery ? (roles.length ? `Результатов поиска: ${roles.length}` : "Роли не найдены") : ""}</p>
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
                        <EmptyDescription>{isEmptyFavorites ? "Нажмите на звезду рядом с ролью, чтобы быстро вернуться к ней." : hasQuery ? "Попробуйте другой запрос или сбросьте фильтры." : "В этой категории пока нет избранных ролей. Выберите другую категорию или откройте все роли."}</EmptyDescription>
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
