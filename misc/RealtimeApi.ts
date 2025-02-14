import { ClientEvent } from "@/misc/ClientEvent"
import { ServerEvent } from "@/misc/ServerEvent"


export async function RealtimeApi(secretKey: string) {
  // Create a peer connection
  const rtc = new RTCPeerConnection()

  // Set up to play remote audio from the model
  const audioEl = document.createElement('audio')
  audioEl.autoplay = true
  rtc.ontrack = e => audioEl.srcObject = e.streams[0]

  // Add local audio track for microphone input in the browser
  const ms = await navigator.mediaDevices.getUserMedia({
    audio: true
  })
  rtc.addTrack(ms.getTracks()[0])

  // Set up data channel for sending and receiving events
  type Listener = (data: ServerEvent) => void
  let _listener: Listener
  const dataChannel = rtc.createDataChannel('oai-events')
  dataChannel.addEventListener('message', (e) => {
    _listener?.(JSON.parse(e.data))
  })

  // Start the session using the Session Description Protocol (SDP)
  const offer = await rtc.createOffer()
  await rtc.setLocalDescription(offer)

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

  await rtc.setRemoteDescription({
    type: 'answer',
    sdp: await sdpResponse.text(),
  })

  return {
    send(obj: ClientEvent) {
      dataChannel.send(JSON.stringify(obj))
    },
    open: new Promise<void>(resolve =>
      dataChannel.onopen = () => resolve()),
    listen(listener: Listener) {
      _listener = listener
    }
  }
}
