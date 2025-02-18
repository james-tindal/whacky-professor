import { ClientEvent } from '@/types/ClientEvent'
import { prompt } from './prompt'

export const sessionSettings = ClientEvent.session.update({
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

export const SECRET_KEY =
  'sk-proj-oPeQd2MyCGjr7MMayv6eshFFMzGoVB7aeBWXH8AUZdlibXSLlczjQf1ur-zFTZAFYmGGITvFOE'
+ 'T3BlbkFJzG9k3-ddBpn9Q6BD1H4cFGQLjVP0A7eJrc9ek48DfY0oSgETssA66oicL7ld_xQDL3Mo91IeAA'
