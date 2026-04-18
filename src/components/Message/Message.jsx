import { useState, useRef, useCallback } from 'react'
import './message.css'

export default function Message({ message }) {
  const { role, text, audioChunks = [], streaming = false } = message
  const isShakespeare = role === 'shakespeare'
  const [isReplaying, setIsReplaying] = useState(false)
  const replayRef = useRef(null)

  // Re-play all stored audio chunks sequentially
  const handleReplay = useCallback(() => {
    if (isReplaying || audioChunks.length === 0) return
    setIsReplaying(true)
    const queue = [...audioChunks]

    const playNext = () => {
      if (queue.length === 0) { setIsReplaying(false); return }
      const audio = new Audio(`data:audio/mpeg;base64,${queue.shift()}`)
      replayRef.current = audio
      audio.onended = playNext
      audio.onerror = playNext
      audio.play().catch(playNext)
    }
    playNext()
  }, [audioChunks, isReplaying])

  const handleSilence = useCallback(() => {
    if (replayRef.current) {
      replayRef.current.pause()
      replayRef.current = null
    }
    setIsReplaying(false)
  }, [])

  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar">
        <span className="message__avatar-text">
          {isShakespeare ? 'W.S.' : 'You'}
        </span>
      </div>

      <div className="message__body">
        <div className="message__bubble">
          <p className="message__text">
            {text}
            {streaming && <span className="message__cursor" aria-hidden="true">▌</span>}
          </p>

          {/* Audio controls — only shown after streaming is complete */}
          {isShakespeare && !streaming && audioChunks.length > 0 && (
            <div className="message__audio">
              <button
                className="message__play-btn"
                onClick={isReplaying ? handleSilence : handleReplay}
                aria-label={isReplaying ? 'Pause audio' : 'Replay audio response'}
              >
                {isReplaying ? '❚❚  Silence' : '▶  Hearken Again'}
              </button>
            </div>
          )}
        </div>

        <span className="message__label">
          {isShakespeare ? 'William Shakespeare' : 'You'}
        </span>
      </div>
    </div>
  )
}
