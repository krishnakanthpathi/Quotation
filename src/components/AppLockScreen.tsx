import { useState, type FormEvent } from 'react'
import { Lock } from 'lucide-react'

interface AppLockScreenProps {
  onUnlock: (password: string) => boolean
}

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onUnlock(password)) {
      setError('')
      setPassword('')
      return
    }
    setError('Incorrect password')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">SVLN Quotation Generator</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter password to unlock
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="app-password" className="sr-only">
              Password
            </label>
            <input
              id="app-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-md transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
