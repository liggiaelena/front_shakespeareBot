import { useState, useCallback, useRef } from 'react'
import Header from './components/Header/Header'
import ChatWindow from './components/ChatWindow/ChatWindow'
import InputBar from './components/InputBar/InputBar'
import { sendTextMessageStream, sendAudioMessageStream } from './services/api'
import './App.css'

const WELCOME_MESSAGE = {
  id: 0,
  role: 'shakespeare',
  text: "Good morrow, gentle soul! I am William Shakespeare — playwright, poet, and humble servant of the Muse. Prithee, speak thy question, whether by voice or quill, and I shall answer as best I may.",
  audioChunks: [],
  streaming: false,
}

// ── Audio queue — plays chunks sequentially as they arrive ───────────────────
function useAudioQueue() {
  const queue = useRef([])
  const playing = useRef(false)

  const playNext = useCallback(() => {
    if (queue.current.length === 0) { playing.current = false; return }
    playing.current = true
    const b64 = queue.current.shift()
    const audio = new Audio(`data:audio/mpeg;base64,${b64}`)
    audio.onended = playNext
    audio.onerror = playNext
    audio.play().catch(playNext)
  }, [])

  const enqueue = useCallback((b64) => {
    queue.current.push(b64)
    if (!playing.current) playNext()
  }, [playNext])

  const reset = useCallback(() => {
    queue.current = []
    playing.current = false
  }, [])

  return { enqueue, reset }
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  const { enqueue, reset } = useAudioQueue()

  const addMessage = useCallback((role, text, audioChunks = [], extraProps = {}) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), role, text, audioChunks, streaming: false, ...extraProps },
    ])
  }, [])

  // ── Text send ───────────────────────────────────────────────────────────────
  const handleTextSend = useCallback(async text => {
    addMessage('user', text)
    setLoading(true)
    reset()

    const placeholderId = Date.now()
    const collectedChunks = []

    setMessages(prev => [...prev, {
      id: placeholderId,
      role: 'shakespeare',
      text: '',
      audioChunks: [],
      streaming: true,
    }])

    await sendTextMessageStream(
      text,
      // onChunk — one sentence arrived
      ({ text: chunkText, audio_base64 }) => {
        collectedChunks.push(audio_base64)
        setMessages(prev => prev.map(m =>
          m.id === placeholderId
            ? { ...m, text: m.text ? m.text + ' ' + chunkText : chunkText }
            : m
        ))
      },
      // onDone — stream complete
      ({ full_text }) => {
        setMessages(prev => prev.map(m =>
          m.id === placeholderId
            ? { ...m, text: full_text, audioChunks: [...collectedChunks], streaming: false }
            : m
        ))
        setLoading(false)
      },
      // onError
      () => {
        setMessages(prev => prev.map(m =>
          m.id === placeholderId
            ? { ...m, text: 'Alas, the ether hath failed us. Prithee, try once more.', streaming: false }
            : m
        ))
        setLoading(false)
      }
    )
  }, [addMessage, enqueue, reset])

  // ── Audio send ──────────────────────────────────────────────────────────────
  const handleAudioSend = useCallback(async audioBlob => {
    const userPlaceholderId = Date.now()
    setMessages(prev => [...prev, {
      id: userPlaceholderId,
      role: 'user',
      text: '🎙 Voice message…',
      audioChunks: [],
      streaming: false,
    }])
    setLoading(true)
    reset()

    const shaksPlaceholderId = Date.now() + 1
    const collectedChunks = []

    setMessages(prev => [...prev, {
      id: shaksPlaceholderId,
      role: 'shakespeare',
      text: '',
      audioChunks: [],
      streaming: true,
    }])

    await sendAudioMessageStream(
      audioBlob,
      // onChunk
      ({ text: chunkText, audio_base64 }) => {
        collectedChunks.push(audio_base64)
        setMessages(prev => prev.map(m =>
          m.id === shaksPlaceholderId
            ? { ...m, text: m.text ? m.text + ' ' + chunkText : chunkText }
            : m
        ))
      },
      // onDone
      ({ full_text, user_text }) => {
        setMessages(prev => prev.map(m => {
          if (m.id === userPlaceholderId) return { ...m, text: `🎙 "${user_text}"` }
          if (m.id === shaksPlaceholderId) return { ...m, text: full_text, audioChunks: [...collectedChunks], streaming: false }
          return m
        }))
        setLoading(false)
      },
      // onError
      () => {
        setMessages(prev => prev.map(m => {
          if (m.id === userPlaceholderId) return { ...m, text: '🎙 Voice message (transcription failed)' }
          if (m.id === shaksPlaceholderId) return { ...m, text: 'Alas, I could not hear thee clearly. Prithee speak again.', streaming: false }
          return m
        }))
        setLoading(false)
      }
    )
  }, [addMessage, enqueue, reset])

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <ChatWindow messages={messages} loading={loading} />
        <InputBar
          onTextSend={handleTextSend}
          onAudioSend={handleAudioSend}
          disabled={loading}
        />
      </main>
    </div>
  )
}

export default App
