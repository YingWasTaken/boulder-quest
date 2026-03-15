import { useMemo } from 'react'
import { useApp } from '../context/AppContext'

const modules = import.meta.glob('../locales/*.json', { eager: true })

export const availableLocales: Record<string, Record<string, string>> = {}
export const availableLangs: string[] = []

for (const path in modules) {
  const langKey = path.split('/').pop()?.replace('.json', '')
  if (langKey) {
    availableLocales[langKey] = (modules[path] as any).default || modules[path]
    availableLangs.push(langKey)
  }
}

export function useTranslation() {
  const { lang } = useApp()
  const t = useMemo(() => {
    const dict = availableLocales[lang] ?? availableLocales['es'] ?? availableLocales[availableLangs[0]] ?? {};
    return (key: string): string => dict[key] ?? key
  }, [lang])
  return { t, lang, availableLangs }
}
