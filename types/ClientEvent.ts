import { JSONSchema4 } from "json-schema"

type Tool = {
  type: 'file_search'
} | {
  type: 'code_interpreter'
} | {
  type: 'function'
  name: string
  description: string
  parameters: JSONSchema4
}

export type ClientEvent =
  | ClientEvent.response.create
  | ClientEvent.session.update

export namespace ClientEvent {
  export namespace session {
    export const update = (data: update) => data
    export type update = {
      event_id?: string
      type: 'session.update'
      session: {
        modalities?: ('text' | 'audio')[]
        model?: string
        instructions?: string
        voice?: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse'
        input_audio_format?: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
        output_audio_format?: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
        input_audio_transcription?: {
          model?: 'whisper-1'
          language?: string
          prompt?: string
        }
        turn_detection?: {
          type?: 'server_vad'
          threshold?: number
          prefix_padding_ms?: number
          silence_duration_ms?: number
          create_response?: boolean
        }
        tools?: Tool[]
        tool_choice?: 'auto' | 'none' | 'required' | string
        temperature?: number
        max_response_output_tokens?: number | 'inf'
      }
    }
  }
  export namespace response {
    export const create = (data: create) => data
    export type create = {
      event_id?: string
      type: 'response.create'
      response?: object
    }
  }
}
