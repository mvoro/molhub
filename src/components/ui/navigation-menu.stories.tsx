import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image02Icon, MusicNote02Icon, TextIcon, Video01Icon } from "@hugeicons/core-free-icons"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/NavigationMenu",
  component: NavigationMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Меню верхнего уровня с выпадающими панелями (Radix). Для AI Hub уместно в шапке — например пункт «Создать» с подпунктами по типу генерации. Для точечных действий и коротких списков в интерфейсе обычно достаточно `AppMenu*`; `NavigationMenu` — для более широкой, витринной раскладки со ссылками и описаниями.",
      },
    },
  },
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Создать</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="#">
                  <HugeiconsIcon icon={TextIcon} strokeWidth={ICON_STROKE} />
                  <div className="flex flex-col">
                    <span>Текст</span>
                    <span className="text-xs text-muted-foreground">Молли, GPT-5, Claude, Gemini</span>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <HugeiconsIcon icon={Image02Icon} strokeWidth={ICON_STROKE} />
                  <div className="flex flex-col">
                    <span>Фото</span>
                    <span className="text-xs text-muted-foreground">Молли, Midjourney, Nano Banana</span>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <HugeiconsIcon icon={Video01Icon} strokeWidth={ICON_STROKE} />
                  <div className="flex flex-col">
                    <span>Видео</span>
                    <span className="text-xs text-muted-foreground">Kling, Молли</span>
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <HugeiconsIcon icon={MusicNote02Icon} strokeWidth={ICON_STROKE} />
                  <div className="flex flex-col">
                    <span>Аудио</span>
                    <span className="text-xs text-muted-foreground">Молли</span>
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">История</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Тарифы</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

export const WithoutViewport: Story = {
  name: "Без общего окна",
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Тарифы</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              <li>
                <NavigationMenuLink href="#">Базовый — 500 молекул</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Про — 2000 молекул</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Команда</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
