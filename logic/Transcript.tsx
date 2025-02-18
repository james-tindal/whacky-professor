import { useCallback } from 'react'
import { MemoryStream } from 'xstream'

import { DataChannel, useDataChannel } from './Initialise'
import { sessionSettings } from './settings'
import { ServerEvent } from '@/types/ServerEvent'
import { ClientEvent } from '@/types/ClientEvent'
import { useAsync } from '@/utilities/usePromise'
import { useRender } from '@/utilities/useRender'
import { ReactiveMap } from '@/utilities/reactive-map'
import { Iterate } from '@/utilities/Iterate'


export function Transcript() {
  const dataChannel = useDataChannel()

  const newItem = dataChannel.changed.filter((event): event is NewItem =>
       event.type === 'conversation.item.created'
    && event.item.type === 'message'
    && event.item.role !== 'system'
  )
  const suffix = dataChannel.changed.filter(event =>
    event.type === 'response.audio_transcript.delta')
  const userTranscript = dataChannel.changed.filter(event =>
    event.type === 'conversation.item.input_audio_transcription.completed')

  const transcript = new ReactiveMap<ItemId, TranscriptItem>
  newItem.subscribe({ next(event) {
    const text = event.item.role === 'assistant'
    ? suffix
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.delta)
        .fold((a, b) => a + b, '')
    : userTranscript
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.transcript)
        .startWith('')
    transcript.set(event.item.id, { text, role: event.item.role })
  }})

  const x = newItem.map(event => {
    const text = event.item.role === 'assistant'
    ? suffix
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.delta)
        .fold((a, b) => a + b, '')
    : userTranscript
        .filter(event_ => event_.item_id === event.item.id)
        .map(event => event.transcript)
        .startWith('')
    transcript.set(event.item.id, { text, role: event.item.role })
  })
  .mapTo(transcript)




  const render = useRender()
  transcript.subscribe(render)

  useAsync(() =>
    sendSettingsAndStart(dataChannel, sessionSettings))

  // Need to consider whether I should be cleaning up memory on unmount.
  // For every thing, ask when it should be cleaned up. 
  // Write a test to ensure it is.


  if (transcript.size === 0) return
  return (
    <div className="transcript-container">
      <div className="transcript">
        <TranscriptItems transcript={transcript} />
      </div>
    </div>
  )
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

async function sendSettingsAndStart(
  dataChannel: DataChannel,
  sessionSettings: ClientEvent.session.update
) {
  await dataChannel.isOpen
  dataChannel.send(sessionSettings)
  dataChannel.send({ type: 'response.create' })
}
