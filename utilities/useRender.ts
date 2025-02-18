import { useReducer } from 'react'

export function useRender() {
  return useReducer(() => ({}), {})[1] as () => void
}
