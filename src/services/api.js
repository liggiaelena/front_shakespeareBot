const BASE = '/api'

/**
 * Send a typed text message and receive Shakespeare's reply.
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
 * Send a recorded audio blob and receive Shakespeare's reply.
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
