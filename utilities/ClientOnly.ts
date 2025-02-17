import { PropsWithChildren, useEffect, useState } from 'react'

export function ClientOnly({ children }: PropsWithChildren) {
  const isClient = useIsClient()
  if (isClient)
    return children
}

function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
