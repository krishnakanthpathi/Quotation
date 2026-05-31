export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

export function pickAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm'
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ]
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'audio/webm'
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Could not read audio'))
        return
      }
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Could not encode audio'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read audio'))
    reader.readAsDataURL(blob)
  })
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null
  private mimeType = pickAudioMimeType()

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.chunks = []

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType })
    } catch {
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.mimeType = this.mediaRecorder.mimeType || 'audio/webm'
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    // Timeslice ensures chunks are collected on Safari/iOS
    this.mediaRecorder.start(250)
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'))
        return
      }

      const mimeType = this.mimeType
      const chunks = this.chunks

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        this.cleanup()
        resolve(blob)
      }
      this.mediaRecorder.onerror = () => {
        this.cleanup()
        reject(new Error('Recording failed'))
      }

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.requestData()
      }
      this.mediaRecorder.stop()
    })
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
  }

  getMimeType(): string {
    return this.mimeType
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.mediaRecorder = null
    this.chunks = []
  }
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | undefined {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function isSpeechRecognitionSupported(): boolean {
  return !!getSpeechRecognitionCtor()
}

/** Continuous speech capture — click stop when finished speaking. */
export class SpeechListener {
  private recognition: SpeechRecognitionLike
  private transcript = ''
  private active = false

  constructor(lang = 'en-IN') {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      throw new Error('Speech recognition is not supported in this browser')
    }
    this.recognition = new Ctor()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = lang
    this.recognition.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      this.transcript += text
    }
  }

  start(): void {
    this.transcript = ''
    this.active = true
    this.recognition.start()
  }

  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.active) {
        reject(new Error('Speech listener not started'))
        return
      }

      this.recognition.onerror = (event) => {
        this.active = false
        if (event.error === 'no-speech') {
          reject(new Error('No speech detected. Please try again.'))
          return
        }
        if (event.error !== 'aborted') {
          reject(new Error(event.error || 'Speech recognition failed'))
        }
      }

      this.recognition.onend = () => {
        this.active = false
        const text = this.transcript.trim()
        if (text) resolve(text)
        else reject(new Error('No speech detected. Please try again.'))
      }

      this.recognition.stop()
    })
  }

  cancel(): void {
    if (!this.active) return
    this.active = false
    this.recognition.abort()
  }
}

export function listenOnce(lang = 'en-IN'): Promise<string> {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    return Promise.reject(
      new Error('Speech recognition is not supported in this browser'),
    )
  }

  return new Promise((resolve, reject) => {
    const recognition = new Ctor()
    let transcript = ''

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = lang

    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
    }

    recognition.onerror = (event) => {
      reject(new Error(event.error || 'Speech recognition failed'))
    }

    recognition.onend = () => {
      if (transcript.trim()) resolve(transcript.trim())
      else reject(new Error('No speech detected'))
    }

    recognition.start()
  })
}
