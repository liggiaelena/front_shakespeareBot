const BASE = '/api'

// ── Non-streaming (kept as fallback) ─────────────────────────────────────────

/**
 * Send a typed text message and receive Shakespeare's reply as one JSON blob.
 * @param {string} message
 * @returns {Promise<{text: string, audio_base64: string, user_text: string}>}
 */
export async function sendTextMessage(message) {
  const res = await fetch(`${BASE}/chat/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Server error ${res.status}: ${detail}`)
  }
  return res.json()
}

/**
 * Send a recorded audio blob and receive Shakespeare's reply as one JSON blob.
 * @param {Blob} audioBlob
 * @returns {Promise<{text: string, audio_base64: string, user_text: string}>}
 */
export async function sendAudioMessage(audioBlob) {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  const res = await fetch(`${BASE}/chat/audio`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Server error ${res.status}: ${detail}`)
  }
  return res.json()
}

// ── Streaming ─────────────────────────────────────────────────────────────────

/**
 * Parse an SSE ReadableStream and call callbacks for each event.
 * @param {Response} response   - fetch Response with text/event-stream body
 * @param {Function} onChunk    - called with {text, audio_base64} for each sentence
 * @param {Function} onDone     - called with {full_text, user_text} when stream ends
 */
async function _readSSEStream(response, onChunk, onDone) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete last line in buffer
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.type === 'audio_chunk') onChunk(data)
        else if (data.type === 'done') onDone(data)
      } catch {
        // malformed JSON line — skip silently
      }
    }
  }
}

/**
 * Send a typed message and receive Shakespeare's reply as an SSE stream.
 * @param {string}   message
 * @param {Function} onChunk  - ({text, audio_base64}) called per sentence as it arrives
 * @param {Function} onDone   - ({full_text, user_text}) called when stream is complete
 * @param {Function} onError  - (Error) called on network or server error
 */
export async function sendTextMessageStream(message, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${BASE}/chat/text/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    if (!res.ok) throw new Error(`Server error ${res.status}`)
    await _readSSEStream(res, onChunk, onDone)
  } catch (err) {
    onError(err)
  }
}

/**
 * Send a recorded audio blob and receive Shakespeare's reply as an SSE stream.
 * @param {Blob}     audioBlob
 * @param {Function} onChunk  - ({text, audio_base64}) called per sentence as it arrives
 * @param {Function} onDone   - ({full_text, user_text}) called when stream is complete
 * @param {Function} onError  - (Error) called on network or server error
 */
export async function sendAudioMessageStream(audioBlob, onChunk, onDone, onError) {
  try {
    const form = new FormData()
    form.append('audio', audioBlob, 'recording.webm')
    const res = await fetch(`${BASE}/chat/audio/stream`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error(`Server error ${res.status}`)
    await _readSSEStream(res, onChunk, onDone)
  } catch (err) {
    onError(err)
  }
}
