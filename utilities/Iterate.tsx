import { Key, ReactElement } from 'react'

type IterateProps <ComponentProps extends { [k in K]: Key }, K extends string> = {
  iterable: Iterable<ComponentProps>
  key: K
  children: (props: ComponentProps) => ReactElement
}

function Iterate<ComponentProps extends { [k in K]: Key }, K extends string>(iterateProps: IterateProps<ComponentProps, K>) {
  const Component = iterateProps.children
  return [...iterateProps.iterable].map(componentProps => <Component key={componentProps[iterateProps.key]} {...componentProps} />)
}

export { Iterate }
