import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { AssistantChatMessage, UserChatMessage } from "@/components/chat/chat-messages"
import { ChatArtifactWorkspace } from "@/components/chat/artifact-panel"
import { BalanceButton } from "@/components/balance/balance-button"
import { getChatConfig, saveChatConfig, type ChatConfig } from "@/components/chat-composer/chat-config"
import { ChatComposer, type ComposerHandle } from "@/components/chat-composer/chat-composer"
import { ProjectChatHeader } from "@/components/project/project-chat-header"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { type Chat, type ChatType } from "@/data/chats"
import { useComposerHeight } from "@/hooks/use-composer-height"
import { useHub } from "@/hooks/use-hub"
import { useRoles } from "@/hooks/use-roles"
import { isActive, rateReply, regenerateReply, reloadChatMessages, sendChatMessage, stopReply, useChatLoadState, useChatMessages } from "@/hooks/use-chat-messages"
import { CHAT_TYPE_ICON, ICON_STROKE } from "@/lib/icons"
import type { ChatArtifact } from "@/lib/chat-attachments"
import { resolveRole } from "@/lib/roles"

const PLACEHOLDER: Record<ChatType, string> = {
  text: "Напишите сообщение",
  image: "Опишите, что изменить или нарисовать",
  video: "Опишите следующую сцену",
  audio: "Вставьте текст для озвучки",
}

/* An open chat. Its type was fixed when it started, so there are no mode chips here — only a
   badge in the composer saying what this chat makes. The composer is pinned over the bottom with
   no backing and the header over the top (phone): messages scroll under both. */
export function ChatView({ chat }: { chat: Chat }) {
  const messages = useChatMessages(chat.id)
  const loadState = useChatLoadState(chat.id)
  const { touchChat } = useHub()
  const { recordUse } = useRoles()
  const { section, dock } = useComposerHeight()
  const composer = React.useRef<ComposerHandle>(null)
  const [artifact, setArtifact] = React.useState<ChatArtifact | null>(null)
  const [artifactOpen, setArtifactOpen] = React.useState(false)
  const openDocument = (file: ChatArtifact) => { setArtifact(file); setArtifactOpen(true) }
  const saveConfig = React.useCallback((config: ChatConfig) => saveChatConfig(chat.id, config), [chat.id])
  // The last reply still thinking, drawing or writing: the composer shows «stop» instead of «send».
  const last = messages.at(-1)
  const busy = last?.role === "assistant" && isActive(last.status)

  return (
    <ChatArtifactWorkspace file={artifact} open={artifactOpen} onClose={() => setArtifactOpen(false)}>
    <section ref={section} aria-label={chat.title} className="relative flex min-h-0 flex-1 flex-col [--composer-h:8rem]">
      {artifactOpen && <BalanceButton className="absolute top-3.5 right-6 z-30 max-md:hidden" />}
      {/* A project's chat: the project top left (desktop). */}
      <ProjectChatHeader chat={chat} />
      {messages.length === 0 && loadState === "loading" ? (
        <div className="flex flex-1 items-center justify-center gap-2 p-6 pb-[calc(var(--composer-h)+1.5rem)] text-sm text-muted-foreground" aria-live="polite">
          <Spinner /> Загружаем историю…
        </div>
      ) : messages.length === 0 && loadState === "error" ? (
        <Empty className="p-6 pb-[calc(var(--composer-h)+1.5rem)]">
          <EmptyHeader>
            <EmptyTitle className="text-base">Не удалось загрузить историю</EmptyTitle>
            <EmptyDescription>Попробуйте открыть сообщения ещё раз.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => reloadChatMessages(chat.id)}>Повторить</Button>
        </Empty>
      ) : messages.length === 0 ? (
        <Empty className="p-6 pb-[calc(var(--composer-h)+1.5rem)]">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-10 rounded-xl [&_svg]:size-5">
              <HugeiconsIcon icon={CHAT_TYPE_ICON[chat.type]} strokeWidth={ICON_STROKE} />
            </EmptyMedia>
            <EmptyTitle className="text-base">{chat.title}</EmptyTitle>
            <EmptyDescription>Здесь пока нет сообщений. Напишите первое ниже.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-8 px-4 pt-20 pb-[calc(var(--composer-h)+2rem)] md:px-6 md:pt-14">
                {messages.map((message) => (
                  // The item clips what spills out of it (content-visibility), so it reaches 8px past the
                  // column on both sides: the action buttons' hover pills sit out there, icons in line with the text.
                  <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"} className="-mx-2 px-2">
                    {message.role === "user" ? (
                      <UserChatMessage message={message} onEdit={(text) => composer.current?.fill(text)} onOpenDocument={openDocument} />
                    ) : (
                      <AssistantChatMessage
                        message={message}
                        busy={busy}
                        onRate={(rating) => {
                          // Thanks only for a new rating, not for taking one back (a second press clears it).
                          if (message.rating !== rating) toast("Спасибо за отзыв", { id: "rate" })
                          rateReply(chat.id, message.id, rating)
                        }}
                        onRegenerate={() => regenerateReply(chat.id, message.id)}
                        onOpenDocument={openDocument}
                      />
                    )}
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            {/* Desktop (the user's ask, 27.09): the thread dissolves under the top edge through the studios'
                scrim, as tall as the list's top padding, so at rest it covers nothing. The phone has its header. */}
            <div aria-hidden="true" className="scrim-top pointer-events-none absolute inset-x-0 top-0 z-10 h-14 max-md:hidden" />
            <MessageScrollerButton className="size-10 rounded-full data-[direction=end]:bottom-[calc(var(--composer-h)+0.75rem)] md:size-9" />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <div ref={dock} className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 md:pb-6">
        <ChatComposer
          key={chat.id}
          ref={composer}
          mode={chat.type}
          initial={getChatConfig(chat.id, chat.type)}
          onConfigChange={saveConfig}
          placeholder={PLACEHOLDER[chat.type]}
          onSend={({ text, files, model, settings }) => {
            const body = text || files.map((file) => file.name).join(", ")
            saveConfig({ model, settings })
            const role = resolveRole(settings.role)
            if (role) recordUse(role.id, chat.id)
            sendChatMessage(chat.id, text, model, files)
            // The chat moves up in its project's list, with this line under its title.
            touchChat(chat.id, body)
          }}
          generating={busy}
          onStop={() => stopReply(chat.id)}
          autoFocus
        />
      </div>
    </section>
    </ChatArtifactWorkspace>
  )
}
