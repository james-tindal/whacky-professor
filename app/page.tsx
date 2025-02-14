'use client'
import '@/misc/logic'
import { useProfessor } from '@/misc/logic'
import { useRef } from 'react'

export default function Home() {
  const dialogue = useProfessor()
  const transcriptItemEl = useRef<HTMLParagraphElement>(null)
  transcriptItemEl.current?.scrollIntoView?.(false)

  if (dialogue.length > 0) return (
    <div className="transcript-container">
      <div className="transcript">
        {
          dialogue.map(item =>
            <p key={item.item_id} className={`transcript-item ${item.role}`} ref={transcriptItemEl}>
              {item.text}
            </p>
          )
        }
      </div>
    </div>
  )
} 
