const SESSION_KEY = 'svln-gemini-api-key'

export function getGeminiApiKey(): string {
  const fromEnv = import.meta.env.VITE_GEMINI_API_KEY
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim()
  try {
    return sessionStorage.getItem(SESSION_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function saveGeminiApiKey(key: string): void {
  try {
    if (key.trim()) {
      sessionStorage.setItem(SESSION_KEY, key.trim())
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // ignore
  }
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 0
}

export function getGeminiModel(): string {
  const fromEnv = import.meta.env.VITE_GEMINI_MODEL
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim()
  return 'gemini-2.5-flash'
}
