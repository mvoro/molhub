/* Tools of the Krea-style workspace: shown in the sidebar and, with their descriptions, in search (⌘K).
   `id` is what the workspace opens (`new:<type>` = a new chat in that mode). Icons are app tiles from
   public/icons: the 1024px originals cropped to the tile and scaled to 96px in public/icons/sm
   (3× of the sidebar's 20px, 3× of search's 32px): `sips -c 804 804 x.png --out sm/x.png && sips -Z 96 sm/x.png`.
   The «Новый чат» row uses the same kind of tile (new-chat.png). */
export type Tool = {
  id: string
  label: string
  icon: string
  /* One line in search: what the tool makes and with which models. No trailing period. */
  description: string
}

/* «Новый чат» opens the text tool: it is the default screen and the home of the chat history. */
export const NEW_CHAT = "new:text"

export const TOOLS: Tool[] = [
  { id: "new:text", label: "Текст", icon: "/icons/sm/text.png", description: "Ответы и тексты в ChatGPT, Claude и Gemini" },
  { id: "new:image", label: "Фото", icon: "/icons/sm/photo.png", description: "Картинки и правка фото в Nano Banana и FLUX" },
  { id: "new:video", label: "Видео", icon: "/icons/sm/video.png", description: "Ролики из текста или фото в Veo, Kling и Seedance" },
  { id: "new:audio", label: "Аудио", icon: "/icons/sm/audio.png", description: "Песни и музыка в Suno" },
]

/* Rarer tools: behind «Больше» in the sidebar, listed after the main ones in search.
   Roles are not a tool: they have their own row in the navigation (sidebar-nav) and are picked in the text composer. */
export const MORE_TOOLS: Tool[] = [
  { id: "carousel", label: "Карусель", icon: "/icons/sm/carousel.png", description: "Серия картинок для соцсетей" },
  { id: "trends", label: "Тренды", icon: "/icons/sm/trends.png", description: "Популярные работы — повторите по шаблону" },
]
