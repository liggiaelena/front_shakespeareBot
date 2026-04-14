import { useEffect, useRef } from 'react'
import Message from '../Message/Message'
import './chat-window.css'

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="chat-window">
      <div className="chat-window__scroll">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="chat-window__typing">
            <div className="chat-window__typing-avatar">W.S.</div>
            <div className="chat-window__typing-bubble">
              <span className="chat-window__typing-label">
                Shakespeare is composing his reply…
              </span>
              <span className="chat-window__typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
