import { useEffect, useRef, useState } from 'react'
import { DataChannel, useDataChannel } from './Initialise'
import { useAsync } from '@/utilities/usePromise'
import { ClientEvent } from '@/types/ClientEvent'
import { prompt } from './prompt'

export function Transcript() {
  const dataChannel = useDataChannel()
  const { transcript, ...t } = useTranscript()
  console.log('transcript', transcript)
  useEffect(() => {
    t.addItem('hello', 'assistant')
    t.setItemText('hello', 'This was whatever sometimes yo')
  }, [])
  dataChannel.listen(data => {
    if (data.type === 'response.audio_transcript.delta')
      t.appendItemText(data.item_id, data.delta)

    if ( data.type === 'conversation.item.created'
      && data.item.type === 'message'
      && data.item.role !== 'system'
    )
      t.addItem(data.item.id, data.item.role)

    if (data.type === 'conversation.item.input_audio_transcription.completed')
      t.setItemText(data.item_id, data.transcript)
  })

  useAsync(() =>
    sendSettingsAndStart(dataChannel, sessionSettings))

  const transcriptItemEl = useRef<HTMLParagraphElement>(null)
  transcriptItemEl.current?.scrollIntoView?.(false)

  return (
    <div className="transcript-container">
      <div className="transcript">
        {
          transcript.map(item =>
            <p key={item.item_id} className={`transcript-item ${item.role}`} ref={transcriptItemEl}>
              {item.text}
            </p>
          )
        }
      </div>
    </div>
  )
}

async function sendSettingsAndStart(
  dataChannel: DataChannel,
  sessionSettings: ClientEvent.session.update
) {
  await dataChannel.isOpen
  dataChannel.send(sessionSettings)
  dataChannel.send({ type: 'response.create' })
}

const sessionSettings = ClientEvent.session.update({
  type: 'session.update',
  session: {
    modalities: ['text', 'audio'],
    instructions: prompt,
    voice: 'ballad',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    input_audio_transcription: {
      model: 'whisper-1'
    },
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 1500,
      create_response: true
    },
    tool_choice: 'auto',
    temperature: 0.8,
    max_response_output_tokens: 'inf'
  }
})

type TranscriptItem = {
  role: 'assistant' | 'user'
  text: string
  item_id: string
}
type Transcript = TranscriptItem[]

function useTranscript() {
  const [transcript, setTranscript] = useState<Transcript>([])

  return { addItem, appendItemText, setItemText, transcript }

  function addItem(item_id: string, role: TranscriptItem['role']) {
    const newItem = { text: '', role, item_id }
    setTranscript(transcript => [...transcript, newItem])
  }

  function appendItemText(item_id: string, suffix: string) {
    const index =
      transcript.findIndex(item => item.item_id === item_id)
  
    if (!(index >= 0))
      throw `setItemText didn't find an item with id ${item_id}`
    
    setTranscript(transcript => {
      const oldItem = transcript[index]
      const newItem = { ...oldItem, text: oldItem + suffix }
      return transcript.with(index, newItem)
    })
  }

  function setItemText(item_id: string, text: string) {
    const index =
      transcript.findIndex(item => item.item_id === item_id)

    if (!(index >= 0))
      throw `setItemText didn't find an item with id ${item_id}`

    setTranscript(transcript => {
      const oldItem = transcript[index]
      console.log({oldItem})
      const newItem = { ...oldItem, text }
      console.log({newItem})
      return transcript.with(index, newItem)
    })
  }
}
