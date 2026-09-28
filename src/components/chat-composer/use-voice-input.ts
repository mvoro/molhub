import * as React from "react"
import { toast } from "sonner"
import { WorkspaceVisibilityContext } from "@/hooks/workspace-visibility"

type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

type RecognitionConstructor = new () => Recognition

/* Dictation through the browser's speech recognition (Chrome, Safari). Spoken words are appended
   to what was typed before the mic was switched on. */
export function useVoiceInput(onText: (text: string) => void) {
  const visible = React.useContext(WorkspaceVisibilityContext)
  const [listening, setListening] = React.useState(false)
  const recognition = React.useRef<Recognition | null>(null)

  const stop = React.useCallback(() => {
    const current = recognition.current
    if (!current) return
    // stop() can deliver a final result later; it must not refill a sent message.
    current.onresult = null
    current.stop()
    recognition.current = null
    setListening(false)
  }, [])

  React.useEffect(() => {
    if (!visible) stop()
    return stop
  }, [visible, stop])

  const start = (base: string) => {
    const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
    const Speech = scope.SpeechRecognition ?? scope.webkitSpeechRecognition
    if (!Speech) {
      toast("Голосовой ввод недоступен в этом браузере", { description: "Откройте Молекулу в Chrome или Safari." })
      return
    }
    const r = new Speech()
    r.lang = "ru-RU"
    r.interimResults = true
    r.continuous = true
    r.onresult = (event) => {
      let spoken = ""
      for (const result of Array.from(event.results)) spoken += `${result[0].transcript} `
      onText(`${base} ${spoken}`.trim())
    }
    r.onend = () => setListening(false)
    r.onerror = (event) => {
      setListening(false)
      toast.error(
        event.error === "not-allowed" ? "Разрешите доступ к микрофону в настройках браузера" : "Не удалось распознать речь. Попробуйте ещё раз."
      )
    }
    recognition.current = r
    try {
      r.start()
      setListening(true)
    } catch {
      setListening(false)
      toast.error("Не удалось включить микрофон. Попробуйте ещё раз.")
    }
  }

  return { listening, start, stop }
}
