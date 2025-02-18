import xs, { Stream } from 'xstream'

export class ReactiveMap<K, V> extends Map<K, V> {
  public stream: Stream<void>
  private emit?: () => void
  constructor(...args: ConstructorParameters<typeof Map<K, V>>) {
    super(...args)
    this.stream = xs.create({
      start: listener =>
        this.emit = () => listener.next(),
      stop: () =>
        this.emit = undefined
    })
  }

  subscribe(next: () => void) {
    this.stream.subscribe({ next })
  }

  clear() {
    super.clear()
    this.emit?.()
  }

  delete(...args: Parameters<Map<K, V>['delete']>) {
    const result = super.delete(...args)
    this.emit?.()
    return result
  }

  set(...args: Parameters<Map<K, V>['set']>) {
    const result = super.set(...args)
    this.emit?.()
    return result
  }
}
