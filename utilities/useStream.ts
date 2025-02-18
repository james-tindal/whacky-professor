import { useEffect, useMemo, useState } from 'react'
import { Stream } from 'xstream'

export function useStream<T>(stream: Stream<T> | (() => Stream<T>)) {
  const _stream = useMemo(() => {
    if (stream instanceof Stream)
      return stream
    else
      return stream()
  }, [])

  const [state, setState] = useState<StreamResult<T>>(Pending)

  useEffect(() => {
    const { unsubscribe } = _stream.subscribe({
      next(value) {
        setState(Resolved(value))
      }
    })
    return unsubscribe
  }, [])

  return state
}

type StreamResult<T> = {
  tag: 'pending'
} | {
  tag: 'resolved'
  value: T
}
const Pending = { tag: 'pending' as const }
const Resolved = <T>(value: T) => ({ tag: 'resolved' as const, value })
