'use client'
import '@/misc/professor'
import { useProfessor } from '@/misc/professor'
import useIsClient from '@/misc/useIsClient'
import { Suspense, useRef } from 'react'

export default function Home() {
  const isClient = useIsClient()
  if (isClient) return (
    <Suspense>
      <Transcript />
    </Suspense>
  )
} 

function Transcript() {
  const transcript = useProfessor()
  const transcriptItemEl = useRef<HTMLParagraphElement>(null)
  transcriptItemEl.current?.scrollIntoView?.(false)

  return (
    <div className="transcript-container">
      <div className="transcript">
        {
          transcript.map(item =>
            <p key={item.item_id} className={`transcript-item ${item.role}`} ref={transcriptItemEl}>
              {item.text}
            </p>
          )
        }
      </div>
    </div>
  )
}
