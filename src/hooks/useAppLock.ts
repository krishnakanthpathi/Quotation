import { useCallback, useState } from 'react'
import { APP_LOCK_PASSWORD, APP_UNLOCK_SESSION_KEY } from '../constants/auth'

export function useAppLock() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(APP_UNLOCK_SESSION_KEY) === 'true',
  )

  const unlock = useCallback((password: string): boolean => {
    if (password !== APP_LOCK_PASSWORD) return false
    sessionStorage.setItem(APP_UNLOCK_SESSION_KEY, 'true')
    setUnlocked(true)
    return true
  }, [])

  const lock = useCallback(() => {
    sessionStorage.removeItem(APP_UNLOCK_SESSION_KEY)
    setUnlocked(false)
  }, [])

  return { unlocked, unlock, lock }
}
