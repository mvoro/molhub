import type { Meta, StoryObj } from "@storybook/react-vite"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ImageAdd01Icon, Pdf02Icon } from "@hugeicons/core-free-icons"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import { ICON_STROKE } from "@/lib/icons"

const meta = {
  title: "UI/Attachment",
  component: Attachment,
  parameters: {
    docs: {
      description: {
        component:
          "Карточка вложения в композере и в сообщениях: файл, фото или кадр видео. `state` задаёт вид — `idle` (пунктирная рамка, приглашение загрузить), `uploading`/`processing` (шиммер заголовка и спиннер), `error` (красная рамка), `done` — обычный вид. `orientation=\"vertical\"` — превью на всю ширину карточки (кадры для видео-моделей), `horizontal` — иконка слева и текст справа. `AttachmentGroup` — горизонтальная лента с прокруткой для нескольких вложений в одном сообщении.",
      },
    },
  },
  args: { state: "done", size: "default", orientation: "horizontal" },
  argTypes: {
    state: { control: "select", options: ["idle", "uploading", "processing", "error", "done"] },
    size: { control: "select", options: ["default", "sm", "xs"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <Attachment {...args} className="w-56">
      <AttachmentMedia>
        <HugeiconsIcon icon={Pdf02Icon} strokeWidth={ICON_STROKE} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>menu.pdf</AttachmentTitle>
        <AttachmentDescription>
          {args.state === "idle"
            ? "Загрузите файл"
            : args.state === "uploading"
              ? "Загрузка…"
              : args.state === "processing"
                ? "Обработка…"
                : args.state === "error"
                  ? "Не удалось загрузить"
                  : "214 КБ"}
        </AttachmentDescription>
      </AttachmentContent>
      {args.state !== "idle" && (
        <AttachmentActions>
          <AttachmentAction aria-label="Убрать menu.pdf">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
          </AttachmentAction>
        </AttachmentActions>
      )}
    </Attachment>
  ),
} satisfies Meta<typeof Attachment>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Attachment state="idle" orientation="vertical" size="sm" className="w-32">
        <AttachmentMedia>
          <HugeiconsIcon icon={ImageAdd01Icon} strokeWidth={ICON_STROKE} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Начальный кадр</AttachmentTitle>
          <AttachmentDescription>Загрузите фото</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading" className="w-56">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>portrait.jpg</AttachmentTitle>
          <AttachmentDescription>Загрузка…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="processing" className="w-56">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>dance.mp4</AttachmentTitle>
          <AttachmentDescription>Обработка…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error" className="w-56">
        <AttachmentMedia>
          <HugeiconsIcon icon={Pdf02Icon} strokeWidth={ICON_STROKE} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>brief.pdf</AttachmentTitle>
          <AttachmentDescription>Файл больше 25 МБ</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Убрать brief.pdf">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "default"] as const).map((size) => (
        <Attachment key={size} size={size} className="w-48">
          <AttachmentMedia>
            <HugeiconsIcon icon={Pdf02Icon} strokeWidth={ICON_STROKE} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>menu.pdf</AttachmentTitle>
            <AttachmentDescription>214 КБ</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  ),
}

export const ImagePreview: Story = {
  render: () => (
    <Attachment orientation="vertical" className="w-36">
      <AttachmentMedia variant="image">
        <img src="/uploads/bedroom.jpg" alt="" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>bedroom.jpg</AttachmentTitle>
        <AttachmentDescription>3,4 МБ</AttachmentDescription>
      </AttachmentContent>
      <AttachmentTrigger aria-label="Открыть bedroom.jpg" />
      <AttachmentActions>
        <AttachmentAction aria-label="Убрать bedroom.jpg">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={ICON_STROKE} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
}

export const VideoWithPoster: Story = {
  render: () => (
    <Attachment orientation="vertical" className="w-36">
      <AttachmentMedia variant="image">
        <video
          src="/uploads/dance.mp4"
          poster="/uploads/dance.jpg"
          muted
          playsInline
          className="aspect-square w-full object-cover"
        />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>dance.mp4</AttachmentTitle>
        <AttachmentDescription>Видео · 8 c</AttachmentDescription>
      </AttachmentContent>
      <AttachmentTrigger aria-label="Открыть dance.mp4" />
    </Attachment>
  ),
}

export const Group: Story = {
  render: () => (
    <AttachmentGroup className="max-w-md">
      <Attachment size="sm" className="w-48">
        <AttachmentMedia>
          <HugeiconsIcon icon={Pdf02Icon} strokeWidth={ICON_STROKE} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>menu.pdf</AttachmentTitle>
          <AttachmentDescription>214 КБ</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment orientation="vertical" size="sm" className="w-28">
        <AttachmentMedia variant="image">
          <img src="/uploads/cream.jpg" alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>cream.jpg</AttachmentTitle>
          <AttachmentDescription>1,1 МБ</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment orientation="vertical" size="sm" className="w-28">
        <AttachmentMedia variant="image">
          <video
            src="/uploads/walk.mp4"
            poster="/uploads/walk.jpg"
            muted
            playsInline
            className="aspect-square w-full object-cover"
          />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>walk.mp4</AttachmentTitle>
          <AttachmentDescription>Видео</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  ),
}
