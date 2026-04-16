import { useEffect, useRef, useState } from 'react'
import './message.css'

export default function Message({ message }) {
  const { role, text, audioBase64 } = message
  const isShakespeare = role === 'shakespeare'
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)


  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                className="message__play-btn"
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying ? '❚❚  Silence' : '▶  Hearken Again'}
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
