import type { PropsWithChildren } from 'react'
import type { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'

import { ClientEvent } from '@/types/ClientEvent'
import { ServerEvent } from '@/types/ServerEvent'
import { createContext } from '@/utilities/createContext'
import { useAsync } from '@/utilities/usePromise'

export function Initialise({ children }: PropsWithChildren) {
  const promiseState = useAsync(initialise)

  switch (promiseState.status) {
    case 'pending' : return
    case 'rejected': throw promiseState.reason
  }

  switch (promiseState.value.tag) {
    case 'webrtc not available':
      return <Failed>WebRTC not available. Can't connect to server.</Failed>
    case 'microphone error':
      return <Failed>Couldn't get microphone input</Failed>
    case 'success':
      return <Provider value={promiseState.value.dataChannel}>{children}</Provider>
    default:
      return <Failed>{JSON.stringify(promiseState)}</Failed>
  }
}

export async function initialise(): Promise<Initialise> {
  if (!('RTCPeerConnection' in globalThis))
    return { tag: 'webrtc not available' }

  const microphone = await getMicrophone()
  if (microphone instanceof DOMException)
    return {
      tag: 'microphone error',
      error: microphone
    }

  const rtc = new RTC()
  rtc.addMicrophone(microphone)
  rtc.createAudioOutput()

  // const error = await
  //   rtc.startSession(SECRET_KEY)
  // if (error)
  //   return error

  return {
    tag: 'success',
    dataChannel: rtc.dataChannel
  }
}

const Failed = ({ children }: PropsWithChildren) =>
  <div className="failed">{ children }</div>

const getMicrophone = () => 
  navigator.mediaDevices.getUserMedia({ audio: true })
    .catch((error: DOMException) => error)

class RTC {
  private rtc = new RTCPeerConnection
  public dataChannel = DataChannel(this.rtc)

  addMicrophone(microphone: MediaStream) {
    this.rtc.addTrack(microphone.getTracks()[0])
  }

  createAudioOutput() {
    const audioEl = document.createElement('audio')
    audioEl.autoplay = true
    this.onTrackAdded(event =>
      audioEl.srcObject = event.streams[0])
  }

  async startSession(secretKey: string) {
    const offer = await this.rtc.createOffer()
      .catch((error: DOMException) => error)
    
    if (offer instanceof DOMException)
      return { tag: 'createOffer error', error: offer } as const

    await this.rtc.setLocalDescription(offer)

    const baseUrl = 'https://api.openai.com/v1/realtime'
    const model = 'gpt-4o-realtime-preview-2024-12-17'
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/sdp'
      },
    })
      .catch((error: Error) => error)
    
    if (sdpResponse instanceof Error)
      return { tag: 'network error', error: sdpResponse } as const
  
    await this.rtc.setRemoteDescription({
      type: 'answer',
      sdp: await sdpResponse.text(),
    })
  }

  private onTrackAdded(fn: NonNullable<RTCPeerConnection['ontrack']>) {
    this.rtc.ontrack = fn
  }
}

export type DataChannel = ReturnType<typeof DataChannel>
function DataChannel(rtc: RTCPeerConnection) {
  const dataChannel = rtc.createDataChannel('oai-events')
  const changed = fromEvent(dataChannel, 'message') as unknown as Stream<ServerEvent>
  // chould be called serverEvents?

  // The actual purpose of this module is to:
  // start and listen to events

  // it should only be started when someone subscribes to events.
  // the Map should be inside the stream in closure
  // all references dropped when stream stops (no listeners)

  async function sendSettingsAndStart(
    dataChannel: DataChannel,
    sessionSettings: ClientEvent.session.update
  ) {
    await dataChannel.isOpen
    dataChannel.send(sessionSettings)
    dataChannel.send({ type: 'response.create' })
  }
  return {
    isOpen: new Promise<void>(resolve =>
      dataChannel.onopen = () => resolve()
    ),
    send(obj: ClientEvent) {
      dataChannel.send(JSON.stringify(obj))
    },
    changed
  }
}

const { Provider, useContext: useDataChannel } = createContext<DataChannel>()
export { useDataChannel }
    
type Initialise = InitialiseFailed | InitialiseSuccess
type InitialiseFailed = {
  tag: 'webrtc not available'
} | {
  tag: 'microphone error',
  error: DOMException
} | {
  tag: 'createOffer error',
  error: DOMException
} | {
  tag: 'network error'
  error: Error
}
type InitialiseSuccess ={
  tag: 'success',
  dataChannel: DataChannel
}
