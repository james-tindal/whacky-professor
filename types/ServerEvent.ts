
export type ServerEvent =
  | ServerEvent.response.audio_transcript.delta
  | ServerEvent.response.content_part.added
  | ServerEvent.conversation.item.created
  | ServerEvent.conversation.item.input_audio_transcription.completed

export namespace ServerEvent {
  export namespace response {
    export namespace audio_transcript {
      export type delta = {
        type: 'response.audio_transcript.delta'
        event_id: string
        response_id: string
        item_id: string
        output_index: number
        content_index: number
        delta: string
      }
    }
    export namespace content_part {
      export type added = {
        type: 'response.content_part.added'
        event_id: string
        response_id: string
        item_id: string
        output_index: number
        content_index: number
        part: Part
      }
      type Part = {
        type: 'text'
        text: string
      } | {
        type: 'audio'
        audio: string
        transcript: string
      }
    }
  }
  
  export namespace conversation {
    export namespace item {
      export type created = {
        type: 'conversation.item.created'
        event_id: string
        previous_item_id: string
        item: item
      }
      type item = {
        id: string
        object: 'realtime.item'
        status: 'completed' | 'incomplete'
      } & ( message | function_call | function_call_output)
      type message = {
        type: 'message'
      } & (user | assistant | system)
      type user = {
        role: 'user'
        content: input_text | input_audio
      }
      type assistant = {
        role: 'assistant'
        content: text
      }
      type system = {
        role: 'system'
        content: input_text 
      }
      type input_text = {
        type: 'input_text'
        text: string
      }
      type input_audio = {
        type: 'input_audio'
        audio: string
        transcript: string
      }
      type item_reference = {
        type: 'item_reference'
        id: string
      }
      type text = {
        type: 'text'
        text: string
      }
  
      type function_call = {
        type: 'function_call'
        call_id: string
        name: string
        arguments: string
      }
      type function_call_output = {
        type: 'function_call_output'
        call_id: string
        output: string
      }
  
      export namespace input_audio_transcription {
        export interface completed {
          type: 'conversation.item.input_audio_transcription.completed'
          event_id: string
          item_id: string
          content_index: number
          transcript: string
        }
      }
    }
  }
}
