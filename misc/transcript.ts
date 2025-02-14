import { useState } from 'react'

export type TranscriptItem = {
  role: 'assistant' | 'user'
  text: string
  item_id: string
}
export type Transcript = TranscriptItem[]

export function useTranscript() {
  const [transcript, setTranscript] = useState<Transcript>([])

  return { addItem, appendItemText, setItemText, transcript }

  function addItem(item_id: string, role: TranscriptItem['role']) {
    const newItem = { text: '', role, item_id }
    setTranscript(transcript => [...transcript, newItem])
  }

  function appendItemText(item_id: string, suffix: string) {
    const index =
      transcript.findIndex(item => item.item_id === item_id)
    
      setTranscript(transcript => {
        const oldItem = transcript[index]
        const newItem = { ...oldItem, text: oldItem + suffix }
        return transcript.with(index, newItem)
      })
  }

  function setItemText(item_id: string, text: string) {
    const index =
      transcript.findIndex(item => item.item_id === item_id)
      
    setTranscript(transcript => {
      const oldItem = transcript[index]
      const newItem = { ...oldItem, text }
      return transcript.with(index, newItem)
    })
  }
}
