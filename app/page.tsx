'use client'
import { Initialise } from '@/logic/Initialise'
import { Transcript } from '@/logic/Transcript'
import { ClientOnly } from '@/utilities/ClientOnly'

export default function Home() {
  return (
    <ClientOnly>
      <Initialise>
        <Transcript />
      </Initialise>
    </ClientOnly>
  )
}
