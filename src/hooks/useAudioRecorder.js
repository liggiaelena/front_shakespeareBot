import { useState, useRef } from 'react'

/**
 * Records audio from the user's microphone.
 * Calls `onComplete(blob)` when the recording is stopped.
 */
export default function useAudioRecorder(onComplete) {
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Pick the best supported MIME type
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find(
        t => MediaRecorder.isTypeSupported(t),
      ) ?? ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        onComplete(blob)
      }

      recorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert(
        'Microphone access is required to speak with Shakespeare.\n' +
          'Please allow microphone access in your browser and try again.',
      )
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state !== 'inactive') {
      recorderRef.current?.stop()
    }
    setRecording(false)
  }

  return { recording, startRecording, stopRecording }
}
