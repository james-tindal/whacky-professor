import { Key, ReactNode } from 'react'

type IterateProps <ComponentProps extends { [k in K]: Key }, K extends string> = {
  iterable: Iterable<ComponentProps>
  pickKey: K
  children: (props: ComponentProps) => ReactNode | undefined
}

function Iterate<ComponentProps extends { [k in K]: Key }, K extends string>(iterateProps: IterateProps<ComponentProps, K>) {
  const Component = iterateProps.children
  return [...iterateProps.iterable].map(componentProps => <Component key={componentProps[iterateProps.pickKey]} {...componentProps} />)
}

export { Iterate }
