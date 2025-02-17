import React from 'react'

export function createContext<T>() {
  const nothing = Symbol() as T
  const context = React.createContext<T>(nothing)
  function useContext() {
    const value = React.useContext(context)
    if (value === nothing)
      throw new Error('Context used without Provider')
    return value
  }
  return {
    Provider: context.Provider,
    useContext
  }
}
