import { useMemo, useState } from 'react'

export function usePromise<T>(promise: Promise<T>): PromiseState<T> {
  type Status = 'pending' | 'rejected' | 'fulfilled'
  const [status, setStatus] = useState<Status>('pending')
  const [result, setResult] = useState<any>()
  promise.then(
    value => {
      setStatus('fulfilled')
      setResult(value)
    },
    reason => {
      setStatus('rejected')
      setResult(reason)
    }
  )
  return {
    status,
    ...status === 'fulfilled' && { value: result as T },
    ...status === 'rejected' && { reason: result as unknown }
  } as PromiseState<T>
}

export function useAsync<T>(fn: () => Promise<T>) {
  const promise = useMemo(fn, [])
  return usePromise(promise)
}

export type PromiseState<T> = {
  status: 'pending'
} | {
  status: 'fulfilled'
  value: T
} | {
  status: 'rejected'
  reason: unknown
}
