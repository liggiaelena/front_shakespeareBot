import { useEffect, useRef } from 'react'
import './message.css'

export default function Message({ message }) {
  const { role, text, audioBase64 } = message
  const isShakespeare = role === 'shakespeare'
  const audioRef = useRef(null)

  // Auto-play Shakespeare's audio when the message first renders
  useEffect(() => {
    if (isShakespeare && audioBase64 && audioRef.current) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(() => {
          // Browser may block autoplay before first user gesture; silently ignore
        })
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [isShakespeare, audioBase64])

  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar">
        <span className="message__avatar-text">
          {isShakespeare ? 'W.S.' : 'You'}
        </span>
      </div>

      <div className="message__body">
        <div className="message__bubble">
          <p className="message__text">{text}</p>

          {audioBase64 && (
            <div className="message__audio">
              <audio
                ref={audioRef}
                src={`data:audio/mpeg;base64,${audioBase64}`}
                preload="auto"
              />
              <button
                className="message__play-btn"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0
                    audioRef.current.play()
                  }
                }}
                aria-label="Replay audio response"
              >
                ▶&nbsp; Hearken Again
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
