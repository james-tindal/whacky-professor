import { useCallback } from 'react'
import { MemoryStream } from 'xstream'

import { RealtimeApi, useRealtimeApi } from './Initialise'
import { ServerEvent } from '@/types/ServerEvent'
import { Iterate } from '@/utilities/Iterate'
import { useStream } from '@/utilities/useStream'


export function Transcript() {
  const realtimeApi = useRealtimeApi()
  const transcriptResult = useStream(() =>
    createTranscript(realtimeApi))

  if (transcriptResult.tag === 'pending') return
  const transcript = transcriptResult.value
  if (transcript.size === 0) return

  return (
    <div className="transcript-container">
      <div className="transcript">
        <TranscriptItems transcript={transcript} />
      </div>
    </div>
  )
}

function createTranscript(realtimeApi: RealtimeApi) {
  const newItem = realtimeApi.serverEvents.filter((event): event is NewItem =>
       event.type === 'conversation.item.created'
    && event.item.type === 'message'
    && event.item.role !== 'system'
  )
  const assistantSuffix = realtimeApi.serverEvents.filter(event =>
    event.type === 'response.audio_transcript.delta')
  const userTranscript = realtimeApi.serverEvents.filter(event =>
    event.type === 'conversation.item.input_audio_transcription.completed')

  const transcript = new Map<ItemId, TranscriptItem>
  newItem.subscribe({ next(event) {
    const text = event.item.role === 'assistant'
    ? assistantSuffix
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.delta)
        .fold((a, b) => a + b, '')
    : userTranscript
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.transcript)
        .startWith('')
    transcript.set(event.item.id, { text, role: event.item.role })
  }})

  return newItem.mapTo(transcript)
}


type ItemId = string
type TranscriptItem = {
  role: 'assistant' | 'user'
  text: MemoryStream<string>
}
type Transcript = Map<ItemId, TranscriptItem>

function TranscriptItems({ transcript }: { transcript: Transcript }) {
  const childrenProps = transcript.entries().map(
    ([id, { role, text }], index) =>
      ({ id, role, text, isLatest: transcript.size === index - 1 }))

  return (
    <Iterate
      key="id"
      iterable={childrenProps}
    >{TranscriptItem}</Iterate>
  )
}

function TranscriptItem(props: { id: string, text: MemoryStream<string>, role: 'assistant' | 'user', isLatest: boolean }) {
  const scrollIntoView = useScrollIntoView()
  return (
    <p
      key={props.id}
      className={`transcript-item ${props.role}`}
      {...props.isLatest && { ref: scrollIntoView }}
    >{ 'props.text' }</p>
  )
}

const useScrollIntoView = () =>
  useCallback((el: Element | null) => el?.scrollIntoView(), [])

type NewItem = ServerEvent.conversation.item.created & {
  item: {
    type: 'message'
    role: 'user' | 'assistant'
  }
}
