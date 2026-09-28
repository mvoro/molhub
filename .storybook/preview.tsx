import { useEffect, type ReactNode } from "react"
import type { Decorator, Preview } from "@storybook/react-vite"
import { TooltipProvider } from "../src/components/ui/tooltip"
import { RolesProvider } from "../src/hooks/use-roles"
import "../src/index.css"

/* Dark theme works exactly like in the app: the `.dark` class on <html>. */
function ThemeRoot({ dark, children }: { dark: boolean; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return <RolesProvider><TooltipProvider>{children}</TooltipProvider></RolesProvider>
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeRoot dark={ctx.globals.theme === "dark"}>
    <Story />
  </ThemeRoot>
)

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [withTheme],
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "Тема",
      toolbar: {
        title: "Тема",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Светлая" },
          { value: "dark", title: "Тёмная" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
    options: {
      storySort: { order: ["Проект", "UI"] },
    },
    viewport: {
      options: {
        mobile: { name: "Мобилка 375", styles: { width: "375px", height: "812px" }, type: "mobile" },
        desktop: { name: "Десктоп 1100", styles: { width: "1100px", height: "800px" }, type: "desktop" },
      },
    },
  },
}

export default preview
