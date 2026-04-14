import { useState, useCallback } from 'react'
import Header from './components/Header/Header'
import ChatWindow from './components/ChatWindow/ChatWindow'
import InputBar from './components/InputBar/InputBar'
import { sendTextMessage, sendAudioMessage } from './services/api'
import './App.css'

const WELCOME_MESSAGE = {
  id: 0,
  role: 'shakespeare',
  text: "Good morrow, gentle soul! I am William Shakespeare — playwright, poet, and humble servant of the Muse. Prithee, speak thy question, whether by voice or quill, and I shall answer as best I may.",
  audioBase64: null,
}

function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)

  const addMessage = useCallback((role, text, audioBase64 = null) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), role, text, audioBase64 },
    ])
  }, [])

  const handleTextSend = useCallback(
    async text => {
      addMessage('user', text)
      setLoading(true)
      try {
        const data = await sendTextMessage(text)
        addMessage('shakespeare', data.text, data.audio_base64)
      } catch {
        addMessage('shakespeare', 'Alas, the ether hath failed us. Prithee, try once more.')
      } finally {
        setLoading(false)
      }
    },
    [addMessage],
  )

  const handleAudioSend = useCallback(
    async audioBlob => {
      const placeholderId = Date.now()
      setMessages(prev => [
        ...prev,
        { id: placeholderId, role: 'user', text: '🎙 Voice message…', audioBase64: null },
      ])
      setLoading(true)
      try {
        const data = await sendAudioMessage(audioBlob)
        // Replace placeholder with transcribed text
        setMessages(prev =>
          prev.map(m =>
            m.id === placeholderId
              ? { ...m, text: `🎙 "${data.user_text}"` }
              : m,
          ),
        )
        addMessage('shakespeare', data.text, data.audio_base64)
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === placeholderId
              ? { ...m, text: '🎙 Voice message (transcription failed)' }
              : m,
          ),
        )
        addMessage('shakespeare', 'Alas, I could not hear thee clearly. Prithee speak again.')
      } finally {
        setLoading(false)
      }
    },
    [addMessage],
  )

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
