import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Markdown becomes React nodes. Raw HTML is skipped, URLs use react-markdown's safe transform,
// and remote images are represented by alt text instead of loading resources from model output.
export function DocumentContent({ text }: { text: string }) {
  return (
    <article className="mx-auto max-w-2xl break-words text-base leading-7 [&>*+*]:mt-4">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
        h1: ({ children }) => <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="pt-2 text-xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="pt-2 text-lg font-semibold">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children, start }) => <ol start={start} className="list-decimal space-y-1 pl-5">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="border-l-2 pl-4 text-muted-foreground">{children}</blockquote>,
        pre: ({ children }) => <pre className="overflow-x-auto rounded-xl bg-muted p-4 font-mono text-sm leading-6">{children}</pre>,
        code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{children}</a>,
        img: ({ alt }) => <span className="text-muted-foreground">{alt || "Изображение"}</span>,
        input: ({ checked }) => <Checkbox checked={!!checked} disabled aria-label={checked ? "Выполнено" : "Не выполнено"} className="mr-2" />,
        table: ({ children }) => <Table>{children}</Table>,
        thead: ({ children }) => <TableHeader>{children}</TableHeader>,
        tbody: ({ children }) => <TableBody>{children}</TableBody>,
        tr: ({ children }) => <TableRow>{children}</TableRow>,
        th: ({ children }) => <TableHead>{children}</TableHead>,
        td: ({ children }) => <TableCell>{children}</TableCell>,
      }}>{text}</Markdown>
    </article>
  )
}
