import { useState } from 'react'
import useAudioRecorder from '../../hooks/useAudioRecorder'
import './input-bar.css'

export default function InputBar({ onTextSend, onAudioSend, disabled }) {
  const [text, setText] = useState('')
  const { recording, startRecording, stopRecording } = useAudioRecorder(onAudioSend)

  const handleSubmit = e => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onTextSend(trimmed)
    setText('')
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  const handleMicToggle = () => {
    if (disabled) return
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="input-bar">
      <div className="input-bar__rule" />

      <form className="input-bar__form" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`input-bar__mic-btn${recording ? ' input-bar__mic-btn--recording' : ''}`}
          onClick={handleMicToggle}
          disabled={disabled}
          aria-label={recording ? 'Stop recording' : 'Speak to Shakespeare'}
          title={recording ? 'Stop recording' : 'Speak to Shakespeare'}
        >
          {recording ? '⏹' : '🎙'}
        </button>

        <input
          className="input-bar__input"
          type="text"
          placeholder="Write thy question to The Bard…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || recording}
          aria-label="Message input"
        />

        <button
          className="input-bar__send-btn"
          type="submit"
          disabled={disabled || !text.trim() || recording}
          aria-label="Send message"
        >
          Send &nbsp;✉
        </button>
      </form>

      {recording && (
        <p className="input-bar__recording-hint">
          ● Recording — speak thy question, then press ⏹ to send
        </p>
      )}
    </div>
  )
}
