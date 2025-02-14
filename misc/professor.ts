import { use, useState } from 'react'
import { ClientEvent } from './ClientEvent'
import { RealtimeApi } from './RealtimeApi'
import { prompt } from './prompt'
import { useTranscript } from './transcript'

const SECRET_KEY = 'sk-proj-oPeQd2MyCGjr7MMayv6eshFFMzGoVB7aeBWXH8AUZdlibXSLlczjQf1ur-zFTZAFYmGGITvFOE'
                 + 'T3BlbkFJzG9k3-ddBpn9Q6BD1H4cFGQLjVP0A7eJrc9ek48DfY0oSgETssA66oicL7ld_xQDL3Mo91IeAA'

const setUp = async () => {
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
  return dataChannel
}

export const useProfessor = () => use(_useProfessor())
export async function _useProfessor() {
  const dataChannel = await setUp()
  const { addItem, appendItemText, setItemText, transcript } = useTranscript()

  dataChannel.listen(data => {
    if (data.type === 'response.audio_transcript.delta')
      appendItemText(data.item_id, data.delta)

    if ( data.type === 'conversation.item.created'
      && data.item.type === 'message'
      && data.item.role !== 'system'
    )
      addItem(data.item.id, data.item.role)

    if (data.type === 'conversation.item.input_audio_transcription.completed')
      setItemText(data.item_id, data.transcript)
  })

  await new Promise<void>(resolve => {
    if (transcript.length > 0)
      resolve()
  })
  return transcript
}
