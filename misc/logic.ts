import { useState } from 'react'
import { ClientEvent } from './ClientEvent'
import { RealtimeApi } from './RealtimeApi'
import { prompt } from './prompt'

const SECRET_KEY = 'sk-proj-oPeQd2MyCGjr7MMayv6eshFFMzGoVB7aeBWXH8AUZdlibXSLlczjQf1ur-zFTZAFYmGGITvFOE'
                 + 'T3BlbkFJzG9k3-ddBpn9Q6BD1H4cFGQLjVP0A7eJrc9ek48DfY0oSgETssA66oicL7ld_xQDL3Mo91IeAA'

const dataChannel = await RealtimeApi(SECRET_KEY)
await dataChannel.open
dataChannel.send(ClientEvent.session.update({
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
        silence_duration_ms: 500,
        create_response: true
      },
      tool_choice: 'auto',
      temperature: 0.8,
      max_response_output_tokens: 'inf'
  }
}))
dataChannel.send({ type: 'response.create' })

type TranscriptItem = {
  role: 'assistant' | 'user'
  text: string
  item_id: string
}
type Transcript = TranscriptItem[]

export function useProfessor() {
  const [transcript, setTranscript] = useState<Transcript>([])

  function appendDelta(item_id: string, delta: string) {
    setTranscript(transcript => {
      const [rest, last] = splitLast(transcript)
      return [ ...rest, {
        ...last,
        text: last.text + delta
      }]
    })
  }

  dataChannel.listen(data => {
    if (data.type === 'response.audio_transcript.delta')
      appendDelta(data.item_id, data.delta)
    if ( data.type === 'conversation.item.created'
      && data.item.type === 'message'
      && data.item.role !== 'system'
    ) {
      const newItem: TranscriptItem = {
        role: data.item.role,
        text: '',
        item_id: data.item.id
      }
      setTranscript(transcript => [...transcript, newItem])
    }
    if (data.type === 'conversation.item.input_audio_transcription.completed') {
      const index =
        transcript.findIndex(item => item.item_id === data.item_id)
      
      setTranscript(transcript => {
        const oldItem = transcript[index]
        const newItem = {
          ...oldItem,
          text: data.transcript
        }
        return transcript.with(index, newItem)
      })
    }
      
  })

  return transcript
}

const splitLast = <T>(array: T[]) =>
  [array.slice(0, array.length - 1), array[array.length - 1]] as const
