import { useEffect, useRef, useState } from 'react'
import { Sparkles, KeyRound, Mic, MicOff, Square } from 'lucide-react'
import type { UseQuotationFormReturn } from '../hooks/useQuotationForm'
import {
  extractQuotationFromAudio,
  extractQuotationFromText,
} from '../utils/aiAutofill'
import {
  getGeminiApiKey,
  getGeminiModel,
  hasGeminiApiKey,
  saveGeminiApiKey,
} from '../utils/aiApiKey'
import {
  SpeechListener,
  VoiceRecorder,
  isMediaRecorderSupported,
  isSpeechRecognitionSupported,
  listenOnce,
} from '../utils/voiceInput'

interface AiAutofillPanelProps {
  form: UseQuotationFormReturn
}

export function AiAutofillPanel({ form }: AiAutofillPanelProps) {
  const [text, setText] = useState('')
  const [apiKey, setApiKey] = useState(getGeminiApiKey)
  const [showKeyInput, setShowKeyInput] = useState(!hasGeminiApiKey())
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const speechRef = useRef<SpeechListener | null>(null)
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const voiceModeRef = useRef<'speech' | 'audio' | null>(null)

  useEffect(() => {
    return () => {
      speechRef.current?.cancel()
      recorderRef.current?.cancel()
    }
  }, [])

  const handleSaveKey = () => {
    saveGeminiApiKey(apiKey)
    setShowKeyInput(false)
    setError('')
  }

  const requireKey = (): string | null => {
    const key = getGeminiApiKey()
    if (!key) {
      setError('Add your Gemini API key first')
      setShowKeyInput(true)
      return null
    }
    return key
  }

  const handleAutofill = async () => {
    setError('')
    setSuccess('')

    const key = requireKey()
    if (!key) return
    if (!text.trim()) {
      setError('Paste or speak quotation details first')
      return
    }

    setLoading(true)
    try {
      const extract = await extractQuotationFromText(key, text.trim())
      form.applyAiAutofill(extract)
      setSuccess('Form filled from your text. Review and edit if needed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI auto-fill failed')
    } finally {
      setLoading(false)
    }
  }

  const autofillFromTranscript = async (transcript: string) => {
    const key = requireKey()
    if (!key) return

    setText((prev) => (prev ? `${prev}\n${transcript}` : transcript))
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const extract = await extractQuotationFromText(key, transcript)
      form.applyAiAutofill(extract)
      setSuccess('Form filled from your voice. Review and edit if needed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice auto-fill failed')
    } finally {
      setLoading(false)
    }
  }

  const autofillFromAudio = async (audioBlob: Blob, mimeType: string) => {
    const key = requireKey()
    if (!key) return

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const extract = await extractQuotationFromAudio(key, audioBlob, mimeType)
      form.applyAiAutofill(extract)
      setSuccess('Form filled from your voice. Review and edit if needed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice auto-fill failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceToggle = async () => {
    setError('')
    setSuccess('')

    if (recording) {
      setRecording(false)
      const mode = voiceModeRef.current
      voiceModeRef.current = null

      if (mode === 'speech' && speechRef.current) {
        const listener = speechRef.current
        speechRef.current = null
        try {
          const transcript = await listener.stop()
          await autofillFromTranscript(transcript)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Voice input failed')
        }
        return
      }

      if (mode === 'audio' && recorderRef.current) {
        const recorder = recorderRef.current
        recorderRef.current = null
        try {
          const mimeType = recorder.getMimeType()
          const blob = await recorder.stop()
          if (blob.size < 100) {
            setError('No audio captured. Please try again.')
            return
          }
          await autofillFromAudio(blob, mimeType)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Recording failed')
        }
      }
      return
    }

    const key = requireKey()
    if (!key) return

    if (isSpeechRecognitionSupported()) {
      try {
        const listener = new SpeechListener('en-IN')
        listener.start()
        speechRef.current = listener
        voiceModeRef.current = 'speech'
        setRecording(true)
        setSuccess('Listening… speak your quotation, then click Stop.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start microphone')
      }
      return
    }

    if (!isMediaRecorderSupported()) {
      setError('Voice input is not supported in this browser')
      return
    }

    try {
      const recorder = new VoiceRecorder()
      await recorder.start()
      recorderRef.current = recorder
      voiceModeRef.current = 'audio'
      setRecording(true)
      setSuccess('Recording… click Stop when finished.')
    } catch {
      setError('Microphone access denied or unavailable')
    }
  }

  const handleDictateToText = async () => {
    setError('')
    setSuccess('')
    if (!isSpeechRecognitionSupported()) {
      setError('Speech-to-text is not supported in this browser')
      return
    }
    setLoading(true)
    try {
      const transcript = await listenOnce('en-IN')
      setText((prev) => (prev ? `${prev}\n${transcript}` : transcript))
      setSuccess('Added voice text. Click Auto-fill or speak again.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not capture speech')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-violet-700" />
        <h3 className="font-bold text-violet-900">AI Auto-fill (Gemini)</h3>
      </div>
      <p className="text-sm text-violet-800">
        Type, paste, or speak quotation details — Gemini fills the form. Model:{' '}
        <span className="font-mono text-xs">{getGeminiModel()}</span>
      </p>

      {showKeyInput && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <KeyRound size={14} />
            Google Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3 py-2 bg-violet-700 text-white rounded-md text-sm hover:bg-violet-800"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Stored in this browser session only. Or set{' '}
            <code className="bg-white px-1 rounded">VITE_GEMINI_API_KEY</code>{' '}
            in .env
          </p>
        </div>
      )}

      {!showKeyInput && (
        <button
          type="button"
          onClick={() => setShowKeyInput(true)}
          className="text-xs text-violet-700 underline"
        >
          Change API key
        </button>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={`Example:\nQuote for ABC Traders, Visakhapatnam\n1x SVLN bench scale 100kg x 10g, rate 15000\nWith battery backup and dust cover\n18% tax, 30 days validity, 50% advance`}
        className="w-full p-3 border border-gray-300 rounded-md text-sm bg-white"
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700" role="status">
          {success}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-60 ${
            recording
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-white border-2 border-violet-600 text-violet-800 hover:bg-violet-100'
          }`}
        >
          {recording ? (
            <>
              <Square size={16} />
              Stop &amp; Auto-fill
            </>
          ) : (
            <>
              <Mic size={16} />
              Voice → Auto-fill
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleAutofill}
          disabled={loading || recording}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-60 text-white font-semibold rounded-md text-sm"
        >
          <Sparkles size={16} />
          {loading ? 'Analyzing…' : 'Auto-fill Form'}
        </button>
      </div>

      {isSpeechRecognitionSupported() && (
        <button
          type="button"
          onClick={handleDictateToText}
          disabled={loading || recording}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-violet-800 border border-violet-300 rounded-md hover:bg-violet-100 disabled:opacity-60"
        >
          <MicOff size={14} />
          Dictate to text box only
        </button>
      )}
    </div>
  )
}
