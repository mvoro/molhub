import type { StorybookConfig } from "@storybook/react-vite"

// The project's vite.config.ts (React, Tailwind v4, the "@" alias) is picked up as is.
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  features: { sidebarOnboardingChecklist: false, menuOnboardingChecklist: false },
}

export default config
